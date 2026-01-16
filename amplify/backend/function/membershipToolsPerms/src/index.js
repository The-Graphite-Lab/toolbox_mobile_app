const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableNameUsers = "Users-bm44urfj6bcajm63ohamnsj4au-staging";
const tableNameMemberships = "Memberships-bm44urfj6bcajm63ohamnsj4au-staging";
const tableNameMasterPermissions =
  "MasterPermissions-bm44urfj6bcajm63ohamnsj4au-staging";

exports.handler = async (event) => {
  const masterPermissions = await getMasterPermissions();
  for (const record of event.Records) {
    try {
      if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
        const newImage = AWS.DynamoDB.Converter.unmarshall(
          record.dynamodb.NewImage
        );
        const oldImage = record.dynamodb.OldImage
          ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
          : null;
        const membershipId = newImage.MembershipID || null;
        const toolId = newImage.ToolID || null;
        // console.log(record, newImage, oldImage, membershipId, toolId);

        if (!membershipId || !toolId) return;
        const membership = await getMembership(membershipId);
        const users = await getUsers(membership.ClientID);

        for (const user of users) {
          const thisUser = await getUser(user.id);
          const isCustomer = thisUser.type === "customer";
          if (!isCustomer) continue;
          try {
            await updateUserPermissions(
              thisUser,
              masterPermissions,
              toolId,
              record.eventName,
              newImage,
              oldImage
            );
          } catch (error) {
            console.log("Error updating user permissions:", error);
          }
        }
      }
    } catch (error) {
      console.error(error);
      // Consider adding additional error handling/recovery logic.
      // throw error;
    }
  }
};

async function getMembership(membershipId) {
  const params = {
    TableName: tableNameMemberships,
    Key: {
      id: membershipId,
    },
  };
  const result = await dynamo.get(params).promise();
  // console.log("Membership: ", result.Item);
  return result.Item;
}

async function getUsers(ClientID) {
  const params = {
    TableName: tableNameUsers,
    IndexName: "byClient", // This is a GSI that should already be configured on the Users table to query users by clientId
    KeyConditionExpression: "ClientID = :ClientID",
    ExpressionAttributeValues: {
      ":ClientID": ClientID,
    },
  };
  const result = await dynamo.query(params).promise();
  // console.log("Users: ", result.Items);
  return result.Items;
}

async function getMasterPermissions() {
  const params = {
    TableName: tableNameMasterPermissions,
    Key: {
      id: "1",
    },
  };
  const result = await dynamo.get(params).promise();
  // console.log("Master Permissions: ", result.Item);
  return result.Item;
}

function safeParse(jsonString) {
  try {
    if (typeof jsonString === "string") {
      return JSON.parse(jsonString);
    }
    return jsonString || {}; // If jsonString is not a string, return it. If it's undefined or null return an empty object.
  } catch (e) {
    console.error("Error parsing JSON string:", jsonString, e);
    // throw e; // Now re-throws error for better visibility in the calling function.
  }
}

async function updateUserPermissions(
  user,
  masterPermissions,
  toolId,
  action,
  newImage,
  oldImage
) {
  // Parse current user permissions

  // console.log("Updating permissions for user", user.id, "for tool", toolId);

  try {
    let currentPerms = safeParse(user?.permissions); // Ensure permissions are parsed from JSON
    // Assume masterPermissions.permissions is already a JSON string and parse it as well
    const masterPerms = safeParse(masterPermissions?.permissions);

    // console.log("Current permissions:", currentPerms);
    // console.log("Master permissions:", masterPerms);

    const isCustomerAdmin = Boolean(currentPerms?.customerAdmin);

    // Apply action specific logic
    let permissionChanged = false; // To track if permissions actually need an update
    if (action === "INSERT") {
      // console.log("Inserting permissions for", toolId);
      if (!masterPerms[toolId]) return; // If toolId is not in masterPerms, do nothing
      currentPerms[toolId] = masterPerms[toolId];
      if (
        !isCustomerAdmin &&
        currentPerms[toolId] &&
        Object?.keys(currentPerms[toolId])?.length &&
        Object?.keys(currentPerms[toolId])?.includes("Client Data")
      ) {
        currentPerms[toolId]["Client Data"] = {};
      }
      permissionChanged = true;
    } else if (
      newImage?._deleted &&
      (action === "MODIFY" || action === "REMOVE")
    ) {
      // No need for separate 'MODIFY' and 'REMOVE' if they perform the same task
      // console.log("Removing", toolId, "from permissions");
      delete currentPerms[toolId];
      permissionChanged = true;
    }

    // console.log("New permissions:", currentPerms);

    // Convert back to a JSON string before update
    const newUserPerms = currentPerms;
    // JSON.stringify(currentPerms);

    if (permissionChanged) {
      const params = {
        TableName: tableNameUsers,
        Key: {
          id: user.id,
        },
        UpdateExpression: "set #permissions = :permissions",
        ExpressionAttributeValues: {
          ":permissions": newUserPerms, // Ensure permissions are stringified JSON
        },
        ExpressionAttributeNames: {
          "#permissions": "permissions",
        },
        ReturnValues: "UPDATED_NEW",
      };

      const update = await dynamo.update(params).promise();
      // console.log("User permissions updated:", update);
    }
  } catch (error) {
    console.error("Error updating user permissions:", error);
    // Possibly retry the operation or notify the error
  }
}

async function getUser(userId) {
  const params = {
    TableName: tableNameUsers,
    Key: {
      id: userId,
    },
  };
  const result = await dynamo.get(params).promise();
  return result.Item;
}
