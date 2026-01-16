const { PDFDocument, rgb } = require("pdf-lib");
const AWS = require("aws-sdk");
const DDB = new AWS.DynamoDB.DocumentClient();
const S3 = new AWS.S3();
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid");

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });
const invoiceTable = "Invoices-bm44urfj6bcajm63ohamnsj4au-staging";
const activityTable = "Activity-bm44urfj6bcajm63ohamnsj4au-staging";

function getPrompt({ prompt, invoiceType }) {
  let prompts = {
    pages: `I will be giving you the text from a pdf document that contains one or many transactions of different types. Your job is to return back a JSON array that tells me which invoice numbers exist in the document and what pages any part of the invoice can be seen on which could be one page or multiple. Every page should be accounted for in your response.

    Important note: A multipage transaction will never span non-consequtive pages. All pages of a transaction will be in an unbroken sequence of pages.

      ONLY RESPOND WITH THE JSON ARRAY AND NO MARKDOWN.
      
      FORMAT:
      {transactions: [
      {
      invoiceNumber: 'string',
      pages: array of numbers,
      type: 'string' this is the type of transaction file on these pages.
      }
      ]}
      
      AVAILABLE TRANSACTION TYPES (A transaction can only be one of the following types):
      Bill: A bill is a document that is sent to a customer from a vendor requesting payment for goods or services that have been provided. It may also be referred to as an invoice.
      Receipt: A receipt is a document that is given to a customer after they have paid for goods or services. It is proof of payment.
      Statement: A statement is a document that is sent to a customer from a vendor that details the transactions that have occurred between the two parties over a specific period of time.
      Order Acknowledgement: An order acknowledgement is a document that is sent to a customer from a vendor confirming that an order has been received and will be processed.
      Purchase Order: A purchase order is a document that is sent from a customer to a vendor requesting goods or services. It is a legally binding document that outlines the terms of the transaction.
      Delivery: A delivery is a document that is sent to a customer from a vendor confirming that goods or services have been delivered.
      Credit: A credit is a document that is sent to a customer from a vendor confirming that a credit has been issued.
      Debit: A debit is a document that is sent to a customer from a vendor confirming that a debit has been issued.
      Remittance Advice: A remittance advice is a document that is sent to a vendor from a customer detailing the payments that have been made.
      Other: If the transaction type does not fit into any of the above categories, it should be classified as "Other".
      `,
    invoice: `You will be provided with the contents of a PDF transformed into text.

      Your task is to extract details from transactions with this specified transaction type: ${invoiceType}.

      Do not include markdown or keys that don't exist. Please respond in JSON format as laid out below.

      Return the following data based on the whole text in JSON object format. Ensure accuracy in identifying and matching fields to their correct values.

      IMPORTANT NOTES:
      - Customer PO Number "poNumber" is incredibly important and should be extracted if it exists. It is not the same as the customer number and it will probably be its own field in the document.
      - Product Code "productCode" is incredibly important and should be extracted if it exists. It is not the full description of the line item and will probably be hidden in the description if it is not its own field. If it is in a description, it is most likely towards the beginning.
      - Description "description" is the full description of a line item and the no part of the decription should be excluded.

      Field Definitions:
      - vendor refers to the person providing the transaction document
      - client refers to the person receiving the transaction document (could be called a customer)
      - invoiceNumber refers to the document number regardless of type.
      - vendorName refers to the name of the vendor.
      - vendorAddress refers to the address of the vendor.
      - vendorUrl refers to the URL or website of the vendor.
      - vendorContact refers to a phone number string.
      - vendorABN refers to the Australian Business Number string.
      - vendorGST refers to the Goods and Services Tax number string.
      - vendorPAN refers to the Permanent Account Number string.
      - vendorVAT refers to the Value Added Tax number string.
      - clientUrl refers to the URL or website of the client. 
      - clientName refers to the name of the client.
      - clientAddress refers to the address of the client.
      - clientPhone refers to a phone number string.
      - clientABN refers to the Australian Business Number string.
      - clientGST refers to the Goods and Services Tax number string.
      - clientPAN refers to the Permanent Account Number string.
      - clientVAT refers to the Value Added Tax number string.
      - customerTaxID refers to the customer's tax ID string.
      - customerNumber refers to the customer's number in the vendors system and is not always provided in the document. It will be its own field if it exists.
      - customerAccount refers to the customer's account number in the vendors system.
      - invoiceDate refers to the date the invoice was issued.
      - dueDate refers to the date the invoice is due.
      - paymentMethod refers to the method of payment.
      - orderDate refers to the date the order was placed.
      - deliveryDate refers to the date the order was delivered.
      - poNumber refers to the client's purchase order number or po number or customer po number and is not always provided in the document. This is different from the customer number. This will not be in the line items, but it will be its own field on the transaction.
      - serviceCharge refers to the service charge amount.
      - gratuity refers to the gratuity amount.
      - discount refers to the discount amount.
      - priorBalance refers to the prior balance amount.
      - amountDue refers to the total amount due.
      - amountPaid refers to the total amount paid.
      - subTotal refers to the pretax and shipping total.
      - shippingHandling refers to the shipping and handling amount.
      - tax refers to the sales tax or VAT amount.
      - total refers to the total amount.
      - lineItems refers to an array of objects containing the following fields:
        - quantity refers to the quantity of the line item.
        - price refers to the total price of the line item.
        - unitPrice refers to the price per unit of the line item.
        - productCode refers to the part number or sku of the line item and may be hidden in the description. This will NOT be the full description of the line item.
        - description refers to the full description of the line item. This will be the full description of the line item.

      FORMAT:
          {
            invoiceNumber: string,
            vendorName, 
            vendorAddress, 
            vendorUrl, 
            vendorContact, 
            vendorABN, 
            vendorGST, 
            vendorPAN, 
            vendorVAT, 
            clientUrl, 
            clientName, 
            clientAddress, 
            clientPhone, 
            clientABN, 
            clientGST, 
            clientPAN, 
            clientVAT, 
            customerTaxID, 
            customerNumber: string, 
            customerAccount, 
            invoiceDate, 
            dueDate, 
            paymentMethod, 
            orderDate, 
            deliveryDate, 
            poNumber: string, 
            serviceCharge, 
            gratuity, 
            discount, 
            priorBalance, 
            amountDue: float, 
            amountPaid: float, 
            subTotal: float, 
            shippingHandling: float, 
            tax: float,
            total: float, 
            lineItems: [
            {
              quantity: int,
              price: float,
              unitPrice: float,
              productCode: string,
              description: string
            }]
          }`,
    images: `You will be provided with an image of an invoice. Your job is to process it and return a text that can be used to create a pdf of the invoice if returning a pdf is not possible.`,
  };

  return prompts[prompt];
}

