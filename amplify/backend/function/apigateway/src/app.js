const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const AWS = require("aws-sdk");
const apigateway = new AWS.APIGateway();

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

async function getOrCreateUsagePlan(usagePlanName) {
  let position = undefined;
  let usagePlan = null;

  do {
    // Fetch the list of usage plans with the current position
    const usagePlansObject = await apigateway
      .getUsagePlans({
        position: position,
        limit: 100, // Adjust the limit as needed
      })
      .promise();

    // Try to locate the usage plan by name
    usagePlan = usagePlansObject.items.find(
      (item) => item.name === usagePlanName
    );

    // If you have found the usage plan, break out of the loop.
    if (usagePlan) {
      break;
    }

    // If not found, and there's a position token for more results, update position
    position = usagePlansObject.position;
  } while (position);

  if (!usagePlan) {
    // If the usage plan was not found through pagination, create a new one.
    const createUsagePlanParams = {
      name: usagePlanName,
      // Add additional parameters for the usage plan if needed
    };
    usagePlan = await apigateway
      .createUsagePlan(createUsagePlanParams)
      .promise();
  }

  return usagePlan;
}

async function getOrCreateApiKey(apiKeyName) {
  let position = undefined;
  let apiKey = null;
  do {
    // Fetch the list of API keys with the current position
    const apiKeyObject = await apigateway
      .getApiKeys({
        includeValues: true,
        position: position,
        limit: 100, // Adjust the limit as needed
      })
      .promise();

    // Try to locate the API key by name
    apiKey = apiKeyObject.items.find((key) => key.name === apiKeyName);

    // If found, break out of the loop
    if (apiKey) {
      break;
    }

    // If not found, and there's a position token for more results, update position
    position = apiKeyObject?.position;
  } while (position);

  // If the API key was found, return it, otherwise create a new one
  if (!apiKey) {
    const createApiKeyParams = {
      name: apiKeyName,
      description: "Your API Key Description",
      enabled: true,
    };
    apiKey = await apigateway.createApiKey(createApiKeyParams).promise();
  }

  return apiKey;
}

async function isApiKeyAssociatedWithUsagePlan(apiKey, usagePlan) {
  let position = undefined;
  let isAssociated = false;

  do {
    const usagePlanKeysResponse = await apigateway
      .getUsagePlanKeys({
        usagePlanId: usagePlan.id,
        position: position,
        limit: 100, // Adjust the limit as needed
      })
      .promise();

    isAssociated = usagePlanKeysResponse.items.some(
      (item) => item.id === apiKey.id
    );

    // If the API Key is already associated, break out of the loop
    if (isAssociated) {
      break;
    }

    // Update the position for the next page of results, if there is one
    position = usagePlanKeysResponse.position;
  } while (position);

  return isAssociated;
}

async function associateApiKeyWithUsagePlan(apiKey, usagePlan) {
  const isAssociated = await isApiKeyAssociatedWithUsagePlan(apiKey, usagePlan);

  if (isAssociated) {
    console.log("API Key is already associated with the Usage Plan");
    return;
  }

  const createUsagePlanKeyParams = {
    keyId: apiKey.id,
    keyType: "API_KEY",
    usagePlanId: usagePlan.id,
  };

  const usagePlanKey = await apigateway
    .createUsagePlanKey(createUsagePlanKeyParams)
    .promise();
  return usagePlanKey;
}

app.get("/getAPIKey", async function (req, res) {
  const user = req?.query?.user;
  const apiKeyName = user;
  const usagePlanName = "The Graphite Lab Toolbox";

  const apiKey = await getOrCreateApiKey(apiKeyName);
  const usagePlan = await getOrCreateUsagePlan(usagePlanName);
  const usagePlanKey = await associateApiKeyWithUsagePlan(apiKey, usagePlan);

  res.json({
    success: "get call succeed!",
    url: req.url,
    data: { apiKey, usagePlan, usagePlanKey },
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
