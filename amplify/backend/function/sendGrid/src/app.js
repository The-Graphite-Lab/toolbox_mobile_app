const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const client = require("@sendgrid/client");
const {
  SecretsManagerClient,
  CreateSecretCommand,
  UpdateSecretCommand,
  GetSecretValueCommand,
  DeleteSecretCommand,
} = require("@aws-sdk/client-secrets-manager");
const { updateSendGridSubUser } = require("./functions/updateSendGridSubUser");
const { getClients } = require("./functions/Clients/getClients");
const { getUsers } = require("./functions/Users/getUsers");
const {
  getEmailStats,
  getEmailStatsByBrowser,
  getEmailStatsGeo,
  getEmailStatsByDevice,
  getEmailStatsByMailboxProvider,
  getEngagementQualityScores,
} = require("./functions/SendGrid/emailStats");
const {
  getEmailActivity,
  getEmailActivityByMessageId,
} = require("./functions/SendGrid/emailActivity");
const {
  getTrackingSettings,
  getClickTrackingSettings,
  updateClickTrackingSettings,
  getGoogleAnalyticsSettings,
  updateGoogleAnalyticsSettings,
  getOpenTrackingSettings,
  updateOpenTrackingSettings,
  getSubscriptionTrackingSettings,
  updateSubscriptionTrackingSettings,
} = require("./functions/SendGrid/trackingSettings");

// Set the SendGrid API key from environment variables
client.setApiKey(process.env.SENDGRID_API_KEY);

// Configure AWS Secrets Manager client using AWS SDK v3
const secretsManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-2",
});

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str);
}
function isValidAggregatedBy(val) {
  return ["day", "week", "month"].includes(val);
}
function isValidCountry(val) {
  return ["US", "CA"].includes(val);
}
function isValidDeviceType(val) {
  const allowed = ["Desktop", "Webmail", "Phone", "Tablet", "Other"];
  return allowed.includes(val);
}

/**
 * POST /sendgrid/subuser
 * - Requires: clientId, userId
 * - Creates a new SendGrid subuser if one does not already exist.
 * - Immediately updates DynamoDB with the new subuser ID if created.
 * - Creates an API key for the subuser (with UI access effectively disabled).
 * - Stores the API key in AWS Secrets Manager under the secret name "SendGridAPIKey-<clientId>".
 * - Returns the SendGridSubUserID and API key.
 */
