// server.js - Main Express server file

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const neo4j = require('neo4j-driver');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logging

// Neo4j Database Connection
let driver;
try {
  driver = neo4j.driver(
    process.env.NEO4J_URI || 'neo4j://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER || 'neo4j', 
      process.env.NEO4J_PASSWORD || 'password'
    )
  );
  console.log('Connected to Neo4j database');
} catch (error) {
  console.error('Error connecting to Neo4j:', error);
}

const axios = require('axios');

// Direct OpenAI integration endpoint
app.post('/api/chat', async (req, res) => {
  const apiKey = req.headers['x-openai-key'] || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required' });
  }
  
  try {
    console.log('Making request to OpenAI API...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', 
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Received response from OpenAI');
    res.json(response.data);
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

// API Routes
// 1. User Routes
app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const session = driver.session();
  try {
    const result = await session.run(
      'MERGE (u:User {name: $name}) RETURN u',
      { name }
    );
    
    const user = result.records[0].get('u').properties;
    res.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    await session.close();
  }
});

// 2. Survey Routes
app.post('/api/users/:name/survey', async (req, res) => {
  const { name } = req.params;
  const surveyData = req.body;
  
  const session = driver.session();
  try {
    // Store survey data
    await session.run(
      'MATCH (u:User {name: $name}) SET u.surveyData = $surveyData RETURN u',
      { name, surveyData: JSON.stringify(surveyData) }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving survey data:', error);
    res.status(500).json({ error: 'Failed to save survey data' });
  } finally {
    await session.close();
  }
});

// 3. Knowledge Graph Node Routes
app.post('/api/users/:name/nodes', async (req, res) => {
  const { name } = req.params;
  const { title, content, position } = req.body;
  
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {name: $name})
       CREATE (n:Node {id: randomUUID(), title: $title, content: $content, position: $position, createdAt: datetime()})
       CREATE (u)-[:CREATED]->(n)
       RETURN n`,
      { name, title, content, position: JSON.stringify(position) }
    );
    
    const node = result.records[0].get('n').properties;
    res.json({ node });
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: 'Failed to create node' });
  } finally {
    await session.close();
  }
});

app.get('/api/users/:name/nodes', async (req, res) => {
  const { name } = req.params;
  
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {name: $name})-[:CREATED]->(n:Node)
       RETURN n ORDER BY n.createdAt`,
      { name }
    );
    
    const nodes = result.records.map(record => record.get('n').properties);
    res.json({ nodes });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  } finally {
    await session.close();
  }
});

app.put('/api/nodes/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n:Node {id: $id})
       SET n += $updates
       RETURN n`,
      { id, updates }
    );
    
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    const node = result.records[0].get('n').properties;
    res.json({ node });
  } catch (error) {
    console.error('Error updating node:', error);
    res.status(500).json({ error: 'Failed to update node' });
  } finally {
    await session.close();
  }
});

app.delete('/api/nodes/:id', async (req, res) => {
  const { id } = req.params;
  
  const session = driver.session();
  try {
    await session.run(
      `MATCH (n:Node {id: $id})
       DETACH DELETE n`,
      { id }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  } finally {
    await session.close();
  }
});

// 4. Chat Routes
app.post('/api/users/:name/messages', async (req, res) => {
  const { name } = req.params;
  const { content } = req.body;
  
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {name: $name})
       CREATE (m:Message {id: randomUUID(), content: $content, sender: 'user', timestamp: datetime()})
       CREATE (u)-[:SENT]->(m)
       RETURN m`,
      { name, content }
    );
    
    const message = result.records[0].get('m').properties;
    res.json({ message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  } finally {
    await session.close();
  }
});

app.get('/api/users/:name/messages', async (req, res) => {
  const { name } = req.params;
  
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {name: $name})-[:SENT]->(m:Message)
       RETURN m ORDER BY m.timestamp`,
      { name }
    );
    
    const messages = result.records.map(record => record.get('m').properties);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  } finally {
    await session.close();
  }
});

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing Neo4j driver...');
  await driver?.close();
  console.log('Server shutting down...');
  process.exit(0);
});

module.exports = app;