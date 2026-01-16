/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const AWS = require("aws-sdk");
const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
// const { default: axios } = require("axios");
const s3 = new AWS.S3();
var OAuth = require("oauth");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const NPKey = process.env.REACT_APP_NP_KEY;
const NPSecret = process.env.REACT_APP_NP_SECRET;

var oauth = new OAuth.OAuth(
  "https://api.thenounproject.com",
  "https://api.thenounproject.com",
  NPKey,
  NPSecret,
  "1.0",
  null,
  "HMAC-SHA1"
);

/**********************
 * Example get method *
 **********************/

app.get("/icons", async function (req, res) {
  // Add your code here
  // console.log(req);
  let query = req.query.query;
  let next_page = req.query.next_page;

  oauth.get(
    next_page
      ? `https://api.thenounproject.com/v2/icon?query=${query}&include_svg=1&limit=10&thumbnail_size=200&next_page=${next_page}`
      : `https://api.thenounproject.com/v2/icon?query=${query}&include_svg=1&limit=10&thumbnail_size=200`,
    null,
    null,
    function (error, data, response) {
      if (error) {
        console.error(`Error: ${JSON.stringify(error)}`);
        res.json({
          success: false,
          message: "GET icons search failed!",
          url: req.url,
          error: error.message,
        });
      } else {
        console.log(data);
        res.json({
          success: "GET icons search succeed!",
          url: req.url,
          data: JSON.parse(data),
        });
      }
    }
  );
});

app.get("/icons/save/raw", function (req, res) {
  // Add your code here
  //  console.log(req);
  let id = req.query.id;
  let size = req.query.size || 1200;
  let color = req.query.color || "000000";
  let type = req.query.type || "svg";
  let user = req.query.user || "ERROR";
  let svg = req.query.svg || false;

  oauth.get(
    `https://api.thenounproject.com/v2/icon/${id}/download?color=${color}&filetype=${type}`,
    null,
    null,
    function (error, data, response) {
      if (error) {
        console.error(`Error: ${JSON.stringify(error)}`);
        res.json({
          success: false,
          message: "GET icon download failed!",
          url: req.url,
          error: error.message,
        });
      } else {
        console.log(data);
        // const base64data = new Buffer.from(
        //   JSON.parse(data).base64_encoded_file,
        //   "base64"
        // );

        res.send({ success: true, data: JSON.parse(data).base64_encoded_file });
      }
    }
  );
});

app.get("/icons/save/edited", function (req, res) {
  // Add your code here
  //  console.log(req);
  let id = req.query.id;
  let size = req.query.size || 1200;
  let color = req.query.color || "000000";
  let type = req.query.type || "png";
  let user = req.query.user || "ERROR";
  let svg = req.query.svg || false;

  oauth.get(
    `https://api.thenounproject.com/v2/icon/${id}/download?color=${color}&filetype=${type}&size=${size}`,
    null,
    null,
    function (error, data, response) {
      if (error) {
        console.error(`Error: ${JSON.stringify(error)}`);
        res.json({
          success: false,
          message: "GET icon download failed!",
          url: req.url,
          error: error.message,
        });
      } else {
        console.log(data);
        const base64data = new Buffer.from(
          JSON.parse(data).base64_encoded_file,
          "base64"
        );

        const params = {
          Bucket: "tgltoolboxusericons",
          Key: `edited/${user}/${id}.png`,
          Body: base64data,
          ContentType: "image/png",
          ContentEncoding: "base64",
          ContentDisposition: `attachment; filename=${id}.png`,
        };

        s3.upload(params, function (err, data) {
          if (err) {
            console.error(`Upload Error: ${err}`);
            return res.json({
              success: false,
              message: "Upload to S3 failed!",
              url: req.url,
              error: err,
            });
          } else {
            console.log(`Upload Success. File location: ${data.Location}`);
            res.json({
              success: true,
              message: "Upload to S3 succeed!",
              url: data.Location,
              data: data,
            });
          }
        });
      }
    }
  );
});

