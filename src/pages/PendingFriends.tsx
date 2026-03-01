import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/helpers";
import { toast } from "react-toastify";
import { User } from "../utils/definitions";

interface FriendRequest {
  id: string;
  user: User;
}

export default function PendingFriends() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>();
  const [isLoading, setIsLoading] = useState(true);

  async function fetchFriendRequests() {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/friend-requests?type=received`,
      );
      const { friendRequests } = await res.json();
      setFriendRequests(friendRequests);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function updateFriendRequest(
    friendRequestId: string,
    status: "accepted" | "rejected" | "pending",
  ) {
    try {
      const res = await fetchWithAuth(
        `${
          import.meta.env.VITE_API_DOMAIN
        }${import.meta.env.VITE_API_PATH}/friend-requests/${friendRequestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message);
      }

      const data = await res.json();
      toast.success(data.message);

      fetchFriendRequests();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  }

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="p-4">
      <span className="text-base uppercase">
        all friends requests - {friendRequests && friendRequests.length}
      </span>
      <div className="mt-2">
        {friendRequests &&
          friendRequests.map((friendRequest) => (
            <div
              key={friendRequest.id}
              className="flex justify-between p-2 hover:bg-neutral-200 transition rounded cursor-pointer border-t border-neutral-400"
            >
              <span>{friendRequest.user.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateFriendRequest(friendRequest.id, "accepted")
                  }
                  className="px-2 py-1 cursor-pointer text-sm hover:bg-neutral-700 hover:text-white rounded transition"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    updateFriendRequest(friendRequest.id, "rejected")
                  }
                  className="px-2 py-1 cursor-pointer text-sm text-red-700 hover:bg-red-700 hover:text-white rounded transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
