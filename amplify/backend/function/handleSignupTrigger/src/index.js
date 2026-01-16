const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // Check the trigger source
  if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
    const user = event.request.userAttributes;
    const params = {
      TableName: process.env.USERS_TABLE, // Use environment variable for table name
      Item: {
        id: user.sub, // cognito sub
        username: event.userName, // cognito username
        email: user.email,
        name: user.name,
        phone: user.phone_number,
        type: "customer",
        __typeName: "Users",
        _version: 1, // Assuming a default version number
        _lastChangedAt: new Date().getTime(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    try {
      await dynamoDB.put(params).promise();
      console.log("User successfully added to DynamoDB");
    } catch (error) {
      console.error("Error adding user to DynamoDB", error);
      throw new Error("Error adding user to DynamoDB");
    }
  } else {
    console.log(
      "Trigger source is not PostConfirmation_ConfirmSignUp, skipping DynamoDB insert."
    );
  }
  return event;
};
