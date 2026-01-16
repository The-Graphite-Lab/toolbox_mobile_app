const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
  CreateSecretCommand,
} = require("@aws-sdk/client-secrets-manager");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");

// Create an S3 client using AWS SDK v3 configured for the us-east-1 region.
const s3Client = new S3Client({ region: "us-east-1" });

// Create a Secrets Manager client (adjust region if needed).
const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

// Helper function to convert stream to a buffer.
const streamToBuffer = async (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
};

// Declare a new express app.
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// GET endpoint to retrieve the authentication fields from the zipped module in S3.
app.get("/connections/apps/:id/authFields", async (req, res) => {
  const id = req.params.id;
  const s3Key = `Apps/${id}/App.zip`;
  const params = {
    Bucket: "prod-toolbox-data",
    Key: s3Key,
  };

  try {
    // Retrieve the zip file from S3.
    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);

    // Convert the returned stream to a buffer.
    const buffer = await streamToBuffer(data.Body);

    // Extract the zip file using AdmZip.
    const zip = new AdmZip(buffer);
    const extractPath = path.join("/tmp", `app-${id}`);

    // Remove any existing folder to avoid stale modules.
    if (fs.existsSync(extractPath)) {
      fs.rmdirSync(extractPath, { recursive: true });
    }
    fs.mkdirSync(extractPath);

    zip.extractAllTo(extractPath, true);

    // Dynamically require the extracted index.js.
    const modulePath = path.join(extractPath, "index.js");
    delete require.cache[require.resolve(modulePath)];
    const appModule = require(modulePath);

    // Return the authentication module's fields.
    const authFields = appModule.authentication.fields;
    res.json(authFields);
  } catch (err) {
    console.error("Error retrieving authFields:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// NEW GET endpoint: /connections/:id/authdata
// Attempts to retrieve secret "toolbox-connections-:id" from AWS Secrets Manager.
// If found, returns the parsed secret; if not, returns null.
app.get("/connections/:id/authdata", async (req, res) => {
  const id = req.params.id;
  const secretName = `toolbox-connections-${id}`;

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const secretData = await secretsClient.send(command);

    if (secretData.SecretString) {
      // Parse and return the secret value.
      const parsedSecret = JSON.parse(secretData.SecretString);
      return res.json(parsedSecret);
    } else {
      // Secret exists but has no SecretString, so return null.
      return res.json(null);
    }
  } catch (err) {
    // If the secret is not found, return null.
    if (
      err.name === "ResourceNotFoundException" ||
      err.$metadata?.httpStatusCode === 404
    ) {
      return res.json(null);
    } else {
      console.error("Error retrieving authdata:", err);
      return res.status(500).json({ error: err.toString() });
    }
  }
});

app.post("/connections/:id/authdata", async (req, res) => {
  const id = req.params.id;
  const secretName = `toolbox-connections-${id}`;

  console.log("POST /connections/:id/authdata called with id:", id);
  console.log("Request Body:", req.body);

  // Validate that the request body is an array.
  if (!Array.isArray(req.body)) {
    console.error("Invalid payload. Must be an array.");
    return res
      .status(400)
      .json({ error: "Request body must be an array of objects." });
  }

  // Merge array of objects into one object.
  const newData = req.body.reduce((acc, item) => ({ ...acc, ...item }), {});
  console.log("Merged new data:", newData);

  try {
    // Retrieve the existing secret.
    const getCommand = new GetSecretValueCommand({ SecretId: secretName });
    const secretData = await secretsClient.send(getCommand);
    let currentData = {};
    if (secretData.SecretString) {
      try {
        currentData = JSON.parse(secretData.SecretString);
      } catch (parseError) {
        console.error("Error parsing existing secret:", parseError);
      }
    }
    console.log("Existing secret data:", currentData);

    // Merge the data.
    const mergedData = { ...currentData, ...newData };
    console.log("Merged secret data to be updated:", mergedData);

    // Update the secret.
    const updateCommand = new UpdateSecretCommand({
      SecretId: secretName,
      SecretString: JSON.stringify(mergedData),
    });
    const updateResponse = await secretsClient.send(updateCommand);
    console.log("Update response:", updateResponse);

    res.json({ message: "Secret updated successfully.", data: mergedData });
  } catch (err) {
    console.error("Error retrieving/updating secret:", err);
    // If the secret does not exist, create it.
    if (
      err.name === "ResourceNotFoundException" ||
      err.$metadata?.httpStatusCode === 404
    ) {
      console.log("Secret not found. Creating new secret.");
      try {
        const createCommand = new CreateSecretCommand({
          Name: secretName,
          SecretString: JSON.stringify(newData),
        });
        const createResponse = await secretsClient.send(createCommand);
        console.log("Create response:", createResponse);
        res.json({ message: "Secret created successfully.", data: newData });
      } catch (createErr) {
        console.error("Error creating secret:", createErr);
        res.status(500).json({ error: createErr.toString() });
      }
    } else {
      res.status(500).json({ error: err.toString() });
    }
  }
});

app.listen(3000, () => {
  console.log("App started");
});

// Export the app object for AWS Lambda (a wrapper will load the app from this file).
module.exports = app;
