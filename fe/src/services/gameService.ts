import api from "./api";

export interface GameCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  games?: Game[];
}

export interface Game {
  id: number;
  title: string;
  description: string;
  playUrl: string;
  minioObjectName: string;
  instructions?: string;
  dateAdded?: string;
  likes?: number;
  views?: number;
  thumbnailUrl?: string;
  thumbnailFullUrl?: string;
  category?: GameCategory;
  createdBy?: string;
}

export interface Comment {
  id: number;
  gameId: number;
  username: string;
  content: string;
  datePosted: string;
  parentCommentId?: number;
}

export interface CommentRequest {
  gameId: number;
  username: string;
  content: string;
  parentCommentId?: number | null;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  totalLikes: number;
  isLiked: boolean;
}

const gameService = {
  // Get all games
  getAllGames: async (): Promise<Game[]> => {
    const response = await api.get<Game[]>("/games");
    return response.data;
  },

  // Get all categories
  getAllCategories: async (): Promise<GameCategory[]> => {
    const response = await api.get<GameCategory[]>("/games/categories");
    return response.data;
  },

  // Get game by ID (increments view count)
  getGameById: async (id: number): Promise<Game> => {
    const response = await api.get<Game>(`/games/${id}`);
    return response.data;
  },

  // Upload a new game
  uploadGame: async (formData: FormData): Promise<Game> => {
    const response = await api.post<Game>("/games/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update game (Admin only)
  updateGame: async (id: number, formData: FormData): Promise<Game> => {
    const response = await api.put<Game>(`/games/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete game (Admin only)
  deleteGame: async (id: number, username: string): Promise<void> => {
    await api.delete(`/games/${id}`, {
      params: { username },
    });
  },

  // Track play activity
  trackPlay: async (
    gameId: number,
    userId: string,
    score: number = 0,
    duration: number = 0
  ): Promise<void> => {
    await api.post(`/games/${gameId}/play`, null, {
      params: { userId, score, duration },
    });
  },

  // Like/Unlike a game (toggle)
  toggleLike: async (gameId: number, username: string): Promise<LikeResponse> => {
    const response = await api.post<LikeResponse>(
      `/games/${gameId}/like`,
      null,
      { params: { username } }
    );
    return response.data;
  },

  // Check if user has liked a game
  checkLikeStatus: async (gameId: number, username: string): Promise<boolean> => {
    const response = await api.get<boolean>(
      `/games/${gameId}/like/status`,
      { params: { username } }
    );
    return response.data;
  },

  // Get comments for a game
  getComments: async (gameId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/games/${gameId}/comments`);
    return response.data;
  },

  // Add a comment or reply
  addComment: async (request: CommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>(
      `/games/${request.gameId}/comments`,
      request
    );
    return response.data;
  },

  // Get game categories with games (Netflix style)
  getCategoriesWithGames: async (): Promise<GameCategory[]> => {
    const response = await api.get<GameCategory[]>("/game-center/game-categories");
    return response.data;
  },
};

export default gameService;
