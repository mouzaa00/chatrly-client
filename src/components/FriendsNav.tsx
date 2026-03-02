import { Link, Outlet, useLocation } from "react-router";

export default function FriendsNav() {
  const location = useLocation();

  return (
    <div className="flex-1">
      <nav className="flex space-x-4 border-b border-gray-200 px-6 py-3">
        <Link
          to="friends"
          className={`font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${
            location.pathname === "/friends"
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          All
        </Link>
        <Link
          to="friends/pending"
          className={`font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${
            location.pathname === "/friends/pending"
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Pending
        </Link>
        <Link
          to="friends/add"
          className={`font-medium px-3 py-2 rounded-lg transition-colors duration-150 ${
            location.pathname === "/friends/add"
              ? "bg-indigo-600 text-white"
              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          }`}
        >
          Add Friend
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}
