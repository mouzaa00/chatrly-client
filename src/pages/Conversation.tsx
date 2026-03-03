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
  const nextCursorRef = useRef<string | null>(null);
  const initialLoadRef = useRef(true);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    async function fetchMessages() {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/conversations/${conversationId}/messages?limit=10`,
        );
        const { data, hasMore, nextCursor } = await res.json();
        const messages = data.reverse() as Message[];
        setMessages(messages);
        nextCursorRef.current = nextCursor;
        setHasMore(hasMore);
        // Scroll to bottom only on initial load
        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          0,
        );
        initialLoadRef.current = false;
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
      // auto-scroll to bottom when a new message is received
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        0,
      );
    };

    socket.on("chat message", handleMessage);

    return () => {
      socket.emit("leave conversation", conversationId);
      socket.off("chat message", handleMessage);
    };
  }, [conversationId]);

  async function handleFetchMoreMessages() {
    console.log(
      "Fetching more messages with nextCursor:",
      nextCursorRef.current,
    );
    if (!nextCursorRef.current || !hasMore || isFetching) return;

    try {
      setIsFetching(true);
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/conversations/${conversationId}/messages?limit=10&cursor=${nextCursorRef.current}`,
      );
      const { data, nextCursor, hasMore: more } = await res.json();
      const messages = data.reverse() as Message[];
      setMessages((prev) => [...messages, ...prev]);
      nextCursorRef.current = nextCursor;
      setHasMore(more);
    } catch {
      toast.error("Failed to load more messages");
    } finally {
      setIsFetching(false);
    }
  }

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

      // Optimistically add message to UI
      setMessages((prev) => [...prev, newMessage]);

      // auto-scroll to bottom when a new message is sent
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        0,
      );

      // Save message in Database
      fetchWithAuth(
        `${
          import.meta.env.VITE_API_DOMAIN
        }${import.meta.env.VITE_API_PATH}/conversations/${conversationId}/messages`,
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
    <main className="flex-1 p-6 flex justify-center">
      <div className="w-full flex flex-col h-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-4">
          {hasMore && (
            <div className="flex justify-center my-3">
              <button
                disabled={isFetching}
                className={`text-sm text-gray-500 px-3 py-1 rounded-full border border-gray-200 bg-white/0 shadow-sm hover:bg-gray-50 transition ${
                  isFetching ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleFetchMoreMessages}
              >
                {isFetching ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className="mb-4 space-y-1">
              <div className="space-x-2">
                <span className="font-medium text-gray-700">
                  {message.sender.name}
                </span>
                <time className="text-xs text-gray-500">
                  {format(parseISO(message.createdAt), "dd/MM/yy, hh:mm aa")}
                </time>
              </div>
              <p className="text-sm text-gray-800">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white font-medium transition-colors p-3 rounded-lg cursor-pointer hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
