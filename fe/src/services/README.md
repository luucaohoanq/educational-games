# Services Directory

This directory contains all API service modules for the Educational Games application.

## Structure

- **api.ts** - Base axios instance with default configuration
- **authService.ts** - Authentication and user management APIs
- **gameService.ts** - Game-related APIs (CRUD, comments, likes, tracking)
- **index.ts** - Centralized exports for all services

## Usage

### Import services in components:

```typescript
import { authService, gameService } from "../services";
// or
import authService from "../services/authService";
import gameService from "../services/gameService";
```

### Example usage:

```typescript
// Authentication
const response = await authService.login({ username, password });
authService.storeAuthData(response.username, response.userId);

// Games
const games = await gameService.getAllGames();
const game = await gameService.getGameById(id);
await gameService.likeGame(gameId);

// Comments
const comments = await gameService.getComments(gameId);
await gameService.addComment({ gameId, username, content, parentCommentId });
```

## API Configuration

The base API URL is configured in `api.ts`:
- Default: `http://localhost:8080/api`
- Can be modified to use environment variables

## Type Definitions

All request/response types are defined alongside their respective services:
- `Game`, `Comment`, `CommentRequest` in gameService.ts
- `LoginRequest`, `RegisterRequest`, `AuthResponse` in authService.ts
