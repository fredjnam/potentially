// src/counselor/knowledgeExtractor.js
const axios = require('axios');

// Function to extract knowledge graph data from chat interactions
async function extractKnowledgeGraph(userMessage, assistantResponse, existingGraphData, surveyData) {
  // Build the extraction prompt
  const extractionPrompt = `
You are a knowledge extraction system. Your task is to analyze a conversation between a student and an AI counselor, 
and extract structured information that can be represented in a Neo4j knowledge graph.

USER BACKGROUND:
${surveyData ? JSON.stringify(surveyData, null, 2) : 'No background data available'}

CURRENT KNOWLEDGE GRAPH:
${existingGraphData ? JSON.stringify(existingGraphData, null, 2) : 'No existing graph data'}

RECENT CONVERSATION:
User: ${userMessage}
Assistant: ${assistantResponse}

INSTRUCTIONS:
1. Analyze the conversation above and identify key concepts, entities, and relationships
2. Focus on academically relevant information including:
   - Topics or subjects mentioned
   - Skills or competencies discussed
   - Goals or aspirations expressed
   - Challenges or obstacles mentioned
   - Resources or strategies suggested
   - Connections between concepts
3. Return a JSON structure that can be used to update a Neo4j knowledge graph with the following format:

{
  "nodes": [
    {
      "label": "Topic|Skill|Goal|Challenge|Resource|Strategy",
      "properties": {
        "name": "Name of the entity",
        "description": "Brief description of the entity",
        "source": "conversation", 
        "confidence": 0.0-1.0,
        "relevance": "Why this is relevant to the student's learning/development"
      }
    }
  ],
  "relationships": [
    {
      "from": "Source node name",
      "to": "Target node name",
      "type": "RELATES_TO|REQUIRES|HELPS_WITH|PART_OF|LEADS_TO",
      "properties": {
        "strength": 0.0-1.0,
        "description": "Description of the relationship"
      }
    }
  ]
}

Only include information that was clearly expressed or strongly implied in the conversation. 
If no relevant knowledge can be extracted, return an empty structure.
Focus on creating a meaningful, connected graph that represents the student's academic ecosystem.
`;

  try {
    // Call OpenAI API to extract knowledge
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: extractionPrompt },
          { role: "user", content: "Extract knowledge from the conversation above." }
        ],
        temperature: 0.2 // Lower temperature for more deterministic results
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Get the extracted knowledge
    const extractionResult = response.data.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      // Extract JSON portion if the AI included any additional text
      const jsonMatch = extractionResult.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : extractionResult;
      
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing extracted knowledge:', parseError);
      console.log('Raw extraction result:', extractionResult);
      return { nodes: [], relationships: [] };
    }
  } catch (error) {
    console.error('Error calling knowledge extraction API:', error);
    return { nodes: [], relationships: [] };
  }
}

// Function to update Neo4j with extracted knowledge
async function updateKnowledgeGraph(extractedData, username, session) {
  if (!extractedData || !extractedData.nodes || !extractedData.relationships) {
    console.log('No valid extraction data to update graph');
    return false;
  }
  
  try {
    // Ensure the user has a KnowledgeGraph node
    const kgResult = await session.run(
      `MATCH (u:User {name: $username})
       MERGE (kg:KnowledgeGraph {userId: $username})
       MERGE (u)-[:HAS_KNOWLEDGE_GRAPH]->(kg)
       RETURN kg`,
      { username }
    );
    
    // Process nodes - each node is connected to the user's knowledge graph
    for (const node of extractedData.nodes) {
      const { label, properties } = node;
      
      // Skip if no valid name
      if (!properties.name) continue;
      
      // Create or merge node and connect to this user's knowledge graph
      await session.run(
        `MATCH (u:User {name: $username})-[:HAS_KNOWLEDGE_GRAPH]->(kg:KnowledgeGraph)
         MERGE (n:${label} {name: $name, userId: $username})
         ON CREATE SET n += $properties
         ON MATCH SET n += $updateProperties
         MERGE (kg)-[:CONTAINS]->(n)
         RETURN n`,
        { 
          username,
          name: properties.name,
          properties: {
            ...properties,
            userId: username,  // Add userId to ensure complete isolation
            created: new Date().toISOString()
          },
          updateProperties: {
            description: properties.description,
            updated: new Date().toISOString()
          }
        }
      );
    }
    
    // Process relationships - only between nodes in this user's knowledge graph
    for (const rel of extractedData.relationships) {
      const { from, to, type, properties } = rel;
      
      // Skip if missing source or target
      if (!from || !to) continue;
      
      // Create relationship between nodes that belong to this user's knowledge graph
      await session.run(
        `MATCH (kg:KnowledgeGraph {userId: $username})
         MATCH (kg)-[:CONTAINS]->(source {name: $fromName, userId: $username})
         MATCH (kg)-[:CONTAINS]->(target {name: $toName, userId: $username})
         MERGE (source)-[r:${type}]->(target)
         ON CREATE SET r = $properties
         ON MATCH SET r += $updateProperties
         RETURN r`,
        {
          username,
          fromName: from,
          toName: to,
          properties: {
            ...(properties || {}),
            created: new Date().toISOString()
          },
          updateProperties: {
            updated: new Date().toISOString()
          }
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating knowledge graph in Neo4j:', error);
    return false;
  }
}

// Function to retrieve existing knowledge graph for a user
async function getUserKnowledgeGraph(username, session) {
  try {
    // First, ensure the user has a KnowledgeGraph node
    await session.run(
      `MATCH (u:User {name: $username})
       MERGE (kg:KnowledgeGraph {userId: $username})
       MERGE (u)-[:HAS_KNOWLEDGE_GRAPH]->(kg)`,
      { username }
    );
    
    // Get nodes specific to this user's knowledge graph
    const nodesResult = await session.run(
      `MATCH (u:User {name: $username})-[:HAS_KNOWLEDGE_GRAPH]->(kg:KnowledgeGraph)
       MATCH (kg)-[:CONTAINS]->(n)
       RETURN n.name as name, labels(n) as labels, properties(n) as properties`,
      { username }
    );
    
    // Get relationships between nodes within this user's knowledge graph
    const relsResult = await session.run(
      `MATCH (u:User {name: $username})-[:HAS_KNOWLEDGE_GRAPH]->(kg:KnowledgeGraph)
       MATCH (kg)-[:CONTAINS]->(source)-[r]->(target)<-[:CONTAINS]-(kg)
       RETURN source.name as from, target.name as to, type(r) as type, properties(r) as properties`,
      { username }
    );
    
    // Format the response
    const nodes = nodesResult.records.map(record => ({
      name: record.get('name'),
      label: record.get('labels')[0],
      properties: record.get('properties')
    }));
    
    const relationships = relsResult.records.map(record => ({
      from: record.get('from'),
      to: record.get('to'),
      type: record.get('type'),
      properties: record.get('properties')
    }));
    
    return { nodes, relationships };
  } catch (error) {
    console.error('Error retrieving knowledge graph:', error);
    return { nodes: [], relationships: [] };
  }
}

module.exports = {
  extractKnowledgeGraph,
  updateKnowledgeGraph,
  getUserKnowledgeGraph
};