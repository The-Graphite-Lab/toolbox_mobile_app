const express = require("express");
const AWS = require("aws-sdk");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Set the region
AWS.config.update({ region: "us-east-2" }); // Change this to your region

// Create a Cognito identity service provider
const cognitoISP = new AWS.CognitoIdentityServiceProvider();

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

app.get("/users", async (req, res) => {
  const params = {
    UserPoolId: "us-east-2_QUpKtOof0", // Your user pool ID
  };

  //try catch do while PaginationToken
  try {
    let users = [];
    let data;
    do {
      data = await cognitoISP.listUsers(params).promise();
      users = users.concat(data.Users);
      params.PaginationToken = data.PaginationToken;
    } while (data.PaginationToken);

    res.send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

//get a specific user
app.get("/users/:id", (req, res) => {
  const username = req.params.id; // The username (ID) of the user
  if (!username) {
    res.status(400).send({ error: "Missing username" });
    return;
  }
  const params = {
    UserPoolId: "us-east-2_QUpKtOof0", // Your user pool ID
    Username: username, // The username (ID) of the user
  };
  cognitoISP.adminGetUser(params, (err, data) => {
    if (err) res.status(500).send(err);
    else res.send(data);
  });
});

//create a new user
app.post("/users", (req, res) => {
  try {
    const { username, email, name, phone_number } = req.body;
    const attributes = [
      "email",
      "name",
      "phone_number",
      "custom:clientID",
      "custom:companyName",
      "custom:profilePic",
      "custom:membershipType",
      "custom:mondayBoardID",
      "custom:primaryColor",
      "custom:secondaryColor",
      "custom:slogan",
      "custom:type",
      "custom:csm",
      "custom:mondayUserID",
    ];

    // Check for required fields
    if (!username || !email || !name || !phone_number) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    let UserAttributes = [];

    for (let attribute of attributes) {
      if (req.body[attribute]) {
        UserAttributes.push({ Name: attribute, Value: req.body[attribute] });
      }
    }
    const params = {
      UserPoolId: "us-east-2_QUpKtOof0", // Your user pool ID
      Username: username,
      UserAttributes: [
        { Name: "email_verified", Value: "true" },
        ...UserAttributes,
      ],
      DesiredDeliveryMediums: ["EMAIL"],
    };

    cognitoISP.adminCreateUser(params, (err, cognitoResponse) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        // Extract user attributes from the response
        const userAttributes = cognitoResponse.User.Attributes.reduce(
          (acc, attr) => {
            acc[attr.Name] = attr.Value;
            return acc;
          },
          {}
        );

        let user = {
          id: userAttributes["sub"], // The Cognito 'sub' attribute
          username: username,
          email: userAttributes["email"],
          name: userAttributes["name"],
          phone: userAttributes["phone_number"],
          profilePic: userAttributes["custom:profilePic"] || null,
          type: userAttributes["custom:type"],
          membershipType: userAttributes["custom:membershipType"],
          // Add other attributes as needed
          __typeName: "Users",
          _version: 1, // Assuming a default version number
          _lastChangedAt: new Date().getTime(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (userAttributes["custom:clientID"]) {
          user.ClientID = userAttributes["custom:clientID"];
        }

        const dbParams = {
          TableName: "Users-bm44urfj6bcajm63ohamnsj4au-staging", // Replace with your table name
          Item: user,
        };

        dynamoDB.put(dbParams, (dbErr, dbData) => {
          if (dbErr) {
            console.error("Error saving user to DynamoDB:", dbErr);
            res.status(500).send({
              error: "User created in Cognito but failed to add to DynamoDB",
              dbErr,
            });
          } else {
            res.send({ cognitoData: cognitoResponse, dynamoDBData: user });
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

//resend password
app.post("/users/:id/resend-password", (req, res) => {
  // Check for required parameters
  if (!req.params.id) {
    res.status(400).send({ error: "Missing required parameter: id" });
    return;
  }
  const params = {
    UserPoolId: "us-east-2_QUpKtOof0", // Your user pool ID
    Username: req.params.id, // The username (ID) of the user
    MessageAction: "RESEND", // Resend the message to the user if they already exist
    DesiredDeliveryMediums: ["EMAIL"],
  };
  cognitoISP.adminCreateUser(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else res.send(data);
  });
});

//update user attributes
app.put("/users/:id", (req, res) => {
  const attributes = [
    "email",
    "name",
    "phone_number",
    "custom:clientID",
    "custom:companyName",
    "custom:logo",
    "custom:membershipType",
    "custom:mondayBoardID",
    "custom:primaryColor",
    "custom:secondaryColor",
    "custom:slogan",
    "custom:type",
    "custom:csm",
    "custom:mondayUserID",
  ];

  let UserAttributes = [];

  for (let attribute of attributes) {
    if (req.body[attribute]) {
      UserAttributes.push({ Name: attribute, Value: req.body[attribute] });
    }
  }

  // If no valid attributes are found in the request body
  if (UserAttributes.length === 0) {
    return res.status(400).send({ error: "No valid attributes provided" });
  }

  const params = {
    UserPoolId: "us-east-2_QUpKtOof0", // Your user pool ID
    Username: req.params.id, // The username (ID) of the user
    UserAttributes: UserAttributes,
  };

  cognitoISP.adminUpdateUserAttributes(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: "Failed to update user" });
    } else res.send(data);
  });
});

app.put("/users/:id/status", (req, res) => {
  const username = req.params.id;
  const enabled = req.body.Enabled;

  const params = {
    UserPoolId: "us-east-2_QUpKtOof0",
    Username: username,
  };

  if (enabled) {
    cognitoISP.adminEnableUser(params, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to enable user" });
      } else {
        res.json({ message: "User enabled successfully" });
      }
    });
  } else {
    cognitoISP.adminDisableUser(params, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to disable user" });
      } else {
        res.json({ message: "User disabled successfully" });
      }
    });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
