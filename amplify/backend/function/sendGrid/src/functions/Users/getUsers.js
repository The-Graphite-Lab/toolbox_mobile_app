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
  process.env.USERS_TABLE || "Users-bm44urfj6bcajm63ohamnsj4au-staging";

/**
 * Retrieves the DynamoDB record(s) for a user.
 * @param {string} userId - The user identifier.
 * @returns {Promise<Array>} - Promise representing the query operation result.
 */
async function getUsers(userId) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "#id = :id",
    ExpressionAttributeNames: {
      "#id": "id",
    },
    ExpressionAttributeValues: {
      ":id": userId,
    },
  };

  const command = new QueryCommand(params);
  const result = await docClient.send(command);
  return result.Items[0];
}

module.exports = { getUsers };