// Utility Functions
const isImageFile = (fileName) => /\.(jpg|jpeg|png)$/i.test(fileName);

async function convertTextToPDF(text) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont("Helvetica");
    const fontSize = 12;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height - textHeight - 50,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("Error converting text to PDF:", error.message);
    throw new Error(
      "There was an issue creating the PDF document. Please try again."
    );
  }
}

async function createTempInvoice(objectKey, metadata) {
  const tempInvoiceId = uuidv4();
  await DDB.put({
    TableName: invoiceTable,
    Item: {
      id: tempInvoiceId,
      fileLink: objectKey,
      originalFileLink: objectKey,
      textractStatus: "PENDING",
      source: metadata.source,
      type: "-",
      clientID: objectKey.split("/originals/")[1]?.split("/")?.shift(),
      UserID: objectKey.split("::")[0]?.split("/")?.pop(),
      user: objectKey.split("::")[1]?.split("/")?.shift(),
      __typename: "Invoices",
      _version: 0,
      _lastChangedAt: new Date().getTime(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }).promise();
  return tempInvoiceId;
}

async function deleteTempInvoice(tempInvoiceId) {
  await DDB.delete({
    TableName: invoiceTable,
    Key: {
      id: tempInvoiceId,
    },
  }).promise();
}

async function setInvoiceStatusToErrored(tempInvoiceId) {
  await DDB.update({
    TableName: invoiceTable,
    Key: {
      id: tempInvoiceId,
    },
    UpdateExpression: "set textractStatus = :status",
    ExpressionAttributeValues: {
      ":status": "ERRORED",
    },
  }).promise();
}

async function getUser(userID) {
  return await DDB.get({
    TableName: "Users-bm44urfj6bcajm63ohamnsj4au-staging",
    Key: {
      id: userID,
    },
  }).promise();
}

async function createFailureActivityLog(
  objectKey,
  error,
  tempInvoiceID,
  ClientID
) {
  let filename = objectKey.split("/").pop();
  return await DDB.put({
    TableName: activityTable,
    Item: {
      id: uuidv4(),
      title: "Invoice Processing Failure",
      details: `Failed to process invoice: ${filename}.
        
        Error: ${error.message || "Unknown error"}`,
      type: "Error",
      referenceNumber: tempInvoiceID,
      ToolID: "e447fa1b-c26b-4469-8de1-414ea86c0512",
      UserID: objectKey.split("::")[0]?.split("/")?.pop(),
      ClientID,
      __typename: "Activity",
      _version: 1,
      _lastChangedAt: new Date().getTime(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      typeCreatedAt: `${new Date().toISOString()}_Error`,
    },
  }).promise();
}

async function extractS3Info(event) {
  const s3Info = event.Records[0].s3;
  const bucketName = s3Info.bucket.name;
  const objectKey = decodeURIComponent(s3Info.object.key.replace(/\+/g, " "));

  const originalFile = await S3.getObject({
    Bucket: bucketName,
    Key: objectKey,
  }).promise();

  const metadataResponse = await S3.headObject({
    Bucket: bucketName,
    Key: objectKey,
  }).promise();

  const metadata = metadataResponse.Metadata;

  return { bucketName, objectKey, originalFile, metadata };
}

async function slicePdf(pdfBuffer, pages) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const newDoc = await PDFDocument.create();
    for (let pageNumber of pages) {
      const [copiedPage] = await newDoc.copyPages(pdfDoc, [pageNumber - 1]);
      newDoc.addPage(copiedPage);
    }
    return newDoc.save();
  } catch (error) {
    console.error("Error slicing PDF:", error.message);
    throw new Error(
      "There was an issue slicing the PDF document. Please try again."
    );
  }
}

async function uploadPdfToS3(pdfBuffer, bucketName, objectKey) {
  try {
    await S3.putObject({
      Bucket: bucketName,
      Key: objectKey,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    }).promise();
    return objectKey;
  } catch (error) {
    console.error("Error uploading PDF to S3:", error.message);
    throw new Error(
      "There was an issue uploading the PDF document to S3. Please try again."
    );
  }
}

async function parsePDF(pdfBuffer, forArray = false) {
  return new Promise((resolve, reject) => {
    let pagesText = [];

    const options = {
      pagerender: async (page) => {
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(" ");
        pagesText.push(forArray ? text.replace(/\n/g, " ") : text);
      },
    };

    pdfParse(pdfBuffer, options)
      .then(() => {
        if (forArray) {
          resolve(pagesText);
        } else {
          const fullText = pagesText
            .map((text, index) => `~~~Page ${index + 1}~~~\n\n${text}`)
            .join("\n");
          resolve(fullText);
        }
      })
      .catch((error) => {
        reject(
          new Error(`Error parsing PDF: ${error.message || "Unknown error"}`)
        );
      });
  });
}

async function sendToOpenAI({
  systemContent,
  userContent,
  attempt = 0,
  vision,
}) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: vision
            ? [
                {
                  type: "image",
                  image_url: {
                    url: userContent,
                  },
                },
              ]
            : userContent,
        },
      ],
      temperature: 0,
    });
    return response;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      if (attempt < 5) {
        let delayTime = 10000;
        if (error.response.headers["x-ratelimit-reset-requests"]) {
          const resetRequestTime = parseInt(
            error.response.headers["x-ratelimit-reset-requests"]
          );
          delayTime = Math.max(resetRequestTime - Date.now(), 1000);
        }
        await new Promise((resolve) => setTimeout(resolve, delayTime));
        return sendToOpenAI({
          systemContent,
          userContent,
          attempt: attempt + 1,
        });
      } else {
        throw new Error("Failed after 5 attempts due to rate limit.");
      }
    } else {
      console.error("Error sending request to OpenAI:", error.message);
      throw new Error(
        "There was an issue communicating with OpenAI. Please try again."
      );
    }
  }
}

