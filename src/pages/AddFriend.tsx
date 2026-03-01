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
    <main className="p-4">
      <p className="text-base uppercase">Add Friend</p>
      <p className="text-neutral-700">You can add friends with their email</p>
      <p className="h-3 m-0 text-sm text-red-600 mt-1">
        {errors.root
          ? errors.root.message
          : errors.email
            ? errors.email.message
            : ""}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex gap-2">
        <input
          type="email"
          {...register("email")}
          placeholder="You can add friends with their email"
          className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500 text-sm"
        />
        <button
          type="submit"
          className="bg-green-500 text-white text-sm font-medium transition-colors px-3 py-2 rounded cursor-pointer hover:bg-green-500/80"
        >
          Send Friend Request
        </button>
      </form>
    </main>
  );
}
