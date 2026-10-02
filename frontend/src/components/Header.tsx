import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const [token] = useState<string | null>(
    localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
        <Link to="/" className="text-xl font-bold text-primary-700">
          GapFit AI
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-primary-600 transition"
          >
            Home
          </Link>
          {token ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}