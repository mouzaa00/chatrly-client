import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/helpers";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { User } from "../utils/definitions";

export default function Friends() {
  const [friends, setFriends] = useState<User[]>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchFriends() {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/friends`,
      );
      const data = await res.json();
      setFriends(data.friends);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteFriend(id: string) {
    // Optimistically remove the record from state
    setFriends((prevFriends) =>
      prevFriends?.filter((friend) => friend.id !== id),
    );

    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/friends/${id}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return toast.error(error.message);
    }

    const data = await res.json();
    toast.success(data.message);

    fetchFriends();
  }

  async function getOrCreateConversation(recipientId: string) {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId,
          }),
        },
      );

      const { conversation } = await res.json();
      navigate(`/conversations/${conversation.id}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }

  useEffect(() => {
    fetchFriends();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="p-6 flex justify-center">
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          All Friends ({friends?.length ?? 0})
        </h1>
        <div className="space-y-2">
          {friends &&
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex justify-between items-center p-3 hover:bg-gray-100 transition rounded-lg border border-gray-200"
              >
                <span className="font-medium text-gray-700">{friend.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => getOrCreateConversation(friend.id)}
                    className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded transition"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => handleDeleteFriend(friend.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
