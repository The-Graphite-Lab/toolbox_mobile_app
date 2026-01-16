const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/**********************
 * Example get method *
 **********************/

app.get("/openai", async function (req, res) {
  const query = req?.query;
  const prompt = query?.prompt;
  if (!prompt)
    res.json({ status: "error", data: "Request must include a prompt" });
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 70,
    });
    res.json({ status: "success", data: response?.data?.choices[0]?.text });
  } catch (error) {
    res.json({ status: "error", data: error });
  }
});

app.post("/openai/chatCompletion", async function (req, res) {
  const body = req.body;

  // Extract options
  const model = body.model || "gpt-3.5-turbo";
  const temperature = body.temperature;
  const max_tokens = body.max_tokens;
  const messages = body.messages;
  const functions = body.functions;
  const function_calls = body.function_calls;
  const user = body.user;
  const top_p = body.top_p;
  const presence_penalty = body.presence_penalty;
  const frequency_penalty = body.frequency_penalty;
  const stop = body.stop;
  const logit_bias = body.logit_bias;
  const response_format = body.response_format;
  const seed = body.seed;
  const tools = body.tools;
  const tools_choice = body.tools_choice;
  const parallel_tool_calls = body.parallel_tool_calls;

  if (!messages?.length) {
    res.json({ status: "error", data: "Request must include a message" });
    return;
  }

  try {
    let params = {
      model: model,
      messages,
    };
    if (temperature) params.temperature = parseFloat(temperature);
    if (max_tokens) params.max_tokens = parseInt(max_tokens, 10);
    if (functions) params.functions = functions;
    if (function_calls) params.function_calls = function_calls;
    if (user) params.user = user;
    if (top_p) params.top_p = parseFloat(top_p);
    if (presence_penalty)
      params.presence_penalty = parseFloat(presence_penalty);
    if (frequency_penalty)
      params.frequency_penalty = parseFloat(frequency_penalty);
    if (stop) params.stop = stop;
    if (logit_bias) params.logit_bias = logit_bias;
    if (response_format) params.response_format = response_format;
    if (seed) params.seed = parseInt(seed, 10);
    if (tools) params.tools = [...tools];
    if (tools_choice) params.tools_choice = tools_choice;
    if (parallel_tool_calls)
      params.parallel_tool_calls = Boolean(parallel_tool_calls);

    const response = await openai.createChatCompletion(params);

    res.json({ status: "success", data: response?.data });
  } catch (error) {
    res.json({ status: "error", data: error.message });
  }
});

app.post("/openai/imageGen", async function (req, res) {
  const body = req.body;

  const model = body.model || "dall-e-2";
  const prompt = body.prompt;
  const size = body.size || "1024x1024";
  const quality = body.quality || "standard";
  const style = body.style || "vivid";
  const response_format = body.response_format || "url";
  const optimize = body.optimize === "false" ? false : true;

  if (!prompt) {
    res.json({ status: "error", data: "Request must include a prompt" });
    return;
  }

  try {
    let params = {
      model,
      prompt: optimize
        ? prompt
        : `I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: ${prompt}`,
      size,
      quality,
      style,
      response_format,
    };

    const response = await openai.createImage(params);

    res.json({ status: "success", data: response?.data });
  } catch (error) {
    res.json({ status: "error", data: error.message });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
