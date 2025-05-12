// src/counselor/ruleBasedExtractor.js

/**
 * Rule-based knowledge graph generation focused on four key areas:
 * 1. Who You Are (Strengths)
 * 2. How You Learn (Learning Style)
 * 3. What You Care About (Passions)
 * 4. What You Strive For (Goals)
 */

/**
 * Generate knowledge graph from survey data without using LLM
 * @param {Object} surveyData - Survey data from client
 * @returns {Object} - Structured knowledge graph data
 */
function generateKnowledgeGraph(surveyData) {
  // Initialize graph structure
  const nodes = [];
  const relationships = [];
  
  // Process each of the four key areas
  processStrengths(surveyData, nodes, relationships);
  processLearningStyle(surveyData, nodes, relationships);
  processPassions(surveyData, nodes, relationships);
  processGoals(surveyData, nodes, relationships);
  
  // Create connections between the four areas
  createCrossAreaConnections(nodes, relationships);
  
  return { nodes, relationships };
}

/**
 * Process "Who You Are" (Strengths) area
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function processStrengths(data, nodes, relationships) {
  // Extract strengths from various possible fields
  const strengths = extractStrengthsFromData(data);
  
  // Add each strength as a Skill node
  strengths.forEach(strength => {
    nodes.push({
      label: "Skill",
      properties: {
        name: strength,
        description: `Self-identified strength in ${strength}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Personal strength identified by student",
        category: "Who You Are"
      }
    });
  });
  
  // Connect related strengths
  createRelationshipsBetweenItems(strengths, strengths, "RELATES_TO", "Complementary strengths", relationships);
}

/**
 * Process "How You Learn" (Learning Style) area
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function processLearningStyle(data, nodes, relationships) {
  // Extract learning style - default to "Balanced" if not specified
  const learningStyle = extractLearningStyleFromData(data) || "Balanced";
  
  // Add learning style as a Strategy node
  nodes.push({
    label: "Strategy",
    properties: {
      name: `${learningStyle} Learning`,
      description: `Preference for ${learningStyle.toLowerCase()} learning approaches`,
      source: "survey",
      confidence: 1.0,
      relevance: "Primary learning style preference",
      category: "How You Learn"
    }
  });
  
  // Add appropriate learning strategies based on style
  const strategies = getLearningStrategies(learningStyle);
  
  // Add each strategy as a node
  strategies.forEach(strategy => {
    nodes.push({
      label: "Strategy",
      properties: {
        name: strategy,
        description: `Effective approach for ${learningStyle.toLowerCase()} learners`,
        source: "derived",
        confidence: 0.9,
        relevance: `Strategy aligned with ${learningStyle.toLowerCase()} learning`,
        category: "How You Learn"
      }
    });
    
    // Connect learning style to each strategy
    relationships.push({
      from: `${learningStyle} Learning`,
      to: strategy,
      type: "LEADS_TO",
      properties: {
        strength: 0.9,
        description: `${strategy} is effective for ${learningStyle.toLowerCase()} learners`
      }
    });
  });
}

/**
 * Process "What You Care About" (Passions) area
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function processPassions(data, nodes, relationships) {
  // Extract interests from various fields
  const passions = extractPassionsFromData(data);
  
  // Add each passion as a Topic node
  passions.forEach(passion => {
    nodes.push({
      label: "Topic",
      properties: {
        name: passion,
        description: `Interest in ${passion}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Area of personal interest or passion",
        category: "What You Care About"
      }
    });
  });
  
  // Connect related passions (if they share keywords or domains)
  createRelationshipsBetweenItems(passions, passions, "RELATES_TO", "Related areas of interest", relationships);
}

/**
 * Process "What You Strive For" (Goals) area
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function processGoals(data, nodes, relationships) {
  // Extract goals from various fields
  const goals = extractGoalsFromData(data);
  
  // Add each goal as a Goal node
  goals.forEach(goal => {
    nodes.push({
      label: "Goal",
      properties: {
        name: goal,
        description: `Aspiration to ${goal.toLowerCase().startsWith('become') ? goal : 'achieve ' + goal}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Personal or career aspiration",
        category: "What You Strive For"
      }
    });
  });
  
  // Add common prerequisites for each goal
  goals.forEach(goal => {
    const prerequisites = getGoalPrerequisites(goal);
    
    prerequisites.forEach(prereq => {
      // Add prerequisite as a node if it doesn't exist yet
      if (!nodes.some(node => node.properties?.name === prereq)) {
        nodes.push({
          label: "Skill",
          properties: {
            name: prereq,
            description: `Skill needed for ${goal}`,
            source: "derived",
            confidence: 0.8,
            relevance: `Required for ${goal}`,
            category: "What You Strive For"
          }
        });
      }
      
      // Connect prerequisite to goal
      relationships.push({
        from: prereq,
        to: goal,
        type: "HELPS_WITH",
        properties: {
          strength: 0.8,
          description: `${prereq} is important for ${goal}`
        }
      });
    });
  });
}

/**
 * Create connections between the four key areas
 * @param {Array} nodes - All nodes in the graph
 * @param {Array} relationships - Relationships array to update
 */
