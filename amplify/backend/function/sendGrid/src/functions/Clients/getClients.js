const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

// Configure the DynamoDBClient to use the us-east-2 region
const client = new DynamoDBClient({ region: "us-east-2" });

// Create a DynamoDBDocumentClient from the DynamoDBClient
const docClient = DynamoDBDocumentClient.from(client);

// Use the table name from environment variable or default to the provided table name
const tableName =
  process.env.CLIENTS_TABLE || "Clients-bm44urfj6bcajm63ohamnsj4au-staging";

/**
 * Updates the DynamoDB record for a client with the SendGridSubUserID.
 * @param {string} clientId - The client identifier.
 * @returns {Promise<Array>} - Promise representing the update operation.
 */
async function getClients(clientId) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":id": clientId,
    },
  };

  const command = new QueryCommand(params);
  const result = await docClient.send(command);
  return result.Items[0];
}

module.exports = { getClients };
