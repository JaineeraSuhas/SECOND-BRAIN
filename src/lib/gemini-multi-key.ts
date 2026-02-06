const GEMINI_API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
].filter(Boolean); // Remove undefined keys

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

if (GEMINI_API_KEYS.length === 0) {
    console.warn('Missing Gemini API keys. AI features will be disabled.');
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

// Rate limiter with multi-key support
class RateLimiter {
    private queues: Map<string, Array<() => Promise<void>>> = new Map();
    private processing: Map<string, boolean> = new Map();
    private lastRequestTime: Map<string, number> = new Map();
    private readonly minDelay = 4000; // 4 seconds between requests per key
    private currentKeyIndex = 0;

    // Round-robin key selection
    private getNextKey(): string {
        if (GEMINI_API_KEYS.length === 0) return '';
        const key = GEMINI_API_KEYS[this.currentKeyIndex];
        this.currentKeyIndex = (this.currentKeyIndex + 1) % GEMINI_API_KEYS.length;
        return key;
    }

    async add<T>(fn: (apiKey: string) => Promise<T>): Promise<T> {
        const apiKey = this.getNextKey();
        if (!apiKey) throw new Error('No API keys available');

        if (!this.queues.has(apiKey)) {
            this.queues.set(apiKey, []);
            this.processing.set(apiKey, false);
            this.lastRequestTime.set(apiKey, 0);
        }

        return new Promise((resolve, reject) => {
            this.queues.get(apiKey)!.push(async () => {
                try {
                    const result = await fn(apiKey);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.processQueue(apiKey);
        });
    }

    private async processQueue(apiKey: string) {
        if (this.processing.get(apiKey) || !this.queues.get(apiKey)?.length) return;

        this.processing.set(apiKey, true);
        const queue = this.queues.get(apiKey)!;

        while (queue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - (this.lastRequestTime.get(apiKey) || 0);

            if (timeSinceLastRequest < this.minDelay) {
                await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastRequest));
            }

            const task = queue.shift();
            if (task) {
                this.lastRequestTime.set(apiKey, Date.now());
                await task();
            }
        }

        this.processing.set(apiKey, false);
    }
}

export class GeminiClient {
    private rateLimiter = new RateLimiter();

    async generateContent(prompt: string): Promise<string> {
        if (GEMINI_API_KEYS.length === 0) {
            throw new Error('Gemini API key not configured');
        }

        // Use rate limiter with multi-key support
        return this.rateLimiter.add(async (apiKey: string) => {
            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
                    // Handle rate limit specifically
                    if (response.status === 429) {
                        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                    }
                    throw new Error(`Gemini API error: ${response.statusText}`);
                }

                const data: GeminiResponse = await response.json();
                return data.candidates[0]?.content?.parts[0]?.text || '';
            } catch (error) {
                console.error('Gemini API error:', error);
                throw error;
            }
        });
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