function createCrossAreaConnections(nodes, relationships) {
  // Get nodes by category
  const strengthNodes = nodes.filter(n => n.properties.category === "Who You Are");
  const learningNodes = nodes.filter(n => n.properties.category === "How You Learn");
  const passionNodes = nodes.filter(n => n.properties.category === "What You Care About");
  const goalNodes = nodes.filter(n => n.properties.category === "What You Strive For");
  
  // Connect strengths to passions
  createRelationshipsBetweenItems(
    strengthNodes.map(n => n.properties.name),
    passionNodes.map(n => n.properties.name),
    "HELPS_WITH",
    "Strength supporting passion",
    relationships
  );
  
  // Connect learning strategies to goals
  createRelationshipsBetweenItems(
    learningNodes.map(n => n.properties.name),
    goalNodes.map(n => n.properties.name),
    "HELPS_WITH",
    "Learning approach supporting goal",
    relationships,
    0.5  // Lower confidence for these connections
  );
  
  // Connect passions to goals
  createRelationshipsBetweenItems(
    passionNodes.map(n => n.properties.name),
    goalNodes.map(n => n.properties.name),
    "LEADS_TO",
    "Passion contributing to goal",
    relationships
  );
  
  // Connect strengths to learning strategies
  createRelationshipsBetweenItems(
    strengthNodes.map(n => n.properties.name),
    learningNodes.map(n => n.properties.name),
    "ENHANCES",
    "Strength enhancing learning approach",
    relationships,
    0.6  // Medium confidence
  );
}

// ======== Helper Functions ========

/**
 * Extract strengths from survey data
 * @param {Object} data - Survey data
 * @returns {Array} - List of strengths
 */
function extractStrengthsFromData(data) {
  const strengths = [];
  
  // Direct strength fields
  if (data.strengths) {
    addToArray(strengths, data.strengths);
  }
  
  // Other possible strength fields
  const strengthFields = ['skills', 'abilities', 'talents', 'goodAt', 'strongPoints'];
  for (const field of strengthFields) {
    if (data[field]) {
      addToArray(strengths, data[field]);
    }
  }
  
  return removeDuplicates(strengths);
}

/**
 * Extract learning style from survey data
 * @param {Object} data - Survey data
 * @returns {String} - Standardized learning style
 */
function extractLearningStyleFromData(data) {
  // Direct learning style field
  if (data.learningStyle) {
    return standardizeLearningStyle(data.learningStyle);
  }
  
  // Other possible learning style fields
  const learningStyleFields = ['preferredLearningMethod', 'studyStyle', 'learnBest'];
  for (const field of learningStyleFields) {
    if (data[field]) {
      return standardizeLearningStyle(data[field]);
    }
  }
  
  return "Balanced";
}

/**
 * Standardize learning style to one of the main categories
 * @param {String} style - Raw learning style
 * @returns {String} - Standardized learning style
 */
