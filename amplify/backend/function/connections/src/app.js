/* Amplify Params - DO NOT EDIT
	API_THEGRAPHITELABTOOLBOX_GRAPHQLAPIENDPOINTOUTPUT
	API_THEGRAPHITELABTOOLBOX_GRAPHQLAPIIDOUTPUT
	API_THEGRAPHITELABTOOLBOX_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
  CreateSecretCommand,
} = require("@aws-sdk/client-secrets-manager");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Create an S3 client using AWS SDK v3 configured for the us-east-1 region.
const s3Client = new S3Client({ region: "us-east-1" });
const userFilesS3Client = new S3Client({
  region: process.env.AWS_REGION || process.env.REGION || "us-east-2",
});

// Create a Secrets Manager client (adjust region if needed).
const secretsClient = new SecretsManagerClient({ region: "us-east-1" });
const assemblySecretsClient = new SecretsManagerClient({ region: "us-east-2" });

const DEFAULT_APPSYNC_GRAPHQL_ENDPOINT =
  "https://pypzmxx23zbfngaitimnhh7rlq.appsync-api.us-east-2.amazonaws.com/graphql";
const resolveAppSyncGraphqlEndpoint = () => {
  const candidates = [
    process.env.APPSYNC_GRAPHQL_ENDPOINT,
    process.env.API_THEGRAPHITELABTOOLBOX_GRAPHQLAPIENDPOINTOUTPUT,
    DEFAULT_APPSYNC_GRAPHQL_ENDPOINT,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "string") {
      continue;
    }
    const trimmed = candidate.trim();
    if (trimmed.startsWith("https://")) {
      return trimmed;
    }
  }

  return DEFAULT_APPSYNC_GRAPHQL_ENDPOINT;
};
const APPSYNC_GRAPHQL_ENDPOINT = resolveAppSyncGraphqlEndpoint();
const RIDE_ALONG_TOOL_ID = "0ec3fab8-0b78-4b7c-aba0-66b26f640ffe";
const USER_FILES_BUCKET =
  process.env.USER_FILES_BUCKET ||
  process.env.STORAGE_USERFILES_BUCKETNAME ||
  "tgltoolboxuserfiles210135-staging";
const ASSEMBLYAI_SECRET_NAME = "AssemblyAI/APIKey";
let cachedAssemblyAiApiKey = null;

const CREATE_RIDE_ALONG_SESSION_MUTATION = /* GraphQL */ `
  mutation CreateRideAlongSession($input: CreateRideAlongSessionsInput!) {
    createRideAlongSessions(input: $input) {
      id
      _version
      _lastChangedAt
    }
  }
`;

const UPDATE_RIDE_ALONG_SESSION_MUTATION = /* GraphQL */ `
  mutation UpdateRideAlongSession($input: UpdateRideAlongSessionsInput!) {
    updateRideAlongSessions(input: $input) {
      id
      _version
      _lastChangedAt
    }
  }
`;

const CREATE_RIDE_ALONG_SESSION_TURN_MUTATION = /* GraphQL */ `
  mutation CreateRideAlongSessionTurn($input: CreateRideAlongSessionTurnsInput!) {
    createRideAlongSessionTurns(input: $input) {
      id
      turnOrder
      _version
      _lastChangedAt
    }
  }
`;

const GET_RIDE_ALONG_STATUS_QUERY = /* GraphQL */ `
  query GetRideAlongStatus($id: ID!) {
    getRideAlongs(id: $id) {
      id
      status
    }
  }
`;

const GET_RIDE_ALONG_KEYTERMS_CONTEXT_QUERY = /* GraphQL */ `
  query GetRideAlongKeytermsContext($id: ID!) {
    getRideAlongs(id: $id) {
      id
      UserID
      ClientID
    }
  }
`;

const GET_USER_KEYTERM_NAME_QUERY = /* GraphQL */ `
  query GetUserKeytermName($id: ID!) {
    getUsers(id: $id) {
      id
      name
    }
  }
`;

