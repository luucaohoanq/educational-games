import { Eye, Heart, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Comment, Game, GameCategory } from "../services/gameService";
import gameService from "../services/gameService";

interface GameListProps {
	username: string | null;
	role: string | null;
}

export default function GameList({ username, role }: GameListProps) {
	const [games, setGames] = useState<Game[]>([]);
	const [categories, setCategories] = useState<GameCategory[]>([]);
	const [selectedGame, setSelectedGame] = useState<Game | null>(null);
	const [detailGame, setDetailGame] = useState<Game | null>(null);

	// State for Upload Form
	const [title, setTitle] = useState("");
	const [desc, setDesc] = useState("");
	const [instructions, setInstructions] = useState("");
	const [categoryId, setCategoryId] = useState<number | null>(null);
	const [thumbnailUrl, setThumbnailUrl] = useState("");
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [showUpload, setShowUpload] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	// State for Fullscreen
	const [isFullscreen, setIsFullscreen] = useState(false);
	const gameContainerRef = useRef<HTMLDivElement>(null);

	// State for Detail View
	const [comments, setComments] = useState<Comment[]>([]);
	const [commentText, setCommentText] = useState("");
	const [replyTo, setReplyTo] = useState<number | null>(null);
	const [replyText, setReplyText] = useState("");
	const [isLiked, setIsLiked] = useState(false);

	useEffect(() => {
		fetchGames();
		fetchCategories();

		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};
		document.addEventListener("fullscreenchange", handleFullscreenChange);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	useEffect(() => {
		const preventDefaultScroll = (e: KeyboardEvent) => {
			if (
				selectedGame &&
				["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
					e.code,
				)
			) {
				e.preventDefault();
			}
		};

		window.addEventListener("keydown", preventDefaultScroll);
		return () => {
			window.removeEventListener("keydown", preventDefaultScroll);
		};
	}, [selectedGame]);

	const fetchGames = async () => {
		try {
			const data = await gameService.getAllGames();
			setGames(data);
		} catch (error) {
			console.error("Failed to load games", error);
		}
	};

	const fetchCategories = async () => {
		try {
			const data = await gameService.getAllCategories();
			setCategories(data);
		} catch (error) {
			console.error("Failed to load categories", error);
		}
	};

	const handleUpload = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) return alert("Please select a file!");
		if (!categoryId) return alert("Please select a category!");
		if (!username) return alert("Please login to upload!");

		const formData = new FormData();
		formData.append("file", file);
		formData.append("title", title);
		formData.append("desc", desc);
		formData.append("instructions", instructions);
		formData.append("categoryId", categoryId.toString());
		formData.append("username", username);

		if (thumbnailFile) {
			formData.append("thumbnailFile", thumbnailFile);
		} else if (thumbnailUrl) {
			formData.append("thumbnailUrl", thumbnailUrl);
		}

		try {
			await gameService.uploadGame(formData);
			alert("Game uploaded successfully!");
			fetchGames();
			// Reset form
			setTitle("");
			setDesc("");
			setInstructions("");
			setCategoryId(null);
			setThumbnailUrl("");
			setThumbnailFile(null);
			setFile(null);
			setShowUpload(false);
		} catch (error) {
			alert("Upload failed");
		}
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles && droppedFiles.length > 0) {
			const droppedFile = droppedFiles[0];
			const fileExtension = droppedFile.name.split(".").pop()?.toLowerCase();
			if (fileExtension === "html" || fileExtension === "zip") {
				setFile(droppedFile);
			} else {
				alert("Please upload only .html or .zip files");
			}
		}
	};

	const handlePlay = async (game: Game) => {
		setSelectedGame(game);
		setIsFullscreen(false);
		if (username) {
			const randomScore = Math.floor(Math.random() * 1000);
			try {
				await gameService.trackPlay(game.id, username, randomScore);
				console.log("Play tracked with score:", randomScore);
			} catch (e) {
				console.error("Tracking error", e);
			}
		}
	};

	const handleShowDetail = async (game: Game) => {
		try {
			const gameData = await gameService.getGameById(game.id);
			setDetailGame(gameData);

			const commentsData = await gameService.getComments(game.id);
			setComments(commentsData);

			if (username) {
				const likeStatus = await gameService.checkLikeStatus(game.id, username);
				setIsLiked(likeStatus);
			} else {
				setIsLiked(false);
			}
		} catch (e) {
			console.error("Failed to load game details", e);
		}
	};

	const handleDeleteGame = async (gameId: number) => {
		if (!username || role !== "ADMIN") {
			alert("Only admins can delete games!");
			return;
		}

		if (
			!confirm(
				"Are you sure you want to delete this game? This action cannot be undone.",
			)
		) {
			return;
		}

		try {
			await gameService.deleteGame(gameId, username);
			alert("Game deleted successfully!");
			setDetailGame(null);
			fetchGames();
		} catch (error) {
			alert("Failed to delete game");
			console.error(error);
		}
	};

	const handleLike = async () => {
		if (!username) {
			alert("Please login to like games!");
			return;
		}
		if (!detailGame) return;
		try {
			const response = await gameService.toggleLike(detailGame.id, username);
			setDetailGame({ ...detailGame, likes: response.totalLikes });
			setIsLiked(response.isLiked);
		} catch (e) {
			console.error("Failed to like", e);
		}
	};

	const handleAddComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username) {
			alert("Please login to comment!");
			return;
		}
		if (!detailGame || !commentText.trim()) return;

		try {
			await gameService.addComment({
				gameId: detailGame.id,
				username: username,
				content: commentText,
				parentCommentId: null,
			});
			setCommentText("");
			const commentsData = await gameService.getComments(detailGame.id);
			setComments(commentsData);
		} catch (e) {
			console.error("Failed to add comment", e);
		}
	};

	const handleAddReply = async (parentId: number) => {
		if (!username) {
			alert("Please login to reply!");
			return;
		}
		if (!detailGame || !replyText.trim()) return;

		try {
			await gameService.addComment({
				gameId: detailGame.id,
				username: username,
				content: replyText,
				parentCommentId: parentId,
			});
			setReplyText("");
			setReplyTo(null);
			const commentsData = await gameService.getComments(detailGame.id);
			setComments(commentsData);
		} catch (e) {
			console.error("Failed to add reply", e);
		}
	};

	const toggleFullscreen = () => {
		if (!gameContainerRef.current) return;

		if (!document.fullscreenElement) {
			gameContainerRef.current.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	};

	// --- VIEW: Playing Game Screen ---
	if (selectedGame) {
		return (
			<div className="fixed inset-0 z-50 bg-gray-900 flex flex-col overflow-hidden">
				<div className="bg-gray-800 text-white p-3 flex justify-between items-center shadow-md z-10">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setSelectedGame(null)}
							className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-colors"
						>
							⬅ Back
						</button>
						<h2 className="font-bold text-lg truncate">{selectedGame.title}</h2>
					</div>

					<button
						onClick={toggleFullscreen}
						className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-sm font-bold transition-colors"
					>
						{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
					</button>
				</div>

				<div className="flex-1 relative bg-black w-full h-full flex justify-center items-center">
					<div className="w-full h-full relative">
						<iframe
							ref={gameContainerRef as any}
							src={selectedGame.playUrl}
							className="absolute inset-0 w-full h-full border-none"
							title="Game Play"
							onLoad={(e) => e.currentTarget.focus()}
						/>
					</div>
				</div>
			</div>
		);
	}

	// --- VIEW: Detail Page (Scratch-styled) ---
	if (detailGame) {
		const topLevelComments = comments.filter((c) => !c.parentCommentId);
		const getReplies = (parentId: number) =>
			comments.filter((c) => c.parentCommentId === parentId);

		return (
			<div className="min-h-screen bg-[#e9f1fc]">
				{/* Scratch-style Header */}
				<div className="bg-[#4c97ff] text-white shadow-md">
					<div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center gap-4">
						<button
							onClick={() => setDetailGame(null)}
							className="bg-[#3373cc] hover:bg-[#2e69b8] px-4 py-2 rounded-md font-semibold transition-colors text-sm"
						>
							← Back
						</button>
						<h1 className="text-xl font-bold">{detailGame.title}</h1>
					</div>
				</div>

				<div className="max-w-[1200px] mx-auto px-4 py-8">
					<div className="w-full mx-auto px-4 py-8">
						<div className="grid lg:grid-cols-[minmax(0,960px)_380px] gap-6">
							{/* Left Column - Game & Info */}
							<div className="space-y-6">
								{/* Game Player */}
								<div className="bg-white rounded-lg border border-[#d9e3f1] shadow-sm overflow-hidden">
									<div className="aspect-[4/3] bg-white flex items-center justify-center relative">
										<iframe
											src={detailGame.playUrl}
											className="w-full h-full border-none"
											title="Game Preview"
										/>
									</div>

									<div className="p-5 border-t border-[#d9e3f1]">
										<div className="flex items-center gap-3">
											<button
												onClick={() => setSelectedGame(detailGame)}
												className="flex-1 bg-[#4c97ff] hover:bg-[#3373cc] text-white font-bold py-3 px-6 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
											>
												<span className="text-lg">▶</span>
												<span>See inside</span>
											</button>

											<button
												onClick={handleLike}
												className={`px-6 py-3 rounded-md font-bold transition-all flex items-center gap-2 text-sm ${
													isLiked
														? "bg-[#ff6680] hover:bg-[#ff4d6a] text-white"
														: "bg-white hover:bg-[#f7f9fc] text-[#575e75] border border-[#d9e3f1]"
												}`}
											>
												<Heart
													className={`w-5 h-5 ${isLiked ? "fill-white" : ""}`}
												/>
												<span>{detailGame.likes || 0}</span>
											</button>

											<button className="bg-white hover:bg-[#f7f9fc] text-[#575e75] border border-[#d9e3f1] px-6 py-3 rounded-md font-bold transition-colors text-sm flex items-center gap-2">
												<Eye className="w-5 h-5" />
												<span>{detailGame.views || 0}</span>
											</button>

											{role === "ADMIN" && (
												<button
													onClick={() => handleDeleteGame(detailGame.id)}
													className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md font-bold transition-colors text-sm flex items-center gap-2"
												>
													🗑️ Delete
												</button>
											)}
										</div>
									</div>
								</div>

								{/* Project Stats */}
								<div className="bg-white rounded-lg border border-[#d9e3f1] shadow-sm p-5">
									<h3 className="text-sm font-bold text-[#575e75] mb-3">
										Project Stats
									</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm text-[#8fa1b3]">Views</span>
											<span className="text-sm font-bold text-[#575e75]">
												{detailGame.views || 0}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-[#8fa1b3]">Loves</span>
											<span className="text-sm font-bold text-[#575e75]">
												{detailGame.likes || 0}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-[#8fa1b3]">
												Date Shared
											</span>
											<span className="text-sm font-bold text-[#575e75]">
												{detailGame.dateAdded
													? new Date(detailGame.dateAdded).toLocaleDateString(
															"en-US",
															{
																month: "short",
																day: "numeric",
																year: "numeric",
															},
														)
													: "Unknown"}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Right Sidebar - Instructions */}
							<div className="space-y-6">
								<div className="bg-white rounded-lg border border-[#d9e3f1] shadow-sm p-6">
									<h2 className="text-lg font-bold text-[#575e75] mb-3">
										Instructions
									</h2>
									<div className="text-[#575e75] text-sm leading-relaxed whitespace-pre-wrap">
										{detailGame.description ||
											detailGame.instructions ||
											"Use arrow keys to move around. Have fun playing!"}
									</div>
								</div>
							</div>
						</div>

						{/* Comments and More Games - Side by Side */}
						<div className="mt-6 grid lg:grid-cols-[minmax(0,900px)_260px] gap-6">
							{/* Comments Section - Scratch Style */}
							<div>
								<div className="bg-white rounded-lg border border-[#d9e3f1] shadow-sm p-6">
									<h2 className="text-lg font-bold text-[#575e75] mb-4 flex items-center gap-2">
										<MessageCircle className="w-5 h-5" />
										Comments ({comments.length})
									</h2>

									{/* Add Comment */}
									{username ? (
										<div className="mb-6 bg-[#f7f9fc] rounded-lg p-4 border border-[#d9e3f1]">
											<div className="flex gap-3">
												<div className="w-10 h-10 rounded-full bg-[#4c97ff] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
													{username.charAt(0).toUpperCase()}
												</div>
												<div className="flex-1">
													<textarea
														value={commentText}
														onChange={(e) => setCommentText(e.target.value)}
														placeholder="Add your thoughts..."
														className="w-full px-4 py-3 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] resize-none text-sm bg-white"
														rows={3}
													/>
													<div className="flex gap-2 mt-2">
														<button
															onClick={handleAddComment}
															className="bg-[#4c97ff] hover:bg-[#3373cc] text-white font-bold px-5 py-2 rounded-md transition-colors text-sm"
														>
															Post
														</button>
														<button
															onClick={() => setCommentText("")}
															className="bg-white hover:bg-[#f7f9fc] text-[#575e75] border border-[#d9e3f1] font-bold px-5 py-2 rounded-md transition-colors text-sm"
														>
															Cancel
														</button>
													</div>
												</div>
											</div>
										</div>
									) : (
										<div className="mb-6 bg-[#f7f9fc] border border-[#d9e3f1] rounded-lg p-6 text-center">
											<p className="text-[#575e75] font-semibold mb-3">
												Please sign in to comment
											</p>
											<a
												href="/login"
												className="inline-block bg-[#4c97ff] hover:bg-[#3373cc] text-white font-bold px-6 py-2 rounded-md transition-colors text-sm"
											>
												Sign in
											</a>
										</div>
									)}

									{/* Comments List */}
									<div className="space-y-4">
										{topLevelComments.map((comment) => (
											<div
												key={comment.id}
												className="border-l-4 border-[#4c97ff] pl-4"
											>
												<div className="bg-[#f7f9fc] rounded-lg p-4">
													<div className="flex items-start gap-3 mb-2">
														<div className="w-10 h-10 rounded-full bg-[#ffab19] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
															{comment.username.charAt(0).toUpperCase()}
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<p className="font-bold text-[#575e75] text-sm">
																	{comment.username}
																</p>
																<span className="text-xs text-[#8fa1b3]">
																	{new Date(
																		comment.datePosted,
																	).toLocaleDateString()}
																</span>
															</div>
															<p className="text-[#575e75] text-sm leading-relaxed">
																{comment.content}
															</p>

															{username && (
																<button
																	onClick={() => setReplyTo(comment.id)}
																	className="text-xs font-bold text-[#4c97ff] hover:text-[#3373cc] mt-2"
																>
																	Reply
																</button>
															)}
														</div>
													</div>

													{/* Reply Form */}
													{replyTo === comment.id && username && (
														<div className="mt-3 ml-13 bg-white rounded-lg p-3 border border-[#d9e3f1]">
															<textarea
																value={replyText}
																onChange={(e) => setReplyText(e.target.value)}
																placeholder="Write a reply..."
																className="w-full px-3 py-2 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] resize-none text-sm"
																rows={2}
															/>
															<div className="flex gap-2 mt-2">
																<button
																	onClick={() => handleAddReply(comment.id)}
																	className="bg-[#4c97ff] hover:bg-[#3373cc] text-white text-xs font-bold px-4 py-1.5 rounded-md transition-colors"
																>
																	Post
																</button>
																<button
																	onClick={() => {
																		setReplyTo(null);
																		setReplyText("");
																	}}
																	className="bg-white hover:bg-[#f7f9fc] text-[#575e75] border border-[#d9e3f1] text-xs font-bold px-4 py-1.5 rounded-md transition-colors"
																>
																	Cancel
																</button>
															</div>
														</div>
													)}

													{/* Replies */}
													{getReplies(comment.id).map((reply) => (
														<div
															key={reply.id}
															className="mt-3 ml-13 bg-white rounded-lg p-3 border border-[#d9e3f1]"
														>
															<div className="flex items-start gap-3">
																<div className="w-8 h-8 rounded-full bg-[#0fbd8c] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
																	{reply.username.charAt(0).toUpperCase()}
																</div>
																<div className="flex-1 min-w-0">
																	<div className="flex items-center gap-2 mb-1">
																		<p className="font-bold text-[#575e75] text-xs">
																			{reply.username}
																		</p>
																		<span className="text-xs text-[#8fa1b3]">
																			{new Date(
																				reply.datePosted,
																			).toLocaleDateString()}
																		</span>
																	</div>
																	<p className="text-[#575e75] text-sm leading-relaxed">
																		{reply.content}
																	</p>
																</div>
															</div>
														</div>
													))}
												</div>
											</div>
										))}

										{comments.length === 0 && (
											<div className="text-center py-12">
												<p className="text-[#8fa1b3] text-sm">
													No comments yet
												</p>
												<p className="text-[#8fa1b3] text-xs mt-1">
													Be the first to share what you think!
												</p>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* More Games Section */}
							<div className=" p-5">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-sm font-bold text-[#575e75]">
										More Games
									</h3>
									<button className="text-xs font-bold text-[#4c97ff] hover:text-[#3373cc]">
										View all
									</button>
								</div>
								<div className="space-y-3">
									{games
										.filter((g) => g.id !== detailGame.id)
										.slice(0, 4)
										.map((game) => (
											<div
												key={game.id}
												onClick={() => handleShowDetail(game)}
												className="flex flex-col gap-2 p-2 hover:bg-[#f7f9fc] rounded-md cursor-pointer transition-colors group"
											>
												<div className="w-full aspect-square bg-gradient-to-br from-[#4c97ff] to-[#855cd6] rounded-md flex items-center justify-center text-3xl">
													🎮
												</div>

												<div className="w-full">
													<p className="font-bold text-[#575e75] text-sm truncate group-hover:text-[#4c97ff]">
														{game.title}
													</p>
													<p className="text-xs text-[#8fa1b3] line-clamp-2">
														{game.description || "No description"}
													</p>
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// --- VIEW: Game Gallery (Scratch-styled) ---
	return (
		<div className="min-h-screen bg-[#e9f1fc]">
			{/* Scratch-style Header */}
			<div className="bg-[#4c97ff] text-white shadow-md">
				<div className="max-w-[1280px] mx-auto px-6 py-5 flex items-center justify-between">
					<h1 className="text-2xl font-bold">🎮 My Stuff</h1>
					{username && role === "ADMIN" && (
						<button
							onClick={() => setShowUpload(!showUpload)}
							className="bg-[#0fbd8c] hover:bg-[#0b9e74] text-white px-5 py-2.5 rounded-md font-bold shadow-sm transition-colors text-sm"
						>
							{showUpload ? "✕ Cancel" : "+ New Project"}
						</button>
					)}
				</div>
			</div>

			<div className="max-w-[1280px] mx-auto px-6 py-8">
				{/* Upload Form */}
				{showUpload && username && role === "ADMIN" && (
					<div className="bg-white rounded-lg border border-[#d9e3f1] shadow-sm p-6 mb-8">
						<h3 className="text-xl font-bold text-[#575e75] mb-5">
							Upload New Game
						</h3>
						<form onSubmit={handleUpload} className="space-y-5">
							<div>
								<label className="block text-sm font-bold text-[#575e75] mb-2">
									Title
								</label>
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full px-4 py-2.5 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] text-sm"
									placeholder="Name your project"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#575e75] mb-2">
									Description
								</label>
								<textarea
									value={desc}
									onChange={(e) => setDesc(e.target.value)}
									className="w-full px-4 py-2.5 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] text-sm resize-none"
									rows={3}
									placeholder="Brief description of your project"
								/>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#575e75] mb-2">
									Instructions
								</label>
								<textarea
									value={instructions}
									onChange={(e) => setInstructions(e.target.value)}
									className="w-full px-4 py-2.5 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] text-sm resize-none"
									rows={4}
									placeholder="Tell others how to use your project (such as which keys to press)"
								/>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#575e75] mb-2">
									Category
								</label>
								<select
									value={categoryId || ""}
									onChange={(e) =>
										setCategoryId(
											e.target.value ? Number(e.target.value) : null,
										)
									}
									className="w-full px-4 py-2.5 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] text-sm"
									required
								>
									<option value="">Select a category...</option>
									{categories.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.icon} {cat.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#575e75] mb-2">
									Thumbnail (Optional)
								</label>
								<div className="space-y-3">
									<input
										type="text"
										value={thumbnailUrl}
										onChange={(e) => {
											setThumbnailUrl(e.target.value);
											if (e.target.value) setThumbnailFile(null);
										}}
										className="w-full px-4 py-2.5 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] text-sm"
										placeholder="Or paste thumbnail URL"
										disabled={!!thumbnailFile}
									/>
									<div className="flex items-center gap-3">
										<span className="text-xs text-[#8fa1b3]">OR</span>
									</div>
									<input
										type="file"
										accept="image/*"
										onChange={(e) => {
											const selectedFile = e.target.files?.[0];
											if (selectedFile) {
												setThumbnailFile(selectedFile);
												setThumbnailUrl("");
											}
										}}
										className="w-full px-4 py-2.5 border border-[#d9e3f1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4c97ff] text-sm"
										disabled={!!thumbnailUrl}
									/>
									{thumbnailFile && (
										<p className="text-xs text-[#0fbd8c]">
											✓ {thumbnailFile.name}
										</p>
									)}
								</div>
							</div>

							<div>
								<label className="block text-sm font-bold text-[#575e75] mb-2">
									Project File (.html or .zip)
								</label>

								<div
									onDragEnter={handleDragEnter}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onDrop={handleDrop}
									className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-all ${
										isDragging
											? "border-[#4c97ff] bg-[#e9f1fc]"
											: file
												? "border-[#0fbd8c] bg-[#e8fcf6]"
												: "border-[#d9e3f1] bg-white hover:border-[#8fa1b3]"
									}`}
								>
									<input
										type="file"
										id="file-upload"
										accept=".html,.zip"
										onChange={(e) =>
											setFile(e.target.files ? e.target.files[0] : null)
										}
										className="hidden"
										required={!file}
									/>

									<div className="space-y-3">
										{file ? (
											<>
												<div className="text-[#0fbd8c] text-5xl">✓</div>
												<p className="text-[#0fbd8c] font-bold text-sm">
													{file.name}
												</p>
												<p className="text-[#8fa1b3] text-xs">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</p>
												<button
													type="button"
													onClick={() => setFile(null)}
													className="text-[#ff6680] hover:text-[#ff4d6a] text-xs font-bold"
												>
													Remove file
												</button>
											</>
										) : (
											<>
												<div className="text-[#8fa1b3] text-5xl">
													{isDragging ? "📂" : "📁"}
												</div>
												<div>
													<p className="text-[#575e75] font-bold mb-2 text-sm">
														{isDragging
															? "Drop your file here"
															: "Drag and drop or"}
													</p>
													<label
														htmlFor="file-upload"
														className="inline-block bg-[#4c97ff] hover:bg-[#3373cc] text-white font-bold px-5 py-2 rounded-md cursor-pointer transition-colors text-sm"
													>
														Choose File
													</label>
												</div>
												<p className="text-[#8fa1b3] text-xs">
													Supported: .html, .zip
												</p>
											</>
										)}
									</div>
								</div>
							</div>

							<button
								type="submit"
								className="w-full bg-[#0fbd8c] hover:bg-[#0b9e74] text-white font-bold py-3 rounded-md transition-colors text-sm"
							>
								Share Project
							</button>
						</form>
					</div>
				)}

				{/* Games Grid */}
				{games.length > 0 ? (
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
						{games.map((game) => (
							<div
								key={game.id}
								className="bg-white rounded-lg border border-[#d9e3f1] shadow-sm overflow-hidden hover:shadow-md transition-all group"
							>
								<div
									className="h-44 bg-gradient-to-br from-[#4c97ff] to-[#855cd6] flex items-center justify-center cursor-pointer relative overflow-hidden"
									onClick={() => handleShowDetail(game)}
								>
									{game.thumbnailFullUrl ? (
										<img
											src={game.thumbnailFullUrl}
											alt={game.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-6xl">🎮</span>
									)}
									<div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
								</div>

								<div className="p-4">
									<div className="flex items-center gap-2 mb-2">
										<h3
											className="flex-1 text-base font-bold text-[#575e75] truncate cursor-pointer hover:text-[#4c97ff]"
											onClick={() => handleShowDetail(game)}
										>
											{game.title}
										</h3>
										{game.category && (
											<span className="text-xs bg-[#e9f1fc] text-[#4c97ff] px-2 py-1 rounded">
												{game.category.icon}
											</span>
										)}
									</div>
									<p className="text-xs text-[#8fa1b3] mb-3 line-clamp-2 h-8">
										{game.description || "No description provided."}
									</p>

									<div className="flex items-center gap-2">
										<button
											onClick={() => handlePlay(game)}
											className="flex-1 bg-[#4c97ff] hover:bg-[#3373cc] text-white font-bold py-2 px-3 rounded-md transition-colors text-xs flex items-center justify-center gap-1.5"
										>
											<span>▶</span>
											<span>Play</span>
										</button>
										<button
											onClick={() => handleShowDetail(game)}
											className="flex-1 bg-white hover:bg-[#f7f9fc] text-[#4c97ff] border border-[#d9e3f1] font-bold py-2 px-3 rounded-md transition-colors text-xs"
										>
											Details
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-20">
						<div className="text-6xl mb-4">🎮</div>
						<p className="text-[#575e75] font-bold text-lg mb-2">
							No projects yet
						</p>
						<p className="text-[#8fa1b3] text-sm">
							{username
								? "Create your first project to get started!"
								: "Sign in to create projects"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
