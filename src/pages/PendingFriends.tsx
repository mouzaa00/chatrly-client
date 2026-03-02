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
    <main className="p-6 flex justify-center">
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Pending Requests ({friendRequests?.length ?? 0})
        </h1>
        <div className="space-y-2">
          {friendRequests &&
            friendRequests.map((friendRequest) => (
              <div
                key={friendRequest.id}
                className="flex justify-between items-center p-3 hover:bg-gray-100 transition rounded-lg border border-gray-200"
              >
                <span className="font-medium text-gray-700">
                  {friendRequest.user.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateFriendRequest(friendRequest.id, "accepted")
                    }
                    className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      updateFriendRequest(friendRequest.id, "rejected")
                    }
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