const GET_CLIENT_KEYTERM_NAME_QUERY = /* GraphQL */ `
  query GetClientKeytermName($id: ID!) {
    getClients(id: $id) {
      id
      name
    }
  }
`;

const safeJsonParse = (input, fallback = null) => {
  try {
    return JSON.parse(input);
  } catch (error) {
    return fallback;
  }
};

const isSessionAlreadyExistsError = (error) => {
  const message =
    error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";
  return (
    message.includes("already exists") ||
    message.includes("conditional request failed")
  );
};

const getAssemblyAiApiKey = async () => {
  if (cachedAssemblyAiApiKey) {
    return cachedAssemblyAiApiKey;
  }

  const secretData = await assemblySecretsClient.send(
    new GetSecretValueCommand({ SecretId: ASSEMBLYAI_SECRET_NAME })
  );

  const secretString = secretData?.SecretString;
  if (!secretString) {
    throw new Error(
      `AssemblyAI secret ${ASSEMBLYAI_SECRET_NAME} has no SecretString value.`
    );
  }

  const parsed = safeJsonParse(secretString, null);
  const candidate =
    typeof parsed === "object" && parsed !== null
      ? parsed.apiKey || parsed.ASSEMBLYAI_API_KEY
      : secretString;

  const apiKey = typeof candidate === "string" ? candidate.trim() : "";
  if (!apiKey) {
    throw new Error(
      `AssemblyAI secret ${ASSEMBLYAI_SECRET_NAME} is missing apiKey.`
    );
  }

  cachedAssemblyAiApiKey = apiKey;
  return cachedAssemblyAiApiKey;
};

const toAwsJsonValue = (value, fallback = null) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === "string") {
    const parsed = safeJsonParse(value, null);
    return parsed !== null ? JSON.stringify(parsed) : JSON.stringify(value);
  }
  return JSON.stringify(value);
};

const normalizeAssemblyKeyterm = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  const compacted = value.replace(/\s+/g, " ").trim();
  if (!compacted || compacted.length > 50) {
    return "";
  }
  return compacted;
};

const buildAssemblyKeytermsPrompt = async (rideAlongId) => {
  const normalizedRideAlongId =
    typeof rideAlongId === "string" ? rideAlongId.trim() : "";
  if (!normalizedRideAlongId) {
    return [];
  }

  try {
    const rideAlongLookup = await executeAppSyncMutation({
      query: GET_RIDE_ALONG_KEYTERMS_CONTEXT_QUERY,
      variables: { id: normalizedRideAlongId },
    });
    const rideAlongRecord = rideAlongLookup?.getRideAlongs || null;
    if (!rideAlongRecord) {
      return [];
    }

    const keyterms = [];

    const userId =
      typeof rideAlongRecord.UserID === "string"
        ? rideAlongRecord.UserID.trim()
        : "";
    if (userId) {
      try {
        const userLookup = await executeAppSyncMutation({
          query: GET_USER_KEYTERM_NAME_QUERY,
          variables: { id: userId },
        });
        const userName = normalizeAssemblyKeyterm(userLookup?.getUsers?.name);
        if (userName) {
          keyterms.push(userName);
        }
      } catch (error) {
        console.warn(
          "Unable to resolve ride-along user name for keyterms_prompt:",
          error.message || error
        );
      }
    }

    const clientId =
      typeof rideAlongRecord.ClientID === "string"
        ? rideAlongRecord.ClientID.trim()
        : "";
    if (clientId) {
      try {
        const clientLookup = await executeAppSyncMutation({
          query: GET_CLIENT_KEYTERM_NAME_QUERY,
          variables: { id: clientId },
        });
        const clientName = normalizeAssemblyKeyterm(clientLookup?.getClients?.name);
        if (clientName) {
          keyterms.push(clientName);
        }
      } catch (error) {
        console.warn(
          "Unable to resolve ride-along client name for keyterms_prompt:",
          error.message || error
        );
      }
    }

    if (keyterms.length === 0) {
      return [];
    }

    const deduped = [];
    const seen = new Set();
    for (const term of keyterms) {
      const key = term.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      deduped.push(term);
    }

    return deduped.slice(0, 100);
  } catch (error) {
    console.warn(
      "Unable to build keyterms_prompt for ride-along AssemblyAI session:",
      error.message || error
    );
    return [];
  }
};