function standardizeLearningStyle(style) {
  if (!style) return "Balanced";
  
  const normalized = style.toLowerCase();
  
  if (normalized.includes('visual')) return "Visual";
  if (normalized.includes('audi') || normalized.includes('aural')) return "Auditory";
  if (normalized.includes('kines') || normalized.includes('hands') || normalized.includes('tactile')) return "Kinesthetic";
  if (normalized.includes('read') || normalized.includes('writ')) return "Reading/Writing";
  if (normalized.includes('multi') || normalized.includes('mix')) return "Multimodal";
  
  return "Balanced";
}

/**
 * Get learning strategies based on learning style
 * @param {String} style - Learning style
 * @returns {Array} - Appropriate learning strategies
 */
function getLearningStrategies(style) {
  const strategies = {
    "Visual": [
      "Mind mapping", 
      "Color-coding notes", 
      "Diagrams and charts", 
      "Video tutorials",
      "Visual organization tools"
    ],
    "Auditory": [
      "Group discussions", 
      "Audio recordings", 
      "Verbal explanations", 
      "Reading aloud",
      "Podcasts and lectures"
    ],
    "Kinesthetic": [
      "Hands-on projects", 
      "Role-playing", 
      "Lab experiments", 
      "Physical models",
      "Movement while studying"
    ],
    "Reading/Writing": [
      "Note-taking", 
      "Written summaries", 
      "Reading textbooks", 
      "Making lists",
      "Written practice questions"
    ],
    "Multimodal": [
      "Mixed media resources", 
      "Project-based learning", 
      "Interactive tutorials", 
      "Varied study techniques"
    ],
    "Balanced": [
      "Varied study techniques",
      "Project-based learning",
      "Interactive learning",
      "Group and individual study"
    ]
  };
  
  return strategies[style] || strategies["Balanced"];
}

/**
 * Extract passions/interests from survey data
 * @param {Object} data - Survey data
 * @returns {Array} - List of passions
 */
function extractPassionsFromData(data) {
  const passions = [];
  
  // Various passion/interest fields
  const passionFields = [
    'interests', 'passions', 'hobbies', 'favoriteSubjects', 
    'academicInterests', 'extracurriculars', 'activities'
  ];
  
  for (const field of passionFields) {
    if (data[field]) {
      addToArray(passions, data[field]);
    }
  }
  
  return removeDuplicates(passions);
}

/**
 * Extract goals from survey data
 * @param {Object} data - Survey data
 * @returns {Array} - List of goals
 */
function extractGoalsFromData(data) {
  const goals = [];
  
  // Various goal fields
  const goalFields = [
    'goals', 'futureGoals', 'aspirations', 'careerGoals', 
    'collegeGoals', 'lifeGoals', 'objectives'
  ];
  
  for (const field of goalFields) {
    if (data[field]) {
      addToArray(goals, data[field]);
    }
  }
  
  return removeDuplicates(goals);
}

/**
 * Get prerequisites for common goals
 * @param {String} goal - The goal
 * @returns {Array} - List of prerequisites
 */
function getGoalPrerequisites(goal) {
  // Predefined prerequisites for common goals
  const prerequisites = {
    "College": ["Academic Excellence", "Time Management", "Study Skills"],
    "Medicine": ["Biology", "Chemistry", "Empathy", "Dedication"],
    "Engineering": ["Mathematics", "Physics", "Problem Solving"],
    "Business": ["Communication", "Economics", "Leadership"],
    "Arts": ["Creativity", "Technical Skills", "Self-expression"],
    "Technology": ["Computer Science", "Logic", "Innovation"],
    "Teaching": ["Communication", "Subject Expertise", "Empathy"]
  };
  
  // Check if the goal contains any of our predefined keywords
  for (const [key, prereqs] of Object.entries(prerequisites)) {
    if (goal.toLowerCase().includes(key.toLowerCase())) {
      return prereqs;
    }
  }
  
  // Default prerequisites for any goal
  return ["Persistence", "Planning", "Self-discipline"];
}

