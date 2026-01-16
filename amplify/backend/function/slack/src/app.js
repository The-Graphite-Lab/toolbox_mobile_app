const express = require('express')
const querystring = require('querystring');
const axios = require('axios');
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

app.post('/slack/callback', async (req, res) => {
  let { code } = req.body;

  console.log('running callback');

  if (!code) {
    return res.status(400).json({ error: 'Invalid code.' });
  }

  try {
    // Slack API URL for exchanging the code for an access token
    const slackApiUrl = 'https://slack.com/api/oauth.v2.access';

    // Replace 'YOUR_SLACK_CLIENT_ID' and 'YOUR_SLACK_CLIENT_SECRET' with your actual values
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    // Prepare the data in form-encoded format
    const formData = querystring.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: 'https://toolbox.thegraphitelab.com/authorize/slack',
    });

    // Make the token exchange request using form-encoded data
    const response = await axios.post(slackApiUrl, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Check if the response contains the access token
    if (response.data && response.data.access_token) {
      // Handle the response as needed (e.g., store the access token in your database)
      const data = response.data;

      // Send the access token back to the client
      return res.status(200).json(data);
    } else {
      // Handle the case where the response does not contain the access token
      return res.status(500).json({ error: 'Failed to exchange code for access token.' });
    }
  } catch (error) {
    console.error('Error exchanging code for access token:', error);
    return res.status(500).json({ error: 'Failed to exchange code for access token.' });
  }
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
