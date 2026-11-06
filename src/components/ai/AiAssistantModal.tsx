import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, User, RefreshCw, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { aiService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [modelName, setModelName] = useState<string>("Groq AI");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getGreeting = () => {
    return isAdmin
      ? `Hello **${user?.name || "Admin"}**! I am your **DeadlineHub AI Copilot** with real-time access to team tasks, Jira ticket references, deadlines, and review queues in PostgreSQL.\n\nHow can I help coordinate your team today?`
      : `Hello **${user?.name || "there"}**! I am your **DeadlineHub AI Copilot** with real-time access to your personal PostgreSQL task assignments, upcoming deadlines, and Jira tickets.\n\nAsk me anything about your current workload, pending deliverables, or deadlines!`;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: getGreeting() }]);
    }
  }, [isOpen, isAdmin, user, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const quickPrompts = isAdmin
    ? [
        "Show all team tasks",
        "What tasks are currently overdue?",
        "Which tasks are waiting for review?",
        "Give me a workload summary",
      ]
    : [
        "Show me all my tasks",
        "What is my next deadline?",
        "Which tasks are pending?",
        "Which tasks are overdue?",
        "What is my progress?",
      ];

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: prompt },
    ];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const response = await aiService.chat(prompt, newMessages);
      if (response.data) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: response.data.reply },
        ]);
        if (response.data.model) {
          setModelName(
            response.data.model === "task-assistant"
              ? "Database Copilot"
              : response.data.model
          );
        }
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            err.response?.data?.message ||
            "Sorry, I encountered an issue retrieving real-time task records. Please verify the backend connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([{ role: "assistant", content: getGreeting() }]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl h-[660px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-copilot-title"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-copilot-title" className="font-semibold text-sm leading-tight text-white">
                  DeadlineHub AI Copilot
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-400/30">
                  {modelName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to real PostgreSQL database records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="Reset conversation"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/60">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.role === "user"
                    ? "bg-slate-900 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                }`}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <div className="prose prose-xs max-w-none text-slate-800 space-y-2 leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-900">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-700">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 space-y-1 mb-2 text-slate-700">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-snug">{children}</li>,
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mt-3 mb-1.5 border-b border-slate-100 pb-1">
                            {children}
                          </h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-xs font-semibold text-slate-800 mt-2 mb-1">
                            {children}
                          </h4>
                        ),
                        code: ({ children }) => (
                          <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                            {children}
                          </code>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline font-medium hover:bg-blue-50 px-1 py-0.5 rounded transition-colors"
                          >
                            <span>{children}</span>
                            <ExternalLink className="w-3 h-3 inline shrink-0" />
                          </a>
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-[11px] text-slate-600 font-medium ml-1">
                  Querying live PostgreSQL database records...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Multiline Input Footer with Enter to Send / Shift+Enter for newline */}
        <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about tasks, deadlines, priorities... (Enter to send, Shift+Enter for new line)"
                disabled={isLoading}
                className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 leading-relaxed resize-none max-h-32"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
