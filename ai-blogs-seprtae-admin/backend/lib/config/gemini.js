import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main(prompt, modelName = "gemini-2.5-flash") {
  try {
    const model = ai.getGenerativeModel({ model: modelName });
    
    // Enhanced prompt that includes formatting instructions
    const enhancedPrompt = `You are a professional blog writer. Write a blog post about: ${prompt}

    IMPORTANT: Respond with ONLY the blog content using proper HTML formatting:
    - Use <h2> tags for section headings
    - Use <p> tags for paragraphs
    - Use <ul> and <li> tags for bullet points where appropriate
    - Do NOT include <html>, <head>, <body>, or DOCTYPE tags
    - Do NOT include code blocks or markdown formatting
    - Start directly with the content (first paragraph or heading)
    - Make the content engaging, informative, and easy to read
    - Keep paragraphs concise (2-4 sentences each)
    - Use professional yet conversational tone`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    // Log the error for debugging
    console.error("[Gemini API Error]:", error);
    // Return a user-friendly error message
    return `[Gemini API Error]: ${error.message || "Unknown error occurred."}`;
  }
}

async function listModels() {
  try {
    const models = await ai.listModels();
    console.log("Available models:", models);
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

// Execute the function to list models
listModels();

export default main;