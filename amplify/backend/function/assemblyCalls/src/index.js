const { AssemblyAI } = require("assemblyai");
const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const axios = require("axios");
const s3 = new AWS.S3();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ASSEMBLY_AI_API_KEY = process.env.REACT_APP_ASSEMBLY_AI_API_KEY;
const client = new AssemblyAI({
  apiKey: ASSEMBLY_AI_API_KEY,
});
const bucketName = "tgltoolboxuserfiles210135-staging";

// Updated convertTranscript: no longer combines utterances by speaker.
function convertTranscript(transcript) {
  if (!transcript.utterances || transcript.utterances.length === 0) {
    return [];
  }

  // Return each utterance separately with trimmed text.
  return transcript.utterances.map((utterance) => ({
    speaker: utterance.speaker,
    text: utterance.text.trim(),
    start: utterance.start,
    end: utterance.end,
  }));
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const callItem = AWS.DynamoDB.Converter.unmarshall(
        record.dynamodb.NewImage
      );

      if (callItem.transcriptStatus === "PENDING") {
        const recordingURL = callItem.recordingURL;
        const callId = callItem.id;
        const ClientID = callItem.ClientID;
        const fileName = recordingURL.split("/").pop();

        try {
          const audioFileS3Response = await s3
            .getObject({
              Bucket: bucketName,
              Key: "public/" + recordingURL,
            })
            .promise();

          const transcript = await client.transcripts.transcribe({
            audio: audioFileS3Response.Body,
            speaker_labels: true,
            speakers_expected: 2,
            summarization: false,
            sentiment_analysis: true,
            redact_pii: true,
            redact_pii_policies: [
              "credit_card_number",
              "credit_card_expiration",
              "credit_card_cvv",
              "us_social_security_number",
              "banking_information",
              "drivers_license",
            ],
            redact_pii_audio: true,
          });

          // Process the transcript without combining utterances.
          const processedTranscript = convertTranscript(transcript);
          // Construct the S3 key (path)
          const s3Key = `public/clients/${ClientID}/tooldata/9be17780-eba3-4bbd-a8be-fe5b78d296c0/callTranscripts/${callId}.json`;

          // Upload the processed transcript to S3 using AWS SDK v2
          const putParams = {
            Bucket: "tgltoolboxuserfiles210135-staging",
            Key: s3Key,
            Body: JSON.stringify(processedTranscript),
            ContentType: "application/json",
          };

          await s3.putObject(putParams).promise();
          // Remove the 'public/' prefix to build the transcriptPath
          const transcriptPath = s3Key.replace(/^public\//, "");

          const { redacted_audio_url } = await client.transcripts.redactions(
            transcript.id
          );

          const redactedFile = await axios.get(redacted_audio_url, {
            responseType: "arraybuffer",
          });

          let redactedFileName = recordingURL.replace(".mp3", "_redacted.mp3");
          redactedFileName = redactedFileName.replace("/input/", "/output/");
          await s3
            .putObject({
              Bucket: bucketName,
              Key: "public/" + redactedFileName,
              Body: redactedFile.data,
            })
            .promise();

          const updateParams = {
            TableName: "Calls-bm44urfj6bcajm63ohamnsj4au-staging",
            Key: {
              id: callId,
            },
            UpdateExpression:
              "set recordingURL = :r, transcriptStatus = :s, #dur = :d, transcriptID = :i, callName = :n, transcriptPath = :tp, isProcessed = :iP",
            ExpressionAttributeNames: {
              "#dur": "duration",
            },
            ExpressionAttributeValues: {
              ":r": redactedFileName,
              ":s": "ANALYZING",
              ":d": transcript?.audio_duration,
              ":i": transcript?.id,
              ":n": fileName,
              ":tp": transcriptPath,
              ":iP": true,
            },
          };

          await dynamoDB.update(updateParams).promise();
          console.log("Transcript processed");
        } catch (error) {
          console.error(`Error processing transcription: ${error.message}`);
          const updateParams = {
            TableName: "Calls-bm44urfj6bcajm63ohamnsj4au-staging",
            Key: {
              id: callId,
            },
            UpdateExpression: "set transcriptStatus = :s",
            ExpressionAttributeValues: {
              ":s": "ERROR",
            },
          };

          await dynamoDB.update(updateParams).promise();
          return { statusCode: 500, body: "Internal Server Error" };
        }
      }
    } catch (error) {
      console.error(`Error processing transcription: ${error.message}`);
    }
  }

  return {
    statusCode: 200,
    body: "Trigger processed successfully.",
  };
};