async function initialProcessing({
  objectKey,
  originalFile,
  bucketName,
  tempInvoiceId,
  ClientID,
}) {
  try {
    let pdfText, pdfArray, pdfBuffer;
    if (isImageFile(objectKey)) {
      pdfText = await sendToOpenAI({
        systemContent: getPrompt({ prompt: "images" }),
        userContent: originalFile.Body.toString("base64"),
        vision: true,
      });
      pdfBuffer = await convertTextToPDF(pdfText);
    } else {
      pdfBuffer = originalFile.Body;
      pdfText = await parsePDF(pdfBuffer);
    }

    pdfArray = await parsePDF(pdfBuffer, true);

    let parsedPages = true;
    pdfArray.forEach((text, index) => {
      if (!text || typeof text !== "string" || text.trim() === "") {
        parsedPages = false;
      }
    });

    if (!parsedPages) {
      console.error("Error processing PDF pages array.");
      await setInvoiceStatusToErrored(tempInvoiceId);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Error processing PDF pages array. The PDF might be corrupt or empty.",
        }),
      };
    }

    await uploadPdfToS3(
      pdfBuffer,
      bucketName,
      objectKey.replace("originals", "processed")
    );

    if (!pdfText) {
      await setInvoiceStatusToErrored(tempInvoiceId);
      await createFailureActivityLog(
        objectKey,
        new Error("Error Parsing Pages"),
        tempInvoiceId,
        ClientID
      );
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Failed to parse PDF text. The document might not contain any readable text.",
        }),
      };
    }

    return { pdfBuffer, pdfText, pdfArray };
  } catch (error) {
    console.error("Error processing PDF:", error.message);
    await setInvoiceStatusToErrored(tempInvoiceId);
    await createFailureActivityLog(objectKey, error, tempInvoiceId, ClientID);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error while processing the PDF.",
      }),
    };
  }
}

