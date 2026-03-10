import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Sparkles, Loader2, Bot } from "lucide-react";
import { useAppContext } from "../utils/AppContext";
import { GoogleGenAI, Type } from "@google/genai";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function JayQAssistant() {
  const { settings, setSettings } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm JayQ, your JQL expert. Ask me to find tickets, and I'll update your filters automatically.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not found. Please add it in Settings.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const tool = {
        functionDeclarations: [
          {
            name: "applyJqlFilter",
            description: "Applies a JQL query to the application filters",
            parameters: {
              type: Type.OBJECT,
              properties: {
                jql: {
                  type: Type.STRING,
                  description: "The valid JQL query string to apply",
                },
              },
              required: ["jql"],
            },
          },
        ],
      };

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: `You are JayQ, an expert in Jira Query Language (JQL). 
          Your goal is to help users construct valid JQL queries to filter their Jira tickets.
          
          You have access to a tool called 'applyJqlFilter' which takes a 'jql' string argument.
          
          When a user asks for tickets (e.g., "show me high priority bugs", "tickets assigned to me", "tickets updated last week"), 
          you MUST construct the appropriate JQL and call the 'applyJqlFilter' tool.
          
          Common JQL patterns:
          - "assigned to me": assignee = currentUser()
          - "high priority": priority = High
          - "bugs": issuetype = Bug
          - "open tickets": statusCategory != Done
          - "updated recently": updated >= -1w
          
          If the user's request is ambiguous, ask for clarification.
          If the user just wants to chat or ask about JQL syntax, answer them without calling the tool.
          
          Keep your text responses concise and helpful.`,
          tools: [tool],
        },
        history: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      });

      const result = await chat.sendMessage({ message: userMessage });
      const functionCalls = result.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === "applyJqlFilter") {
          const jql = call.args.jql as string;
          setSettings({ ...settings, jql });
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              text: `I've updated your filter with JQL: \`${jql}\``,
            },
          ]);
        }
      } else {
        const text = result.text;
        if (text) {
          setMessages((prev) => [...prev, { role: "model", text }]);
        }
      }
    } catch (error: any) {
      console.error("JayQ Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
          isOpen
            ? "bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 rotate-90"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        style={{ height: "500px", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">JayQ Assistant</h3>
            <p className="text-blue-100 text-xs">JQL Expert & Helper</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black/50 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask for tickets..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-zinc-950 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <Sparkles className="w-4 h-4 animate-pulse" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-zinc-600 mt-2">
            JayQ can modify your active filters.
          </p>
        </div>
      </div>
    </>
  );
}
