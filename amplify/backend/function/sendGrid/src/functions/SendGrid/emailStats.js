const client = require("@sendgrid/client");

/**
 * Calls SendGrid's /v3/stats endpoint with the given clientId and query params.
 * @param {string} clientId - The subuser username for the on-behalf-of header.
 * @param {object} queryParams - The query parameters for the stats API (start_date, end_date, etc).
 * @returns {Promise<object>} - The SendGrid stats API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailStats(clientId, queryParams) {
  if (!clientId || !queryParams || !queryParams.start_date) {
    throw new Error(
      "Missing required parameters: clientId and start_date are required."
    );
  }
  const request = {
    url: "/v3/stats",
    method: "GET",
    headers: { "on-behalf-of": clientId },
    qs: queryParams,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid stats API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

/**
 * Calls SendGrid's /v3/browsers/stats endpoint with the given clientId and query params.
 * @param {string} clientId - The subuser username for the on-behalf-of header.
 * @param {object} queryParams - The query parameters for the browsers stats API (start_date, end_date, etc).
 * @returns {Promise<object>} - The SendGrid browsers stats API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailStatsByBrowser(clientId, queryParams) {
  if (!clientId || !queryParams || !queryParams.start_date) {
    throw new Error(
      "Missing required parameters: clientId and start_date are required."
    );
  }
  const request = {
    url: "/v3/browsers/stats",
    method: "GET",
    headers: { "on-behalf-of": clientId },
    qs: queryParams,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid browsers stats API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

/**
 * Calls SendGrid's /v3/geo/stats endpoint with the given clientId and query params.
 * @param {string} clientId - The subuser username for the on-behalf-of header.
 * @param {object} queryParams - The query parameters for the geo stats API (start_date, end_date, etc).
 * @returns {Promise<object>} - The SendGrid geo stats API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailStatsGeo(clientId, queryParams) {
  if (!clientId || !queryParams || !queryParams.start_date) {
    throw new Error(
      "Missing required parameters: clientId and start_date are required."
    );
  }
  const request = {
    url: "/v3/geo/stats",
    method: "GET",
    headers: { "on-behalf-of": clientId },
    qs: queryParams,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid geo stats API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

/**
 * Calls SendGrid's /v3/devices/stats endpoint with the given clientId and query params.
 * @param {string} clientId - The subuser username for the on-behalf-of header.
 * @param {object} queryParams - The query parameters for the devices stats API (start_date, end_date, etc).
 * @returns {Promise<object>} - The SendGrid devices stats API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailStatsByDevice(clientId, queryParams) {
  if (!clientId || !queryParams || !queryParams.start_date) {
    throw new Error(
      "Missing required parameters: clientId and start_date are required."
    );
  }
  const request = {
    url: "/v3/devices/stats",
    method: "GET",
    headers: { "on-behalf-of": clientId },
    qs: queryParams,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid devices stats API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

/**
 * Calls SendGrid's /v3/mailbox_providers/stats endpoint with the given clientId and query params.
 * @param {string} clientId - The subuser username for the on-behalf-of header.
 * @param {object} queryParams - The query parameters for the mailbox providers stats API (start_date, end_date, etc).
 * @returns {Promise<object>} - The SendGrid mailbox providers stats API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEmailStatsByMailboxProvider(clientId, queryParams) {
  if (!clientId || !queryParams || !queryParams.start_date) {
    throw new Error(
      "Missing required parameters: clientId and start_date are required."
    );
  }
  const request = {
    url: "/v3/mailbox_providers/stats",
    method: "GET",
    headers: { "on-behalf-of": clientId },
    qs: queryParams,
  };
  const [response, body] = await client.request(request);
  if (response.statusCode !== 200) {
    const error = new Error("SendGrid mailbox providers stats API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

/**
 * Calls SendGrid's /v3/engagementquality/scores endpoint with the given clientId and query params.
 * @param {string} clientId - The subuser username for the on-behalf-of header.
 * @param {object} queryParams - The query parameters for the engagement quality API (from, to).
 * @returns {Promise<object>} - The SendGrid engagement quality API response body.
 * @throws {Error} - Throws if the API call fails.
 */
async function getEngagementQualityScores(clientId, queryParams) {
  if (!clientId || !queryParams || !queryParams.from || !queryParams.to) {
    throw new Error(
      "Missing required parameters: clientId, from, and to are required."
    );
  }
  const request = {
    url: "/v3/engagementquality/scores",
    method: "GET",
    headers: { "on-behalf-of": clientId },
    qs: queryParams,
  };
  const [response, body] = await client.request(request);
  if (![200, 202].includes(response.statusCode)) {
    const error = new Error("SendGrid engagement quality API error");
    error.statusCode = response.statusCode;
    error.body = body;
    throw error;
  }
  return body;
}

module.exports = {
  getEmailStats,
  getEmailStatsByBrowser,
  getEmailStatsGeo,
  getEmailStatsByDevice,
  getEmailStatsByMailboxProvider,
  getEngagementQualityScores,
};
