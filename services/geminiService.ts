
import { GoogleGenAI, Type } from "@google/genai";

// Ensure API_KEY is set in your environment variables for this to work.
// The prompt guides Gemini to provide a JSON output.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const schema = {
    type: Type.OBJECT,
    properties: {
        facts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    fact: {
                        type: Type.STRING,
                        description: "A short, interesting fact about blood donation."
                    },
                    explanation: {
                        type: Type.STRING,
                        description: "A brief explanation or elaboration of the fact."
                    }
                },
                 required: ["fact", "explanation"]
            }
        }
    },
    required: ["facts"]
};


export const getBloodDonationFacts = async (): Promise<{ fact: string; explanation: string; }[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Provide 3 interesting and encouraging facts about blood donation for a donor website dashboard.",
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString);
        return parsed.facts;

    } catch (error) {
        console.error("Error fetching facts from Gemini API:", error);
        throw new Error("Could not fetch blood donation facts.");
    }
};
