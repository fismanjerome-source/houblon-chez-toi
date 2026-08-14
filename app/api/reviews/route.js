const { prisma } = require('../../../lib/db');

async function GET() {
  const reviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(reviews), { status: 200 });
}

async function POST(request) {
  const { token, rating, comment } = await request.json();
  const ratingNum = Math.round(Number(rating));
  if (!token || !ratingNum || ratingNum < 1 || ratingNum > 5) {
    return new Response(JSON.stringify({ error: 'Note invalide' }), { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { reviewToken: token }, include: { user: true, review: true } });
  if (!order) return new Response(JSON.stringify({ error: 'Lien invalide' }), { status: 404 });
  if (order.review) return new Response(JSON.stringify({ error: 'Un avis a déjà été déposé pour cette commande' }), { status: 409 });

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      customerName: order.user.name,
      rating: ratingNum,
      comment: comment ? String(comment).slice(0, 1000) : null,
    },
  });

  return new Response(JSON.stringify(review), { status: 201 });
}

module.exports = { GET, POST };
