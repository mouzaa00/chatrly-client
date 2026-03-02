import { ChevronsUpDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "../utils/helpers";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { User } from "../utils/definitions";

export default function Modal(props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [friends, setFriends] = useState<User[]>();
  const [recipientId, setRecipientId] = useState<string>();
  const navigate = useNavigate();

  console.log("Modal rendered with isOpen:", props.isOpen);

  async function createConversationHandle() {
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      const { conversation } = await res.json();
      navigate(`/conversations/${conversation.id}`);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      props.setIsOpen(false);
      ref.current?.close();
    }
  }

  useEffect(() => {
    if (props.isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }

    async function fetchFriends() {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/friends`,
        );
        const { friends } = await res.json();
        setFriends(friends);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    }

    fetchFriends();
  }, [props.isOpen]);

  return (
    <div>
      <dialog
        ref={ref}
        id="modal"
        className="fixed inset-1/2 -translate-1/2 w-lg flex items-center justify-center backdrop-blur-sm rounded-2xl shadow-xl [not([open])]:hidden"
        onCancel={(e) => {
          e.preventDefault();
          props.setIsOpen(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            ref.current?.close();
            props.setIsOpen(false);
          }
        }}
      >
        <div className="w-full bg-white/90 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Send a message
            </h3>
            <button
              onClick={() => {
                ref.current?.close();
                props.setIsOpen(false);
              }}
              className="p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {friends && friends.length !== 0 ? (
            <form className="mt-4 space-y-4">
              <p className="text-gray-600">
                Choose a user to start a conversation
              </p>

              <div>
                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-gray-700"
                >
                  Friend
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    name="user"
                    id="user"
                    className="block w-full appearance-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    defaultValue="none"
                    onChange={(e) => setRecipientId(e.target.value)}
                  >
                    <option value="none" disabled>
                      Select a friend
                    </option>
                    {friends.map((friend) => (
                      <option key={friend.id} value={friend.id}>
                        {friend.name}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="w-5 h-5 absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                onClick={createConversationHandle}
              >
                Send
              </button>
            </form>
          ) : (
            <p className="mt-4 text-red-600">
              You need to add friends before you can message someone.
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
