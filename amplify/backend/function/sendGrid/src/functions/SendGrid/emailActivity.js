const client = require("@sendgrid/client");

/**
 * Calls SendGrid's /v3/messages endpoint with the given API key, query, and limit.
 * @param {string} apiKey - The SendGrid API key to use for authentication.
 * @param {string} query - The query string for filtering messages.
 * @param {number} [limit] - The number of messages to return (1-1000).
 * @returns {Promise<object>} - The SendGrid email activity API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailActivity(apiKey, query, limit) {
  if (!apiKey || !query) {
    throw new Error(
      "Missing required parameters: apiKey and query are required."
    );
  }
  client.setApiKey(apiKey);
  const qs = { query };
  if (limit !== undefined) {
    qs.limit = limit;
  }
  const request = {
    url: "/v3/messages",
    method: "GET",
    qs,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid email activity API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

/**
 * Calls SendGrid's /v3/messages/{messageId} endpoint with the given API key.
 * @param {string} apiKey - The SendGrid API key to use for authentication.
 * @param {string} messageId - The message ID to retrieve.
 * @returns {Promise<object>} - The SendGrid email activity message response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailActivityByMessageId(apiKey, messageId) {
  if (!apiKey || !messageId) {
    throw new Error(
      "Missing required parameters: apiKey and messageId are required."
    );
  }
  client.setApiKey(apiKey);
  const request = {
    url: `/v3/messages/${encodeURIComponent(messageId)}`,
    method: "GET",
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid email activity by messageId API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

module.exports = { getEmailActivity, getEmailActivityByMessageId };
