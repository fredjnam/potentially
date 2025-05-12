// src/counselor/hierarchicalKnowledgeExtractor.js

/**
 * Rule-based knowledge graph generator that creates 4 main category nodes
 * connected to specific items within each category
 */

/**
 * Generate a hierarchical knowledge graph with 4 main categories
 * @param {Object} surveyData - Survey data from client
 * @returns {Object} - Structured knowledge graph data
 */
function generateHierarchicalKnowledgeGraph(surveyData) {
  // Initialize graph structure
  const nodes = [];
  const relationships = [];
  
  // Create the four main category nodes
  const categoryNodes = [
    {
      label: "Category",
      properties: {
        name: "Strengths",
        description: "Who You Are - Personal strengths and abilities",
        source: "system",
        confidence: 1.0,
        relevance: "Core identity category"
      }
    },
    {
      label: "Category",
      properties: {
        name: "LearningStyle",  // No spaces in Neo4j labels
        description: "How You Learn - Preferred learning approaches",
        source: "system",
        confidence: 1.0,
        relevance: "Educational preference category"
      }
    },
    {
      label: "Category",
      properties: {
        name: "Passions",
        description: "What You Care About - Interests and motivations",
        source: "system",
        confidence: 1.0,
        relevance: "Motivational category"
      }
    },
    {
      label: "Category",
      properties: {
        name: "Goals",
        description: "What You Strive For - Future aspirations",
        source: "system",
        confidence: 1.0,
        relevance: "Aspirational category"
      }
    }
  ];
  
  // Add category nodes to the graph
  nodes.push(...categoryNodes);
  
  // Extract and add items for each category
  addStrengthsNodes(surveyData, nodes, relationships);
  addLearningStyleNodes(surveyData, nodes, relationships);
  addPassionsNodes(surveyData, nodes, relationships);
  addGoalsNodes(surveyData, nodes, relationships);
  
  // Create cross-category connections
  createCrossCategoryConnections(nodes, relationships);
  
  return { nodes, relationships };
}

/**
 * Add Strengths nodes and connections
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function addStrengthsNodes(data, nodes, relationships) {
  // Extract strengths from survey data
  const strengths = extractStrengthsFromData(data);
  
  // Add each strength as a node
  strengths.forEach(strength => {
    nodes.push({
      label: "Skill",  // Label for the actual strength item
      properties: {
        name: strength,
        description: `Self-identified strength in ${strength}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Personal strength identified by student"
      }
    });
    
    // Connect to the Strengths category
    relationships.push({
      from: "Strengths",  // This is the category node
      to: strength,  // This is the specific strength node
      type: "CONTAINS",
      properties: {
        strength: 1.0,
        description: "Category contains specific strength"
      }
    });
  });
  
  // Connect related strengths to each other
  createRelationshipsBetweenItems(strengths, strengths, "RELATES_TO", "Complementary strengths", relationships);
}

/**
 * Add Learning Style nodes and connections
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function addLearningStyleNodes(data, nodes, relationships) {
  // Extract learning style
  const learningStyleName = extractLearningStyleFromData(data) || "Balanced";
  
  // Add the main learning style node
  nodes.push({
    label: "LearningApproach",  // Avoid spaces in Neo4j labels
    properties: {
      name: learningStyleName,
      description: `Preference for ${learningStyleName.toLowerCase()} learning`,
      source: "survey",
      confidence: 1.0,
      relevance: "Primary learning style preference"
    }
  });
  
  // Connect to the LearningStyle category
  relationships.push({
    from: "LearningStyle",  // Category node
    to: learningStyleName,  // Specific learning style
    type: "CONTAINS",
    properties: {
      strength: 1.0,
      description: "Category contains specific learning style"
    }
  });
  
  // Add appropriate learning strategies
  const strategies = getLearningStrategies(learningStyleName);
  
  // Add each strategy as a node
  strategies.forEach(strategy => {
    // Create strategy node
    nodes.push({
      label: "Strategy",
      properties: {
        name: strategy,
        description: `Study approach for ${learningStyleName.toLowerCase()} learners`,
        source: "derived",
        confidence: 0.9,
        relevance: `Strategy aligned with ${learningStyleName}`
      }
    });
    
    // Connect learning style to strategy
    relationships.push({
      from: learningStyleName,
      to: strategy,
      type: "USES",
      properties: {
        strength: 0.9,
        description: `${learningStyleName} learning uses ${strategy}`
      }
    });
  });
}

/**
 * Add Passions nodes and connections
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function addPassionsNodes(data, nodes, relationships) {
  // Extract passions/interests
  const passions = extractPassionsFromData(data);

  // Add each passion as a node
  passions.forEach(passion => {
    // Handle both string and object passions
    let passionName;
    let passionDetails = "";
    
    if (typeof passion === 'string') {
      passionName = passion.trim();
    } else if (passion && typeof passion === 'object') {
      // Extract from object - look for common field names
      if (passion.hobby) passionName = passion.hobby;
      else if (passion.interest) passionName = passion.interest;
      else if (passion.passion) passionName = passion.passion;
      else if (passion.activity) passionName = passion.activity;
      else if (passion.name) passionName = passion.name;
      else if (passion.title) passionName = passion.title;
      else if (passion.path) passionName = passion.path;
      
      // Extract details if available
      if (passion.details) passionDetails = passion.details;
      else if (passion.description) passionDetails = passion.description;
    }
    
    // Skip if we couldn't determine a name
    if (!passionName) {
      console.log('Skipping passion with missing name:', passion);
      return;
    }
    
    nodes.push({
      label: "Topic",
      properties: {
        name: passionName,
        description: passionDetails || `Interest in ${passionName}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Area of personal interest"
      }
    });

    // Connect to the Passions category
    relationships.push({
      from: "Passions",  // Category node
      to: passionName,   // Specific passion
      type: "CONTAINS",
      properties: {
        strength: 1.0,
        description: "Category contains specific interest"
      }
    });
  });

  // Filter out invalid items before creating relationships
  const validPassions = passions.map(p => {
    if (typeof p === 'string') return p.trim();
    if (p && typeof p === 'object') {
      if (p.hobby) return p.hobby;
      if (p.interest) return p.interest;
      if (p.passion) return p.passion;
      if (p.activity) return p.activity;
      if (p.name) return p.name;
      if (p.title) return p.title;
      if (p.path) return p.path;
    }
    return null;
  }).filter(p => p && p.trim().length > 0);

  // Connect related passions to each other
  createRelationshipsBetweenItems(validPassions, validPassions, "RELATES_TO", "Related interests", relationships);
}

/**
 * Add Goals nodes and connections
 * @param {Object} data - Survey data
 * @param {Array} nodes - Nodes array to update
 * @param {Array} relationships - Relationships array to update
 */
