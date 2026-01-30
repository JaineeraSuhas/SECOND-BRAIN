import { Client } from '@notionhq/client';
import { gemini } from './gemini';

const NOTION_API_KEY = (import.meta as any).env.VITE_NOTION_API_KEY;

export interface NotionPage {
    id: string;
    title: string;
    content: string;
    url: string;
    created_time: string;
    last_edited_time: string;
    properties: Record<string, any>;
    parent_id?: string;
}

export interface NotionDatabase {
    id: string;
    title: string;
    properties: Record<string, any>;
    url: string;
}

export class NotionClient {
    private client: Client | null = null;
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || NOTION_API_KEY;
        if (this.apiKey) {
            this.client = new Client({ auth: this.apiKey });
        }
    }

    isConfigured(): boolean {
        return !!this.client;
    }

    /**
     * Search for pages and databases in Notion workspace
     */
    async search(query?: string): Promise<{ pages: NotionPage[]; databases: NotionDatabase[] }> {
        if (!this.client) {
            throw new Error('Notion API key not configured');
        }

        try {
            const response = await this.client.search({
                query: query || '',
                filter: {
                    property: 'object',
                    value: 'page'
                },
                sort: {
                    direction: 'descending',
                    timestamp: 'last_edited_time'
                }
            });

            const pages: NotionPage[] = [];
            const databases: NotionDatabase[] = [];

            for (const result of response.results) {
                if ((result as any).object === 'page') {
                    const page = await this.getPage((result as any).id);
                    if (page) pages.push(page);
                } else if ((result as any).object === 'database') {
                    const db = await this.getDatabase((result as any).id);
                    if (db) databases.push(db);
                }
            }

            return { pages, databases };
        } catch (error) {
            console.error('Notion search failed:', error);
            throw error;
        }
    }

    /**
     * Get a single page with its content
     */
    async getPage(pageId: string): Promise<NotionPage | null> {
        if (!this.client) {
            throw new Error('Notion API key not configured');
        }

        try {
            // Get page metadata
            const page = await this.client.pages.retrieve({ page_id: pageId });

            // Get page content (blocks)
            const blocks = await this.client.blocks.children.list({
                block_id: pageId,
                page_size: 100
            });

            // Extract title
            const title = this.extractPageTitle(page);

            // Convert blocks to plain text
            const content = await this.blocksToText(blocks.results);

            return {
                id: page.id,
                title,
                content,
                url: (page as any).url || `https://notion.so/${pageId.replace(/-/g, '')}`,
                created_time: (page as any).created_time,
                last_edited_time: (page as any).last_edited_time,
                properties: (page as any).properties || {},
                parent_id: (page as any).parent?.page_id || (page as any).parent?.database_id
            };
        } catch (error) {
            console.error(`Failed to get page ${pageId}:`, error);
            return null;
        }
    }

    /**
     * Get database information
     */
    async getDatabase(databaseId: string): Promise<NotionDatabase | null> {
        if (!this.client) {
            throw new Error('Notion API key not configured');
        }

        try {
            const database = await this.client.databases.retrieve({
                database_id: databaseId
            });

            return {
                id: database.id,
                title: this.extractDatabaseTitle(database),
                properties: (database as any).properties || {},
                url: (database as any).url || `https://notion.so/${databaseId.replace(/-/g, '')}`
            };
        } catch (error) {
            console.error(`Failed to get database ${databaseId}:`, error);
            return null;
        }
    }

    /**
     * Get all pages from a database
     */
    async getDatabasePages(databaseId: string): Promise<NotionPage[]> {
        if (!this.client) {
            throw new Error('Notion API key not configured');
        }

        try {
            const response = await (this.client.databases as any).query({
                database_id: databaseId
            });

            const pages: NotionPage[] = [];
            for (const result of response.results) {
                const page = await this.getPage(result.id);
                if (page) pages.push(page);
            }

            return pages;
        } catch (error) {
            console.error(`Failed to get database pages ${databaseId}:`, error);
            return [];
        }
    }

    /**
     * Extract concepts from Notion page using AI
     */
    async extractConcepts(page: NotionPage): Promise<string[]> {
        try {
            const concepts = await gemini.extractConcepts(page.content);
            return concepts;
        } catch (error) {
            console.error('Failed to extract concepts from Notion page:', error);
            return [];
        }
    }

    /**
     * Convert Notion blocks to plain text
     */
    private async blocksToText(blocks: any[]): Promise<string> {
        const textParts: string[] = [];

        for (const block of blocks) {
            const text = this.extractBlockText(block);
            if (text) {
                textParts.push(text);
            }

            // Recursively get child blocks
            if (block.has_children) {
                try {
                    const children = await this.client!.blocks.children.list({
                        block_id: block.id
                    });
                    const childText = await this.blocksToText(children.results);
                    if (childText) {
                        textParts.push(childText);
                    }
                } catch (error) {
                    console.error('Failed to get child blocks:', error);
                }
            }
        }

        return textParts.join('\n\n');
    }

    /**
     * Extract text from a single block
     */
    private extractBlockText(block: any): string {
        const type = block.type;

        if (!block[type]) return '';

        // Handle different block types
        switch (type) {
            case 'paragraph':
            case 'heading_1':
            case 'heading_2':
            case 'heading_3':
            case 'bulleted_list_item':
            case 'numbered_list_item':
            case 'to_do':
            case 'toggle':
            case 'quote':
            case 'callout':
                return this.richTextToPlainText(block[type].rich_text);

            case 'code':
                return block[type].rich_text ? this.richTextToPlainText(block[type].rich_text) : '';

            case 'image':
                return block[type].caption ? this.richTextToPlainText(block[type].caption) : '';

            default:
                return '';
        }
    }

    /**
     * Convert Notion rich text to plain text
     */
    private richTextToPlainText(richText: any[]): string {
        if (!richText || !Array.isArray(richText)) return '';
        return richText.map(text => text.plain_text || '').join('');
    }

    /**
     * Extract page title from page object
     */
    private extractPageTitle(page: any): string {
        const properties = page.properties;

        // Try to find title property
        for (const key in properties) {
            const prop = properties[key];
            if (prop.type === 'title' && prop.title && prop.title.length > 0) {
                return this.richTextToPlainText(prop.title);
            }
        }

        return 'Untitled';
    }

    /**
     * Extract database title
     */
    private extractDatabaseTitle(database: any): string {
        if (database.title && database.title.length > 0) {
            return this.richTextToPlainText(database.title);
        }
        return 'Untitled Database';
    }

    /**
     * Extract links from Notion page content
     */
    extractPageLinks(page: NotionPage): string[] {
        const links: string[] = [];
        const urlRegex = /https?:\/\/[^\s]+/g;
        const matches = page.content.match(urlRegex);

        if (matches) {
            links.push(...matches);
        }

        // Extract Notion page links from properties
        if (page.properties) {
            for (const key in page.properties) {
                const prop = page.properties[key];
                if (prop.type === 'relation' && prop.relation) {
                    prop.relation.forEach((rel: any) => {
                        links.push(`notion://${rel.id}`);
                    });
                }
            }
        }

        return links;
    }
}

export const notion = new NotionClient();
