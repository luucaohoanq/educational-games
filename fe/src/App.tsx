import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Auth from "./components/Auth";
import GameList from "./components/GameList";
import Leaderboard from "./components/Leaderboard";
import BucketManager from "./components/BucketManager";

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUsername = localStorage.getItem("username");
    const savedUserId = localStorage.getItem("userId");
    if (savedUsername && savedUserId) {
      setUsername(savedUsername);
      setUserId(parseInt(savedUserId));
    }
  }, []);

  const handleAuthSuccess = (user: string, uid: number) => {
    setUsername(user);
    setUserId(uid);
  };

  const handleLogout = () => {
    setUsername(null);
    setUserId(null);
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  };

  if (!username) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-gray-800">
                  🎮 Game Store
                </h1>
                <div className="flex space-x-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-blue-500 font-semibold"
                  >
                    Games
                  </Link>
                  <Link
                    to="/leaderboard"
                    className="text-gray-600 hover:text-blue-500 font-semibold"
                  >
                    Leaderboard
                  </Link>
                  <Link
                    to="/buckets"
                    className="text-gray-600 hover:text-blue-500 font-semibold"
                  >
                    Buckets
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  👤 {username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<GameList username={username} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/buckets" element={<BucketManager />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
