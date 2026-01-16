/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const axios = require("axios");
const AWS = require("aws-sdk");
const apigateway = new AWS.APIGateway();
const s3 = new AWS.S3();

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

// async function getOrCreateUsagePlan(usagePlanName) {
//   const usagePlans = await apigateway.getUsagePlans().promise();
//   let usagePlan = usagePlans.items.find((item) => item.name === usagePlanName);

//   if (!usagePlan) {
//     const createUsagePlanParams = {
//       name: usagePlanName,
//       // Add additional parameters for the usage plan if needed
//     };
//     usagePlan = await apigateway
//       .createUsagePlan(createUsagePlanParams)
//       .promise();
//   }

//   return usagePlan;
// }

// async function isApiKeyAssociatedWithUsagePlan(apiKey, usagePlan) {
//   let usagePlanKeys = [];
//   let params = { usagePlanId: usagePlan.id, limit: 500 };
//   let response;

//   do {
//     response = await apigateway.getUsagePlanKeys(params).promise();
//     usagePlanKeys = usagePlanKeys.concat(response.items);

//     params.position = response.position;
//   } while (response.position);

//   const associated = usagePlanKeys.some((item) => item.id === apiKey.id);
//   return associated;
// }

// async function associateApiKeyWithUsagePlan(apiKey, usagePlan) {
//   const isAssociated = await isApiKeyAssociatedWithUsagePlan(apiKey, usagePlan);

//   if (isAssociated) {
//     console.log("API Key is already associated with the Usage Plan");
//     return;
//   }

//   const createUsagePlanKeyParams = {
//     keyId: apiKey.id,
//     keyType: "API_KEY",
//     usagePlanId: usagePlan.id,
//   };

//   const usagePlanKey = await apigateway
//     .createUsagePlanKey(createUsagePlanKeyParams)
//     .promise();
//   return usagePlanKey;
// }

async function getApiKey(apiKeyName) {
  let apiKeys = [];
  let params = { includeValues: true, limit: 500 };
  let response;

  do {
    response = await apigateway.getApiKeys(params).promise();
    apiKeys = apiKeys.concat(response.items); // Combine current page keys with all keys

    params.position = response.position; // Set the position for the next page, if it exists
  } while (response.position);

  let apiKey = apiKeys.find((key) => key.name === apiKeyName);
  return apiKey;
}

/**********************
 * Example get method *
 **********************/

app.get("/tglapi/weatherman", async function (req, res) {
  res.json({ success: "get call succeed!", url: req.url });
});

app.get("/tglapi/pdffiller", async function (req, res) {
  const bucketName = "tgltoolboxpdftemplates";
  const bucketUserFolder = req.query.user;

  const params = {
    Bucket: bucketName,
    Prefix: bucketUserFolder,
  };

  // console.log(params);

  try {
    // Fetch the list of objects in the bucket
    const data = await s3.listObjectsV2(params).promise();

    if (!data.Contents.length) {
      res.json({
        success: false,
        message: "No PDF files found",
        url: req.url,
        data: [],
      });
      return;
    }

    console.log("PDF files fetched successfully.");

    const filesWithSignedUrls = await Promise.all(
      data.Contents.map(async (fileObject) => {
        const presignedUrl = s3.getSignedUrl("getObject", {
          Bucket: bucketName,
          Key: fileObject.Key,
          Expires: 6000, // Duration in seconds
        });

        return {
          ...fileObject,
          presignedUrl,
        };
      })
    );

    if (!filesWithSignedUrls.length) {
      res.json({
        success: false,
        message: "Failed to sign",
        url: req.url,
        data: [],
      });
      return;
    }

    console.log("Files with signed URLs.");

    res.json({
      success: true,
      message: "PDF files fetched successfully",
      url: req.url,
      data: filesWithSignedUrls,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "PDF files fetch failed",
      url: req.url,
      error: error,
    });
  }
});