const buildSessionRecordingS3Key = ({ clientId, rideAlongId, sessionId }) =>
  `public/clients/${clientId}/tooldata/${RIDE_ALONG_TOOL_ID}/RideAlongs/${rideAlongId}/ridealongsessions/${sessionId}/recording_file`;

const buildTurnRecordingS3Prefix = ({ clientId, rideAlongId, sessionId }) =>
  `public/clients/${clientId}/tooldata/${RIDE_ALONG_TOOL_ID}/RideAlongs/${rideAlongId}/ridealongsessions/${sessionId}/RideAlongSessionTurn/{TurnID}/recording_file`;

const toBuffer = (input) => {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof Uint8Array) {
    return Buffer.from(input);
  }
  if (typeof input === "string") {
    return Buffer.from(input, "utf8");
  }
  if (input === undefined || input === null) {
    return Buffer.alloc(0);
  }
  return Buffer.from(input);
};

class NodeSha256 {
  constructor(secret) {
    this.secret = secret;
    this.reset();
  }

  reset() {
    if (this.secret) {
      this.hash = crypto.createHmac("sha256", toBuffer(this.secret));
    } else {
      this.hash = crypto.createHash("sha256");
    }
  }

  update(data) {
    this.hash.update(toBuffer(data));
  }

  digest() {
    return Promise.resolve(this.hash.digest());
  }
}

const getLambdaAwsCredentials = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Lambda AWS credentials are missing for AppSync signing.");
  }

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken,
  };
};

const resolveSignatureV4Modules = () => {
  let SignatureV4;
  let HttpRequest;

  try {
    ({ SignatureV4 } = require("@aws-sdk/signature-v4"));
  } catch (error) {
    ({ SignatureV4 } = require("@smithy/signature-v4"));
  }

  try {
    ({ HttpRequest } = require("@aws-sdk/protocol-http"));
  } catch (error) {
    ({ HttpRequest } = require("@smithy/protocol-http"));
  }

  return { SignatureV4, HttpRequest };
};