function addGoalsNodes(data, nodes, relationships) {
  // Extract goals
  const goals = extractGoalsFromData(data);

  // Add each goal as a node
  goals.forEach(goal => {
    // Handle both string and object goals
    let goalName;
    let goalDetails = "";
    
    if (typeof goal === 'string') {
      goalName = goal.trim();
    } else if (goal && typeof goal === 'object') {
      // Extract from object - look for common field names
      if (goal.goal) goalName = goal.goal;
      else if (goal.aspiration) goalName = goal.aspiration;
      else if (goal.target) goalName = goal.target;
      else if (goal.objective) goalName = goal.objective;
      else if (goal.name) goalName = goal.name;
      else if (goal.title) goalName = goal.title;
      else if (goal.path) goalName = goal.path;
      
      // Extract details if available
      if (goal.details) goalDetails = goal.details;
      else if (goal.description) goalDetails = goal.description;
    }
    
    // Skip if we couldn't determine a name
    if (!goalName) {
      console.log('Skipping goal with missing name:', goal);
      return;
    }

    nodes.push({
      label: "Aspiration",
      properties: {
        name: goalName,
        description: goalDetails || `Aspiration to ${goalName.toLowerCase().startsWith('become') ? goalName : 'achieve ' + goalName}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Personal or career aspiration"
      }
    });

    // Connect to the Goals category
    relationships.push({
      from: "Goals",  // Category node
      to: goalName,   // Specific goal
      type: "CONTAINS",
      properties: {
        strength: 1.0,
        description: "Category contains specific goal"
      }
    });

    // Add prerequisites for this goal
    const prerequisites = getGoalPrerequisites(goalName);

    prerequisites.forEach(prereq => {
      // Check if prerequisite node already exists
      if (!nodes.some(node => node.properties?.name === prereq)) {
        // Create prerequisite node
        nodes.push({
          label: "Requirement",
          properties: {
            name: prereq,
            description: `Required for ${goalName}`,
            source: "derived",
            confidence: 0.8,
            relevance: `Needed to achieve ${goalName}`
          }
        });
      }

      // Connect prerequisite to goal
      relationships.push({
        from: prereq,
        to: goalName,
        type: "REQUIRED_FOR",
        properties: {
          strength: 0.8,
          description: `${prereq} is needed for ${goalName}`
        }
      });
    });
  });
}

/**
 * Create connections between items in different categories
 * @param {Array} nodes - All nodes
 * @param {Array} relationships - Relationships array to update
 */
function createCrossCategoryConnections(nodes, relationships) {
  // Get skills, strategies, topics, and aspirations
  const skills = nodes.filter(n => n.label === "Skill" && n.properties?.name).map(n => n.properties.name);
  const strategies = nodes.filter(n => n.label === "Strategy" && n.properties?.name).map(n => n.properties.name);
  const topics = nodes.filter(n => n.label === "Topic" && n.properties?.name).map(n => n.properties.name);
  const aspirations = nodes.filter(n => n.label === "Aspiration" && n.properties?.name).map(n => n.properties.name);

  // Make sure all values are valid strings
  const validSkills = skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0);
  const validStrategies = strategies.filter(strategy => typeof strategy === 'string' && strategy.trim().length > 0);
  const validTopics = topics.filter(topic => typeof topic === 'string' && topic.trim().length > 0);
  const validAspirations = aspirations.filter(aspiration => typeof aspiration === 'string' && aspiration.trim().length > 0);

  console.log('Creating cross-connections between categories');
  console.log(`Found ${validSkills.length} skills, ${validStrategies.length} strategies, ${validTopics.length} topics, ${validAspirations.length} aspirations`);

  // Connect strengths to related passions
  validSkills.forEach(skill => {
    validTopics.forEach(topic => {
      if (areRelated(skill, topic)) {
        relationships.push({
          from: skill,
          to: topic,
          type: "RELATES_TO",
          properties: {
            strength: 0.7,
            description: `${skill} is relevant to ${topic}`
          }
        });
      }
    });
  });

  // Connect strengths to relevant goals
  validSkills.forEach(skill => {
    validAspirations.forEach(aspiration => {
      if (skillHelpsWithGoal(skill, aspiration)) {
        relationships.push({
          from: skill,
          to: aspiration,
          type: "HELPS_WITH",
          properties: {
            strength: 0.8,
            description: `${skill} helps achieve ${aspiration}`
          }
        });
      }
    });
  });

  // Connect passions to relevant goals
  validTopics.forEach(topic => {
    validAspirations.forEach(aspiration => {
      if (areRelated(topic, aspiration)) {
        relationships.push({
          from: topic,
          to: aspiration,
          type: "CONTRIBUTES_TO",
          properties: {
            strength: 0.7,
            description: `Interest in ${topic} contributes to ${aspiration}`
          }
        });
      }
    });
  });
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
  
  // Personal traits field (commonly used in this app)
  if (data.personalTraits) {
    addToArray(strengths, data.personalTraits);
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
  // In this app, passions are mapped to learning style
  if (data.passions) {
    const passions = Array.isArray(data.passions) ? data.passions : [data.passions];
    if (passions.length > 0) {
      // Just use the first passion to determine a learning style
      return standardizeLearningStyle("Visual"); // Default to visual for this app
    }
  }
  
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
  if (normalized.includes('read') || normalized.includes('writ')) return "ReadingWriting"; // Remove space
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
      "MindMapping", 
      "ColorCoding", 
      "DiagramsAndCharts", 
      "VideoTutorials",
      "VisualOrganizers"
    ],
    "Auditory": [
      "GroupDiscussions", 
      "AudioRecordings", 
      "VerbalExplanations", 
      "ReadingAloud",
      "PodcastsAndLectures"
    ],
    "Kinesthetic": [
      "HandsOnProjects", 
      "RolePlaying", 
      "LabExperiments", 
      "PhysicalModels",
      "MovementWhileStudying"
    ],
    "ReadingWriting": [
      "NoteTaking", 
      "WrittenSummaries", 
      "ReadingTextbooks", 
      "MakingLists",
      "WrittenPracticeQuestions"
    ],
    "Multimodal": [
      "MixedMediaResources", 
      "ProjectBasedLearning", 
      "InteractiveTutorials", 
      "VariedStudyTechniques"
    ],
    "Balanced": [
      "VariedStudyTechniques",
      "ProjectBasedLearning",
      "InteractiveLearning",
      "GroupAndIndividualStudy"
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
  
  // In this app, dreams are mapped to passions
  if (data.dreams) {
    addToArray(passions, data.dreams);
  }
  
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
  
  // In this app, paths are mapped to goals
  if (data.paths) {
    addToArray(goals, data.paths);
  }
  
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
    "College": ["AcademicExcellence", "TimeManagement", "StudySkills"],
    "Medicine": ["Biology", "Chemistry", "Empathy", "Dedication"],
    "Engineering": ["Mathematics", "Physics", "ProblemSolving"],
    "Business": ["Communication", "Economics", "Leadership"],
    "Arts": ["Creativity", "TechnicalSkills", "SelfExpression"],
    "Technology": ["ComputerScience", "Logic", "Innovation"],
    "Teaching": ["Communication", "SubjectExpertise", "Empathy"]
  };
  
  // Check if the goal contains any of our predefined keywords
  for (const [key, prereqs] of Object.entries(prerequisites)) {
    if (goal.toLowerCase().includes(key.toLowerCase())) {
      return prereqs;
    }
  }
  
  // Default prerequisites for any goal
  return ["Persistence", "Planning", "SelfDiscipline"];
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
      
      // Check if items are related
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
 * Check if two items are related
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
    "STEM": ["Mathematics", "Science", "Engineering", "Technology", "Computer", "Physics", "Chemistry", "Biology"],
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
 * Helper function for skill-goal relationships
 * @param {String} skill - Skill name
 * @param {String} goal - Goal name
 * @returns {Boolean} - True if related
 */
function skillHelpsWithGoal(skill, goal) {
  // Common skill-goal relationships
  const skillGoalMap = {
    "Mathematics": ["Engineering", "Science", "Finance", "Computer"],
    "Communication": ["Business", "Law", "Teaching", "Leadership"],
    "Research": ["Academic", "Science", "Medicine", "Psychology"],
    "Creativity": ["Art", "Design", "Writing", "Music"]
  };
  
  // Check if any known patterns match
  for (const [skillKey, goalPatterns] of Object.entries(skillGoalMap)) {
    if (skill.toLowerCase().includes(skillKey.toLowerCase())) {
      for (const pattern of goalPatterns) {
        if (goal.toLowerCase().includes(pattern.toLowerCase())) {
          return true;
        }
      }
    }
  }
  
  // Fall back to general relation check
  return areRelated(skill, goal);
}

/**
 * Add items to an array, handling different input types
 * @param {Array} array - Target array
 * @param {*} items - Items to add (string, array, or object)
 */
function addToArray(array, items) {
  try {
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
        } else if (value) {
          // For non-string values, add as is
          array.push(value);
        }
      });
    } else if (items !== null && items !== undefined) {
      // For any other non-null value, add as is
      array.push(items);
    }
  } catch (error) {
    console.error('Error in addToArray:', error);
    console.log('Problematic items:', items);
  }
}

/**
 * Remove duplicates and empty values from array
 * @param {Array} array - Input array
 * @returns {Array} - Deduplicated array
 */
function removeDuplicates(array) {
  return [...new Set(array)]
    .filter(item => {
      // Check if item is string
      if (typeof item !== 'string') {
        return item != null; // Keep non-null/undefined non-strings
      }
      return item.trim().length > 0; // Filter out empty strings
    })
    .map(item => {
      // Only trim if it's a string
      return typeof item === 'string' ? item.trim() : item;
    });
}

/**
 * Initialize knowledge graph from survey data using the hierarchical approach
 * @param {String} username - User identifier
 * @param {Object} surveyData - Survey data from client
 * @param {Object} session - Neo4j database session
 * @returns {Promise<Boolean>} - Success status
 */
async function initializeHierarchicalKnowledgeGraph(username, surveyData, session) {
  try {
    // First ensure the user has a knowledge graph node
    await session.run(
      `MATCH (u:User {name: $username})
       MERGE (kg:KnowledgeGraph {userId: $username})
       MERGE (u)-[:HAS_KNOWLEDGE_GRAPH]->(kg)`,
      { username }
    );
    
    // Generate knowledge graph without LLM
    const graphData = generateHierarchicalKnowledgeGraph(surveyData);
    
    // Process nodes - each node is connected to the user's knowledge graph
    for (const node of graphData.nodes) {
      const { label, properties } = node;
      
      // Skip if no valid name
      if (!properties.name) continue;
      
      // Create or merge node and connect to this user's knowledge graph
      await session.run(
        `MATCH (kg:KnowledgeGraph {userId: $username})
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
            userId: username,
            created: new Date().toISOString()
          },
          updateProperties: {
            description: properties.description,
            updated: new Date().toISOString()
          }
        }
      );
    }
    
    // Process relationships between nodes in this user's knowledge graph
    for (const rel of graphData.relationships) {
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
    console.error('Error initializing hierarchical knowledge graph:', error);
    return false;
  }
}

module.exports = {
  generateHierarchicalKnowledgeGraph,
  initializeHierarchicalKnowledgeGraph
};