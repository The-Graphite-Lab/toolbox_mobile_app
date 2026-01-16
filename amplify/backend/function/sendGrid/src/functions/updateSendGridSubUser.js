const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
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
 * @param {number|string} sendGridSubUserID - The SendGrid subuser ID to update.
 * @returns {Promise} - Promise representing the update operation.
 */
async function updateSendGridSubUser(clientId, sendGridSubUserID) {
  if (!clientId || !sendGridSubUserID) {
    throw new Error(
      "Missing required parameters for updating SendGrid SubUser"
    );
  }

  const params = {
    TableName: tableName,
    Key: { id: clientId },
    UpdateExpression: "SET SendGridSubUserID = :sendGridSubUserID",
    ExpressionAttributeValues: {
      ":sendGridSubUserID": sendGridSubUserID,
    },
    ReturnValues: "UPDATED_NEW",
  };

  const command = new UpdateCommand(params);
  return await docClient.send(command);
}

module.exports = { updateSendGridSubUser };