const executeAppSyncMutation = async ({ query, variables = {} }) => {
  const body = JSON.stringify({ query, variables });
  const endpoint = new URL(APPSYNC_GRAPHQL_ENDPOINT);
  const region = process.env.AWS_REGION || process.env.REGION || "us-east-2";
  const { SignatureV4, HttpRequest } = resolveSignatureV4Modules();

  const signer = new SignatureV4({
    credentials: getLambdaAwsCredentials(),
    region,
    service: "appsync",
    sha256: NodeSha256,
  });

  const request = new HttpRequest({
    protocol: endpoint.protocol,
    hostname: endpoint.hostname,
    method: "POST",
    path: endpoint.pathname,
    headers: {
      host: endpoint.host,
      "content-type": "application/json",
    },
    body,
  });

  const signedRequest = await signer.sign(request);
  const response = await fetch(APPSYNC_GRAPHQL_ENDPOINT, {
    method: signedRequest.method,
    headers: signedRequest.headers,
    body: signedRequest.body,
  });

  const responseBody = await response.text();
  const parsed = safeJsonParse(responseBody, null);
  if (!parsed) {
    throw new Error(
      `AppSync response was not valid JSON. Status: ${response.status}`
    );
  }
  if (parsed.errors?.length) {
    throw new Error(parsed.errors[0].message || "AppSync error");
  }
  return parsed.data || {};
};

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
  const requestOrigin = req.headers.origin;
  const requestedHeaders = req.headers["access-control-request-headers"];

  res.header("Access-Control-Allow-Origin", requestOrigin || "*");
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    typeof requestedHeaders === "string" && requestedHeaders.trim().length > 0
      ? requestedHeaders
      : "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With"
  );
  res.header("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

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

app.post("/ridealongs/assembly/token", async (req, res) => {
  try {
    const assemblyApiKey = await getAssemblyAiApiKey();
    const rideAlongId =
      typeof req.body?.rideAlongId === "string" ? req.body.rideAlongId : "";

    const expiresInSeconds = Number(req.body?.expiresInSeconds || 600);
    const maxSessionDurationSeconds = Number(
      req.body?.maxSessionDurationSeconds || 10800
    );

    if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      res.status(400).json({ error: "expiresInSeconds must be a positive number." });
      return;
    }

    const params = new URLSearchParams({
      expires_in_seconds: `${Math.floor(expiresInSeconds)}`,
      max_session_duration_seconds: `${Math.floor(maxSessionDurationSeconds)}`,
    });

    const tokenResponse = await fetch(
      `https://streaming.assemblyai.com/v3/token?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: assemblyApiKey,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      res.status(tokenResponse.status).json({
        error: "Failed to generate AssemblyAI token.",
        details: errorBody,
      });
      return;
    }

    const payload = await tokenResponse.json();
    const keytermsPrompt = await buildAssemblyKeytermsPrompt(rideAlongId);
    res.json({
      token: payload.token,
      expiresInSeconds: payload.expires_in_seconds,
      wsUrl: "wss://streaming.assemblyai.com/v3/ws",
      keytermsPrompt,
    });
  } catch (error) {
    console.error("Error generating AssemblyAI token:", error);
    res.status(500).json({ error: error.message || "Unable to generate token." });
  }
});

app.post("/ridealongs/sessions/start", async (req, res) => {
  try {
    const { rideAlongId, clientId, userId, assemblySessionId, startedAt } = req.body || {};

    if (!rideAlongId || !clientId || !userId || !assemblySessionId || !startedAt) {
      res.status(400).json({
        error:
          "rideAlongId, clientId, userId, assemblySessionId, and startedAt are required.",
      });
      return;
    }

    const rideAlongLookup = await executeAppSyncMutation({
      query: GET_RIDE_ALONG_STATUS_QUERY,
      variables: { id: rideAlongId },
    });
    const rideAlongRecord = rideAlongLookup?.getRideAlongs || null;

    if (!rideAlongRecord) {
      res.status(404).json({
        error: "Ride along not found.",
      });
      return;
    }

    if (rideAlongRecord.status !== "LIVE") {
      res.status(409).json({
        error:
          "Ride along is not live. Resume the ride along before starting a new recording session.",
        rideAlongStatus: rideAlongRecord.status || null,
      });
      return;
    }

    const sessionInput = {
      id: assemblySessionId,
      RideAlongID: rideAlongId,
      ClientID: clientId,
      UserID: userId,
      sessionStartTime: startedAt,
      assemblySessionId,
    };

    let sessionRecord = null;
    let alreadyExists = false;
    try {
      const createSessionData = await executeAppSyncMutation({
        query: CREATE_RIDE_ALONG_SESSION_MUTATION,
        variables: { input: sessionInput },
      });
      sessionRecord = createSessionData.createRideAlongSessions;
    } catch (error) {
      if (!isSessionAlreadyExistsError(error)) {
        throw error;
      }
      alreadyExists = true;
      sessionRecord = {
        id: assemblySessionId,
        RideAlongID: rideAlongId,
        ClientID: clientId,
        UserID: userId,
        sessionStartTime: startedAt,
        assemblySessionId,
      };
    }

    res.json({
      status: "success",
      alreadyExists,
      session: sessionRecord,
      rideAlong: null,
    });
  } catch (error) {
    console.error("Error starting ride-along session:", error);
    res.status(500).json({
      error: error.message || "Unable to start ride-along session.",
    });
  }
});

app.post("/ridealongs/sessions/:sessionId/turns", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { rideAlongId, clientId, userId } = req.body || {};
    const incomingTurns = Array.isArray(req.body?.turns)
      ? req.body.turns
      : req.body?.turn
        ? [req.body.turn]
        : [];

    if (!sessionId || !rideAlongId || !clientId || !userId || incomingTurns.length === 0) {
      res.status(400).json({
        error:
          "sessionId route param plus rideAlongId, clientId, userId, and at least one turn are required.",
      });
      return;
    }

    const finalizedTurns = incomingTurns.filter((turn) => {
      const candidate = turn || {};
      const endOfTurn = Boolean(
        candidate.end_of_turn ?? candidate.endOfTurn ?? false
      );
      const turnIsFormatted = Boolean(
        candidate.turn_is_formatted ?? candidate.turnIsFormatted ?? false
      );
      return endOfTurn && turnIsFormatted;
    });

    const dedupedFinalizedTurnsByOrder = new Map();
    for (let index = 0; index < finalizedTurns.length; index += 1) {
      const turn = finalizedTurns[index] || {};
      const turnOrderRaw = turn.turn_order ?? turn.turnOrder ?? index + 1;
      const parsedTurnOrder = Number(turnOrderRaw);
      if (!Number.isFinite(parsedTurnOrder)) {
        continue;
      }
      dedupedFinalizedTurnsByOrder.set(Math.floor(parsedTurnOrder), turn);
    }

    const turnsToPersist = Array.from(
      dedupedFinalizedTurnsByOrder.entries()
    )
      .sort((left, right) => left[0] - right[0])
      .map(([, turn]) => turn);

    const firstTurn = incomingTurns[0] || null;
    console.log("Ride-along turns payload received:", {
      sessionId,
      rideAlongId,
      clientId,
      userId,
      turnCount: incomingTurns.length,
      finalizedTurnCount: finalizedTurns.length,
      persistedTurnCount: turnsToPersist.length,
      firstTurnSummary: firstTurn
        ? {
            type: firstTurn.type || "Turn",
            turnOrder: firstTurn.turn_order ?? firstTurn.turnOrder ?? null,
            endOfTurn: firstTurn.end_of_turn ?? firstTurn.endOfTurn ?? null,
            transcriptPreview:
              typeof firstTurn.transcript === "string"
                ? firstTurn.transcript.slice(0, 160)
                : null,
          }
        : null,
    });

    if (turnsToPersist.length === 0) {
      res.json({
        status: "success",
        createdCount: 0,
        createdTurnIds: [],
        skippedCount: incomingTurns.length,
        reason: "No finalized formatted turns to persist.",
      });
      return;
    }

    const createdTurnIds = [];
    for (let index = 0; index < turnsToPersist.length; index += 1) {
      const turn = turnsToPersist[index] || {};
      const turnOrderRaw = turn.turn_order ?? turn.turnOrder ?? index + 1;
      const turnOrder = Number(turnOrderRaw);

      if (!Number.isFinite(turnOrder)) {
        throw new Error(`Turn at index ${index} has invalid turn order.`);
      }

      const turnId =
        turn.id ||
        `${sessionId}-${turnOrder}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      const input = {
        id: turnId,
        RideAlongSessionID: sessionId,
        RideAlongID: rideAlongId,
        ClientID: clientId,
        UserID: userId,
        type: turn.type || "Turn",
        turnOrder: Math.floor(turnOrder),
        turnIsFormatted: Boolean(
          turn.turn_is_formatted ?? turn.turnIsFormatted ?? false
        ),
        endOfTurn: Boolean(turn.end_of_turn ?? turn.endOfTurn ?? false),
        transcript: turn.transcript || "",
        utterance: turn.utterance || null,
        languageCode: turn.language_code || turn.languageCode || null,
        languageConfidence:
          turn.language_confidence !== undefined
            ? Number(turn.language_confidence)
            : turn.languageConfidence !== undefined
              ? Number(turn.languageConfidence)
              : null,
        endOfTurnConfidence:
          turn.end_of_turn_confidence !== undefined
            ? Number(turn.end_of_turn_confidence)
            : turn.endOfTurnConfidence !== undefined
              ? Number(turn.endOfTurnConfidence)
              : null,
        words: toAwsJsonValue(turn.words || [], "[]"),
      };

      const createTurnData = await executeAppSyncMutation({
        query: CREATE_RIDE_ALONG_SESSION_TURN_MUTATION,
        variables: { input },
      });

      createdTurnIds.push(createTurnData.createRideAlongSessionTurns?.id || turnId);
    }

    console.log("Ride-along turns persisted:", {
      sessionId,
      createdCount: createdTurnIds.length,
      createdTurnIds,
    });

    res.json({
      status: "success",
      createdCount: createdTurnIds.length,
      createdTurnIds,
    });
  } catch (error) {
    console.error("Error writing ride-along session turns:", error);
    res.status(500).json({
      error: error.message || "Unable to persist ride-along session turns.",
    });
  }
});

