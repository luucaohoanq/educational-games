import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import authService from "./services/authService";
import Auth from "./components/Auth";
import Leaderboard from "./components/Leaderboard";
import BucketManager from "./components/BucketManager";
import GameList from "./components/GameList";
import GameListNetflix from "./components/GameListNetflix";
import Switch from "./components/Switch";

function App() {
	const [username, setUsername] = useState<string | null>(null);
	const [userId, setUserId] = useState<number | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [theme, setTheme] = useState<"light" | "dark">("dark");

	useEffect(() => {
		// Check if user is already logged in
		const {
			username: savedUsername,
			userId: savedUserId,
			role: savedRole,
		} = authService.getStoredAuthData();
		if (savedUsername && savedUserId) {
			setUsername(savedUsername);
			setUserId(savedUserId);
			setRole(savedRole);
		}

		// Load saved theme preference
		const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
		if (savedTheme) {
			setTheme(savedTheme);
		}
	}, []);

	// Apply theme to document
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	const handleAuthSuccess = (user: string, uid: number, userRole: string) => {
		setUsername(user);
		setUserId(uid);
		setRole(userRole);
		authService.storeAuthData(user, uid, userRole);
	};

	const handleLogout = () => {
		setUsername(null);
		setUserId(null);
		setRole(null);
		authService.clearAuthData();
	};

	return (
		<BrowserRouter>
			<title>Authentication</title>
			<div className="min-h-screen bg-base-200">
				{/* Navigation */}
				<nav className="bg-base-100 shadow-lg">
					<div className="max-w-7xl mx-auto px-6 py-4">
						<div className="flex justify-between items-center">
							<div className="flex items-center space-x-8">
								<h1 className="text-2xl font-bold">Home</h1>
								<div className="flex space-x-4">
									<Link
										to="/"
										className="text-base-content/70 hover:text-primary font-semibold"
									>
										Games
									</Link>
									<Link
										to="/leaderboard"
										className="text-base-content/70 hover:text-primary font-semibold"
									>
										Leaderboard
									</Link>
									<Link
										to="/buckets"
										className="text-base-content/70 hover:text-primary font-semibold"
									>
										Buckets
									</Link>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<Switch theme={theme} onToggle={toggleTheme} />
								{username ? (
									<>
										<span className="font-medium">👤 {username}</span>
										<button
											onClick={handleLogout}
											className="btn btn-error btn-sm"
										>
											Logout
										</button>
									</>
								) : (
									<Link to="/login" className="btn btn-primary btn-sm">
										Login / Register
									</Link>
								)}
							</div>
						</div>
					</div>
				</nav>

				{/* Routes */}
				<Routes>
					<Route
						path="/"
						element={<GameListNetflix username={username} role={role} />}
					/>
					<Route path="/leaderboard" element={<Leaderboard />} />
					<Route path="/buckets" element={<BucketManager />} />
					<Route
						path="/login"
						element={
							username ? (
								<Navigate to="/" />
							) : (
								<Auth onSuccess={handleAuthSuccess} />
							)
						}
					/>
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
