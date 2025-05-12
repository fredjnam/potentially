// src/counselor/ruleBasedKnowledgeExtractor.js

/**
 * Rule-based knowledge graph extraction to replace LLM-based approach
 * Processes survey data into predefined categories and relationships
 * Categories: Strengths, Learning Style, Passions, Goals
 */

// Generate knowledge graph nodes from survey data
function generateKnowledgeGraphFromSurvey(surveyData) {
  const nodes = [];
  const relationships = [];
  
  // Process strengths (Who You Are)
  if (surveyData.strengths) {
    processStrengths(surveyData.strengths, nodes, relationships);
  }
  
  // Process learning style (How You Learn)
  if (surveyData.learningStyle) {
    processLearningStyle(surveyData.learningStyle, nodes, relationships);
  }
  
  // Process passions (What You Care About)
  if (surveyData.interests || surveyData.academicInterests || surveyData.extracurriculars) {
    processPassions(surveyData, nodes, relationships);
  }
  
  // Process goals (What You Strive For)
  if (surveyData.futureGoals || surveyData.careerInterests) {
    processGoals(surveyData, nodes, relationships);
  }
  
  // Connect related nodes across categories
  createCrossConnections(nodes, relationships);
  
  return { nodes, relationships };
}

// Process strengths data
function processStrengths(strengths, nodes, relationships) {
  // Convert strengths to skill nodes
  if (Array.isArray(strengths)) {
    strengths.forEach(strength => {
      nodes.push({
        label: "Skill",
        properties: {
          name: strength,
          description: `Self-identified strength in ${strength}`,
          source: "survey",
          confidence: 1.0,
          relevance: "Core strength identified by student"
        }
      });
    });
    
    // Create relationships between complementary strengths
    for (let i = 0; i < strengths.length; i++) {
      for (let j = i + 1; j < strengths.length; j++) {
        relationships.push({
          from: strengths[i],
          to: strengths[j],
          type: "RELATES_TO",
          properties: {
            strength: 0.7,
            description: "Complementary strengths"
          }
        });
      }
    }
  } else if (typeof strengths === 'string') {
    // Handle case where strengths is a single string
    nodes.push({
      label: "Skill",
      properties: {
        name: strengths,
        description: `Self-identified strength in ${strengths}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Core strength identified by student"
      }
    });
  }
}

// Process learning style data
function processLearningStyle(learningStyle, nodes, relationships) {
  // Create a node for the learning style
  nodes.push({
    label: "Strategy",
    properties: {
      name: `${learningStyle} Learning`,
      description: `Preference for ${learningStyle.toLowerCase()} learning approaches`,
      source: "survey",
      confidence: 1.0,
      relevance: "Primary learning style preference"
    }
  });
  
  // Map learning styles to effective strategies
  const learningStrategies = {
    "Visual": ["Mind mapping", "Diagrams", "Color coding", "Video tutorials"],
    "Auditory": ["Recorded lectures", "Discussion groups", "Verbal explanation", "Audio materials"],
    "Kinesthetic": ["Hands-on projects", "Role playing", "Physical models", "Movement while studying"],
    "Reading/Writing": ["Note-taking", "Written summaries", "Reading materials", "Written practice questions"],
    "Multimodal": ["Mixed media resources", "Varied study techniques", "Project-based learning"]
  };
  
  // Add related strategy nodes based on learning style
  const strategies = learningStrategies[learningStyle] || [];
  strategies.forEach(strategy => {
    nodes.push({
      label: "Strategy",
      properties: {
        name: strategy,
        description: `Study approach that works well for ${learningStyle.toLowerCase()} learners`,
        source: "survey",
        confidence: 0.9,
        relevance: "Effective strategy based on learning style"
      }
    });
    
    // Connect learning style to strategy
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

// Process passions data
function processPassions(surveyData, nodes, relationships) {
  const passions = [];
  
  // Extract interests from various survey fields
  if (surveyData.interests && Array.isArray(surveyData.interests)) {
    passions.push(...surveyData.interests);
  }
  
  if (surveyData.academicInterests && Array.isArray(surveyData.academicInterests)) {
    passions.push(...surveyData.academicInterests);
  }
  
  if (surveyData.extracurriculars && Array.isArray(surveyData.extracurriculars)) {
    passions.push(...surveyData.extracurriculars);
  }
  
  // Create nodes for each passion
  passions.forEach(passion => {
    nodes.push({
      label: "Topic",
      properties: {
        name: passion,
        description: `Interest in ${passion}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Area of personal interest"
      }
    });
  });
  
  // Connect related passions
  for (let i = 0; i < passions.length; i++) {
    for (let j = i + 1; j < passions.length; j++) {
      // Simple heuristic: if words overlap, create a relationship
      if (shareCommonWords(passions[i], passions[j])) {
        relationships.push({
          from: passions[i],
          to: passions[j],
          type: "RELATES_TO",
          properties: {
            strength: 0.6,
            description: "Related areas of interest"
          }
        });
      }
    }
  }
}

