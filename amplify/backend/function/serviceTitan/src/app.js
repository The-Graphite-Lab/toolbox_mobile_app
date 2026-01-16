const express = require("express");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const CryptoJS = require("crypto-js");
const _ = require("lodash");
const moment = require("moment");

const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const axios = require("axios");
const key = process.env.REACT_APP_ENCRYPTION_KEY;

let retryAfter;

// Decryption function
const decrypt = (encrypted) => {
  const HEXKey = CryptoJS.enc.Hex.parse(key);
  const decrypted = CryptoJS.AES.decrypt(encrypted, HEXKey, {
    mode: CryptoJS.mode.ECB,
  }).toString(CryptoJS.enc.Utf8);
  return decrypted;
};

function filterFields(data, fields) {
  if (Array.isArray(data)) {
    return data.map((item) => _.pick(item, fields));
  }
  return _.pick(data, fields);
}

async function performGetRequest(url, params, authToken, retries = 5) {
  if (retries === 0) {
    throw new Error("Maximum retry attempts exhausted");
  }

  const response = await axios
    .get(url, {
      headers: {
        "Content-Type": "application/json",
        "ST-App-Key": serviceTitanAppKey,
        Authorization: `Bearer ${authToken}`,
      },
      params: params,
    })
    .catch(async (error) => {
      // Check if error response status is 429
      if (error?.response?.status === 429) {
        // Calculate delay: 2^(maxRetries-retries) seconds, e.g. 1, 2, 4, 8, 16
        const delay = Math.pow(2, 5 - retries) * 1000;
        console.log(
          `Request rate limit reached. Retrying in ${delay / 1000} seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return performGetRequest(url, params, authToken, retries - 1);
      } else {
        // If error response status is not 429, just throw the error
        throw error;
      }
    });

  return response?.data;
}

async function performPostGetRequest(
  url,
  params,
  body,
  authToken,
  retries = 5
) {
  if (retries === 0) {
    throw new Error("Maximum retry attempts exhausted");
  }

  const response = await axios
    .post(url, body, {
      headers: {
        "Content-Type": "application/json",
        "ST-App-Key": serviceTitanAppKey,
        Authorization: `Bearer ${authToken}`,
      },
      params: params,
    })
    .catch(async (error) => {
      throw error;
    });

  return response?.data;
}

async function performPostRequestWithRetry(
  url,
  params,
  body,
  authToken,
  retries = 5
) {
  if (retries === 0) {
    throw new Error("Maximum retry attempts exhausted");
  }

  try {
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        "ST-App-Key": serviceTitanAppKey,
        Authorization: `Bearer ${authToken}`,
      },
      params: params,
    });

    return response?.data;
  } catch (error) {
    // Check if error response status is 429
    if (error?.response?.status === 429) {
      // Calculate delay: 2^(maxRetries-retries) seconds, e.g. 1, 2, 4, 8, 16
      const delay = Math.pow(2, 5 - retries) * 1000;
      console.log(
        `Request rate limit reached. Retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return performPostRequestWithRetry(
        url,
        params,
        body,
        authToken,
        retries - 1
      );
    } else {
      // If error response status is not 429, just throw the error
      throw error;
    }
  }
}

async function performPatchRequestWithRetry(
  url,
  params,
  body,
  authToken,
  retries = 5
) {
  if (retries === 0) {
    throw new Error("Maximum retry attempts exhausted");
  }

  try {
    const response = await axios.patch(url, body, {
      headers: {
        "Content-Type": "application/json",
        "ST-App-Key": serviceTitanAppKey,
        Authorization: `Bearer ${authToken}`,
      },
      params: params,
    });

    return response?.data;
  } catch (error) {
    // Check if error response status is 429
    if (error?.response?.status === 429) {
      // Calculate delay: 2^(maxRetries-retries) seconds, e.g. 1, 2, 4, 8, 16
      const delay = Math.pow(2, 5 - retries) * 1000;
      console.log(
        `Request rate limit reached. Retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return performPatchRequestWithRetry(
        url,
        params,
        body,
        authToken,
        retries - 1
      );
    } else {
      // If error response status is not 429, just throw the error
      throw error;
    }
  }
}

async function performGetAggregateRequest(
  url,
  params,
  authToken,
  fields,
  groupByField,
  aggregateType,
  filters = {},
  retries = 5,
  page = 1
) {
  if (retries === 0) {
    throw new Error("Maximum retry attempts exhausted");
  }

  // Add page to params
  params.page = page;

  // First request to get total count and page size
  const response = await axios
    .get(url, {
      headers: {
        "Content-Type": "application/json",
        "ST-App-Key": serviceTitanAppKey,
        Authorization: `Bearer ${authToken}`,
      },
      params: params,
    })
    .catch(async (error) => {
      handleRateLimitError(
        error,
        url,
        params,
        authToken,
        fields,
        groupByField,
        aggregateType,
        filters,
        retries,
        page
      );
    });

  let data = response?.data?.data || [];
  const totalCount = response?.data?.totalCount || 0;
  const pageSize = response?.data?.pageSize || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // If there is more than one page, get remaining pages simultaneously
  if (totalPages > 1) {
    // Generate an array of page numbers from 2 to totalPages
    const remainingPages = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    );

    // Fetch all remaining pages simultaneously
    const remainingResponses = await Promise.all(
      remainingPages.map((pageNumber) =>
        axios
          .get(url, {
            headers: {
              "Content-Type": "application/json",
              "ST-App-Key": serviceTitanAppKey,
              Authorization: `Bearer ${authToken}`,
            },
            params: { ...params, page: pageNumber },
          })
          .catch(async (error) => {
            handleRateLimitError(
              error,
              url,
              params,
              authToken,
              fields,
              groupByField,
              aggregateType,
              filters,
              retries,
              pageNumber
            );
          })
      )
    );

    // Extract data from each response and concatenate
    for (const res of remainingResponses) {
      const pageData = res?.data?.data || [];
      data.push(...pageData);
    }
  }

  //filtering the data after we receive it
  data = applyFilters(data, filters);

  // Aggregate data
  const aggregates = aggregateData(data, fields, groupByField, aggregateType);
  return aggregates;
}

async function handleRateLimitError(
  error,
  url,
  params,
  authToken,
  fields,
  groupByField,
  aggregateType = "sum",
  filters = {},
  retries,
  page
) {
  // Check if error response status is 429
  if (error?.response?.status === 429) {
    // Calculate delay: 2^(maxRetries-retries) seconds, e.g. 1, 2, 4, 8, 16
    const delay = Math.pow(2, 5 - retries) * 1000;
    console.log(
      `Request rate limit reached. Retrying in ${delay / 1000} seconds...`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    return performGetAggregateRequest(
      url,
      params,
      authToken,
      fields,
      groupByField,
      aggregateType,
      filters,
      retries - 1,
      page
    );
  } else {
    // If error response status is not 429, just throw the error
    throw error;
  }
}

function aggregateData(allData, fields, groupByField, aggregateType = "sum") {
  let aggregates;
  // If groupByField is specified, group the data by that field
  if (groupByField) {
    aggregates = _.groupBy(allData, (item) => {
      // Use _.get() to retrieve the nested property value
      const groupByValue = _.get(item, groupByField);

      // If groupByValue is a date, format it as YYYY-MM or YYYY-MM-DD based on the aggregateType
      if (moment(groupByValue, moment.ISO_8601, true).isValid()) {
        return aggregateType === "month"
          ? moment(groupByValue).format("YYYY-MM")
          : moment(groupByValue).format("YYYY-MM-DD");
      }
      // Otherwise, group by the value directly
      return groupByValue;
    });
  } else {
    // If no groupByField is specified, treat all data as a single group
    aggregates = { all: allData };
  }

  // For each group, perform the aggregation
  for (const group in aggregates) {
    if (aggregateType === "count") {
      // If aggregateType is 'count', just count the items in each group
      aggregates[group] = aggregates[group].length;
    } else {
      // Otherwise, sum the specified fields for each item in the group
      const groupAggregates = {};
      for (const field of fields) {
        if (field.includes(".")) {
          // If field includes '.', it's a nested field
          const fieldParts = field.split(".");
          const parent = fieldParts.slice(0, -1);
          const child = fieldParts[fieldParts.length - 1];
          groupAggregates[field] = aggregates[group].reduce((sum, item) => {
            const nestedItems = _.get(item, parent, []) || []; // default to empty array if property does not exist
            const fieldSum = nestedItems.reduce((itemSum, subItem) => {
              let value = _.get(subItem, child, 0);
              value = isNaN(value) ? 0 : parseFloat(value); // if value is NaN, convert it to 0, else parse it
              return itemSum + value;
            }, 0);
            return sum + fieldSum;
          }, 0);
        } else {
          // If field doesn't include '.', it's a regular field
          groupAggregates[field] = aggregates[group].reduce((sum, item) => {
            let value = _.get(item, field, 0);
            value = isNaN(value) ? 0 : parseFloat(value); // if value is NaN, convert it to 0, else parse it
            return sum + value;
          }, 0);
        }
      }
      aggregates[group] = groupAggregates;
    }
  }

  return aggregates;
}

function applyFilters(data, filters) {
  if (!filters || typeof filters !== "object") {
    return data;
  }

  return data.filter((item) => {
    for (let key in filters) {
      if (!key.includes(".")) {
        // direct property
        if (item[key] !== filters[key]) {
          return false;
        }
      } else {
        // nested property
        const keys = key.split(".");
        let value = item;
        for (let k of keys) {
          if (value == null) {
            // if null or undefined
            return false;
          }
          value = value[k];
        }
        if (value !== filters[key]) {
          return false;
        }
      }
    }
    return true;
  });
}

//this function gets the ST credentials object from ST and returns the decrypted key-value pairs
async function getServiceTitanCredentials(ClientID) {
  if (!ClientID) return;
  const tableName = "Integrations-bm44urfj6bcajm63ohamnsj4au-staging";
  const indexName = "byClient";
  const serviceName = "ServiceTitan";

  const params = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression:
      "#ClientID = :ClientID AND #serviceName = :serviceName",
    ExpressionAttributeValues: {
      ":ClientID": ClientID,
      ":serviceName": serviceName,
    },
    ExpressionAttributeNames: {
      "#ClientID": "ClientID",
      "#serviceName": "serviceName",
    },
  };

  try {
    const data = await docClient.query(params).promise();
    const credentialObject = data.Items[0];
    let credentials = credentialObject.integrationKeys;
    credentials = decrypt(credentials);
    credentials = JSON.parse(credentials);
    let opts =
      credentialObject?.options && credentialObject?.options !== "{}"
        ? credentialObject?.options
        : "[]";
    opts = JSON?.parse(opts);
    return {
      ...credentials,
      options: opts,
    };
  } catch (err) {
    console.log(err?.message);
    return err;
  }
}

const serviceTitanAppKey = process.env.REACT_APP_SERVICETITAN_APP_KEY;
const prodUrl = "https://api.servicetitan.io";
const intUrl = "https://api-integration.servicetitan.io";

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

async function generateServiceTitanAuthToken(
  clientID,
  clientSecret,
  useIntegration
) {
  const apiResponse = await axios
    .post(
      `https://auth${
        useIntegration ? "-integration" : ""
      }.servicetitan.io/connect/token`,
      `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .catch((error) => {
      console.error(error);
    });
  return apiResponse?.data?.access_token;
}

async function getBusinessUnits(tenantID, authToken, useIntegration) {
  const apiResponse = await axios
    .get(
      `${
        useIntegration ? intUrl : prodUrl
      }/settings/v2/tenant/${tenantID}/business-units`,
      {
        headers: {
          "Content-Type": "application/json",
          "ST-App-Key": serviceTitanAppKey,
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          pageSize: 200,
          active: true,
        },
      }
    )
    .catch((error) => {
      console.error(error);
    });
  return apiResponse?.data?.data;
}

async function getCampaigns(tenantID, authToken, useIntegration) {
  const apiResponse = await axios
    .get(
      `${
        useIntegration ? intUrl : prodUrl
      }/marketing/v2/tenant/${tenantID}/campaigns`,
      {
        headers: {
          "Content-Type": "application/json",
          "ST-App-Key": serviceTitanAppKey,
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          pageSize: 200,
          active: true,
        },
      }
    )
    .catch((error) => {
      console.error(error);
    });
  return apiResponse?.data?.data;
}

async function getEmployees(tenantID, authToken, useIntegration) {
  const apiResponse = await axios
    .get(
      `${
        useIntegration ? intUrl : prodUrl
      }/settings/v2/tenant/${tenantID}/employees`,
      {
        headers: {
          "Content-Type": "application/json",
          "ST-App-Key": serviceTitanAppKey,
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          pageSize: 200,
          active: true,
        },
      }
    )
    .catch((error) => {
      console.error(error);
    });
  return apiResponse?.data?.data;
}

async function getTechnicians(tenantID, authToken, useIntegration) {
  const apiResponse = await axios
    .get(
      `${
        useIntegration ? intUrl : prodUrl
      }/settings/v2/tenant/${tenantID}/technicians`,
      {
        headers: {
          "Content-Type": "application/json",
          "ST-App-Key": serviceTitanAppKey,
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          pageSize: 200,
          active: true,
        },
      }
    )
    .catch((error) => {
      console.error(error);
    });
  return apiResponse?.data?.data;
}

app.get("/st/employees", async function (req, res) {
  const query = req?.query;
  const user = query.user;
  const ClientID = query.ClientID;

  const stCredentialsObject = await getServiceTitanCredentials(ClientID);
  const stTenantID = stCredentialsObject?.tenantID;
  const stClientID = stCredentialsObject?.clientID;
  const stClientSecret = stCredentialsObject?.clientSecret;
  const useIntegration = stCredentialsObject?.options?.find(
    (option) => option?.key === "env"
  )?.value;

  if (!stTenantID || !stClientID || !stClientSecret)
    res.json({ status: "error", url: req.url, message: "Invalid Credentials" });

  const authToken = await generateServiceTitanAuthToken(
    stClientID,
    stClientSecret,
    useIntegration
  );
  let employees = [];
  if (authToken) {
    employees =
      (await getEmployees(stTenantID, authToken, useIntegration)) || [];
  }
  res.json({ status: "success", url: req.url, data: employees });
});

app.get("/st/technicians", async function (req, res) {
  const query = req?.query;
  const user = query.user;
  const ClientID = query.ClientID;

  const stCredentialsObject = await getServiceTitanCredentials(ClientID);
  const stTenantID = stCredentialsObject?.tenantID;
  const stClientID = stCredentialsObject?.clientID;
  const stClientSecret = stCredentialsObject?.clientSecret;
  const useIntegration = stCredentialsObject?.options?.find(
    (option) => option?.key === "env"
  )?.value;

  if (!stTenantID || !stClientID || !stClientSecret)
    res.json({ status: "error", url: req.url, message: "Invalid Credentials" });

  const authToken = await generateServiceTitanAuthToken(
    stClientID,
    stClientSecret,
    useIntegration
  );
  let technicians = [];
  if (authToken) {
    technicians =
      (await getTechnicians(stTenantID, authToken, useIntegration)) || [];
  }
  res.json({ status: "success", url: req.url, data: technicians });
});

app.get("/st/businessunits", async function (req, res) {
  const query = req?.query;
  const ClientID = query.ClientID;

  const stCredentialsObject = await getServiceTitanCredentials(ClientID);
  const stTenantID = stCredentialsObject?.tenantID;
  const stClientID = stCredentialsObject?.clientID;
  const stClientSecret = stCredentialsObject?.clientSecret;
  const useIntegration = stCredentialsObject?.options?.find(
    (option) => option?.key === "env"
  )?.value;

  if (!stTenantID || !stClientID || !stClientSecret)
    res.json({ status: "error", url: req.url, message: "Invalid Credentials" });

  const authToken = await generateServiceTitanAuthToken(
    stClientID,
    stClientSecret,
    useIntegration
  );
  let businessUnits = [];
  if (authToken) {
    businessUnits =
      (await getBusinessUnits(stTenantID, authToken, useIntegration)) || [];
  }
  res.json({ status: "success", url: req.url, data: businessUnits });
});

app.get("/st/campaigns", async function (req, res) {
  const query = req?.query;
  const ClientID = query.ClientID;

  const stCredentialsObject = await getServiceTitanCredentials(ClientID);
  const stTenantID = stCredentialsObject?.tenantID;
  const stClientID = stCredentialsObject?.clientID;
  const stClientSecret = stCredentialsObject?.clientSecret;
  const useIntegration = stCredentialsObject?.options?.find(
    (option) => option?.key === "env"
  )?.value;

  if (!stTenantID || !stClientID || !stClientSecret)
    res.json({ status: "error", url: req.url, message: "Invalid Credentials" });

  const authToken = await generateServiceTitanAuthToken(
    stClientID,
    stClientSecret,
    useIntegration
  );
  let campaigns = [];
  if (authToken) {
    campaigns =
      (await getCampaigns(stTenantID, authToken, useIntegration)) || [];
  }
  res.json({ status: "success", url: req.url, data: campaigns });
});

//make a general api get call to ST
app.get("/st/generic", async function (req, res) {
  const query = req?.query;
  const user = query.user;
  const ClientID = query.ClientID;

  const stCredentialsObject = await getServiceTitanCredentials(ClientID);
  const stTenantID = stCredentialsObject?.tenantID;
  const stClientID = stCredentialsObject?.clientID;
  const stClientSecret = stCredentialsObject?.clientSecret;
  const useIntegration = stCredentialsObject?.options?.find(
    (option) => option?.key === "env"
  )?.value;

  if (!stTenantID || !stClientID || !stClientSecret)
    res.json({ status: "error", url: req.url, message: "Invalid Credentials" });

  const authToken = await generateServiceTitanAuthToken(
    stClientID,
    stClientSecret,
    useIntegration
  );
  let response = [];
  if (authToken) {
    // get the params from the request query or default to an empty object
    let params = query.params || "{}";
    params = JSON.parse(params);

    let fields = query.fields || "[]";
    fields = JSON.parse(fields);

    let filters = query.filters || "{}";
    filters = JSON.parse(filters);

    let getAll = query.getAll || false;
    // get the requested url from the request query
    let url = query.url;
    if (url) {
      // Include tenant ID in the url
      let page = params.page || 1;
      let hasMore = false;

      url = url.replace(":tenantID", stTenantID);
      response =
        (await performGetRequest(url, { ...params, page }, authToken)) || [];
      let allData = response.data;
      hasMore = response.hasMore;

      //run a workflow if getAll is true that iterates through until we return all of the records
      if (response?.data?.length && response?.hasMore && getAll) {
        page++;
        do {
          try {
            // Perform the API call
            const response = await performGetRequest(
              url,
              { ...params, page },
              authToken
            );

            // Push the fetched data items into the allData array
            if (response.data && response.data) {
              allData.push(...response.data);
            }

            hasMore = response.data?.length && response.hasMore;

            if (hasMore) {
              page++; // Increment the page number for the next iteration
            }
          } catch (error) {
            console.error(
              `Error fetching data for page ${page}:`,
              error.message
            );
            throw error; // If there's an error, throw it. You can decide how you want to handle this scenario.
          }
        } while (hasMore);
      }

      if (filters && Object.keys(filters).length > 0) {
        allData = applyFilters(allData, filters);
      }

      //run the fields workflow to reduce the data returned to the front end
      if (fields && Array.isArray(fields) && fields.length > 0) {
        allData = filterFields(allData, fields);
      }

      response.data = allData;
    } else {
      res.json({ status: "error", url: req.url, message: "URL is missing" });
      return;
    }
  }
  res.json({
    status: "success",
    url: req.url,
    data: response,
    params: query.params,
  });
});

app.patch("/st/reschedule", async function (req, res) {
  try {
    const { appID, newStart, newEnd, ClientID } = req.body;

    // Validate input data
    if (!ClientID || !appID || !newStart || !newEnd) {
      res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
      return;
    }

    const stCredentialsObject = await getServiceTitanCredentials(ClientID);
    const stTenantID = stCredentialsObject?.tenantID;
    const stClientID = stCredentialsObject?.clientID;
    const stClientSecret = stCredentialsObject?.clientSecret;
    const useIntegration = stCredentialsObject?.options?.find(
      (option) => option?.key === "env"
    )?.value;

    if (!stTenantID || !stClientID || !stClientSecret) {
      res.status(401).json({ status: "error", message: "Invalid Credentials" });
      return;
    }

    const authToken = await generateServiceTitanAuthToken(
      stClientID,
      stClientSecret,
      useIntegration
    );

    if (!authToken) {
      res
        .status(401)
        .json({ status: "error", message: "Failed to generate auth token" });
      return;
    }

    const url = `${
      useIntegration ? intUrl : prodUrl
    }/jpm/v2/tenant/${stTenantID}/appointments/${appID}/reschedule`;
    const body = { start: newStart, end: newEnd };

    const response = await performPatchRequestWithRetry(
      url,
      {},
      body,
      authToken
    );
    res.json({ status: "success", data: response });
  } catch (error) {
    console.error(`Error during assigning technicians: ${error.message}`);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/st/unassignTechs", async function (req, res) {
  try {
    const { ClientID, techIDs, appID } = req.body;

    // Validate input data
    if (!ClientID || !techIDs || !appID) {
      res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
      return;
    }

    const stCredentialsObject = await getServiceTitanCredentials(ClientID);
    const stTenantID = stCredentialsObject?.tenantID;
    const stClientID = stCredentialsObject?.clientID;
    const stClientSecret = stCredentialsObject?.clientSecret;
    const useIntegration = stCredentialsObject?.options?.find(
      (option) => option?.key === "env"
    )?.value;

    if (!stTenantID || !stClientID || !stClientSecret) {
      res.status(401).json({ status: "error", message: "Invalid Credentials" });
      return;
    }

    const authToken = await generateServiceTitanAuthToken(
      stClientID,
      stClientSecret,
      useIntegration
    );

    if (!authToken) {
      res
        .status(401)
        .json({ status: "error", message: "Failed to generate auth token" });
      return;
    }

    const url = `${
      useIntegration ? intUrl : prodUrl
    }/dispatch/v2/tenant/${stTenantID}/appointment-assignments/unassign-technicians`;
    const body = { jobAppointmentId: appID, technicianIds: techIDs };

    const response = await performPostRequestWithRetry(
      url,
      { tenant: stTenantID },
      body,
      authToken
    );
    res.json({ status: "success", data: response });
  } catch (error) {
    console.error(`Error during assigning technicians: ${error.message}`);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/st/assignTechs", async function (req, res) {
  try {
    const { ClientID, techIDs, appID } = req.body;

    // Validate input data
    if (!ClientID || !techIDs || !appID) {
      res
        .status(400)
        .json({ status: "error", message: "Missing required fields" });
      return;
    }

    const stCredentialsObject = await getServiceTitanCredentials(ClientID);
    if (!stCredentialsObject) {
      res.status(401).json({ status: "error", message: "Invalid Credentials" });
      return;
    }

    const stTenantID = stCredentialsObject?.tenantID;
    const stClientID = stCredentialsObject?.clientID;
    const stClientSecret = stCredentialsObject?.clientSecret;
    const useIntegration = stCredentialsObject?.options?.find(
      (option) => option?.key === "env"
    )?.value;

    if (!stTenantID || !stClientID || !stClientSecret) {
      res.status(401).json({ status: "error", message: "Invalid Credentials" });
      return;
    }

    const authToken = await generateServiceTitanAuthToken(
      stClientID,
      stClientSecret,
      useIntegration
    );

    if (!authToken) {
      res
        .status(401)
        .json({ status: "error", message: "Failed to generate auth token" });
      return;
    }

    const url = `${
      useIntegration ? intUrl : prodUrl
    }/dispatch/v2/tenant/${stTenantID}/appointment-assignments/assign-technicians`;
    const body = { jobAppointmentId: appID, technicianIds: techIDs };

    const response = await performPostRequestWithRetry(
      url,
      { tenant: stTenantID },
      body,
      authToken
    );

    res.json({ status: "success", data: response });
  } catch (error) {
    console.error(`Error during assigning technicians: ${error.message}`);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

app.post("/st/reportdata", async function (req, res) {
  try {
    const query = req?.query;
    const user = query.user;
    const ClientID = query.ClientID;

    const stCredentialsObject = await getServiceTitanCredentials(ClientID);
    const stTenantID = stCredentialsObject?.tenantID;
    const stClientID = stCredentialsObject?.clientID;
    const stClientSecret = stCredentialsObject?.clientSecret;
    const useIntegration = stCredentialsObject?.options?.find(
      (option) => option?.key === "env"
    )?.value;

    if (!stTenantID || !stClientID || !stClientSecret)
      res.json({
        status: "error",
        url: req.url,
        message: "Invalid Credentials",
      });

    const authToken = await generateServiceTitanAuthToken(
      stClientID,
      stClientSecret,
      useIntegration
    );
    let response = [];
    if (authToken) {
      // get the params from the request query or default to an empty object
      let params = query.params || "{}";
      params = JSON.parse(params);

      let reportCategory = query.reportCategory;
      let reportId = query.reportId;

      if (!reportCategory || !reportId) {
        res.json({
          status: "error",
          url: req.url,
          message: "Report Category or Report ID is missing",
        });
        return;
      }

      let body = req.body || {};

      let fields = query.fields || "[]";
      fields = JSON.parse(fields);

      let filters = query.filters || "{}";
      filters = JSON.parse(filters);

      let getAll = query.getAll || false;
      // get the requested url from the request query
      let url = `${
        useIntegration ? intUrl : prodUrl
      }/reporting/v2/tenant/:tenantID/report-category/${reportCategory}/reports/${reportId}/data`;
      if (url) {
        // Include tenant ID in the url
        let page = params.page || 1;
        let hasMore = false;

        url = url.replace(":tenantID", stTenantID);
        response =
          (await performPostGetRequest(
            url,
            { ...params, page },
            { ...body },
            authToken
          )) || [];
        let allData = response.data;
        hasMore = response.hasMore;

        //run a workflow if getAll is true that iterates through until we return all of the records
        if (response?.data?.length && response?.hasMore && getAll) {
          page++;
          do {
            try {
              // Perform the API call
              const response = await performPostGetRequest(
                url,
                { ...params, page },
                { ...body },
                authToken
              );

              // Push the fetched data items into the allData array
              if (response.data && response.data) {
                allData.push(...response.data);
              }

              hasMore = response.data?.length && response.hasMore;

              if (hasMore) {
                page++; // Increment the page number for the next iteration
              }
            } catch (error) {
              console.error(
                `Error fetching data for page ${page}:`,
                error.message
              );
              throw error; // If there's an error, throw it. You can decide how you want to handle this scenario.
            }
          } while (hasMore);
        }

        if (filters && Object.keys(filters).length > 0) {
          allData = applyFilters(allData, filters);
        }

        //run the fields workflow to reduce the data returned to the front end
        if (fields && Array.isArray(fields) && fields.length > 0) {
          allData = filterFields(allData, fields);
        }

        response.data = allData;
      } else {
        res.json({ status: "error", url: req.url, message: "URL is missing" });
        return;
      }
    }
    res.json({
      status: "success",
      url: req.url,
      data: response,
      params: query.params,
    });
  } catch (err) {
    if (err.response && err.response.status === 429) {
      retryAfter = err?.response?.headers["retry-after"];
    }
    res.json({
      status: "error",
      url: req.url,
      message: err.message,
      fullError: err,
      erroredBody: req.body,
      retryAfter,
    });
  }
});

app.post("/st/capacity", async function (req, res) {
  try {
    const query = req?.query;
    const user = query.user;
    const ClientID = query.ClientID;

    const stCredentialsObject = await getServiceTitanCredentials(ClientID);
    const stTenantID = stCredentialsObject?.tenantID;
    const stClientID = stCredentialsObject?.clientID;
    const stClientSecret = stCredentialsObject?.clientSecret;
    const useIntegration = stCredentialsObject?.options?.find(
      (option) => option?.key === "env"
    )?.value;

    if (!stTenantID || !stClientID || !stClientSecret)
      res.json({
        status: "error",
        url: req.url,
        message: "Invalid Credentials",
      });

    const authToken = await generateServiceTitanAuthToken(
      stClientID,
      stClientSecret,
      useIntegration
    );
    let response = [];
    if (authToken) {
      // get the params from the request query or default to an empty object
      let params = query.params || "{}";
      params = JSON.parse(params);

      let body = req.body || {};
      let getAll = query.getAll || false;
      // get the requested url from the request query
      let url = `${
        useIntegration ? intUrl : prodUrl
      }/dispatch/v2/tenant/:tenantID/capacity`;
      if (url) {
        // Include tenant ID in the url
        let page = params.page || 1;
        let hasMore = false;

        url = url.replace(":tenantID", stTenantID);
        response =
          (await performPostGetRequest(
            url,
            { ...params, page },
            { ...body },
            authToken
          )) || [];
        let allData = response.data;
        hasMore = response.hasMore;

        //run a workflow if getAll is true that iterates through until we return all of the records
        if (response?.data?.length && response?.hasMore && getAll) {
          page++;
          do {
            try {
              // Perform the API call
              const response = await performPostGetRequest(
                url,
                { ...params, page },
                { ...body },
                authToken
              );

              // Push the fetched data items into the allData array
              if (response.data && response.data) {
                allData.push(...response.data);
              }

              hasMore = response.data?.length && response.hasMore;

              if (hasMore) {
                page++; // Increment the page number for the next iteration
              }
            } catch (error) {
              console.error(
                `Error fetching data for page ${page}:`,
                error.message
              );
              throw error; // If there's an error, throw it. You can decide how you want to handle this scenario.
            }
          } while (hasMore);
        }

        response.data = allData;
      } else {
        res.json({ status: "error", url: req.url, message: "URL is missing" });
        return;
      }
    }
    res.json({
      status: "success",
      url: req.url,
      data: response,
      params: query.params,
    });
  } catch (err) {
    if (err.response && err.response.status === 429) {
      retryAfter = err?.response?.headers["retry-after"];
    }
    res.json({
      status: "error",
      url: req.url,
      message: err.message,
      retryAfter,
    });
  }
});

app.get("/st/generic/aggregate", async function (req, res) {
  const query = req?.query;
  const ClientID = query.ClientID;

  const stCredentialsObject = await getServiceTitanCredentials(ClientID);
  const stTenantID = stCredentialsObject?.tenantID;
  const stClientID = stCredentialsObject?.clientID;
  const stClientSecret = stCredentialsObject?.clientSecret;
  const useIntegration = stCredentialsObject?.options?.find(
    (option) => option?.key === "env"
  )?.value;

  if (!stTenantID || !stClientID || !stClientSecret)
    res.json({ status: "error", url: req.url, message: "Invalid Credentials" });

  const authToken = await generateServiceTitanAuthToken(
    stClientID,
    stClientSecret,
    useIntegration
  );
  let response = [];
  if (authToken) {
    // get the params from the request query or default to an empty object
    let params = query.params || "{}";
    params = JSON.parse(params);
    // get the requested url from the request query
    let url = query.url;
    let fields = query.fields || "[]";
    fields = JSON.parse(fields);

    let groupByField = query.groupByField;
    let aggregateType = query.aggregateType;
    let filters = query.filters || "{}";
    filters = JSON.parse(filters);

    if (authToken && url) {
      url = url.replace(":tenantID", stTenantID);
      response =
        (await performGetAggregateRequest(
          url,
          params,
          authToken,
          fields,
          groupByField,
          aggregateType,
          filters
        )) || {};
    } else {
      res.json({ status: "error", url: req.url, message: "URL is missing" });
      return;
    }
  }

  res.json({
    status: "success",
    url: req.url,
    data: response,
    params: query.params,
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