app.get("/tglapi/geocoder", async function (req, res) {
  const user = req?.query?.user;
  const apiKeyName = user;
  const apiKey = await getApiKey(apiKeyName);

  if (!apiKey) {
    res.json({
      status: "error",
      message: "API Key not found",
    });
    return;
  }

  let params = {
    url: `https://api.thegraphitelab.com/latlong_geocoder`,
    method: "GET",
    headers: {
      "x-api-key": apiKey?.value,
    },
    params: {
      address: req?.query?.address,
    },
  };

  await axios(params)
    .then((response) => {
      // console.log(response?.data);
      res.json({ status: "success", data: response.data });
    })
    .catch((error) => {
      console.log(error);
      res.json({ status: "error", data: error });
    });
});

app.get("/tglapi/*", function (req, res) {
  // Add your code here
  res.json({ success: "get call succeed!", url: req.url });
});

/****************************
 * Example post method *
 ****************************/

app.post("/tglapi", function (req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

app.post("/tglapi/pdffiller", async function (req, res) {
  const filename = req.body.filename;
  const bucketName = "tgltoolboxpdftemplates";
  const bucketUserFolder = req.body.user;
  const key = `${bucketUserFolder}/${filename}`;
  const contentType = req.body.contentType || "application/pdf";

  // console.log(filename, bucketName, bucketUserFolder, key, contentType);

  try {
    // Generate a pre-signed URL for the client to use for uploading
    const presignedUrl = s3.getSignedUrl("putObject", {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Expires: 6000, // Expiration time in seconds
    });

    // console.log(presignedUrl);

    res.json({
      success: true,
      message: "Pre-signed URL generated successfully",
      presignedUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Pre-signed URL generation failed",
      error: error,
    });
  }
});

app.post("/tglapi/weatherman", async function (req, res) {
  const user = req?.body?.user;
  const apiKeyName = user;
  const apiKey = await getApiKey(apiKeyName);
  if (!apiKey) {
    res.json({
      status: "error",
      message: "API Key not found",
    });
    return;
  }

  let params = {
    url: `https://api.thegraphitelab.com/weather_summary`,
    method: "post",
    headers: {
      "x-api-key": apiKey?.value,
      "Content-Type": "application/json",
    },
    data: {
      lat: req?.body?.lat,
      long: req?.body?.long,
    },
  };

  await axios(params)
    .then((response) => {
      res.json({ status: "success", data: response.data });
    })
    .catch((error) => {
      res.json({ status: "error", data: error });
    });
});

app.post("/tglapi/phone-number-insights", async function (req, res) {
  const user = req?.body?.user;
  const apiKeyName = user;
  const apiKey = await getApiKey(apiKeyName);
  if (!apiKey) {
    res.json({
      status: "error",
      message: "API Key not found",
    });
    return;
  }

  let params = {
    url: `https://api.thegraphitelab.com/toolboxAPI_phoneNumberVerification`,
    method: "POST",
    headers: {
      "x-api-key": apiKey?.value,
      "Content-Type": "application/json",
    },
    data: {
      phoneNumber: req?.body?.phoneNumber,
    },
  };

  await axios(params)
    .then((response) => {
      res.json({ status: "success", data: response.data });
    })
    .catch((error) => {
      res.json({ status: "error", data: error });
    });
});

app.post("/tglapi/*", function (req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example put method *
 ****************************/

app.put("/tglapi", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

app.put("/tglapi/*", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/tglapi", function (req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.delete("/tglapi/pdffiller", async function (req, res) {
  const bucketName = "tgltoolboxpdftemplates";
  const item = req.body.key;

  const params = {
    Bucket: bucketName,
    Key: item,
  };

  try {
    await s3.deleteObject(params).promise();
    res.json({
      success: true,
      message: "PDF file deleted successfully",
      url: req.url,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "PDF file deletion failed",
      url: req.url,
      error: error,
    });
  }
});

app.delete("/tglapi/*", function (req, res) {
  // Add your code here
  res.json({ success: "delete call succeed!", url: req.url });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
