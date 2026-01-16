const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const mondaySdk = require('monday-sdk-js');
const monday = mondaySdk();

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Your monday.com API token should be stored in an environment variable for security
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

/****************************
 * Example get methods *
 ****************************/

app.get('/monday/boards', async function (req, res) {
  try {
    let pageNumber = 1;
    const limitPerPage = 100;  // Set a limit per page
    let allBoards = [];
    let hasMore = true;

    while (hasMore) {
      // Use limit and page params in the query
      const query = `query { boards (limit: ${limitPerPage}, page: ${pageNumber}) { id name board_folder_id workspace_id } }`;
      const response = await monday.api(query, { token: MONDAY_API_TOKEN });

      const boards = response?.data?.boards;
      if (boards.length > 0) {
        allBoards = [...allBoards, ...boards];
        pageNumber++;
      } else {
        hasMore = false;
      }
    }

    allBoards = allBoards.filter((item) => item.board_folder_id === 11004250 && !item.name.includes("Subitems"));
    allBoards.sort((a, b) => a.name.localeCompare(b.name));

    res.json(allBoards);
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

app.get('/monday/users', async function (req, res) {
  try {
    // Use the users query to fetch all users in the workspace
    const query = `query { users { id name } }`;

    const response = await monday.api(query, { token: MONDAY_API_TOKEN });

    const users = response?.data?.users;
    if (users.length > 0) {
      // Sort the users by their names
      users.sort((a, b) => a.name.localeCompare(b.name));

      res.json(users);
    } else {
      res.status(404).json({ error: 'No users found' });
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/monday/boards/:boardId/items', async function (req, res) {
  try {
    const { boardId } = req.params;
    if (!boardId) {
      return res.status(400).send('boardId is required');
    }

    const query = `query ($boardId: Int!) {
      boards (ids: [$boardId]) {
        items {
          id
          name
          column_values {
            id
            title
            value
            text
          }
        }
      }
    }`;

    const variables = { boardId: parseInt(boardId) };

    const response = await monday.api(query, { variables, token: MONDAY_API_TOKEN });

    const items = response.data.boards[0].items;
    if (items.length > 0) {
      res.json(items);
    } else {
      res.status(404).json({ error: 'No items found' });
    }
  } catch (error) {
    console.error('Error getting items from Monday.com:', error);
    res.status(500).send('An error occurred while trying to get items from Monday.com.');
  }
});



app.post('/monday/boards/items', async function (req, res) {
  try {
    const { boardId, itemName, column_values } = req.body;
    if (!boardId || !itemName) {
      return res.status(400).send('boardId and itemName are required');
    }
  
  
    const mutation = `mutation { create_item (board_id: ${boardId}, item_name: "${itemName}", column_values: ${JSON.stringify(JSON.stringify(column_values))}) { id } }`;
    
    console.log({mutation})

    const response = await monday.api(mutation, { token: MONDAY_API_TOKEN });
    res.json(response);
  } catch (error) {
    console.error('Error creating item on Monday.com:', error);
    res.status(500).send('An error occurred while trying to create an item on Monday.com.');
  }
});

app.get('/monday/boards/:boardId/columns', async function (req, res) {
  try {
    const { boardId } = req.params;
    if (!boardId) {
      return res.status(400).send('boardId is required');
    }

    const query = `query ($boardId: Int!) {
      boards (ids: [$boardId]) {
        columns {
          id
          title
          type
          settings_str
        }
      }
    }`;

    const variables = { boardId: parseInt(boardId) };

    const response = await monday.api(query, { variables, token: MONDAY_API_TOKEN });

    res.json(response.data.boards[0].columns);
  } catch (error) {
    console.error('Error getting columns from Monday.com:', error);
    res.status(500).send('An error occurred while trying to get columns from Monday.com.');
  }
});

app.post('/monday/boards/columns', async function (req, res) {
  const { boardId, title, columnType } = req.body;
  if (!boardId || !title || !columnType) {
    return res.status(400).send('boardId, title and columnType are required');
  }
  const mutation = `mutation { create_column (board_id: ${boardId}, title: "${title}", column_type: ${columnType}) { id } }`;
  const response = await monday.api(mutation, { token: MONDAY_API_TOKEN });
  res.json(response);
});

app.listen(3000, function () {
  console.log('App started');
});

module.exports = app;