app.post("/ridealongs/sessions/:sessionId/finish", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { endedAt, terminationReason, duration, sessionVersion } = req.body || {};
    const parsedSessionVersion = Number(sessionVersion);

    if (!sessionId || !endedAt) {
      res.status(400).json({
        error: "sessionId and endedAt are required.",
      });
      return;
    }

    if (!Number.isFinite(parsedSessionVersion)) {
      res.status(202).json({
        status: "skipped",
        reason:
          "sessionVersion missing; no RideAlongSession update was applied.",
        session: null,
        rideAlong: null,
      });
      return;
    }

    const updatedSessionData = await executeAppSyncMutation({
      query: UPDATE_RIDE_ALONG_SESSION_MUTATION,
      variables: {
        input: {
          id: sessionId,
          _version: Math.trunc(parsedSessionVersion),
          sessionEndTime: endedAt,
          sessionTerminationReason: terminationReason || "COMPLETED",
          recordingDurationSeconds:
            duration !== undefined && duration !== null ? Number(duration) : null,
        },
      },
    });

    res.json({
      status: "success",
      session: updatedSessionData.updateRideAlongSessions,
      rideAlong: null,
    });
  } catch (error) {
    console.error("Error finishing ride-along session:", error);
    res.status(500).json({
      error: error.message || "Unable to finalize ride-along session.",
    });
  }
});

