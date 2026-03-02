import { fetchWithAuth } from "../utils/helpers";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

const addFriendSchema = z.object({
  email: z
    .string()
    .nonempty("Email Address is required")
    .email("Not a valid Email Address"),
});

type AddFriendInput = z.infer<typeof addFriendSchema>;

export default function AddFriend() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<AddFriendInput>({
    resolver: zodResolver(addFriendSchema),
  });

  const onSubmit: SubmitHandler<AddFriendInput> = async (data) => {
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_DOMAIN}${import.meta.env.VITE_API_PATH}/friend-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      setError("root", {
        type: "validate",
        message: error.message,
      });
      return;
    }

    // clears the form and shows a toast
    reset();
    toast.success("Friend request sent!");
  };

  return (
    <main className="p-6 flex justify-center">
      <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Add Friend
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <p className="text-sm text-red-600 text-center">
              {errors.root.message}
            </p>
          )}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="email"
                type="email"
                {...register("email")}
                autoComplete="email"
                placeholder="friend@example.com"
                className={`block w-full pr-10 px-3 py-3 text-base border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 rounded-md`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:cursor-pointer text-base transition-colors"
          >
            Send Friend Request
          </button>
        </form>
      </div>
    </main>
  );
}
