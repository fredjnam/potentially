// src/counselor/counselorService.js
const axios = require('axios');
const promptTemplates = require('./promptTemplates');

// Function to process a counseling request
async function processCounselingRequest(message, category, surveyData) {
  // Create adaptive base prompt
  const adaptivePrompt = promptTemplates.createAdaptivePrompt(
    promptTemplates.baseSystemPrompt, 
    surveyData
  );
  
  // Select appropriate template based on category
  let finalPrompt;
  switch(category) {
    case 'academic':
      finalPrompt = promptTemplates.createAcademicGuidancePrompt(adaptivePrompt, message);
      break;
    case 'emotional':
      finalPrompt = promptTemplates.createEmotionalSupportPrompt(adaptivePrompt, message);
      break;
    case 'social':
      finalPrompt = promptTemplates.createSocialChallengesPrompt(adaptivePrompt, message);
      break;
    case 'future':
      finalPrompt = promptTemplates.createFuturePlanningPrompt(adaptivePrompt, message);
      break;
    default:
      // General counseling prompt if no specific category
      finalPrompt = `${adaptivePrompt}\n\nThe student says: ${message}\n\nRespond in a supportive, empathetic manner while providing helpful guidance.`;
  }
  
  // Add safety measures to the prompt
  finalPrompt = promptTemplates.addSafetyMeasures(finalPrompt);
  
  // Prepare the OpenAI API request
  const requestBody = {
    model: "gpt-4", // or your preferred model
    messages: [
      { role: "system", content: finalPrompt },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    max_tokens: 500
  };
  
  try {
    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to process counseling request');
  }
}

module.exports = {
  processCounselingRequest
};