/**
 * Create relationships between items if they are related
 * @param {Array} sourceItems - Source item names
 * @param {Array} targetItems - Target item names
 * @param {String} relationType - Relationship type
 * @param {String} relationDescription - Relationship description
 * @param {Array} relationships - Relationships array to update
 * @param {Number} defaultStrength - Default relationship strength
 */
function createRelationshipsBetweenItems(sourceItems, targetItems, relationType, relationDescription, relationships, defaultStrength = 0.7) {
  for (const source of sourceItems) {
    for (const target of targetItems) {
      // Skip self-relationships
      if (source === target) continue;
      
      // Check if items are related (using simple word matching for now)
      if (areRelated(source, target)) {
        // Avoid duplicate relationships
        if (!relationships.some(r => r.from === source && r.to === target && r.type === relationType)) {
          relationships.push({
            from: source,
            to: target,
            type: relationType,
            properties: {
              strength: defaultStrength,
              description: relationDescription
            }
          });
        }
      }
    }
  }
}

/**
 * Check if two items are related based on keyword matching
 * @param {String} item1 - First item
 * @param {String} item2 - Second item
 * @returns {Boolean} - True if related
 */
function areRelated(item1, item2) {
  // Simple word overlap check
  const words1 = item1.toLowerCase().split(/\s+/);
  const words2 = item2.toLowerCase().split(/\s+/);
  
  // Check for significant word overlap (words with 4+ characters)
  for (const word of words1) {
    if (word.length >= 4 && words2.includes(word)) {
      return true;
    }
  }
  
  // Check known relationships in specific domains
  return checkDomainRelationships(item1, item2);
}

/**
 * Check for relationships within specific knowledge domains
 * @param {String} item1 - First item
 * @param {String} item2 - Second item
 * @returns {Boolean} - True if related
 */
function checkDomainRelationships(item1, item2) {
  // Domain-specific relationships
  const domainRelationships = {
    "STEM": ["Mathematics", "Science", "Engineering", "Technology", "Computer Science", "Physics", "Chemistry", "Biology"],
    "Arts": ["Music", "Art", "Drama", "Theatre", "Writing", "Creative", "Design"],
    "Business": ["Economics", "Finance", "Accounting", "Marketing", "Management", "Leadership"],
    "Languages": ["English", "Spanish", "French", "German", "Chinese", "Japanese", "Communication"]
  };
  
  // Check if items belong to the same domain
  for (const [domain, keywords] of Object.entries(domainRelationships)) {
    const item1InDomain = keywords.some(keyword => 
      item1.toLowerCase().includes(keyword.toLowerCase()));
    const item2InDomain = keywords.some(keyword => 
      item2.toLowerCase().includes(keyword.toLowerCase()));
    
    if (item1InDomain && item2InDomain) {
      return true;
    }
  }
  
  return false;
}

/**
 * Add items to an array, handling different input types
 * @param {Array} array - Target array
 * @param {*} items - Items to add (string, array, or object)
 */
function addToArray(array, items) {
  if (Array.isArray(items)) {
    array.push(...items);
  } else if (typeof items === 'string') {
    // Split comma-separated values
    array.push(...items.split(',').map(item => item.trim()));
  } else if (items && typeof items === 'object') {
    // For object values, extract values
    Object.values(items).forEach(value => {
      if (value && typeof value === 'string') {
        array.push(value.trim());
      }
    });
  }
}

/**
 * Remove duplicates and empty values from array
 * @param {Array} array - Input array
 * @returns {Array} - Deduplicated array
 */
function removeDuplicates(array) {
  return [...new Set(array)]
    .filter(item => item && item.trim().length > 0)
    .map(item => item.trim());
}

/**
 * Rule-based implementation to replace LLM in initializeKnowledgeGraphFromSurvey
 * 
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
    
    // Use the existing updateKnowledgeGraph function from knowledgeExtractor.js
    // Import it wherever this function is used
    return updateKnowledgeGraph(graphData, username, session);
  } catch (error) {
    console.error('Error initializing knowledge graph from survey:', error);
    return false;
  }
}

module.exports = {
  generateKnowledgeGraph,
  initializeKnowledgeGraphRuleBased
};