app.post("/sendGrid/subuser", async (req, res) => {
  try {
    const { clientId, userId } = req.body;

    // Validate required fields
    if (!clientId || !userId) {
      return res.status(400).json({
        error:
          "Missing or invalid required fields. Ensure clientId and userId are provided.",
      });
    }

    // Retrieve client and user info
    const clientData = await getClients(clientId);
    const user = await getUsers(userId);
    const email = user.email;

    let sendGridSubUserID = clientData.SendGridSubUserID;

    // Check if a SendGrid subuser already exists
    if (!sendGridSubUserID) {
      // Generate a random password (to disable UI login)
      const password = Math.random().toString(36).substring(2, 15);

      // Build the payload for creating a new subuser
      const subuserData = {
        username: clientId,
        email: email,
        password: password,
        ips: ["159.183.15.246", "159.183.17.165"],
      };

      const subuserRequest = {
        url: "/v3/subusers",
        method: "POST",
        body: subuserData,
      };

      // Create the subuser on SendGrid
      const [subuserResponse, subuserResponseBody] = await client.request(
        subuserRequest
      );
      if (subuserResponse.statusCode !== 201) {
        return res
          .status(subuserResponse.statusCode)
          .json({ error: subuserResponseBody });
      }

      sendGridSubUserID = subuserResponseBody.user_id;
      if (!sendGridSubUserID) {
        return res
          .status(500)
          .json({ error: "SendGrid did not return a subuser ID." });
      }

      // Immediately update DynamoDB with the new SendGrid subuser ID
      await updateSendGridSubUser(clientId, sendGridSubUserID);
    }

    // Create an API key for the subuser using the "on-behalf-of" header
    const apiKeyRequest = {
      url: "/v3/api_keys",
      method: "POST",
      headers: { "on-behalf-of": clientId },
      body: {
        name: `SendGridAPIKey-${clientId}`,
        scopes: [
          "access_settings.activity.read",
          "access_settings.whitelist.create",
          "access_settings.whitelist.delete",
          "access_settings.whitelist.read",
          "access_settings.whitelist.update",
          "alerts.create",
          "alerts.delete",
          "alerts.read",
          "alerts.update",
          "api_keys.create",
          "api_keys.delete",
          "api_keys.read",
          "api_keys.update",
          "asm.groups.create",
          "asm.groups.delete",
          "asm.groups.read",
          "asm.groups.update",
          "billing.create",
          "billing.delete",
          "billing.read",
          "billing.update",
          "browsers.stats.read",
          "categories.create",
          "categories.delete",
          "categories.read",
          "categories.stats.read",
          "categories.stats.sums.read",
          "categories.update",
          "clients.desktop.stats.read",
          "clients.phone.stats.read",
          "clients.stats.read",
          "clients.tablet.stats.read",
          "clients.webmail.stats.read",
          "credentials.create",
          "credentials.delete",
          "credentials.read",
          "credentials.update",
          "devices.stats.read",
          "email_activity.read",
          "geo.stats.read",
          "ips.assigned.read",
          "ips.pools.create",
          "ips.pools.delete",
          "ips.pools.ips.create",
          "ips.pools.ips.delete",
          "ips.pools.ips.read",
          "ips.pools.ips.update",
          "ips.pools.read",
          "ips.pools.update",
          "ips.read",
          "ips.warmup.create",
          "ips.warmup.delete",
          "ips.warmup.read",
          "ips.warmup.update",
          "mail_settings.address_whitelist.read",
          "mail_settings.address_whitelist.update",
          "mail_settings.bcc.read",
          "mail_settings.bcc.update",
          "mail_settings.bounce_purge.read",
          "mail_settings.bounce_purge.update",
          "mail_settings.footer.read",
          "mail_settings.footer.update",
          "mail_settings.forward_bounce.read",
          "mail_settings.forward_bounce.update",
          "mail_settings.forward_spam.read",
          "mail_settings.forward_spam.update",
          "mail_settings.plain_content.read",
          "mail_settings.plain_content.update",
          "mail_settings.read",
          "mail_settings.spam_check.read",
          "mail_settings.spam_check.update",
          "mail_settings.template.read",
          "mail_settings.template.update",
          "mail.batch.create",
          "mail.batch.delete",
          "mail.batch.read",
          "mail.batch.update",
          "mail.send",
          "mailbox_providers.stats.read",
          "marketing_campaigns.create",
          "marketing_campaigns.delete",
          "marketing_campaigns.read",
          "marketing_campaigns.update",
          "newsletter.create",
          "newsletter.delete",
          "newsletter.read",
          "newsletter.update",
          "partner_settings.new_relic.read",
          "partner_settings.new_relic.update",
          "partner_settings.read",
          "partner_settings.sendwithus.read",
          "partner_settings.sendwithus.update",
          "stats.global.read",
          "stats.read",
          "subusers.create",
          "subusers.credits.create",
          "subusers.credits.delete",
          "subusers.credits.read",
          "subusers.credits.remaining.create",
          "subusers.credits.remaining.delete",
          "subusers.credits.remaining.read",
          "subusers.credits.remaining.update",
          "subusers.credits.update",
          "subusers.delete",
          "subusers.monitor.create",
          "subusers.monitor.delete",
          "subusers.monitor.read",
          "subusers.monitor.update",
          "subusers.read",
          "subusers.reputations.read",
          "subusers.stats.monthly.read",
          "subusers.stats.read",
          "subusers.stats.sums.read",
          "subusers.summary.read",
          "subusers.update",
          "suppression.blocks.create",
          "suppression.blocks.delete",
          "suppression.blocks.read",
          "suppression.blocks.update",
          "suppression.bounces.create",
          "suppression.bounces.delete",
          "suppression.bounces.read",
          "suppression.bounces.update",
          "suppression.create",
          "suppression.delete",
          "suppression.invalid_emails.create",
          "suppression.invalid_emails.delete",
          "suppression.invalid_emails.read",
          "suppression.invalid_emails.update",
          "suppression.read",
          "suppression.spam_reports.create",
          "suppression.spam_reports.delete",
          "suppression.spam_reports.read",
          "suppression.spam_reports.update",
          "suppression.unsubscribes.create",
          "suppression.unsubscribes.delete",
          "suppression.unsubscribes.read",
          "suppression.unsubscribes.update",
          "suppression.update",
          "templates.create",
          "templates.delete",
          "templates.read",
          "templates.update",
          "templates.versions.activate.create",
          "templates.versions.activate.delete",
          "templates.versions.activate.read",
          "templates.versions.activate.update",
          "templates.versions.create",
          "templates.versions.delete",
          "templates.versions.read",
          "templates.versions.update",
          "tracking_settings.click.read",
          "tracking_settings.click.update",
          "tracking_settings.google_analytics.read",
          "tracking_settings.google_analytics.update",
          "tracking_settings.open.read",
          "tracking_settings.open.update",
          "tracking_settings.read",
          "tracking_settings.subscription.read",
          "tracking_settings.subscription.update",
          "user.account.read",
          "user.credits.read",
          "user.email.create",
          "user.email.delete",
          "user.email.read",
          "user.email.update",
          "user.multifactor_authentication.create",
          "user.multifactor_authentication.delete",
          "user.multifactor_authentication.read",
          "user.multifactor_authentication.update",
          "user.password.read",
          "user.password.update",
          "user.profile.read",
          "user.profile.update",
          "user.scheduled_sends.create",
          "user.scheduled_sends.delete",
          "user.scheduled_sends.read",
          "user.scheduled_sends.update",
          "user.settings.enforced_tls.read",
          "user.settings.enforced_tls.update",
          "user.timezone.read",
          "user.username.read",
          "user.username.update",
          "user.webhooks.event.settings.read",
          "user.webhooks.event.settings.update",
          "user.webhooks.event.test.create",
          "user.webhooks.event.test.read",
          "user.webhooks.event.test.update",
          "user.webhooks.parse.settings.create",
          "user.webhooks.parse.settings.delete",
          "user.webhooks.parse.settings.read",
          "user.webhooks.parse.settings.update",
          "user.webhooks.parse.stats.read",
          "whitelabel.create",
          "whitelabel.delete",
          "whitelabel.read",
          "whitelabel.update",
        ],
      },
    };

    const [apiKeyResponse, apiKeyResponseBody] = await client.request(
      apiKeyRequest
    );
    if (apiKeyResponse.statusCode !== 201) {
      return res
        .status(apiKeyResponse.statusCode)
        .json({ error: apiKeyResponseBody });
    }

    const apiKey = apiKeyResponseBody.api_key;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "SendGrid did not return an API key." });
    }

    // Store the API key in AWS Secrets Manager under the secret name "SendGridAPIKey-<clientId>"
    const secretName = `SendGridAPIKey-${clientId}`;
    const secretString = JSON.stringify({ apiKey });
    try {
      await secretsManagerClient.send(
        new CreateSecretCommand({
          Name: secretName,
          SecretString: secretString,
        })
      );
    } catch (createErr) {
      // If the secret already exists, update it
      if (createErr.name === "ResourceExistsException") {
        await secretsManagerClient.send(
          new UpdateSecretCommand({
            SecretId: secretName,
            SecretString: secretString,
          })
        );
      } else {
        throw createErr;
      }
    }

    // Return the SendGridSubUserID and the API key
    return res
      .status(200)
      .json({ SendGridSubUserID: sendGridSubUserID, apiKey });
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendgrid/refresh-connection
 * - Requires: clientId in the body
 * - Checks the current API key's scopes and updates them if needed
 * - Uses admin API key to manage subuser API key scopes
 * - Returns the connection status and any updates made
 */
