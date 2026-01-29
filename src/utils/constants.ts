export const APP_CONFIG = {
    name: import.meta.env.VITE_APP_NAME || 'Second Brain AI',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'AI-powered knowledge management',
};

export const FEATURE_FLAGS = {
    enable3DGraph: import.meta.env.VITE_ENABLE_3D_GRAPH === 'true',
    enableAIChat: import.meta.env.VITE_ENABLE_AI_CHAT === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
};

export const FILE_UPLOAD = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/plain', 'text/markdown', 'application/msword'],
    allowedExtensions: ['.pdf', '.txt', '.md', '.doc', '.docx'],
};

export const GRAPH_CONFIG = {
    nodeSize: 8,
    linkWidth: 2,
    linkOpacity: 0.6,
    backgroundColor: '#0a0a0a',
    highlightColor: '#3B82F6',
};

export const ANIMATION = {
    duration: 0.3,
    ease: 'easeInOut',
};
