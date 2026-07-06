import axios from 'axios';


export const groqSummary=async(text)=>{
try {
    const res=await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: "llama3-8b-8192",
        messages: [
            {
                role: "user",
                content: `Summarize this concisely in 3 sentences: \n${text}`,
                max_tokens: 100,
            }],
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout:7000,
    });
    return res.data.choices[0].message.content.trim();
} catch (error) {
    console.error('Error fetching Groq summary:', error.message);
    return "AI summary temporarily unavailable. Please try again later.";
    throw error;
}
};

