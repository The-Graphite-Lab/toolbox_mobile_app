const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

function limitCharacters(str, max) {
  if (str.length > max) {
    return str.substring(0, max) + "...";
  }
  return str;
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  for (const record of event.Records) {
    const updatedRecord = AWS.DynamoDB.Converter.unmarshall(
      record?.dynamodb?.NewImage
    );
    const reviewContent = updatedRecord?.reviewContent;
    const status = updatedRecord?.status;
    const content = updatedRecord?.content || "";
    const rating = updatedRecord?.rating || "";
    const ratingScale = updatedRecord?.ratingScale || "";
    const responseLength = updatedRecord?.responseLength || 2;

    if (status !== "pending") continue;

    if (reviewContent && !content) {
      const object = {
        messages: [
          {
            role: "system",
            content: `Write a formatted, ${responseLength} sentence response to the provided review. Only include the body without an introduction or closing (dear, sincerely, this is a response, etc). Do not make any offers, only respond to what was said. If a writing style is specified, use it as your style, otherwise make the response sound professional yet human. It should sound like a regular person wrote it. It shouldn't use vocabulary that the average person wouldn't use. Do not mention the review content in the response. If they only provide rating information, response to the rating. If you do not have enough information to respond appropriately only respond with "thank you for your review".`,
          },
          {
            role: "user",
            content: `
              review content: ${reviewContent}
              rating: ${rating}/${ratingScale}
            `,
          },
        ],
        itemId: updatedRecord?.id,
        tableName: "Reviews-bm44urfj6bcajm63ohamnsj4au-staging",
        keyToUpdate: "content",
        type: "chat",
        model: "gpt-4",
        max_tokens: 2000,
      };

      await sendSQSMessage(object);
    }

    if (reviewContent && content) {
      //handle mark complete
      console.log("completing object");
      const params = {
        TableName: "Reviews-bm44urfj6bcajm63ohamnsj4au-staging",
        Key: {
          id: updatedRecord?.id,
        },
        UpdateExpression: `set #status = :value`,
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":value": "complete",
        },
        ReturnValues: "UPDATED_NEW",
      };

      try {
        const result = await dynamoDb.update(params).promise();
        console.log(result);
      } catch (error) {
        console.error(error.message);
      }
    }
  }
  return Promise.resolve("Successfully processed DynamoDB record");
};

async function sendSQSMessage(data) {
  const itemString = JSON.stringify(data);

  const params = {
    QueueUrl:
      "https://sqs.us-east-2.amazonaws.com/843563127054/openAiQueue-toolbox-staging",
    MessageBody: itemString,
  };

  const message = await sqs.sendMessage(params).promise();
  console.log(message);
  return message;
}
