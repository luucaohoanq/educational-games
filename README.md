# Scratch Game Store Demo

A full-stack application for uploading, playing, and managing Scratch games (exported as HTML from TurboWarp) with user authentication, leaderboards, and MinIO bucket management.

## Tech Stack

### Backend (be/)
- **Spring Boot 3.5.10** - Java framework
- **H2 Database** - File-based persistent database
- **MinIO** - Object storage for game files
- **Lombok** - Reduce boilerplate code
- **Maven** - Build tool

### Frontend (fe/)
- **React 19** with TypeScript
- **Vite** - Build tool
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing

## Features

✅ **User Authentication**
- Register new accounts
- Login/logout functionality
- User session persistence

✅ **Game Management**
- Upload HTML games (from TurboWarp/Scratch)
- Store files in MinIO object storage
- Save game metadata in H2 database
- Play games in iframe

✅ **Leaderboard System**
- Track user scores
- Display top 10 players
- Show games played count
- Automatic score updates

✅ **MinIO Bucket Management**
- List all buckets
- Create new buckets
- Delete buckets
- View objects in buckets
- Delete objects
- Real-time bucket monitoring

✅ **Persistent Data**
- File-based H2 database (survives restarts)
- User data preserved
- Game history maintained

## Project Structure

```
demogame/
├── be/                          # Spring Boot backend
│   ├── src/main/java/com/example/be/
│   │   ├── config/
│   │   │   └── MinioConfig.java
│   │   ├── controller/
│   │   │   ├── GameController.java
│   │   │   ├── AuthController.java
│   │   │   └── MinioController.java
│   │   ├── entity/
│   │   │   ├── Game.java
│   │   │   ├── User.java
│   │   │   └── PlayHistory.java
│   │   ├── repository/
│   │   │   ├── GameRepository.java
│   │   │   ├── UserRepository.java
│   │   │   └── PlayHistoryRepository.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── AuthResponse.java
│   │   │   ├── LeaderboardEntry.java
│   │   │   ├── BucketInfo.java
│   │   │   └── ObjectInfo.java
│   │   └── BeApplication.java
│   └── src/main/resources/
│       └── application.properties
├── fe/                          # React frontend
│   └── src/
│       ├── components/
│       │   ├── Auth.tsx
│       │   ├── GameList.tsx
│       │   ├── Leaderboard.tsx
│       │   └── BucketManager.tsx
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
└── docker-compose.yml           # MinIO setup
```

## Setup Instructions

### 1. Start MinIO (Object Storage)

```bash
cd /home/hoang/Desktop/demogame
docker-compose up -d
```

This will start MinIO on:
- API: http://localhost:9000
- Console: http://localhost:9001 (login: minioadmin/minioadmin)

### 2. Start Backend

```bash
cd be
./mvnw spring-boot:run
```

Backend will run on: http://localhost:8080

**Available endpoints:**

**Auth API:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/leaderboard` - Get top 10 players
- `GET /api/auth/user/{username}` - Get user profile

**Game API:**
- `GET /api/games` - List all games
- `GET /api/games/{id}` - Get game detail
- `POST /api/games/upload` - Upload new game
- `POST /api/games/{id}/play` - Track play history (with score & duration)

**MinIO Management API:**
- `GET /api/minio/buckets` - List all buckets
- `POST /api/minio/buckets` - Create bucket
- `DELETE /api/minio/buckets/{name}` - Delete bucket
- `GET /api/minio/buckets/{name}/objects` - List objects in bucket
- `DELETE /api/minio/buckets/{name}/objects/{object}` - Delete object
- `GET /api/minio/buckets/{name}/exists` - Check if bucket exists

**Database Console:**
- `GET /h2-console` - H2 database console

### 3. Start Frontend

```bash
cd fe
npm install  # First time only
npm run dev
```

Frontend will run on: http://localhost:5173

## Usage

### 1. Register/Login
- Open http://localhost:5173
- Register a new account or login
- Your session will be saved in localStorage

### 2. Upload a Game
- Click "➕ Upload Game"
- Export your Scratch project as HTML from TurboWarp
- Fill in title and description
- Select the HTML file
- Click "Upload Game"

### 3. Play Games
- Browse available games on the home page
- Click "▶ Play Now" on any game card
- The game will load in full screen
- A random score is automatically generated for demo
- Your play history is tracked for the leaderboard

### 4. View Leaderboard
## API Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"pass123","email":"player1@example.com"}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"player1","password":"pass123"}'
```

