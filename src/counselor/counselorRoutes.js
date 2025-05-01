// src/routes/counselorRoutes.js
const express = require('express');
const router = express.Router();
const counselorService = require('../counselor/counselorService');

// Endpoint for counselor chat
router.post('/users/:name/counselor-chat', async (req, res) => {
  const { name } = req.params;
  const { message, category } = req.body; // category could be 'academic', 'emotional', 'social', 'future'
  
  // Get the driver from the request (passed from middleware)
  const driver = req.neo4jDriver;
  
  // Retrieve user's survey data
  const session = driver.session();
  try {
    const userResult = await session.run(
      `MATCH (u:User {name: $name}) RETURN u.surveyData`,
      { name }
    );
    
    if (userResult.records.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Parse survey data
    const surveyDataString = userResult.records[0].get('u.surveyData');
    const surveyData = surveyDataString ? JSON.parse(surveyDataString) : {};
    
    // Process the counseling request
    const response = await counselorService.processCounselingRequest(message, category, surveyData);
    
    // Save the interaction in the database
    await session.run(
      `MATCH (u:User {name: $name})
       CREATE (m:Message {id: randomUUID(), content: $message, sender: 'user', timestamp: datetime(), category: $category})
       CREATE (r:Message {id: randomUUID(), content: $response, sender: 'counselor', timestamp: datetime(), category: $category})
       CREATE (u)-[:SENT]->(m)
       CREATE (m)-[:REPLIED_WITH]->(r)
       RETURN r`,
      { 
        name, 
        message, 
        response,
        category
      }
    );
    
    res.json({ response });
    
  } catch (error) {
    console.error('Counselor chat error:', error);
    res.status(500).json({ error: 'Failed to process counselor chat' });
  } finally {
    await session.close();
  }
});

// Get counseling history for a user
router.get('/users/:name/counselor-history', async (req, res) => {
  const { name } = req.params;
  const driver = req.neo4jDriver;
  
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {name: $name})-[:SENT]->(m:Message)-[:REPLIED_WITH]->(r:Message)
       WHERE m.sender = 'user' AND r.sender = 'counselor'
       RETURN m, r ORDER BY m.timestamp DESC`,
      { name }
    );
    
    const history = result.records.map(record => ({
      userMessage: record.get('m').properties,
      counselorResponse: record.get('r').properties
    }));
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching counselor history:', error);
    res.status(500).json({ error: 'Failed to fetch counselor history' });
  } finally {
    await session.close();
  }
});

module.exports = router;