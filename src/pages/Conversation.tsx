import { format, parseISO } from "date-fns";
import { useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "../utils/helpers";
import { io } from "socket.io-client";
import { Message } from "../utils/definitions";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const socket = io(import.meta.env.VITE_API_DOMAIN);

export default function ConversationPane() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    async function fetchMessages() {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/conversations/${conversationId}/messages`,
        );
        const { messages } = await res.json();
        setMessages(messages);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join conversation", conversationId);

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat message", handleMessage);

    return () => {
      socket.emit("leave conversation", conversationId);
      socket.off("chat message", handleMessage);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input && currentUser) {
      const newMessage: Message = {
        content: input,
        createdAt: new Date().toISOString(),
        conversationId: conversationId || "",
        sender: { ...currentUser },
      };

      socket.emit("chat message", newMessage);
      setInput("");

      // Save message in Database
      fetchWithAuth(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: input,
          }),
        },
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex-1">
      <div className="flex flex-col h-full p-4">
        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgb(220_220_220)_transparent] mb-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-2 space-y-1">
              <div className="space-x-2">
                <span className="font-medium">{message.sender.name}</span>
                <time className="text-xs text-neutral-700">
                  {format(parseISO(message.createdAt), "dd/MM/yy, hh:mm aa")}
                </time>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage}>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="bg-black text-white font-medium transition-colors p-3 rounded-lg cursor-pointer hover:bg-black/90"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
