import { GoogleGenAI, Modality, Type, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatInstance: Chat | null = null;

const fileToGenerativePart = (file: File) => {
    return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
                const base64Data = event.target.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                });
            } else {
                reject(new Error("Failed to read file"));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const analyzeImageForScrap = async (imageFile: File): Promise<{ scrapType: string; quality: string; estimatedWeight: number }> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = "Analyze this image of scrap material. Identify the primary material (e.g., 'Copper Wire', 'PET Bottles', 'Cardboard'). Assess its quality on a scale of 'Poor', 'Fair', 'Good', or 'Excellent'. Provide a rough, visual estimate of its weight in kilograms. Return ONLY a valid JSON object with keys 'scrapType' (string), 'quality' (string), and 'estimatedWeight' (number).";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    scrapType: { type: Type.STRING },
                    quality: { type: Type.STRING },
                    estimatedWeight: { type: Type.NUMBER, description: "A visual estimate of the weight in kilograms." }
                }
            }
        },
    });

    try {
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        if (typeof result.scrapType !== 'string' || typeof result.quality !== 'string' || typeof result.estimatedWeight !== 'number') {
            throw new Error("AI analysis returned an invalid data structure.");
        }
        return { scrapType: result.scrapType, quality: result.quality, estimatedWeight: result.estimatedWeight };
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", response.text);
        throw new Error("AI analysis failed to return valid data.");
    }
};


export const enhanceImage = async (imageFile: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = "Enhance this photo for a marketplace listing. Improve lighting, contrast, and sharpness to make the scrap material clear and appealing. Crop slightly if needed to focus on the subject. Do not add or remove any objects.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const part = response.candidates?.[0]?.content?.parts[0];
    if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("No image was enhanced.");
};

export const suggestPrice = async (scrapType: string, weight: number): Promise<number> => {
    const prompt = `Based on current market data, what is the estimated price per kg for '${scrapType}' scrap? Provide a single numerical value representing the price in your local currency.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    
    // Extract the first number found in the text.
    const pricePerKgMatch = response.text.match(/[\d.]+/);
    if (pricePerKgMatch) {
        const pricePerKg = parseFloat(pricePerKgMatch[0]);
        return parseFloat((pricePerKg * weight).toFixed(2));
    }

    return 0;
};

export const generateDescription = async (scrapType: string, quality: string, weight: number): Promise<{ title: string; description: string }> => {
    const prompt = `Generate a concise and appealing marketplace listing for scrap material.
    - Material: ${scrapType}
    - Quality: ${quality}
    - Estimated Weight: ${weight} kg
    
    Return ONLY a valid JSON object with a 'title' (short and descriptive) and a 'description' (a brief paragraph).`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                }
            }
        }
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini Pro:", response.text);
        throw new Error("AI description generation failed.");
    }
};

export const getProChatResponseStream = async (message: string) => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: "You are ScrapKart's expert AI assistant for a scrap marketplace. Help users find materials, understand recycling, and resolve issues effectively.",
            },
        });
    }
    return await chatInstance.sendMessageStream({ message });
};