app.post("/ridealongs/sessions/:sessionId/recording-upload-url", async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { clientId, rideAlongId, contentType } = req.body || {};

    if (!sessionId || !clientId || !rideAlongId) {
      res.status(400).json({
        error: "sessionId, clientId, and rideAlongId are required.",
      });
      return;
    }

    const key = buildSessionRecordingS3Key({
      clientId,
      rideAlongId,
      sessionId,
    });
    const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
    const signedUrl = await getSignedUrl(
      userFilesS3Client,
      new PutObjectCommand({
        Bucket: USER_FILES_BUCKET,
        Key: key,
        ContentType: contentType || "audio/m4a",
      }),
      { expiresIn: 900 }
    );

    res.json({
      status: "success",
      bucket: USER_FILES_BUCKET,
      key,
      signedUrl,
      turnRecordingPathTemplate: buildTurnRecordingS3Prefix({
        clientId,
        rideAlongId,
        sessionId,
      }),
    });
  } catch (error) {
    console.error("Error creating ride-along recording upload URL:", error);
    res.status(500).json({
      error: error.message || "Unable to create recording upload URL.",
    });
  }
});

app.listen(3000, () => {
  console.log("App started");
});

// Export the app object for AWS Lambda (a wrapper will load the app from this file).
module.exports = app;
