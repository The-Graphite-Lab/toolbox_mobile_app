const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const axios = require("axios");

// Declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/**
 * Compute route matrix endpoint
 */
app.post("/geoapify/planRoutes", async function (req, res) {
  const GAKey = process.env.REACT_APP_GEOAPIFY_API_KEY;
  const { agents, locations, options } = req.body;
  // Construct the payload for POST request
  let body = {
    mode: options.mode || "medium_truck",
    traffic: options.traffic || "approximated",
    type: options.type || "balanced",
    units: options.units || "imperial",
    avoid: options.avoid?.map((avoid) => ({ type: avoid })) || [
      { type: "tolls" },
    ],
    agents: agents.map((agent) => ({
      start_location:
        agent?.start === "hq"
          ? [agent.hq.lon, agent.hq.lat]
          : [agent.techHome.lon, agent.techHome.lat],
      end_location:
        agent?.end === "hq"
          ? [agent.hq.lon, agent.hq.lat]
          : agent.techHome
          ? [agent.techHome.lon, agent.techHome.lat]
          : null,
      id: agent.id || "",
      description:
        agent.description?.length > 990
          ? agent.description.substring(0, 990)
          : agent.description || "", // there is a length limit for API
      time_windows: [[options?.start || 0, options?.end || 86400]], //business hours or 24hrs/day
      capabilities: agent.capabilities || [], // Contains agent ID
    })),
    jobs: locations.map((location) => ({
      id: location.id || "",
      description:
        location.description?.length > 990
          ? location.description.substring(0, 990)
          : location.description || "",
      location: [location.lon, location.lat],
      duration: location.duration || 0, // Seconds
      time_windows: location.time_windows || [[0, 86400]], // [[start, end], ...] in seconds
      requirements: location.requirements || [], // Contains agent ID if locked
      priority: location.priority || 0, // 0-100
    })),
  };

  //remove end_location from agents if it is not null
  for (let agent of body.agents) {
    if (!agent.end_location) {
      delete agent.end_location;
    }
  }

  // Make the POST API call
  try {
    const response = await axios.post(
      `https://api.geoapify.com/v1/routeplanner?apiKey=${GAKey}`,
      body
    );
    res.json({
      message: "Successfully retrieved route matrix data",
      routeData: response.data, // Response data from Geoapify API
    });
  } catch (error) {
    // console.error(error);
    console.log(error);

    // Check if error response contains the "too far apart" message
    if (error.response && error.response.data && error.response.data.message) {
      if (
        error.response.data.message.includes(
          "Too long distance between locations"
        )
      ) {
        res.json({
          error:
            "Too long distance between locations. Please go back and inspect your selected appointments and/or technicians.",
          details: error.response.data.message,
        });
        return;
      }
    }

    res.json({
      error: "Failed to fetch the data from the Geoapify API",
      details: error.message,
    });
  }
});

app.post("/geoapify/mapping", async function (req, res) {
  const GAKey = process.env.REACT_APP_GEOAPIFY_API_KEY;
  const { waypoints } = req.body;

  let body = {
    waypoints: waypoints.map((waypoint) => ({
      location: waypoint,
    })),
    mode: "drive",
  };

  try {
    const response = await axios.post(
      `https://api.geoapify.com/v1/mapmatching?apiKey=${GAKey}`,
      body
    );
    res.json({
      message: "Successfully retrieved route matrix data",
      routeData: response.data, // Response data from Geoapify API
    });
  } catch (error) {
    console.error(error);
  }
});

app.post("/geoapify/route", async function (req, res) {
  const GAKey = process.env.REACT_APP_GEOAPIFY_API_KEY;
  const { start, end, waypoints, mode, type } = req.body;

  let waypointsString = "";
  if (start && end) {
    waypointsString = `${start?.join(",")}|${end?.join(",")}`;
  } else if (waypoints) {
    waypointsString = waypoints.map((waypoint) => waypoint.join(",")).join("|");
  }

  // Construct the payload for POST request
  let body = {
    waypoints: waypointsString,
    mode: mode || "drive",
    units: "imperial",
  };

  if (type) {
    body.type = type;
  }

  // Make the POST API call
  try {
    const response = await axios.get(
      `https://api.geoapify.com/v1/routing?apiKey=${GAKey}`,

      { params: body }
    );
    res.json({
      message: "Successfully retrieved route data",
      routeData: response.data, // Response data from Geoapify API
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch the data from the Geoapify API",
      details: error.message,
    });
  }
});

app.listen(3000, function () {
  console.log("App started on port 3000");
});

module.exports = app;