// Process goals data
function processGoals(surveyData, nodes, relationships) {
  const goals = [];
  
  // Extract goals from various survey fields
  if (surveyData.futureGoals) {
    if (Array.isArray(surveyData.futureGoals)) {
      goals.push(...surveyData.futureGoals);
    } else if (typeof surveyData.futureGoals === 'string') {
      goals.push(surveyData.futureGoals);
    }
  }
  
  if (surveyData.careerInterests && Array.isArray(surveyData.careerInterests)) {
    goals.push(...surveyData.careerInterests);
  }
  
  // Create nodes for each goal
  goals.forEach(goal => {
    nodes.push({
      label: "Goal",
      properties: {
        name: goal,
        description: `Aspiration to ${goal.toLowerCase().startsWith('become') ? goal : 'achieve ' + goal}`,
        source: "survey",
        confidence: 1.0,
        relevance: "Personal or career aspiration"
      }
    });
  });
  
  // Simple example of prerequisites for common goals
  const goalPrerequisites = {
    "College": ["Academic Excellence", "Standardized Test Preparation", "Extracurricular Involvement"],
    "Medical School": ["Biology", "Chemistry", "Physics", "Academic Excellence"],
    "Engineering": ["Mathematics", "Physics", "Problem Solving"],
    "Business": ["Economics", "Communication Skills", "Leadership"],
    "Art": ["Creativity", "Technical Skills", "Portfolio Development"]
  };
  
  // Add prerequisites for goals that match our predefined list
  goals.forEach(goal => {
    // Check for partial matches in our predefined goals
    for (const [knownGoal, prerequisites] of Object.entries(goalPrerequisites)) {
      if (goal.includes(knownGoal)) {
        prerequisites.forEach(prereq => {
          // Add prerequisite node if it doesn't already exist
          if (!nodes.some(node => node.properties.name === prereq)) {
            nodes.push({
              label: "Skill",
              properties: {
                name: prereq,
                description: `Skill or knowledge area important for ${goal}`,
                source: "derived",
                confidence: 0.8,
                relevance: `Required for ${goal}`
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
      }
    }
  });
}

// Create connections between different categories
function createCrossConnections(nodes, relationships) {
  // Extract nodes by type
  const skills = nodes.filter(node => node.label === "Skill").map(node => node.properties.name);
  const strategies = nodes.filter(node => node.label === "Strategy").map(node => node.properties.name);
  const topics = nodes.filter(node => node.label === "Topic").map(node => node.properties.name);
  const goals = nodes.filter(node => node.label === "Goal").map(node => node.properties.name);
  
  // Connect skills to related topics
  skills.forEach(skill => {
    topics.forEach(topic => {
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
  
  // Connect skills to goals they help with
  skills.forEach(skill => {
    goals.forEach(goal => {
      if (skillHelpsWithGoal(skill, goal)) {
        relationships.push({
          from: skill,
          to: goal,
          type: "HELPS_WITH",
          properties: {
            strength: 0.8,
            description: `${skill} helps achieve ${goal}`
          }
        });
      }
    });
  });
  
  // Connect strategies to skills they develop
  strategies.forEach(strategy => {
    skills.forEach(skill => {
      if (strategyDevelopsSkill(strategy, skill)) {
        relationships.push({
          from: strategy,
          to: skill,
          type: "LEADS_TO",
          properties: {
            strength: 0.6,
            description: `${strategy} helps develop ${skill}`
          }
        });
      }
    });
  });
}

// Helper function to determine if two strings share common words
function shareCommonWords(str1, str2) {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  for (const word of words1) {
    if (word.length > 3 && words2.includes(word)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to determine if a skill is related to a topic
function areRelated(skill, topic) {
  // This could be a more sophisticated algorithm
  // For now, just check for word overlap
  return shareCommonWords(skill, topic);
}

// Helper function to determine if a skill helps with a goal
function skillHelpsWithGoal(skill, goal) {
  // This could be a more sophisticated matching algorithm
  // For now, just check for word overlap or known relationships
  
  // Some predefined relationships
  const skillToGoalMap = {
    "Mathematics": ["Engineering", "Science", "Finance", "Computer Science"],
    "Communication": ["Business", "Law", "Teaching", "Leadership"],
    "Research": ["Academic", "Science", "Medicine", "Psychology"],
    "Creativity": ["Art", "Design", "Writing", "Music"]
  };
  
  // Check if there's a direct mapping
  for (const [knownSkill, relatedGoals] of Object.entries(skillToGoalMap)) {
    if (skill.includes(knownSkill)) {
      for (const relatedGoal of relatedGoals) {
        if (goal.includes(relatedGoal)) {
          return true;
        }
      }
    }
  }
  
  // Fall back to simple word matching
  return shareCommonWords(skill, goal);
}

// Helper function to determine if a strategy develops a skill
function strategyDevelopsSkill(strategy, skill) {
  // This could be a more sophisticated matching algorithm
  // For now, just check for word overlap or known relationships
  
  // Some predefined relationships
  const strategyToSkillMap = {
    "Mind mapping": ["Critical thinking", "Organization", "Creativity"],
    "Discussion groups": ["Communication", "Collaboration", "Critical thinking"],
    "Hands-on projects": ["Problem solving", "Technical skills", "Creativity"],
    "Note-taking": ["Organization", "Focus", "Memory"]
  };
  
  // Check if there's a direct mapping
  for (const [knownStrategy, developedSkills] of Object.entries(strategyToSkillMap)) {
    if (strategy.includes(knownStrategy)) {
      for (const developedSkill of developedSkills) {
        if (skill.includes(developedSkill)) {
          return true;
        }
      }
    }
  }
  
  // Fall back to simple word matching
  return shareCommonWords(strategy, skill);
}

module.exports = {
  generateKnowledgeGraphFromSurvey
};