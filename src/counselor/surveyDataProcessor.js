// src/counselor/surveyDataProcessor.js

/**
 * Processes survey data into a normalized format for the rule-based knowledge extractor
 */

// Normalize raw survey data from the client
function normalizeSurveyData(rawSurveyData) {
  const normalized = {
    // Who You Are (Strengths)
    strengths: extractStrengths(rawSurveyData),
    
    // How You Learn (Learning Style)
    learningStyle: extractLearningStyle(rawSurveyData),
    
    // What You Care About (Passions)
    interests: extractInterests(rawSurveyData),
    academicInterests: extractAcademicInterests(rawSurveyData),
    extracurriculars: extractExtracurriculars(rawSurveyData),
    
    // What You Strive For (Goals)
    futureGoals: extractFutureGoals(rawSurveyData),
    careerInterests: extractCareerInterests(rawSurveyData),
    
    // Additional data
    challenges: extractChallenges(rawSurveyData),
    gradeLevel: rawSurveyData.gradeLevel || rawSurveyData.grade || null
  };
  
  return normalized;
}

// Extract strengths from survey data
function extractStrengths(data) {
  const strengths = [];
  
  // Common field names for strengths
  const strengthsFields = [
    'strengths', 'skills', 'abilities', 'talents', 
    'goodAt', 'strongPoints', 'expertise'
  ];
  
  // Look for strengths in various possible fields
  for (const field of strengthsFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        strengths.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        // Split comma-separated strings
        strengths.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  // Look for self-description fields that might contain strengths
  if (data.selfDescription && typeof data.selfDescription === 'string') {
    const strengthsKeywords = [
      'good at', 'skilled in', 'excel in', 'talented', 
      'strength', 'ability', 'capable'
    ];
    
    for (const keyword of strengthsKeywords) {
      if (data.selfDescription.toLowerCase().includes(keyword)) {
        strengths.push(`Self-described ${keyword}`);
      }
    }
  }
  
  return removeDuplicates(strengths);
}

// Extract learning style from survey data
function extractLearningStyle(data) {
  // Direct field access
  if (data.learningStyle) {
    return standardizeLearningStyle(data.learningStyle);
  }
  
  // Check for specific learning style questions
  if (data.preferredLearningMethod) {
    return standardizeLearningStyle(data.preferredLearningMethod);
  }
  
  // Learning style might be embedded in an array of preferences
  if (data.learningPreferences && Array.isArray(data.learningPreferences)) {
    const learningStyleKeywords = {
      'Visual': ['visual', 'see', 'watch', 'observe', 'diagrams', 'charts', 'pictures'],
      'Auditory': ['auditory', 'hear', 'listen', 'audio', 'spoken', 'verbal'],
      'Kinesthetic': ['kinesthetic', 'hands-on', 'physical', 'movement', 'touch', 'do'],
      'Reading/Writing': ['reading', 'writing', 'text', 'notes', 'books']
    };
    
    for (const pref of data.learningPreferences) {
      for (const [style, keywords] of Object.entries(learningStyleKeywords)) {
        for (const keyword of keywords) {
          if (pref.toLowerCase().includes(keyword)) {
            return style;
          }
        }
      }
    }
  }
  
  // Default to multimodal if we can't determine
  return 'Multimodal';
}

// Standardize learning style to a consistent format
function standardizeLearningStyle(style) {
  if (!style) return 'Multimodal';
  
  const normalized = style.toLowerCase();
  
  if (normalized.includes('visual')) return 'Visual';
  if (normalized.includes('auditory') || normalized.includes('audio') || normalized.includes('aural')) return 'Auditory';
  if (normalized.includes('kinesthetic') || normalized.includes('tactile') || normalized.includes('hands-on')) return 'Kinesthetic';
  if (normalized.includes('read') || normalized.includes('write')) return 'Reading/Writing';
  if (normalized.includes('multi') || normalized.includes('mixed')) return 'Multimodal';
  
  return 'Multimodal';
}

// Extract interests from survey data
function extractInterests(data) {
  const interests = [];
  
  // Common field names for interests
  const interestsFields = [
    'interests', 'hobbies', 'pastimes', 'activities',
    'enjoyableActivities', 'favoriteThings'
  ];
  
  // Look for interests in various possible fields
  for (const field of interestsFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        interests.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        interests.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  return removeDuplicates(interests);
}

// Extract academic interests from survey data
function extractAcademicInterests(data) {
  const academicInterests = [];
  
  // Common field names for academic interests
  const academicFields = [
    'academicInterests', 'favoriteSubjects', 'preferredSubjects',
    'studyPreferences', 'academicStrengths'
  ];
  
  // Look for academic interests in various possible fields
  for (const field of academicFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        academicInterests.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        academicInterests.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  return removeDuplicates(academicInterests);
}

// Extract extracurricular activities from survey data
function extractExtracurriculars(data) {
  const extracurriculars = [];
  
  // Common field names for extracurricular activities
  const extracurricularFields = [
    'extracurriculars', 'activities', 'clubs', 'sports',
    'afterSchoolActivities', 'organizations'
  ];
  
  // Look for extracurriculars in various possible fields
  for (const field of extracurricularFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        extracurriculars.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        extracurriculars.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  return removeDuplicates(extracurriculars);
}

// Extract future goals from survey data
function extractFutureGoals(data) {
  const goals = [];
  
  // Common field names for goals
  const goalFields = [
    'goals', 'futureGoals', 'aspirations', 'dreams',
    'ambitions', 'objectives', 'lifeGoals'
  ];
  
  // Look for goals in various possible fields
  for (const field of goalFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        goals.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        goals.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  return removeDuplicates(goals);
}

// Extract career interests from survey data
function extractCareerInterests(data) {
  const careers = [];
  
  // Common field names for career interests
  const careerFields = [
    'careerInterests', 'careerGoals', 'desiredProfessions',
    'jobInterests', 'careerPlans'
  ];
  
  // Look for career interests in various possible fields
  for (const field of careerFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        careers.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        careers.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  return removeDuplicates(careers);
}

// Extract challenges from survey data
function extractChallenges(data) {
  const challenges = [];
  
  // Common field names for challenges
  const challengeFields = [
    'challenges', 'difficulties', 'struggles', 'obstacles',
    'weaknesses', 'areasToImprove'
  ];
  
  // Look for challenges in various possible fields
  for (const field of challengeFields) {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        challenges.push(...data[field]);
      } else if (typeof data[field] === 'string') {
        challenges.push(...data[field].split(',').map(s => s.trim()));
      }
    }
  }
  
  return removeDuplicates(challenges);
}

// Helper function to remove duplicates from arrays
function removeDuplicates(array) {
  return [...new Set(array.map(item => item.trim()))].filter(item => item.length > 0);
}

module.exports = {
  normalizeSurveyData
};