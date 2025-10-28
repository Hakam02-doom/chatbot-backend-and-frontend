import express from 'express';

const app = express();
const port = 3002;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Mihu AI - React Frontend</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        const { useState, useRef, useEffect } = React;

        function ChatMessage({ message, isUser, index }) {
            return (
                <div className={\`flex gap-4 mb-6 \${isUser ? 'flex-row-reverse' : 'flex-row'}\`}>
                    <div className={\`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center \${
                        isUser ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }\`}>
                        {isUser ? <span className="text-white font-semibold text-sm">U</span> : <div className="w-5 h-5 bg-white rounded-full" />}
                    </div>
                    <div className={\`px-6 py-4 rounded-2xl max-w-2xl \${
                        isUser ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30' : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30'
                    } backdrop-blur-sm\`}>
                        <p className="text-white leading-relaxed whitespace-pre-wrap">{message}</p>
                    </div>
                </div>
            );
        }

        function ChatInput({ onSendMessage }) {
            const [message, setMessage] = useState('');
            const textareaRef = useRef(null);

            const handleSubmit = (e) => {
                e.preventDefault();
                if (message.trim()) {
                    onSendMessage(message.trim());
                    setMessage('');
                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                    }
                }
            };

            const handleKeyDown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
            };

            useEffect(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = \`\${Math.min(textareaRef.current.scrollHeight, 120)}px\`;
                }
            }, [message]);

            return (
                <div className="relative z-10 p-6 bg-gradient-to-t from-gray-900/50 to-transparent backdrop-blur-sm border-t border-gray-800/50">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="flex items-end gap-4 p-4 rounded-2xl bg-gray-800/30 border border-gray-700/50 backdrop-blur-sm">
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything..."
                                    className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none outline-none min-h-[24px] max-h-[120px]"
                                    rows={1}
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className={\`px-6 py-3 rounded-2xl font-medium transition-all duration-200 \${
                                        message.trim() ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    }\`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        function Sidebar({ onNewChat }) {
            return (
                <aside className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800/50 flex flex-col">
                    <div className="p-6 border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">AI</span>
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Mihu AI</h2>
                                <p className="text-gray-400 text-sm">Conversation Partner</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={onNewChat}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </button>
                    </div>
                    <div className="flex-1 px-4 pb-4">
                        <div className="space-y-2">
                            {[
                                { icon: "🔍", label: "Search Chats" },
                                { icon: "📚", label: "Library" },
                                { icon: "📁", label: "Projects" },
                                { icon: "⚙️", label: "Settings" },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-left"
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-800/50">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-800/30">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">H</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium text-sm">Hakam Singh</p>
                                <p className="text-gray-400 text-xs">Free Plan</p>
                            </div>
                        </div>
                    </div>
                </aside>
            );
        }

        function App() {
            const [messages, setMessages] = useState([
                {
                    id: '1',
                    text: "Hello! I'm your AI assistant. How can I help you today?",
                    isUser: false,
                },
            ]);
            const [isTyping, setIsTyping] = useState(false);

            const handleSendMessage = async (text) => {
                const userMessage = {
                    id: Date.now().toString(),
                    text,
                    isUser: true,
                };
                setMessages((prev) => [...prev, userMessage]);
                setIsTyping(true);

                try {
                    const response = await fetch('http://localhost:3001/ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            message: text,
                            sessionId: 'react_frontend_session'
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }

                    const data = await response.json();
                    const aiMessage = {
                        id: (Date.now() + 1).toString(),
                        text: data.reply,
                        isUser: false,
                    };
                    setMessages((prev) => [...prev, aiMessage]);
                } catch (error) {
                    console.error('Error calling AI API:', error);
                    const errorMessage = {
                        id: (Date.now() + 1).toString(),
                        text: "Sorry, I'm having trouble connecting to the AI service. Please make sure the backend server is running on port 3001.",
                        isUser: false,
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                } finally {
                    setIsTyping(false);
                }
            };

            const handleNewChat = () => {
                setMessages([{
                    id: Date.now().toString(),
                    text: "New conversation started! How can I assist you?",
                    isUser: false,
                }]);
            };

            return (
                <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
                    <Sidebar onNewChat={handleNewChat} />
                    <div className="flex-1 flex flex-col relative">
                        <div className="relative z-10 px-8 py-6 bg-gradient-to-b from-gray-900/50 to-transparent backdrop-blur-sm border-b border-gray-800/50">
                            <h1 className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                Mihu AI
                            </h1>
                            <p className="text-gray-500 mt-1">Your intelligent conversation partner</p>
                        </div>
                        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
                            <div className="max-w-4xl mx-auto">
                                {messages.map((message, index) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message.text}
                                        isUser={message.isUser}
                                        index={index}
                                    />
                                ))}
                                {isTyping && (
                                    <div className="flex gap-4 mb-6">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-blue-400 flex items-center justify-center">
                                            <div className="w-5 h-5 bg-white rounded-full" />
                                        </div>
                                        <div className="px-6 py-2 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 backdrop-blur-sm">
                                            <div className="flex items-center gap-1">
                                                {[0, 1, 2].map((i) => (
                                                    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: \`\${i * 0.2}s\`}} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <ChatInput onSendMessage={handleSendMessage} />
                    </div>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
      </script>
    </body>
    </html>
  `);
});

app.post('/ai', async (req, res) => {
  const { message, sessionId = 'default_session' } = req.body;
  
  // Simple mock response for testing
  const mockResponse = `Hello! I received your message: "${message}". This is a test response from the simple server.`;
  
  res.json({ reply: mockResponse });
});

app.listen(port, () => {
  console.log(`Simple server listening on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser`);
});
