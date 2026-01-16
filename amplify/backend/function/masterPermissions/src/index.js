const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableNameUsers = "Users-bm44urfj6bcajm63ohamnsj4au-staging";
const tableNameMasterPermissions =
  "MasterPermissions-bm44urfj6bcajm63ohamnsj4au-staging";

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  // Check if the event is for MasterPermissions
  for (const record of event.Records) {
    if (
      record.eventName === "MODIFY" &&
      record.eventSourceARN.includes(tableNameMasterPermissions)
    ) {
      const newMasterPermissions = AWS.DynamoDB.Converter.unmarshall(
        record.dynamodb.NewImage
      );

      try {
        // Get all users that are not customers
        const nonCustomerUsers = await getNonCustomerUsers();
        for (const user of nonCustomerUsers) {
          // Update each user's permissions
          await updateUserPermissionsToMatchMaster(
            user,
            newMasterPermissions.permissions
          );
        }
      } catch (error) {
        console.error("Error processing MasterPermissions change:", error);
      }
    }
  }

  return Promise.resolve("Successfully processed DynamoDB record");
};

async function getNonCustomerUsers() {
  const params = {
    TableName: tableNameUsers,
    FilterExpression: "#type <> :customerType",
    ExpressionAttributeValues: { ":customerType": "customer" },
    // Specify a substitution for the reserved keyword 'type'
    ExpressionAttributeNames: { "#type": "type" },
  };
  const scanResult = await dynamo.scan(params).promise();
  return scanResult.Items;
}

async function updateUserPermissionsToMatchMaster(user, newPermissions) {
  const params = {
    TableName: tableNameUsers,
    Key: {
      id: user.id,
    },
    UpdateExpression: "set #permissions = :permissions",
    ExpressionAttributeValues: {
      ":permissions": newPermissions, // Assuming that permissions are already in the correct format
    },
    ExpressionAttributeNames: {
      "#permissions": "permissions",
    },
    ReturnValues: "UPDATED_NEW",
  };

  await dynamo.update(params).promise();
  console.log(`Updated permissions for user ${user.id}`);
}
