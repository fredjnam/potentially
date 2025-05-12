// src/counselor/knowledgeGraphService.js

/**
 * Service for handling knowledge graph operations
 * Provides both LLM-based and rule-based implementations
 */

const { updateKnowledgeGraph, getUserKnowledgeGraph } = require('./knowledgeExtractor');
const { generateKnowledgeGraph } = require('./ruleBasedExtractor');
const axios = require('axios');

/**
 * Initialize knowledge graph from survey data using OpenAI
 * @param {string} username - User identifier
 * @param {Object} surveyData - Raw survey data from client
 * @param {Object} session - Neo4j database session
 * @returns {Promise<boolean>} - Success status
 */
async function initializeKnowledgeGraphWithLLM(username, surveyData, session) {
  try {
    // First ensure the user has a knowledge graph
    await session.run(
      `MATCH (u:User {name: $username})
       MERGE (kg:KnowledgeGraph {userId: $username})
       MERGE (u)-[:HAS_KNOWLEDGE_GRAPH]->(kg)`,
      { username }
    );

    // Use OpenAI to convert survey data to knowledge graph nodes and relationships
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: `You are a system that converts student survey data into a knowledge graph structure.
            Analyze the survey information and create a JSON structure that represents key concepts and their relationships.
            Focus on the following 4 areas: Who You Are (Strengths), How You Learn (Learning Style), What You Care About (Passions), What You Strive For (Goals).`
          },
          { 
            role: "user", 
            content: `Convert this student survey data to a knowledge graph format with nodes and relationships:
            ${JSON.stringify(surveyData, null, 2)}
            
            Format the response as a JSON object with the following structure:
            {
              "nodes": [
                {
                  "label": "Topic|Skill|Goal|Challenge|Resource|Strategy",
                  "properties": {
                    "name": "Name of the entity",
                    "description": "Brief description based on survey data",
                    "source": "survey",
                    "confidence": 1.0,
                    "relevance": "Why this is relevant to the student's development"
                  }
                }
              ],
              "relationships": [
                {
                  "from": "Source node name",
                  "to": "Target node name",
                  "type": "RELATES_TO|REQUIRES|HELPS_WITH|PART_OF|LEADS_TO",
                  "properties": {
                    "strength": 0.8,
                    "description": "Description of how these concepts relate"
                  }
                }
              ]
            }` 
          }
        ],
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract and parse the JSON response
    const rawResponse = openaiResponse.data.choices[0].message.content;
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
    
    try {
      const graphData = JSON.parse(jsonStr);
      
      // Now update the knowledge graph with the extracted data
      return updateKnowledgeGraph(graphData, username, session);
    } catch (parseError) {
      console.error('Error parsing knowledge graph data:', parseError);
      console.log('Raw response:', rawResponse);
      return false;
    }
  } catch (error) {
    console.error('Error initializing knowledge graph from survey:', error);
    return false;
  }
}

/**
 * Initialize knowledge graph from survey data using rule-based approach
 * @param {string} username - User identifier
 * @param {Object} surveyData - Raw survey data from client
 * @param {Object} session - Neo4j database session
 * @returns {Promise<boolean>} - Success status
 */
async function initializeKnowledgeGraphRuleBased(username, surveyData, session) {
  try {
    // First ensure the user has a knowledge graph
    await session.run(
      `MATCH (u:User {name: $username})
       MERGE (kg:KnowledgeGraph {userId: $username})
       MERGE (u)-[:HAS_KNOWLEDGE_GRAPH]->(kg)`,
      { username }
    );
    
    // Generate knowledge graph without LLM
    const graphData = generateKnowledgeGraph(surveyData);
    
    // Update the knowledge graph with the structured data
    return updateKnowledgeGraph(graphData, username, session);
  } catch (error) {
    console.error('Error initializing knowledge graph from survey:', error);
    return false;
  }
}

module.exports = {
  initializeKnowledgeGraphWithLLM,
  initializeKnowledgeGraphRuleBased,
  getUserKnowledgeGraph
};