// Export all services from a single location
export { default as authService } from "./authService";
export { default as gameService } from "./gameService";
export { default as api } from "./api";

// Re-export types
export type {
	LoginRequest,
	RegisterRequest,
	AuthResponse,
} from "./authService";
export type { Game, Comment, CommentRequest } from "./gameService";