app.get("/icons/getRaws", function (req, res) {
  let user = req.query.user;
  let id = req.query.id;
  // let root = req.query.root || "raw";

  let params = {
    Bucket: "tgltoolboxusericons",
    Key: `raw/${user}/${id}.png`,
    Expires: 3600, // This is the expiration time in seconds
  };

  // Generate pre-signed URL
  let url = s3.getSignedUrl("getObject", params);
  return res.json({
    success: url ? true : false,
    message: url ? "Signed success" : "Signed failed",
    url: req.url,
    signedURL: url,
  });
});

app.get("/icons/getEdits", function (req, res) {
  let user = req.query.user;
  let id = req.query.id;
  // let type = req.query.type || "png";

  let params = {
    Bucket: "tgltoolboxusericons",
    Key: `edited/${user}/${id}.png`,
    Expires: 3600, // This is the expiration time in seconds
  };

  // Generate pre-signed URL
  let url = s3.getSignedUrl("getObject", params);
  return res.json({
    success: url ? true : false,
    message: url ? "Signed success" : "Signed failed",
    url: req.url,
    signedURL: url,
  });
});

app.get("/icons/rename", async function (req, res) {
  let user = req.query.user;
  let id = req.query.id;
  let newName = req.query.newName;
  let type = req.query.type || "png";

  async function renameFileInS3(bucketName, oldFileName, newFileName) {
    //copy the object to the same bucket, adding a new name
    await s3
      .copyObject({
        Bucket: bucketName,
        CopySource: `${bucketName}/${oldFileName}`,
        Key: newFileName,
      })
      .promise();

    //delete the old object
    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: oldFileName,
      })
      .promise();

    console.log("File renamed successfully");
  }

  try {
    await renameFileInS3(
      "tgltoolboxusericons",
      `edited/${user}/${id}.png`,
      `edited/${user}/${newName}.png`
    );
    return res.json({
      success: true,
      message: "Rename success",
      url: req.url,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to rename file" });
  }
});

/****************************
 * Example post method *
 ****************************/

// app.post("/icons", async function (req, res) {
//   // Add your code here
//   res.json({ success: "post call succeed!", url: req.url, body: req.body });
// });

app.post("/icons/save/edited", (req, res) => {
  const { id, user, iconString } = req.body;

  // Ensure correct input
  if (!id || !iconString) {
    return res.status(400).json({
      success: false,
      message: "Required fields: id and svg are not supplied!",
    });
  }

  if (!iconString) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid SVG data" });
  }

  const bodyData = Buffer.from(iconString, "base64");

  const params = {
    Bucket: "tgltoolboxusericons",
    Key: `edited/${user}/${id}.png`,
    Body: bodyData,
    ContentType: "image/png",
    ContentEncoding: "base64",
    ContentDisposition: `attachment; filename=${id?.slice(
      id?.indexOf("_") + 1
    )}.png`,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      console.error(`Upload Error: ${error}`);
      res.status(500).json({
        success: false,
        message: "Upload to S3 failed!",
        url: req.url,
        error,
      });
    } else {
      console.log(`Upload Success. File location: ${data.Location}`);
      res.json({
        success: true,
        message: "Upload to S3 successful!",
        url: data.Location,
        data,
      });
    }
  });
});

app.post("/icons/*", function (req, res) {
  // Add your code here
  res.json({ success: "post call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example put method *
 ****************************/

app.put("/icons", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

app.put("/icons/*", function (req, res) {
  // Add your code here
  res.json({ success: "put call succeed!", url: req.url, body: req.body });
});

/****************************
 * Example delete method *
 ****************************/

app.delete("/icons/:id", function (req, res) {
  let user = req.body.user;
  let id = req.params.id;
  let root = req.body.root;

  let params = {
    Bucket: "tgltoolboxusericons",
    Key: `${root}/${user}/${id}${root === "raw" ? ".png" : ".png"}`,
  };

  console.log(params);

  s3.deleteObject(params, function (err, data) {
    if (err) {
      console.error(`Deletion Error: ${err}`);
      return res.json({
        success: false,
        message: "Deletion in S3 failed!",
        url: req.url,
        error: err,
      });
    } else {
      console.log(`Deletion Success.`);
      res.json({
        success: true,
        message: "Deletion in S3 succeed!",
        data: data,
      });
    }
  });
});

// app.delete("/icons/*", function (req, res) {
//   // Add your code here
//   res.json({ success: "delete call succeed!", url: req.url });
// });

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
