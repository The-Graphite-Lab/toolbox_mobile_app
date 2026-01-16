const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

const prodStripeKey = process.env.STRIPE_PROD_SECRET_KEY;
const testStripeKey = process.env.STRIPE_TEST_SECRET_KEY;

const getStripeEnvironment = (env) => {
  const stripeApiKey = env === "test" ? testStripeKey : prodStripeKey;
  return require("stripe")(stripeApiKey);
};

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/**********************
 * Specific Products Routes *
 **********************/
app.get("/billing/products", async (req, res) => {
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    const products = await stripe.products.list({ limit: 100 });
    res.json(products?.data);
  } catch (error) {
    console.error("Stripe API error: ", error); // Log more details
    res.status(500).json({ error: error.message });
  }
});

app.get("/billing/products/:productId", async (req, res) => {
  const productId = req.params.productId;
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    const product = await stripe.products.retrieve(productId);
    const prices = await stripe.prices.list({
      product: productId,
      limit: 100,
    });

    res.json({ product, prices: prices.data });
  } catch (error) {
    console.error("Stripe API error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**********************
 * Customer Specific Billing Routes *
 **********************/
app.get("/billing/:customerId", async (req, res) => {
  const customerId = req.params.customerId;
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    // Fetch the customer's data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
    });
    const invoices = await stripe.invoices.list({ customer: customerId });

    let upcomingInvoice;
    try {
      upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
      });
    } catch (error) {
      if (error.message.includes("No upcoming invoices")) {
        upcomingInvoice = null;
      } else {
        throw error;
      }
    }

    const billingData = {
      subscriptions: subscriptions.data, // Return all subscriptions
      transactions: invoices.data,
      currentBalance:
        subscriptions.data.length > 0
          ? subscriptions.data[0].current_period_end
          : null,
      upcomingCharges: upcomingInvoice,
    };

    res.json(billingData);
  } catch (error) {
    console.error("Stripe API error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/billing/:customerId/payment-methods", async (req, res) => {
  const customerId = req.params.customerId;
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    res.json(paymentMethods.data);
  } catch (error) {
    console.error("Stripe API error: ", error); // Log more details
    res.status(500).json({ error: error.message });
  }
});

app.post("/billing/:customerId/payment-methods", async (req, res) => {
  const { paymentMethodId } = req.body;
  const customerId = req.params.customerId;
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    // Attach the payment method to the customer
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set it as the default payment method for the customer
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    res.json(paymentMethod);
  } catch (error) {
    console.error("Stripe API error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete(
  "/billing/:customerId/payment-methods/:paymentMethodId",
  async (req, res) => {
    const paymentMethodId = req.params.paymentMethodId;
    const env = req.query.env || "production";
    const stripe = getStripeEnvironment(env);

    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      res.json(paymentMethod);
    } catch (error) {
      console.error("Stripe API error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

app.post("/billing/:customerId/setup", async (req, res) => {
  const { customerId } = req.params;
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "setup",
      customer: customerId,
      success_url: `${req.headers.origin}`,
      cancel_url: `${req.headers.origin}`,
      allow_promotion_codes: true,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe API error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/billing/:customerId/checkout", async (req, res) => {
  const { customerId } = req.params;
  const { priceId } = req.body;
  const env = req.query.env || "production";
  const stripe = getStripeEnvironment(env);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}`,
      cancel_url: `${req.headers.origin}`,
      allow_promotion_codes: true,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe API error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("App started");
});

module.exports = app;
