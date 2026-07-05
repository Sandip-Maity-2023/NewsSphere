import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function getSpokenNewsSummary(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Convert this news into a natural spoken style with female voice. 
      Make it sound like a human news anchor talking:
      "${text}"
    `;

    const result = await model.generateContent(prompt);
    //const response = await result.response.text();
    const response = result?.response?.text?.();
    return response;
    
  } catch (err) {
    console.error("Gemini error:", err);
    return "Sorry, I could not process the news.";
  }
}
