import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/games";

interface Game {
  id: number;
  title: string;
  description: string;
  playUrl: string;
}

interface GameListProps {
  username: string;
}

export default function GameList({ username }: GameListProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await axios.get(API_URL);
      setGames(res.data);
    } catch (error) {
      console.error("Failed to load games", error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("desc", desc);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Game uploaded successfully!");
      fetchGames();
      setTitle("");
      setDesc("");
      setFile(null);
      setShowUpload(false);
    } catch (error) {
      alert("Upload failed");
    }
  };

  const handlePlay = async (game: Game) => {
    setSelectedGame(game);
    // Track play with random score for demo
    const randomScore = Math.floor(Math.random() * 1000);
    try {
      await axios.post(
        `${API_URL}/${game.id}/play?userId=${username}&score=${randomScore}`
      );
      console.log("Play tracked with score:", randomScore);
    } catch (e) {
      console.error("Tracking error", e);
    }
  };

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <button
          onClick={() => setSelectedGame(null)}
          className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          ⬅ Back to Games
        </button>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {selectedGame.title}
          </h2>
          <iframe
            src={selectedGame.playUrl}
            className="w-full h-[600px] border-2 border-gray-300 rounded-lg"
            title="Game Play"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">🎮 Games</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {showUpload ? "Cancel" : "➕ Upload Game"}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Upload New Game
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML File (from TurboWarp)
              </label>
              <input
                type="file"
                accept=".html"
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
            >
              Upload Game
            </button>
          </form>
        </div>
      )}

      {/* Game Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {game.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {game.description}
              </p>
              <button
                onClick={() => handlePlay(game)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg"
              >
                ▶ Play Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No games yet. Upload the first one!
        </div>
      )}
    </div>
  );
}