app.post("/sendGrid/refresh-connection", async (req, res) => {
  try {
    const { clientId } = req.body;

    // Validate required fields
    if (!clientId) {
      return res.status(400).json({
        error: "Missing required field: clientId",
      });
    }

    // Check if subuser exists
    const clientData = await getClients(clientId);
    if (!clientData.SendGridSubUserID) {
      return res.status(404).json({
        error: "SendGrid subuser not found. Please register first.",
      });
    }

    // Get the current API key from Secrets Manager
    const secretName = `SendGridAPIKey-${clientId}`;
    let apiKey;
    try {
      const secretData = await secretsManagerClient.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );
      const secretString = secretData.SecretString;
      const parsedSecret = JSON.parse(secretString);
      apiKey = parsedSecret.apiKey;

      if (!apiKey) {
        return res.status(500).json({
          error: "API key not found in secret",
          details: "The secret exists but does not contain a valid API key",
        });
      }
    } catch (err) {
      console.error("Error retrieving secret:", err);
      return res.status(500).json({
        error: `Failed to retrieve API key for clientId: ${clientId}`,
        details: err.message,
      });
    }

    // Check the current API key's scopes using the admin API key
    let currentScopes = [];
    let needsUpdate = false;

    try {
      // Use admin API key to get current scopes of the subuser's API key
      const testRequest = {
        url: "/v3/api_keys",
        method: "GET",
        headers: { "on-behalf-of": clientId },
      };

      const [testResponse, testResponseBody] = await client.request(
        testRequest
      );

      if (testResponse.statusCode === 200) {
        // Check if response has the expected structure
        if (
          testResponseBody &&
          testResponseBody.result &&
          Array.isArray(testResponseBody.result)
        ) {
          // Find the current API key by name (since we don't have the full key in response)
          const currentKey = testResponseBody.result.find(
            (key) => key.name === `SendGridAPIKey-${clientId}`
          );
          if (currentKey) {
            // Since this endpoint doesn't return scopes, we'll assume they need to be updated
            // The scopes field wasn't defined when these keys were created
            currentScopes = [];
            needsUpdate = true; // Force update since no scopes are defined
          } else {
            return res.status(404).json({
              error: "API key not found for this client",
              details:
                "The API key stored in Secrets Manager was not found in SendGrid",
            });
          }
        } else {
          return res.status(500).json({
            error: "Unexpected response structure from SendGrid API",
            details: "Response does not contain expected result array",
          });
        }
      } else {
        return res.status(testResponse.statusCode).json({
          error: "Failed to retrieve API keys from SendGrid",
          details: testResponseBody,
        });
      }
    } catch (testError) {
      return res.status(500).json({
        error: "Failed to retrieve current API key scopes",
        details: testError.message,
      });
    }

    // Define the required scopes for full functionality
    const requiredScopes = [
      "access_settings.activity.read",
      "access_settings.whitelist.create",
      "access_settings.whitelist.delete",
      "access_settings.whitelist.read",
      "access_settings.whitelist.update",
      "alerts.create",
      "alerts.delete",
      "alerts.read",
      "alerts.update",
      "api_keys.create",
      "api_keys.delete",
      "api_keys.read",
      "api_keys.update",
      "asm.groups.create",
      "asm.groups.delete",
      "asm.groups.read",
      "asm.groups.update",
      "billing.create",
      "billing.delete",
      "billing.read",
      "billing.update",
      "browsers.stats.read",
      "categories.create",
      "categories.delete",
      "categories.read",
      "categories.stats.read",
      "categories.stats.sums.read",
      "categories.update",
      "clients.desktop.stats.read",
      "clients.phone.stats.read",
      "clients.stats.read",
      "clients.tablet.stats.read",
      "clients.webmail.stats.read",
      "credentials.create",
      "credentials.delete",
      "credentials.read",
      "credentials.update",
      "devices.stats.read",
      "email_activity.read",
      "geo.stats.read",
      "ips.assigned.read",
      "ips.pools.create",
      "ips.pools.delete",
      "ips.pools.ips.create",
      "ips.pools.ips.delete",
      "ips.pools.ips.read",
      "ips.pools.ips.update",
      "ips.pools.read",
      "ips.pools.update",
      "ips.read",
      "ips.warmup.create",
      "ips.warmup.delete",
      "ips.warmup.read",
      "ips.warmup.update",
      "mail_settings.address_whitelist.read",
      "mail_settings.address_whitelist.update",
      "mail_settings.bcc.read",
      "mail_settings.bcc.update",
      "mail_settings.bounce_purge.read",
      "mail_settings.bounce_purge.update",
      "mail_settings.footer.read",
      "mail_settings.footer.update",
      "mail_settings.forward_bounce.read",
      "mail_settings.forward_bounce.update",
      "mail_settings.forward_spam.read",
      "mail_settings.forward_spam.update",
      "mail_settings.plain_content.read",
      "mail_settings.plain_content.update",
      "mail_settings.read",
      "mail_settings.spam_check.read",
      "mail_settings.spam_check.update",
      "mail_settings.template.read",
      "mail_settings.template.update",
      "mail.batch.create",
      "mail.batch.delete",
      "mail.batch.read",
      "mail.batch.update",
      "mail.send",
      "mailbox_providers.stats.read",
      "marketing_campaigns.create",
      "marketing_campaigns.delete",
      "marketing_campaigns.read",
      "marketing_campaigns.update",
      "newsletter.create",
      "newsletter.delete",
      "newsletter.read",
      "newsletter.update",
      "partner_settings.new_relic.read",
      "partner_settings.new_relic.update",
      "partner_settings.read",
      "partner_settings.sendwithus.read",
      "partner_settings.sendwithus.update",
      "stats.global.read",
      "stats.read",
      "subusers.create",
      "subusers.credits.create",
      "subusers.credits.delete",
      "subusers.credits.read",
      "subusers.credits.remaining.create",
      "subusers.credits.remaining.delete",
      "subusers.credits.remaining.read",
      "subusers.credits.remaining.update",
      "subusers.credits.update",
      "subusers.delete",
      "subusers.monitor.create",
      "subusers.monitor.delete",
      "subusers.monitor.read",
      "subusers.monitor.update",
      "subusers.read",
      "subusers.reputations.read",
      "subusers.stats.monthly.read",
      "subusers.stats.read",
      "subusers.stats.sums.read",
      "subusers.summary.read",
      "subusers.update",
      "suppression.blocks.create",
      "suppression.blocks.delete",
      "suppression.blocks.read",
      "suppression.blocks.update",
      "suppression.bounces.create",
      "suppression.bounces.delete",
      "suppression.bounces.read",
      "suppression.bounces.update",
      "suppression.create",
      "suppression.delete",
      "suppression.invalid_emails.create",
      "suppression.invalid_emails.delete",
      "suppression.invalid_emails.read",
      "suppression.invalid_emails.update",
      "suppression.read",
      "suppression.spam_reports.create",
      "suppression.spam_reports.delete",
      "suppression.spam_reports.read",
      "suppression.spam_reports.update",
      "suppression.unsubscribes.create",
      "suppression.unsubscribes.delete",
      "suppression.unsubscribes.read",
      "suppression.unsubscribes.update",
      "suppression.update",
      "templates.create",
      "templates.delete",
      "templates.read",
      "templates.update",
      "templates.versions.activate.create",
      "templates.versions.activate.delete",
      "templates.versions.activate.read",
      "templates.versions.activate.update",
      "templates.versions.create",
      "templates.versions.delete",
      "templates.versions.read",
      "templates.versions.update",
      "tracking_settings.click.read",
      "tracking_settings.click.update",
      "tracking_settings.google_analytics.read",
      "tracking_settings.google_analytics.update",
      "tracking_settings.open.read",
      "tracking_settings.open.update",
      "tracking_settings.read",
      "tracking_settings.subscription.read",
      "tracking_settings.subscription.update",
      "user.account.read",
      "user.credits.read",
      "user.email.create",
      "user.email.delete",
      "user.email.read",
      "user.email.update",
      "user.multifactor_authentication.create",
      "user.multifactor_authentication.delete",
      "user.multifactor_authentication.read",
      "user.multifactor_authentication.update",
      "user.password.read",
      "user.password.update",
      "user.profile.read",
      "user.profile.update",
      "user.scheduled_sends.create",
      "user.scheduled_sends.delete",
      "user.scheduled_sends.read",
      "user.scheduled_sends.update",
      "user.settings.enforced_tls.read",
      "user.settings.enforced_tls.update",
      "user.timezone.read",
      "user.username.read",
      "user.username.update",
      "user.webhooks.event.settings.read",
      "user.webhooks.event.settings.update",
      "user.webhooks.event.test.create",
      "user.webhooks.event.test.read",
      "user.webhooks.event.test.update",
      "user.webhooks.parse.settings.create",
      "user.webhooks.parse.settings.delete",
      "user.webhooks.parse.settings.read",
      "user.webhooks.parse.settings.update",
      "user.webhooks.parse.stats.read",
      "whitelabel.create",
      "whitelabel.delete",
      "whitelabel.read",
      "whitelabel.update",
    ];

    // Check if any required scopes are missing
    const missingScopes = requiredScopes.filter(
      (scope) => !currentScopes.includes(scope)
    );

    if (missingScopes.length > 0) {
      needsUpdate = true;
    }

    // If update is needed, update the existing API key with required scopes
    if (needsUpdate) {
      try {
        // Find the existing API key to update
        const listRequest = {
          url: "/v3/api_keys",
          method: "GET",
          headers: { "on-behalf-of": clientId },
        };
        const [listResponse, listResponseBody] = await client.request(
          listRequest
        );

        if (listResponse.statusCode === 200) {
          // Check if response has the expected structure
          if (
            listResponseBody &&
            listResponseBody.result &&
            Array.isArray(listResponseBody.result)
          ) {
            const existingKey = listResponseBody.result.find(
              (key) => key.name === `SendGridAPIKey-${clientId}`
            );

            if (existingKey) {
              // Update the existing API key with new scopes
              const updateRequest = {
                url: `/v3/api_keys/${existingKey.api_key_id}`,
                method: "PUT",
                headers: { "on-behalf-of": clientId },
                body: {
                  name: `SendGridAPIKey-${clientId}`,
                  scopes: requiredScopes,
                },
              };

              const [updateResponse, updateResponseBody] = await client.request(
                updateRequest
              );

              if (updateResponse.statusCode === 200) {
                return res.status(200).json({
                  message:
                    "Connection updated successfully with enhanced permissions",
                  status: "updated",
                  previousScopes: currentScopes,
                  newScopes: requiredScopes,
                  scopesAdded: missingScopes,
                });
              } else {
                throw new Error(
                  `Failed to update API key: ${updateResponse.statusCode}`
                );
              }
            } else {
              throw new Error("Existing API key not found");
            }
          } else {
            throw new Error("Unexpected response structure from SendGrid API");
          }
        } else {
          throw new Error(
            `Failed to list API keys: ${listResponse.statusCode}`
          );
        }
      } catch (updateError) {
        console.error(
          "Error updating API key scopes:",
          JSON.stringify(updateError, null, 2)
        );
        return res.status(500).json({
          error: "Failed to update API key scopes",
          details: updateError.message,
        });
      }
    }

    // If no update was needed, the connection is healthy
    return res.status(200).json({
      message: "Connection is working properly",
      status: "healthy",
      currentScopes: currentScopes,
      requiredScopes: requiredScopes,
      missingScopes: missingScopes,
    });
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendgrid/domain-auth
 * - Requires: clientId, domain in the body.
 * - Creates a new authenticated domain for the subuser using SendGrid's whitelabel domains API.
 */
app.post("/sendGrid/domain-auth", async (req, res) => {
  try {
    const { clientId, domain } = req.body;
    if (!clientId || !domain) {
      return res.status(400).json({
        error:
          "Missing or invalid required fields. Ensure clientId and domain are provided.",
      });
    }

    // Build the payload for creating a new authenticated domain.
    const domainData = {
      domain: domain,
      automatic_security: true,
      default: true,
      ips: ["159.183.15.246", "159.183.17.165"],
      custom_dkim_selector: "tgl",
    };

    const domainRequest = {
      url: "/v3/whitelabel/domains",
      method: "POST",
      headers: { "on-behalf-of": clientId },
      body: domainData,
    };

    const [domainResponse, domainResponseBody] = await client.request(
      domainRequest
    );
    if (domainResponse.statusCode !== 201) {
      return res
        .status(domainResponse.statusCode)
        .json({ error: domainResponseBody });
    }

    // Return the created domain details.
    return res.status(200).json(domainResponseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/domain-auth
 * - Requires: clientId as a query parameter.
 * - Lists authenticated domains for the subuser.
 */
app.get("/sendGrid/domain-auth", async (req, res) => {
  try {
    const clientId = req.query.clientId;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }

    const domainListRequest = {
      url: "/v3/whitelabel/domains",
      method: "GET",
      headers: { "on-behalf-of": clientId },
    };

    const [listResponse, listResponseBody] = await client.request(
      domainListRequest
    );
    if (listResponse.statusCode !== 200) {
      return res
        .status(listResponse.statusCode)
        .json({ error: listResponseBody });
    }

    // Return the list of authenticated domains.
    return res.status(200).json(listResponseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendgrid/domain-auth/validate
 * - Requires: clientId, domainId in the body.
 * - Validates an authenticated domain via SendGrid's whitelabel domain validation API.
 */
app.post("/sendGrid/domain-auth/validate", async (req, res) => {
  try {
    const { clientId, domainId } = req.body;
    if (!clientId || !domainId) {
      return res.status(400).json({
        error:
          "Missing required fields. Ensure clientId and domainId are provided.",
      });
    }

    const validateRequest = {
      url: `/v3/whitelabel/domains/${domainId}/validate`,
      method: "POST",
      headers: { "on-behalf-of": clientId },
    };

    const [validateResponse, validateResponseBody] = await client.request(
      validateRequest
    );
    if (validateResponse.statusCode !== 200) {
      return res
        .status(validateResponse.statusCode)
        .json({ error: validateResponseBody });
    }

    return res.status(200).json(validateResponseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendGrid/link-branding
 * - Requires: clientId, domain, subdomain (optional), default (optional), region (optional) in the body.
 * - Creates a new branded link using SendGrid's API.
 */
app.post("/sendGrid/link-branding", async (req, res) => {
  try {
    const { clientId, domain, subdomain, default: isDefault } = req.body;
    if (!clientId || !domain) {
      return res.status(400).json({
        error: "Missing required fields. 'clientId' and 'domain' are required.",
      });
    }
    const data = {
      domain,
      subdomain,
      default: isDefault || false,
    };
    const linkRequest = {
      url: `/v3/whitelabel/links`,
      method: "POST",
      headers: { "on-behalf-of": clientId },
      body: data,
    };
    const [linkResponse, linkResponseBody] = await client.request(linkRequest);
    if (linkResponse.statusCode !== 201) {
      return res
        .status(linkResponse.statusCode)
        .json({ error: linkResponseBody });
    }
    return res.status(200).json(linkResponseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/link-branding
 * - Requires: clientId as a query parameter.
 * - Retrieves branded links associated with a subuser.
 */
app.get("/sendGrid/link-branding", async (req, res) => {
  try {
    const clientId = req.query.clientId;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }

    const linkListRequest = {
      url: `/v3/whitelabel/links`,
      method: "GET",
      headers: { "on-behalf-of": clientId },
    };
    const [listResponse, listResponseBody] = await client.request(
      linkListRequest
    );
    if (listResponse.statusCode !== 200) {
      return res
        .status(listResponse.statusCode)
        .json({ error: listResponseBody });
    }
    return res.status(200).json(listResponseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendGrid/link-branding/validate
 * - Requires: clientId and linkBrandingId in the body.
 * - Validates a branded link via SendGrid's API.
 */
app.post("/sendGrid/link-branding/validate", async (req, res) => {
  try {
    const { clientId, linkBrandingId } = req.body;
    if (!clientId || !linkBrandingId) {
      return res.status(400).json({
        error:
          "Missing required fields. 'clientId' and 'linkBrandingId' are required.",
      });
    }
    const validateRequest = {
      url: `/v3/whitelabel/links/${linkBrandingId}/validate`,
      method: "POST",
      headers: { "on-behalf-of": clientId },
    };
    const [validateResponse, validateResponseBody] = await client.request(
      validateRequest
    );
    // Check validation_results similar to domain validation
    let overallValid = true;
    const failedRecords = [];
    if (validateResponseBody.validation_results) {
      for (const key in validateResponseBody.validation_results) {
        const result = validateResponseBody.validation_results[key];
        if (!result.valid) {
          overallValid = false;
          failedRecords.push({ record: key, reason: result.reason });
        }
      }
    }
    if (!overallValid) {
      return res.status(200).json({
        message: "Link branding validation completed with issues.",
        valid: false,
        failedRecords,
        details: validateResponseBody,
      });
    }
    return res.status(200).json({
      message: "Link branding validation successful",
      valid: true,
      details: validateResponseBody,
    });
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendGrid/reverse-dns
 * - Requires: clientId, ip, domain, subdomain (optional) in the body.
 * - Sets up a reverse DNS record via SendGrid's API.
 */
app.post("/sendGrid/reverse-dns", async (req, res) => {
  try {
    const { clientId, ip, domain, subdomain } = req.body;
    if (!clientId || !ip || !domain) {
      return res.status(400).json({
        error:
          "Missing required fields. 'clientId', 'ip', and 'domain' are required.",
      });
    }
    const data = { ip, domain, subdomain };
    const reverseDnsRequest = {
      url: `/v3/whitelabel/ips`,
      method: "POST",
      headers: { "On-Behalf-Of": clientId },
      body: data,
    };
    const [response, responseBody] = await client.request(reverseDnsRequest);
    if (response.statusCode !== 201) {
      return res.status(response.statusCode).json({ error: responseBody });
    }
    return res.status(200).json(responseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/reverse-dns
 * - Requires: clientId as a query parameter.
 * - Retrieves reverse DNS records using SendGrid's API.
 */
app.get("/sendGrid/reverse-dns", async (req, res) => {
  try {
    const clientId = req.query.clientId;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }
    const queryParams = req.query; // Allow limit and offset if provided
    const reverseDnsListRequest = {
      url: `/v3/whitelabel/ips`,
      method: "GET",
      headers: { "On-Behalf-Of": clientId },
      qs: queryParams,
    };
    const [response, responseBody] = await client.request(
      reverseDnsListRequest
    );
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({ error: responseBody });
    }
    return res.status(200).json(responseBody);
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * POST /sendGrid/reverse-dns/validate
 * - Requires: clientId and reverseDnsId in the body.
 * - Validates a reverse DNS record via SendGrid's API.
 */
app.post("/sendGrid/reverse-dns/validate", async (req, res) => {
  try {
    const { clientId, reverseDnsId } = req.body;
    if (!clientId || !reverseDnsId) {
      return res.status(400).json({
        error:
          "Missing required fields. 'clientId' and 'reverseDnsId' are required.",
      });
    }
    const validateRequest = {
      url: `/v3/whitelabel/ips/${reverseDnsId}/validate`,
      method: "POST",
      headers: { "On-Behalf-Of": clientId },
    };
    const [response, responseBody] = await client.request(validateRequest);
    // Check the A record in validation_results to determine overall validity.
    let valid = false;
    if (
      responseBody.validation_results &&
      responseBody.validation_results.a_record
    ) {
      valid = responseBody.validation_results.a_record.valid;
    }
    if (!valid) {
      return res.status(200).json({
        message: "Reverse DNS validation completed with issues.",
        valid: false,
        details: responseBody,
      });
    }
    return res.status(200).json({
      message: "Reverse DNS validation successful.",
      valid: true,
      details: responseBody,
    });
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("SendGrid API Error:", error.response.body);
      return res
        .status(error.response.statusCode || 500)
        .json({ error: error.response.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/stats
 * - Requires: clientId and start_date as query parameters.
 * - Passes all query params to SendGrid's stats API.
 * - Uses on-behalf-of header for subuser.
 */
app.get("/sendGrid/stats", async (req, res) => {
  try {
    const allowedParams = [
      "clientId",
      "start_date",
      "end_date",
      "aggregated_by",
      "limit",
      "offset",
    ];
    const {
      clientId,
      start_date,
      end_date,
      aggregated_by,
      limit,
      offset,
      ...rest
    } = req.query;
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !start_date) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId and start_date are required.",
      });
    }
    if (!isValidDate(start_date)) {
      return res
        .status(400)
        .json({ error: "start_date must be in YYYY-MM-DD format." });
    }
    if (end_date && !isValidDate(end_date)) {
      return res
        .status(400)
        .json({ error: "end_date must be in YYYY-MM-DD format." });
    }
    if (aggregated_by && !isValidAggregatedBy(aggregated_by)) {
      return res
        .status(400)
        .json({ error: "aggregated_by must be one of: day, week, month." });
    }
    // Compose query params for SendGrid
    const queryParams = { start_date };
    if (end_date) queryParams.end_date = end_date;
    if (aggregated_by) queryParams.aggregated_by = aggregated_by;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    const stats = await getEmailStats(clientId, queryParams);
    return res.status(200).json(stats);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/stats/browsers
 * - Requires: clientId and start_date as query parameters.
 * - Passes allowed query params to SendGrid's browsers stats API.
 * - Uses on-behalf-of header for subuser.
 */
app.get("/sendGrid/stats/browsers", async (req, res) => {
  try {
    const allowedParams = [
      "clientId",
      "start_date",
      "end_date",
      "aggregated_by",
      "limit",
      "offset",
      "browsers",
    ];
    const {
      clientId,
      start_date,
      end_date,
      aggregated_by,
      limit,
      offset,
      browsers,
      ...rest
    } = req.query;
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !start_date) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId and start_date are required.",
      });
    }
    if (!isValidDate(start_date)) {
      return res
        .status(400)
        .json({ error: "start_date must be in YYYY-MM-DD format." });
    }
    if (end_date && !isValidDate(end_date)) {
      return res
        .status(400)
        .json({ error: "end_date must be in YYYY-MM-DD format." });
    }
    if (aggregated_by && !isValidAggregatedBy(aggregated_by)) {
      return res
        .status(400)
        .json({ error: "aggregated_by must be one of: day, week, month." });
    }
    // Compose query params for SendGrid
    const queryParams = { start_date };
    if (end_date) queryParams.end_date = end_date;
    if (aggregated_by) queryParams.aggregated_by = aggregated_by;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    if (browsers) queryParams.browsers = browsers;
    const stats = await getEmailStatsByBrowser(clientId, queryParams);
    return res.status(200).json(stats);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/stats/geo
 * - Requires: clientId and start_date as query parameters.
 * - Passes allowed query params to SendGrid's geo stats API.
 * - Uses on-behalf-of header for subuser.
 */
app.get("/sendGrid/stats/geo", async (req, res) => {
  try {
    const allowedParams = [
      "clientId",
      "start_date",
      "end_date",
      "aggregated_by",
      "limit",
      "offset",
      "country",
      "province",
    ];
    const {
      clientId,
      start_date,
      end_date,
      aggregated_by,
      limit,
      offset,
      country,
      province,
      ...rest
    } = req.query;
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !start_date) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId and start_date are required.",
      });
    }
    if (!isValidDate(start_date)) {
      return res
        .status(400)
        .json({ error: "start_date must be in YYYY-MM-DD format." });
    }
    if (end_date && !isValidDate(end_date)) {
      return res
        .status(400)
        .json({ error: "end_date must be in YYYY-MM-DD format." });
    }
    if (aggregated_by && !isValidAggregatedBy(aggregated_by)) {
      return res
        .status(400)
        .json({ error: "aggregated_by must be one of: day, week, month." });
    }
    if (country && !isValidCountry(country)) {
      return res.status(400).json({ error: "country must be one of: US, CA." });
    }
    // Compose query params for SendGrid
    const queryParams = { start_date };
    if (end_date) queryParams.end_date = end_date;
    if (aggregated_by) queryParams.aggregated_by = aggregated_by;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    if (country) queryParams.country = country;
    if (province) queryParams.province = province;
    const stats = await getEmailStatsGeo(clientId, queryParams);
    return res.status(200).json(stats);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/stats/devices
 * - Requires: clientId and start_date as query parameters.
 * - Passes allowed query params to SendGrid's devices stats API.
 * - Uses on-behalf-of header for subuser.
 */
app.get("/sendGrid/stats/devices", async (req, res) => {
  try {
    const allowedParams = [
      "clientId",
      "start_date",
      "end_date",
      "aggregated_by",
      "limit",
      "offset",
      "devices",
    ];
    const {
      clientId,
      start_date,
      end_date,
      aggregated_by,
      limit,
      offset,
      devices,
      ...rest
    } = req.query;
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !start_date) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId and start_date are required.",
      });
    }
    if (!isValidDate(start_date)) {
      return res
        .status(400)
        .json({ error: "start_date must be in YYYY-MM-DD format." });
    }
    if (end_date && !isValidDate(end_date)) {
      return res
        .status(400)
        .json({ error: "end_date must be in YYYY-MM-DD format." });
    }
    if (aggregated_by && !isValidAggregatedBy(aggregated_by)) {
      return res
        .status(400)
        .json({ error: "aggregated_by must be one of: day, week, month." });
    }
    // Validate devices param
    let devicesParam = devices;
    if (devicesParam) {
      let deviceList = [];
      if (Array.isArray(devicesParam)) {
        deviceList = devicesParam;
      } else if (typeof devicesParam === "string") {
        deviceList = devicesParam.split(",").map((d) => d.trim());
      }
      const invalidDevices = deviceList.filter((d) => !isValidDeviceType(d));
      if (invalidDevices.length > 0) {
        return res.status(400).json({
          error: `Invalid device type(s): ${invalidDevices.join(
            ", "
          )}. Allowed: Desktop, Webmail, Phone, Tablet, Other.`,
        });
      }
      devicesParam = deviceList.join(",");
    }
    // Compose query params for SendGrid
    const queryParams = { start_date };
    if (end_date) queryParams.end_date = end_date;
    if (aggregated_by) queryParams.aggregated_by = aggregated_by;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    if (devicesParam) queryParams.devices = devicesParam;
    const stats = await getEmailStatsByDevice(clientId, queryParams);
    return res.status(200).json(stats);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/stats/mailboxproviders
 * - Requires: clientId and start_date as query parameters.
 * - Passes allowed query params to SendGrid's mailbox providers stats API.
 * - Uses on-behalf-of header for subuser.
 */
app.get("/sendGrid/stats/mailboxproviders", async (req, res) => {
  try {
    const allowedParams = [
      "clientId",
      "start_date",
      "end_date",
      "aggregated_by",
      "limit",
      "offset",
      "mailbox_providers",
    ];
    const {
      clientId,
      start_date,
      end_date,
      aggregated_by,
      limit,
      offset,
      mailbox_providers,
      ...rest
    } = req.query;
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !start_date) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId and start_date are required.",
      });
    }
    if (!isValidDate(start_date)) {
      return res
        .status(400)
        .json({ error: "start_date must be in YYYY-MM-DD format." });
    }
    if (end_date && !isValidDate(end_date)) {
      return res
        .status(400)
        .json({ error: "end_date must be in YYYY-MM-DD format." });
    }
    if (aggregated_by && !isValidAggregatedBy(aggregated_by)) {
      return res
        .status(400)
        .json({ error: "aggregated_by must be one of: day, week, month." });
    }
    // Validate mailbox_providers param
    let mailboxProvidersParam = mailbox_providers;
    if (mailboxProvidersParam) {
      let providerList = [];
      if (Array.isArray(mailboxProvidersParam)) {
        providerList = mailboxProvidersParam;
      } else if (typeof mailboxProvidersParam === "string") {
        providerList = mailboxProvidersParam.split(",").map((d) => d.trim());
      }
      mailboxProvidersParam = providerList.join(",");
    }
    // Compose query params for SendGrid
    const queryParams = { start_date };
    if (end_date) queryParams.end_date = end_date;
    if (aggregated_by) queryParams.aggregated_by = aggregated_by;
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;
    if (mailboxProvidersParam)
      queryParams.mailbox_providers = mailboxProvidersParam;
    const stats = await getEmailStatsByMailboxProvider(clientId, queryParams);
    return res.status(200).json(stats);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/stats/qualityscore
 * - Requires: clientId, from, and to as query parameters.
 * - Passes allowed query params to SendGrid's engagement quality API.
 * - Uses on-behalf-of header for subuser.
 */
app.get("/sendGrid/stats/qualityscore", async (req, res) => {
  try {
    const allowedParams = ["clientId", "from", "to"];
    const { clientId, from, to, ...rest } = req.query;
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !from || !to) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId, from, and to are required.",
      });
    }
    if (!isValidDate(from)) {
      return res
        .status(400)
        .json({ error: "from must be in YYYY-MM-DD format." });
    }
    if (!isValidDate(to)) {
      return res
        .status(400)
        .json({ error: "to must be in YYYY-MM-DD format." });
    }
    // Compose query params for SendGrid
    const queryParams = { from, to };
    const stats = await getEngagementQualityScores(clientId, queryParams);
    return res.status(200).json(stats);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/emailactivity
 * - Requires: clientId and query as query parameters.
 * - Optional: limit (1-1000)
 * - Fetches the SendGrid API key for the clientId from Secrets Manager, then calls getEmailActivity.
 */
app.get("/sendGrid/emailactivity", async (req, res) => {
  try {
    const { clientId, query, limit, ...rest } = req.query;
    const allowedParams = ["clientId", "query", "limit"];
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !query) {
      return res.status(400).json({
        error:
          "Missing required query parameters: clientId and query are required.",
      });
    }
    let limitNum;
    if (limit !== undefined) {
      limitNum = Number(limit);
      if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 1000) {
        return res
          .status(400)
          .json({ error: "limit must be an integer between 1 and 1000." });
      }
    }
    // Fetch API key from Secrets Manager
    const secretName = `SendGridAPIKey-${clientId}`;
    let apiKey;
    try {
      const secretsManagerClient = new SecretsManagerClient({
        region: process.env.AWS_REGION || "us-east-2",
      });
      const secretData = await secretsManagerClient.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );
      const secretString = secretData.SecretString;
      apiKey = JSON.parse(secretString).apiKey;
    } catch (err) {
      return res.status(500).json({
        error: `Failed to retrieve API key for clientId: ${clientId}`,
      });
    }
    // Call SendGrid email activity API
    const result = await getEmailActivity(apiKey, query, limitNum);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

/**
 * GET /sendGrid/emailactivity/:messageId
 * - Requires: clientId as a query parameter.
 * - Fetches the SendGrid API key for the clientId from Secrets Manager, then calls getEmailActivityByMessageId.
 */
app.get("/sendGrid/emailactivity/:messageId", async (req, res) => {
  try {
    const { clientId, ...rest } = req.query;
    const { messageId } = req.params;
    const allowedParams = ["clientId"];
    // Check for unrecognized params
    const extraParams = Object.keys(rest).filter(
      (key) => !allowedParams.includes(key)
    );
    if (extraParams.length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${extraParams.join(", ")}`,
      });
    }
    if (!clientId || !messageId) {
      return res.status(400).json({
        error:
          "Missing required parameters: clientId and messageId are required.",
      });
    }
    // Fetch API key from Secrets Manager
    const secretName = `SendGridAPIKey-${clientId}`;
    let apiKey;
    try {
      const secretsManagerClient = new SecretsManagerClient({
        region: process.env.AWS_REGION || "us-east-2",
      });
      const secretData = await secretsManagerClient.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );
      const secretString = secretData.SecretString;
      apiKey = JSON.parse(secretString).apiKey;
    } catch (err) {
      return res.status(500).json({
        error: `Failed to retrieve API key for clientId: ${clientId}`,
      });
    }
    // Call SendGrid email activity by messageId API
    const result = await getEmailActivityByMessageId(apiKey, messageId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 1. GET /sendGrid/tracking_settings
app.get("/sendGrid/tracking_settings", async (req, res) => {
  try {
    const { clientId, ...rest } = req.query;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }
    if (Object.keys(rest).length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${Object.keys(rest).join(
          ", "
        )}`,
      });
    }
    const result = await getTrackingSettings(clientId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 2. GET /sendGrid/tracking_settings/click
app.get("/sendGrid/tracking_settings/click", async (req, res) => {
  try {
    const { clientId, ...rest } = req.query;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }
    if (Object.keys(rest).length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${Object.keys(rest).join(
          ", "
        )}`,
      });
    }
    const result = await getClickTrackingSettings(clientId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 3. PATCH /sendGrid/tracking_settings/click
app.patch("/sendGrid/tracking_settings/click", async (req, res) => {
  try {
    const { clientId, ...rest } = req.body;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required field: clientId" });
    }
    const data = { ...rest };
    const result = await updateClickTrackingSettings(clientId, data);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 4. GET /sendGrid/tracking_settings/google_analytics
app.get("/sendGrid/tracking_settings/google_analytics", async (req, res) => {
  try {
    const { clientId, ...rest } = req.query;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }
    if (Object.keys(rest).length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${Object.keys(rest).join(
          ", "
        )}`,
      });
    }
    const result = await getGoogleAnalyticsSettings(clientId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 5. PATCH /sendGrid/tracking_settings/google_analytics
app.patch("/sendGrid/tracking_settings/google_analytics", async (req, res) => {
  try {
    const { clientId, ...rest } = req.body;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required field: clientId" });
    }
    const data = { ...rest };
    const result = await updateGoogleAnalyticsSettings(clientId, data);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 6. GET /sendGrid/tracking_settings/open
app.get("/sendGrid/tracking_settings/open", async (req, res) => {
  try {
    const { clientId, ...rest } = req.query;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }
    if (Object.keys(rest).length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${Object.keys(rest).join(
          ", "
        )}`,
      });
    }
    const result = await getOpenTrackingSettings(clientId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 7. PATCH /sendGrid/tracking_settings/open
app.patch("/sendGrid/tracking_settings/open", async (req, res) => {
  try {
    const { clientId, ...rest } = req.body;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required field: clientId" });
    }
    const data = { ...rest };
    const result = await updateOpenTrackingSettings(clientId, data);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 8. GET /sendGrid/tracking_settings/subscription
app.get("/sendGrid/tracking_settings/subscription", async (req, res) => {
  try {
    const { clientId, ...rest } = req.query;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required query parameter: clientId" });
    }
    if (Object.keys(rest).length > 0) {
      return res.status(400).json({
        error: `Unrecognized query parameter(s): ${Object.keys(rest).join(
          ", "
        )}`,
      });
    }
    const result = await getSubscriptionTrackingSettings(clientId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// 9. PATCH /sendGrid/tracking_settings/subscription
app.patch("/sendGrid/tracking_settings/subscription", async (req, res) => {
  try {
    const { clientId, ...rest } = req.body;
    if (!clientId) {
      return res
        .status(400)
        .json({ error: "Missing required field: clientId" });
    }
    const data = { ...rest };
    const result = await updateSubscriptionTrackingSettings(clientId, data);
    return res.status(200).json(result);
  } catch (error) {
    if (error.body) {
      console.error("SendGrid API Error:", error.body);
      return res.status(error.statusCode || 500).json({ error: error.body });
    }
    console.error("Unexpected Error:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

module.exports = app;