async function getPagesFromOpenAI({ pdfText, tempInvoiceId, objectKey }) {
  let pageMap;
  try {
    const response = await sendToOpenAI({
      systemContent: getPrompt({ prompt: "pages" }),
      userContent: pdfText,
    });
    if (response?.choices?.length) {
      let pageMapObject = JSON?.parse(response.choices[0].message.content);
      pageMap = pageMapObject?.transactions;

      if (!pageMap) {
        console.error("Received empty response from OpenAI:", response);
        return {
          statusCode: 400,
          body: JSON.stringify({
            message:
              "Failed to get page map from OpenAI. The response was empty or invalid.",
          }),
        };
      }
      return pageMap;
    } else {
      console.error(
        "Invalid or incomplete response structure from OpenAI:",
        response
      );
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Unexpected response structure from OpenAI.",
        }),
      };
    }
  } catch (error) {
    await setInvoiceStatusToErrored(tempInvoiceId);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error communicating with OpenAI. Please try again.",
      }),
    };
  }
}

async function getDetailsFromOpenAI({
  tempInvoiceId,
  pageMap,
  pdfArray,
  objectKey,
  ClientID,
}) {
  let invoices = [];
  let totalInvoices = pageMap?.length;

  for (let i = 0; i < totalInvoices; i++) {
    let invoicePages = pageMap[i]?.pages;
    let invoiceText = "";
    let type = pageMap[i]?.type;

    for (let pageIndex of invoicePages) {
      if (pageIndex > 0 && pageIndex <= pdfArray.length) {
        invoiceText += pdfArray[pageIndex - 1];
      } else {
        console.warn(
          `Page index ${pageIndex} is out of valid range for invoice ${pageMap[i].invoiceNumber}.`
        );
      }
    }

    if (invoiceText.trim()) {
      invoices.push({ invoiceText, type });
    } else {
      console.warn(
        `Invoice with number ${pageMap[i].invoiceNumber} resulted in empty text.`
      );
    }
  }

  try {
    const invoicePromises = invoices.map(async ({ invoiceText, type }, i) => {
      if (!invoiceText.trim()) {
        return Promise.resolve(null);
      }
      return sendToOpenAI({
        systemContent: getPrompt({ prompt: "invoice", type }),
        userContent: invoiceText,
      }).then((response) => ({
        index: i,
        data: response?.choices[0]?.message?.content,
      }));
    });

    const resolvedInvoices = await Promise.all(invoicePromises);

    for (const invoice of resolvedInvoices) {
      if (!invoice) continue;
      invoices[invoice.index] = invoice.data;
    }

    return invoices;
  } catch (error) {
    console.error("Error processing invoices with OpenAI:", error.message);
    await setInvoiceStatusToErrored(tempInvoiceId);
    await createFailureActivityLog(objectKey, error, tempInvoiceId, ClientID);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error while processing invoice details.",
      }),
    };
  }
}

