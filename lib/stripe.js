const Stripe = require('stripe');

let client = null;
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

module.exports = { getStripeClient };
