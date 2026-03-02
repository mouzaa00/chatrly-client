import { LogOut, MessageCircle, Plus, User as UserIcon } from "lucide-react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/helpers";
import Modal from "./Modal";
import { ToastContainer } from "react-toastify";
import { Conversation } from "../utils/definitions";
import { useAuth } from "../hooks/useAuth";

export default function SidebarLayout() {
  const [conversations, setConversations] = useState<Conversation[]>();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const location = useLocation();
  const { currentUser, loading, logout } = useAuth();

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/conversations`,
        );
        const { conversations } = await res.json();

        setConversations(conversations);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    }

    fetchConversations();
  }, [location]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-dvh text-gray-900">
      <nav className="bg-white text-gray-900 flex flex-col h-full w-72 shadow border-r border-gray-200">
        {/* brand / logo area */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600">
            Chatrly
          </h1>
        </div>

        {/* friends link */}
        <div className="mt-6">
          <Link
            to="friends"
            className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-colors duration-150 ${
              location.pathname.includes("friends")
                ? "bg-indigo-50"
                : "hover:bg-gray-100"
            }`}
          >
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-semibold">Friends</span>
          </Link>
        </div>

        {/* direct messages heading */}
        <div className="mt-8 px-6">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
            <span>Direct Messages</span>
            <button
              onClick={() => setIsOpenModal(true)}
              className="p-1 rounded-full hover:bg-gray-100 transition"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* conversation list */}
        <div className="mt-2 px-3 pt-2 flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {conversations && currentUser && (
            <Peers conversations={conversations} userId={currentUser.id} />
          )}
        </div>

        {/* profile / logout */}
        <div className="mt-auto border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium truncate">
                {currentUser?.name}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>
      <Outlet />
      {isOpenModal && <Modal isOpen={isOpenModal} setIsOpen={setIsOpenModal} />}
      <ToastContainer />
    </div>
  );
}

function Peers(props: { conversations: Conversation[]; userId: string }) {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  return props.conversations.map((conversation) => (
    <button
      onClick={() => navigate(`/conversations/${conversation.id}`)}
      key={conversation.id}
      className={`w-full text-left flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-150 ${
        conversation.id === conversationId
          ? "bg-indigo-50"
          : "hover:bg-gray-100"
      }`}
    >
      <MessageCircle className="w-5 h-5 text-gray-600" />
      <span className="truncate">
        {conversation.creator.id === props.userId
          ? conversation.recipient.name
          : conversation.creator.name}
      </span>
    </button>
  ));
}
