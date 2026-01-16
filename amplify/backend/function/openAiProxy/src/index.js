import OpenAI from "openai";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function handleOpenAiTextCompletion({
  prompt,
  model,
  temperature,
  max_tokens,
}) {
  for (const key of ["prompt", "model", "temperature", "max_tokens"]) {
    if (!key) {
      return {
        status: "error",
        body: `Error: Missing required key "${key}" in event object`,
      };
    }
  }
  const response = await openai.completions.create({
    model,
    prompt,
    temperature,
    max_tokens,
  });

  if (!response?.choices[0]?.text) {
    return {
      status: "error",
      body: "Unable to complete text completion",
    };
  }

  return {
    status: "success",
    body: response?.choices[0]?.text,
  };
}

async function handleOpenAiChatCompletion({
  messages,
  model,
  temperature,
  max_tokens,
  functions,
  function_call,
  response_format

}) {
  for (const key of ["model", "temperature", "max_tokens"]) {
    if (!key) {
      return {
        status: "error",
        body: `Error: Missing required key "${key}" in event object`,
      };
    }
    let completion = {
      model: model || "gpt-3.5-turbo",
      messages: messages || [],
    };
    if (temperature) completion.temperature = temperature;
    if (max_tokens) completion.max_tokens = max_tokens;
    if (functions) completion.functions = functions;
    if (function_call) completion.function_call = function_call;
    if (response_format) completion.response_format = response_format;
    const response = await openai.chat.completions.create(completion);
    const data = response?.choices[0]?.message?.content;
    if (!data) {
      return {
        status: "error",
        body: "Unable to complete chat completion",
      };
    }
    return {
      status: "success",
      body: data,
    };
  }
}

async function updateDynamoDbTableItem({
  tableName,
  id,
  updateKey,
  updateValue,
}) {
  const object = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: `set #${updateKey} = :value`,
    ExpressionAttributeValues: {
      ":value": updateValue,
    },
    ExpressionAttributeNames: {},
    ReturnValues: "UPDATED_NEW",
  }
  object.ExpressionAttributeNames[`#${updateKey}`] = updateKey;
  const command = new UpdateCommand(object);

  try {
    const response = await docClient.send(command);
    return { statusCode: 200, body: JSON.stringify(response.Attributes) };
  } catch (error) {
    return {
      statusCode: error.statusCode || 501,
      headers: { "Content-Type": "text/plain" },
      body: error.message || "Update failed",
    };
  }
}

function convertTextToHtml(text) {
  let textArray = text.split("\n");
  let textString = "";
  for (let i = 0; i < textArray?.length; i++) {
    if (!textArray[i]) continue;
    let cleanedString = `${textArray[i]
      .replace(/######(.+)/g, "<h6>$1</h6>")
      .replace(/#####(.+)/g, "<h5>$1</h5>")
      .replace(/####(.+)/g, "<h4>$1</h4>")
      .replace(/###(.+)/g, "<h3>$1</h3>")
      .replace(/##(.+)/g, "<h2>$1</h2>")
      .replace(/#(.+)/g, "<h1>$1</h1>")
      .replace(/\n/g, "<br>")
      .replace(/#/g, "")
      .trim()}`;
    if (!cleanedString.startsWith("<") || !cleanedString.endsWith(">"))
      cleanedString = `<p>${cleanedString}</p>`;
    textString = `${textString}${textString ? " <br/> " : ""}${cleanedString}`;
  }
  return textString.trim();
}

export const handler = async (event) => {
  //console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    const body = JSON.parse(record?.body || "{}");
    const type = body?.type;
    const itemId = body?.itemId;
    const keyToUpdate = body?.keyToUpdate;
    const tableName = body?.tableName;
    const isHtml = body?.isHtml;
    try {
      if (type === "textCompletion") {
        if (!itemId || !keyToUpdate || !tableName) {
          console.error("Error: Missing necessary key");
          continue;
        }
        const textResponse = await handleOpenAiTextCompletion(body);
        if (textResponse?.status !== "success") {
          console.error(textResponse);
          continue;
        }
        const text = isHtml
          ? convertTextToHtml(textResponse.body)
          : textResponse.body;
        const updateDynamoDBTableResponse = await updateDynamoDbTableItem({
          tableName,
          id: itemId,
          updateKey: keyToUpdate,
          updateValue: text,
        });
        console.log(updateDynamoDBTableResponse);
      }

      if (type === "chat") {
        if (!itemId || !keyToUpdate || !tableName) {
          console.error("Error: Missing necessary key");
          continue;
        }

        const textResponse = await handleOpenAiChatCompletion(body);

        if (textResponse?.status !== "success") {
          console.error(textResponse);
          continue;
        }

        const updateDynamoDBTableResponse = await updateDynamoDbTableItem({
          tableName,
          id: itemId,
          updateKey: keyToUpdate,
          updateValue: textResponse?.body,
        });
        console.log(updateDynamoDBTableResponse);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return {
    statusCode: 200,
  };
};
