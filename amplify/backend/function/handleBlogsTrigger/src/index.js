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
    const title = updatedRecord?.title;
    const status = updatedRecord?.status;
    const excerpt = updatedRecord?.excerpt;
    const content = updatedRecord?.content;
    const keywords = updatedRecord?.keywords || "";
    const summary = updatedRecord?.summary || "";
    const style = updatedRecord?.style || "";

    if (status !== "pending") continue;

    if (title && !content) {
      const object = {
        messages: [
          {
            role: "system",
            content:
              "Write only the body of an html blog post with headers with the provided title. For additional context, the user may also provide keywords they want to focus on, a summary of the blog they want to write, and a writing style for the blog. It is important that the blog that you write cannot be detected as written by AI.",
          },
          {
            role: "user",
            content: `
            Title: ${title}
            Keywords: ${keywords}
            Summary: ${summary}
            Style: ${style}
          `,
          },
        ],
        itemId: updatedRecord?.id,
        tableName: "Blogs-bm44urfj6bcajm63ohamnsj4au-staging",
        keyToUpdate: "content",
        type: "chat",
        model: "gpt-4",
        max_tokens: 2500,
      };
      await sendSQSMessage(object);
    }

    if (title && content && !excerpt) {
      //handle create excerpt
      console.log("creating excerpt");
      const object = {
        messages: [
          {
            role: "system",
            content: "Write a 2 sentence excerpt for the provided article.",
          },
          {
            role: "user",
            content: `
            ${limitCharacters(content, 500)}
          `,
          },
        ],
        itemId: updatedRecord?.id,
        tableName: "Blogs-bm44urfj6bcajm63ohamnsj4au-staging",
        keyToUpdate: "excerpt",
        type: "chat",
        model: "gpt-4",
        max_tokens: 2000,
      };
      await sendSQSMessage(object);
    }

    if (title && content && excerpt) {
      //handle mark complete
      console.log("completing object");
      const params = {
        TableName: "Blogs-bm44urfj6bcajm63ohamnsj4au-staging",
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
