const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
const { computeDeliveryFeeCents } = require('../../../lib/delivery');
const { computeVolumeDiscount } = require('../../../lib/pricing');
const { sendEmail } = require('../../../lib/email');
const { orderConfirmationEmail, reviewRequestEmail, referralInviteEmail, SITE_URL } = require('../../../lib/emailTemplates');
const { getStripeClient } = require('../../../lib/stripe');
const { resolveCode, computeCodeDiscountCents } = require('../../../lib/promoCodes');

function getSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(match[1]);
}

async function GET(request) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { include: { beer: true, glass: true } }, depositReturns: { include: { beer: true } }, extras: true, invoice: true },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(orders), { status: 200 });
}

async function POST(request) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const { town, slot, items, pickup, returns, extras, acceptedTerms, paymentChoice: requestedPaymentChoice, code: promoCodeInput } = await request.json();
  // items: [{ beerId, format, quantity, glassId }]
  // returns: [{ beerId, format, quantity }]
  // extras: [{ kind: 'basket' | 'merch', refId, quantity }]
  if ((!items || !items.length) && (!extras || !extras.length)) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }
  if (!acceptedTerms) {
    return new Response(JSON.stringify({ error: 'Vous devez accepter les CGU/CGV pour valider la commande.' }), { status: 400 });
  }

  const safeItems = items || [];
  const allBeerIds = [...new Set([...safeItems.map((i) => i.beerId), ...(returns || []).map((r) => r.beerId)])];
  const beers = await prisma.beer.findMany({ where: { id: { in: allBeerIds } } });
  const glassIds = safeItems.map((i) => i.glassId).filter(Boolean);
  const glasses = glassIds.length ? await prisma.glass.findMany({ where: { id: { in: glassIds } } }) : [];

  let itemsTotalCents = 0;
  let depositChargedCents = 0;
  const orderItemsData = safeItems.map((item) => {
    const beer = beers.find((b) => b.id === item.beerId);
    if (!beer) throw new Error('Bière introuvable');
    const glass = item.glassId ? glasses.find((g) => g.id === item.glassId && g.beerId === beer.id) : null;
    const unitPrice = item.format === 75 ? beer.price75 : item.format === 33 ? beer.price33 : 0;
    const depositUnitCents = item.format === 75 ? beer.depositCents75 : item.format === 33 ? beer.depositCents33 : 0;
    const depositLineCents = depositUnitCents * item.quantity;
    let lineCents = Math.round(unitPrice * 100) * item.quantity + depositLineCents;
    if (glass) lineCents += Math.round(glass.price * 100);
    itemsTotalCents += lineCents;
    depositChargedCents += depositLineCents;
    return {
      beerId: beer.id,
      format: item.format,
      quantity: item.quantity,
      glassId: glass ? glass.id : null,
      unitPriceCents: Math.round(unitPrice * 100),
      depositCents: depositLineCents,
    };
  });

  let depositReturnedCents = 0;
  const returnItemsData = (returns || [])
    .filter((r) => r.quantity > 0)
    .map((r) => {
      const beer = beers.find((b) => b.id === r.beerId);
      if (!beer) throw new Error('Bière introuvable (reprise)');
      const depositUnitCents = r.format === 75 ? beer.depositCents75 : r.format === 33 ? beer.depositCents33 : 0;
      const creditedCents = depositUnitCents * r.quantity;
      depositReturnedCents += creditedCents;
      return { beerId: beer.id, format: r.format, quantity: r.quantity, creditedCents };
    });

  const basketIds = (extras || []).filter((x) => x.kind === 'basket' && x.quantity > 0).map((x) => x.refId);
  const merchIds = (extras || []).filter((x) => x.kind === 'merch' && x.quantity > 0).map((x) => x.refId);
  const [baskets, merchProducts] = await Promise.all([
    basketIds.length ? prisma.basket.findMany({ where: { id: { in: basketIds }, active: true } }) : [],
    merchIds.length ? prisma.merchProduct.findMany({ where: { id: { in: merchIds }, active: true } }) : [],
  ]);

  let extrasTotalCents = 0;
  const extrasData = (extras || [])
    .filter((x) => x.quantity > 0)
    .map((x) => {
      const source = x.kind === 'basket' ? baskets.find((b) => b.id === x.refId) : merchProducts.find((m) => m.id === x.refId);
      if (!source || source.priceCents <= 0) return null;
      const lineTotalCents = source.priceCents * x.quantity;
      extrasTotalCents += lineTotalCents;
      return { kind: x.kind, refId: source.id, name: source.name, quantity: x.quantity, unitPriceCents: source.priceCents, lineTotalCents };
    })
    .filter(Boolean);

  itemsTotalCents += extrasTotalCents;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const isFirstOrder = (await prisma.order.count({ where: { userId: user.id } })) === 0;

  let discountCents = 0;
  if (user.proApproved) {
    const totalBottles = safeItems.filter((i) => i.format > 0).reduce((sum, i) => sum + i.quantity, 0);
    const tiers = await prisma.pricingTier.findMany();
    ({ discountCents } = computeVolumeDiscount({
      totalBottles,
      discountableCents: itemsTotalCents - depositChargedCents,
      tiers,
    }));
  }

  let codeResolution = null;
  let promoDiscountCents = 0;
  if (promoCodeInput) {
    codeResolution = await resolveCode(prisma, promoCodeInput, user);
    if (codeResolution?.error) {
      return new Response(JSON.stringify({ error: codeResolution.error }), { status: 400 });
    }
    promoDiscountCents = computeCodeDiscountCents(codeResolution, itemsTotalCents - depositChargedCents);
  }

  const deliveryFeeCents = computeDeliveryFeeCents({ pickup: !!pickup, town, itemsTotalCents: itemsTotalCents - depositChargedCents });
  const beforeCreditCents = Math.max(0, itemsTotalCents + deliveryFeeCents - depositReturnedCents - discountCents - promoDiscountCents);
  const creditUsedCents = Math.min(user.creditCents, beforeCreditCents);
  const totalCents = Math.max(0, beforeCreditCents - creditUsedCents);

  // Le paiement par carte (Stripe) et le paiement à 30 jours ne sont proposés
  // qu'aux comptes pro validés ; tout le monde d'autre paie en espèces à la livraison.
  let paymentChoice = 'CASH_ON_DELIVERY';
  if (user.proApproved && (requestedPaymentChoice === 'NET_30' || requestedPaymentChoice === 'STRIPE')) {
    paymentChoice = requestedPaymentChoice;
  }

  let stripe = null;
  if (paymentChoice === 'STRIPE') {
    stripe = getStripeClient();
    if (!stripe) {
      return new Response(JSON.stringify({ error: "Le paiement par carte n'est pas encore disponible. Choisissez un autre mode de paiement." }), { status: 503 });
    }
  }

  const order = await prisma.order.create({
    data: {
      userId: session.userId,
      town: pickup ? 'Bondues (retrait)' : town,
      pickup: !!pickup,
      slot,
      itemsTotalCents,
      deliveryFeeCents,
      depositChargedCents,
      depositReturnedCents,
      discountCents,
      promoCode: codeResolution && !codeResolution.error ? codeResolution.code : null,
      promoDiscountCents,
      creditUsedCents,
      totalCents,
      termsAcceptedAt: new Date(),
      paymentChoice,
      status: paymentChoice === 'STRIPE' ? 'EN_ATTENTE_PAIEMENT' : 'EN_PREPARATION',
      items: { create: orderItemsData },
      depositReturns: returnItemsData.length ? { create: returnItemsData } : undefined,
      extras: extrasData.length ? { create: extrasData } : undefined,
    },
    include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
  });

  if (creditUsedCents > 0) {
    await prisma.user.update({ where: { id: user.id }, data: { creditCents: { decrement: creditUsedCents } } });
  }
  if (codeResolution && !codeResolution.error) {
    if (codeResolution.type === 'PROMO') {
      await prisma.promoCode.update({ where: { code: codeResolution.code }, data: { usedCount: { increment: 1 } } });
    } else if (codeResolution.type === 'REFERRAL') {
      await prisma.referral.create({
        data: {
          referrerId: codeResolution.referrerId,
          refereeId: user.id,
          code: codeResolution.code,
          friendDiscountCents: codeResolution.discountCents,
          orderId: order.id,
        },
      });
    }
  }

  if (paymentChoice === 'STRIPE') {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Commande Houblon chez toi n°${order.id.slice(-6)}` },
          unit_amount: order.totalCents,
        },
        quantity: 1,
      }],
      success_url: `${SITE_URL}/compte?paiement=reussi`,
      cancel_url: `${SITE_URL}/compte?paiement=annule`,
      customer_email: order.user.email,
      client_reference_id: order.id,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });
    return new Response(JSON.stringify({ ...order, stripeCheckoutUrl: checkoutSession.url }), { status: 201 });
  }

  const confirmation = orderConfirmationEmail({ order, user: order.user });
  const reviewEmail = reviewRequestEmail({ order, user: order.user, reviewUrl: `${SITE_URL}/avis/${order.reviewToken}` });
  const reviewSendAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const emailsToSend = [
    sendEmail({ to: order.user.email, subject: confirmation.subject, html: confirmation.html }),
    sendEmail({ to: order.user.email, subject: reviewEmail.subject, html: reviewEmail.html, scheduledAt: reviewSendAt }),
  ];
  if (isFirstOrder) {
    const referral = referralInviteEmail({ user: order.user });
    const referralSendAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    emailsToSend.push(sendEmail({ to: order.user.email, subject: referral.subject, html: referral.html, scheduledAt: referralSendAt }));
  }
  await Promise.all(emailsToSend);

  return new Response(JSON.stringify(order), { status: 201 });
}

module.exports = { GET, POST };
