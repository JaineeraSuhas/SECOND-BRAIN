const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

if (!GEMINI_API_KEY) {
    console.warn('Missing Gemini API key. AI features will be disabled.');
}

export interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
}

export class GeminiClient {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || GEMINI_API_KEY;
    }

    async generateContent(prompt: string): Promise<string> {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data: GeminiResponse = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || '';
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    async extractConcepts(text: string): Promise<string[]> {
        const prompt = `Extract key concepts from the following text. Return only a JSON array of concept strings, nothing else.

Text: ${text}

Concepts:`;

        try {
            const response = await this.generateContent(prompt);
            const concepts = JSON.parse(response);
            return Array.isArray(concepts) ? concepts : [];
        } catch (error) {
            console.error('Failed to extract concepts:', error);
            return [];
        }
    }

    async answerQuestion(question: string, context: string): Promise<string> {
        const prompt = `You are a helpful AI assistant. Answer the following question based on the provided context.

Context:
${context}

Question: ${question}

Answer:`;

        return this.generateContent(prompt);
    }

    async summarize(text: string, maxLength: number = 200): Promise<string> {
        const prompt = `Summarize the following text in approximately ${maxLength} words:

${text}

Summary:`;

        return this.generateContent(prompt);
    }

    async extractStructuredKnowledge(text: string): Promise<{ concepts: string[], summary: string }> {
        const prompt = `Analyze the following text and extract key knowledge. 
        Return a JSON object with two fields: 
        1. "concepts": an array of short, high-level concept labels.
        2. "summary": a one-sentence summary of the text.

        Text: ${text}

        JSON:`;

        try {
            const response = await this.generateContent(prompt);
            const cleanJson = response.replace(/```json|```/g, '').trim();
            const result = JSON.parse(cleanJson);
            return {
                concepts: Array.isArray(result.concepts) ? result.concepts : [],
                summary: typeof result.summary === 'string' ? result.summary : ''
            };
        } catch (error) {
            console.error('Failed to extract structured knowledge:', error);
            return { concepts: [], summary: '' };
        }
    }
}

export const gemini = new GeminiClient();
