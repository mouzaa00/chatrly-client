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
    <main className="p-4">
      <span className="text-base uppercase">
        all friends - {friends && friends.length}
      </span>
      <div className="mt-2">
        {friends &&
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex justify-between p-2 hover:bg-neutral-200 transition rounded cursor-pointer border-t border-neutral-400"
            >
              <span>{friend.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => getOrCreateConversation(friend.id)}
                  className="px-2 py-1 cursor-pointer text-sm hover:bg-neutral-700 hover:text-white rounded transition"
                >
                  Message
                </button>
                <button
                  onClick={() => handleDeleteFriend(friend.id)}
                  className="px-2 py-1 cursor-pointer text-sm text-red-700 hover:bg-red-700 hover:text-white rounded transition"
                >
                  Remove Friend
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