### Get Leaderboard
```bash
curl http://localhost:8080/api/auth/leaderboard
```

### Upload Game
```bash
curl -X POST http://localhost:8080/api/games/upload \
  -F "file=@game.html" \
  -F "title=My Game" \
  -F "desc=A fun game"
```

### List Games
```bash
curl http://localhost:8080/api/games
```

### Track Play with Score
```bash
curl -X POST "http://localhost:8080/api/games/1/play?userId=player1&score=500&duration=120"
```
## Configuration

### Backend (application.properties)
- Server port: `8080`
- H2 database: **File-based** at `./data/gamedb` (persistent)
- MinIO: `localhost:9000`
- Bucket name: `scratch-games`
- Max file size: `50MB`

### Frontend
- API URL: `http://localhost:8080/api/*`
- Tailwind CSS for styling
- React Router for navigation
## Features

✅ Upload HTML games (from TurboWarp/Scratch)  
✅ Store files in MinIO object storage  
✅ Save game metadata in **persistent** H2 database  
✅ User registration and login  
✅ Session management with localStorage  
✅ List all games with beautiful cards  
✅ Play games in full-screen iframe  
✅ Track play history with scores  
✅ Real-time leaderboard (top 10 players)  
✅ MinIO bucket management interface  
✅ Create, delete, and view buckets  
✅ View and delete objects in buckets  
✅ CORS enabled for frontend  
✅ Public bucket policy for direct file access  
✅ Responsive design with Tailwind CSS  
✅ Client-side routing with React Router  
✅ **Data persists across application restarts**
curl http://localhost:8080/api/games
```

### Track Play
```bash
curl -X POST "http://localhost:8080/api/games/1/play?userId=user_123"
```

## Configuration

### Backend (application.properties)
- Server port: `8080`
- H2 database: in-memory
- MinIO: `localhost:9000`
- Bucket name: `scratch-games`
- Max file size: `50MB`

### Frontend (App.tsx)
- API URL: `http://localhost:8080/api/games`
- Fake user ID: randomly generated on page load

## Troubleshooting

### MinIO not connecting
- Check if Docker is running: `docker ps`
- Restart MinIO: `docker-compose restart`
- Verify MinIO is accessible: http://localhost:9000

### Backend errors
- Check if MinIO is running
- Verify application.properties settings
- Check console logs for errors
- Ensure `data/` directory has write permissions

### Frontend not loading
- Verify backend is running on port 8080
- Check browser console for CORS errors
- Clear localStorage: `localStorage.clear()`
- Reinstall dependencies: `npm install`

### Database issues
- Database files are stored in `be/data/`
- To reset database, delete the `data/` directory
- Console URL: `jdbc:h2:file:./data/gamedb`

## Development Notes

- **H2 database is now file-based** - data persists across restarts
- Database files stored in `be/data/` directory
- Use persistent database (PostgreSQL/MySQL) for production
- MinIO data is persisted in Docker volume
- Games are publicly accessible once uploaded
- **Authentication is basic** - use proper JWT/OAuth for production
- **Passwords are not hashed** - implement BCrypt for production
- Random scores are generated for demo purposes
- Leaderboard updates in real-time based on play tracking
- Verify backend is running on port 8080
- Check browser console for CORS errors
- Ensure axios is installed: `npm install axios`

## Development Notes

- H2 database is in-memory, data resets on restart
- Use persistent database (PostgreSQL/MySQL) for production
- MinIO data is persisted in Docker volume
- Games are publicly accessible once uploaded
- No authentication/authorization implemented (demo only)

## License

MIT
