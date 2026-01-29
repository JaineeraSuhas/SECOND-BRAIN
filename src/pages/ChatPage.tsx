export default function ChatPage() {
    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="liquid-glass p-12 rounded-3xl text-center max-w-2xl">
                <h1 className="text-4xl font-display font-bold mb-4 text-gradient-blue">
                    AI Chat Assistant
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                    Coming soon! Ask questions and get answers from your knowledge base.
                </p>
                <p className="text-gray-400">
                    Powered by Google Gemini with RAG technology for accurate, grounded responses.
                </p>
            </div>
        </div>
    );
}
