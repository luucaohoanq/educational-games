import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

interface LeaderboardEntry {
	userId: number;
	username: string;
	totalScore: number;
	gamesPlayed: number;
}

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		fetchLeaderboard();
	}, []);

	const fetchLeaderboard = async () => {
		try {
			const res = await axios.get(`${API_URL}/leaderboard`);
			console.log("Leaderboard API response:", res.data);
			console.log("First entry:", res.data[0]);
			setLeaderboard(res.data);
		} catch (error) {
			console.error("Failed to load leaderboard", error);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h2 className="text-3xl font-bold text-gray-800 mb-6">🏆 Leaderboard</h2>

			<div className="bg-white rounded-lg shadow-lg overflow-hidden">
				<table className="w-full">
					<thead className="bg-gradient-to-r from-yellow-400 to-yellow-500">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Rank
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Player
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Total Score
							</th>
							<th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
								Games Played
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{leaderboard.map((entry, index) => (
							<tr
								key={entry.userId}
								className={`hover:bg-gray-50 transition-colors ${
									index === 0 ? "bg-yellow-50" : ""
								}`}
							>
								<td className="px-6 py-4 text-lg font-bold text-gray-700">
									{index === 0 && "🥇"}
									{index === 1 && "🥈"}
									{index === 2 && "🥉"}
									{index > 2 && `#${index + 1}`}
								</td>
								<td className="px-6 py-4">
									<button
										onClick={() => navigate(`/student/${entry.userId}`)}
										className="text-gray-800 font-medium hover:text-blue-600 hover:underline transition-colors"
									>
										{entry.username}
									</button>
								</td>
								<td className="px-6 py-4 text-gray-800 font-semibold">
									{entry.totalScore.toLocaleString()}
								</td>
								<td className="px-6 py-4 text-gray-600">{entry.gamesPlayed}</td>
							</tr>
						))}
					</tbody>
				</table>

				{leaderboard.length === 0 && (
					<div className="text-center py-12 text-gray-500">
						No players yet. Be the first to play!
					</div>
				)}
			</div>
		</div>
	);
}
