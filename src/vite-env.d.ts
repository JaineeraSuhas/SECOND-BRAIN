/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_NOTION_API_KEY?: string
    readonly VITE_APP_NAME?: string
    readonly VITE_APP_URL?: string
    readonly VITE_APP_DESCRIPTION?: string
    readonly VITE_ENABLE_3D_GRAPH?: string
    readonly VITE_ENABLE_AI_CHAT?: string
    readonly VITE_ENABLE_ANALYTICS?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
