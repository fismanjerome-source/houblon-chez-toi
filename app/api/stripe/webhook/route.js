const { prisma } = require('../../../../lib/db');
const { getStripeClient } = require('../../../../lib/stripe');
const { sendEmail } = require('../../../../lib/email');
const { orderConfirmationEmail, reviewRequestEmail, referralInviteEmail, SITE_URL } = require('../../../../lib/emailTemplates');
const { notifyPaymentConfirmed } = require('../../../../lib/telegramNotify');

async function POST(request) {
  const stripe = getStripeClient();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Stripe non configuré' }), { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe] signature invalide:', err.message);
    return new Response(JSON.stringify({ error: 'Signature invalide' }), { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id;
    if (orderId) {
      const previous = await prisma.order.findUnique({ where: { id: orderId } });
      if (previous && previous.status === 'EN_ATTENTE_PAIEMENT') {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: 'EN_PREPARATION', paidAt: new Date() },
          include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
        });

        const confirmation = orderConfirmationEmail({ order, user: order.user });
        const reviewEmail = reviewRequestEmail({ order, user: order.user, reviewUrl: `${SITE_URL}/avis/${order.reviewToken}` });
        const reviewSendAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const emailsToSend = [
          sendEmail({ to: order.user.email, subject: confirmation.subject, html: confirmation.html }),
          sendEmail({ to: order.user.email, subject: reviewEmail.subject, html: reviewEmail.html, scheduledAt: reviewSendAt }),
        ];
        const otherOrders = await prisma.order.count({ where: { userId: order.userId, id: { not: order.id } } });
        if (otherOrders === 0) {
          const referral = referralInviteEmail({ user: order.user });
          const referralSendAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          emailsToSend.push(sendEmail({ to: order.user.email, subject: referral.subject, html: referral.html, scheduledAt: referralSendAt }));
        }
        await Promise.all(emailsToSend);
        await notifyPaymentConfirmed(order);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

module.exports = { POST };
