const client = require("@sendgrid/client");

// 1. GET /v3/tracking_settings
async function getTrackingSettings(clientId) {
  const request = {
    url: "/v3/tracking_settings",
    method: "GET",
    headers: { "on-behalf-of": clientId },
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid tracking settings API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 2. GET /v3/tracking_settings/click
async function getClickTrackingSettings(clientId) {
  const request = {
    url: "/v3/tracking_settings/click",
    method: "GET",
    headers: { "on-behalf-of": clientId },
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid click tracking settings API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 3. PATCH /v3/tracking_settings/click
async function updateClickTrackingSettings(clientId, data) {
  const request = {
    url: "/v3/tracking_settings/click",
    method: "PATCH",
    headers: { "on-behalf-of": clientId },
    body: data,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error(
      "SendGrid update click tracking settings API error"
    );
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 4. GET /v3/tracking_settings/google_analytics
async function getGoogleAnalyticsSettings(clientId) {
  const request = {
    url: "/v3/tracking_settings/google_analytics",
    method: "GET",
    headers: { "on-behalf-of": clientId },
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid google analytics settings API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 5. PATCH /v3/tracking_settings/google_analytics
async function updateGoogleAnalyticsSettings(clientId, data) {
  const request = {
    url: "/v3/tracking_settings/google_analytics",
    method: "PATCH",
    headers: { "on-behalf-of": clientId },
    body: data,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error(
      "SendGrid update google analytics settings API error"
    );
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 6. GET /v3/tracking_settings/open
async function getOpenTrackingSettings(clientId) {
  const request = {
    url: "/v3/tracking_settings/open",
    method: "GET",
    headers: { "on-behalf-of": clientId },
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid open tracking settings API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 7. PATCH /v3/tracking_settings/open
async function updateOpenTrackingSettings(clientId, data) {
  const request = {
    url: "/v3/tracking_settings/open",
    method: "PATCH",
    headers: { "on-behalf-of": clientId },
    body: data,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid update open tracking settings API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 8. GET /v3/tracking_settings/subscription
async function getSubscriptionTrackingSettings(clientId) {
  const request = {
    url: "/v3/tracking_settings/subscription",
    method: "GET",
    headers: { "on-behalf-of": clientId },
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error(
      "SendGrid subscription tracking settings API error"
    );
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

// 9. PATCH /v3/tracking_settings/subscription
async function updateSubscriptionTrackingSettings(clientId, data) {
  const request = {
    url: "/v3/tracking_settings/subscription",
    method: "PATCH",
    headers: { "on-behalf-of": clientId },
    body: data,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error(
      "SendGrid update subscription tracking settings API error"
    );
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

module.exports = {
  getTrackingSettings,
  getClickTrackingSettings,
  updateClickTrackingSettings,
  getGoogleAnalyticsSettings,
  updateGoogleAnalyticsSettings,
  getOpenTrackingSettings,
  updateOpenTrackingSettings,
  getSubscriptionTrackingSettings,
  updateSubscriptionTrackingSettings,
};
