import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";

const registerFormSchema = z.object({
  email: z
    .string()
    .nonempty("Email Address is required")
    .email("Not a valid Email Address"),
  firstName: z.string().nonempty("First Name is required"),
  lastName: z.string().nonempty("Last Name is required"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Password must contian 8 characters"),
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    setError,
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
  });
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const onSubmit: SubmitHandler<RegisterFormInput> = async (data) => {
    try {
      const { firstName, lastName, ...rest } = data;
      const newData = {
        name: `${firstName} ${lastName}`,
        ...rest,
      };
      await registerUser(newData);
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError("root", {
          type: "validate",
          message: err.message,
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-10">
        <h1 className="text-center text-3xl font-semibold text-gray-800 mb-6">
          Create an account
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                autoComplete="email"
                className={`block w-full pr-10 px-3 py-3 text-base border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 rounded-md`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="firstName"
                  type="text"
                  className={`block w-full pr-10 px-3 py-3 text-base border ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } focus:ring-indigo-500 focus:border-indigo-500 rounded-md`}
                  {...register("firstName")}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="lastName"
                  type="text"
                  className={`block w-full pr-10 px-3 py-3 text-base border ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } focus:ring-indigo-500 focus:border-indigo-500 rounded-md`}
                  {...register("lastName")}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`block w-full pr-10 px-3 py-3 text-base border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 rounded-md`}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:cursor-pointer text-base transition-colors"
          >
            {isLoading ? "Loading.." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