async function completeProcessing({
  tempInvoiceId,
  invoices,
  pageMap,
  pdfBuffer,
  objectKey,
  bucketName,
  metadata,
  ClientID,
  tempInvoiceFile,
}) {
  try {
    if (!pageMap?.length)
      throw new Error("Unable to detect invoices in this file.");
    for (let [i, { invoiceNumber, pages, type }] of pageMap.entries()) {
      if (!Array.isArray(pages)) {
        console.error(
          `Invalid page information for invoice index ${i}:`,
          pages
        );
        continue;
      }

      const slicedPdfBuffer = await slicePdf(pdfBuffer, pages);
      let pdfKey = objectKey.replace("originals", "sliced").replace(".pdf", "");
      pdfKey = `${pdfKey} - pages ${pages?.join(", ")}.pdf`;
      const fileLink = await uploadPdfToS3(slicedPdfBuffer, bucketName, pdfKey);

      let invoiceDetails = JSON.parse(invoices[i]);
      let lineItems = invoiceDetails?.lineItems;
      let nonLIDetails = { ...invoiceDetails };
      delete nonLIDetails.lineItems;

      await DDB.put({
        TableName: invoiceTable,
        Item: {
          id: uuidv4(),
          fileLink,
          originalFileLink: objectKey,
          ...nonLIDetails,
          lineItems,
          textractStatus: "UNCONFIRMED",
          textractStatusUpdatedAt: `UNCONFIRMED_${new Date().toISOString()}`,
          receivedStatus: "NOT RECEIVED",
          source: metadata.source,
          type: type,
          clientID: objectKey.split("/originals/")[1]?.split("/")?.shift(),
          UserID: objectKey.split("::")[0]?.split("/")?.pop(),
          user: objectKey.split("::")[1]?.split("/")?.shift(),
          __typename: "Invoices",
          _version: 0,
          _lastChangedAt: new Date().getTime(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }).promise();
    }
    await deleteTempInvoice(tempInvoiceId);
  } catch (error) {
    console.error("Error saving invoices to database:", error.message);
    await setInvoiceStatusToErrored(tempInvoiceId);
    await createFailureActivityLog(objectKey, error, tempInvoiceId, ClientID);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error while completing invoice processing.",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success" }),
  };
}

exports.handler = async (event) => {
  const { bucketName, objectKey, originalFile, metadata } = await extractS3Info(
    event
  );

  let userID = objectKey.split("::")[0]?.split("/")?.pop();
  let user = await getUser(userID);
  let ClientID = user?.Item?.ClientID;

  const tempInvoiceId = await createTempInvoice(objectKey, metadata);

  try {
    const { pdfBuffer, pdfText, pdfArray } = await initialProcessing({
      objectKey,
      originalFile,
      bucketName,
      tempInvoiceId,
      ClientID,
    });

    const pageMap = await getPagesFromOpenAI({
      pdfText,
      tempInvoiceId,
      objectKey,
      ClientID,
    });

    const invoices = await getDetailsFromOpenAI({
      tempInvoiceId,
      pageMap,
      pdfArray,
      objectKey,
      ClientID,
    });

    return await completeProcessing({
      tempInvoiceId,
      invoices,
      pageMap,
      pdfBuffer,
      objectKey,
      bucketName,
      metadata,
      ClientID,
    });
  } catch (error) {
    console.error("Operation failed:", error.message);
    await setInvoiceStatusToErrored(tempInvoiceId);
    await createFailureActivityLog(objectKey, error, tempInvoiceId, ClientID);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error processing request" }),
    };
  }
};
