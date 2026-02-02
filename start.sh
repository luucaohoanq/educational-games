#!/bin/bash

echo "🎮 Starting Game Store Demo..."
echo ""

# Start MinIO
echo "📦 Starting MinIO..."
docker-compose up -d

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
sleep 5

# Start Backend
echo "🚀 Starting Backend..."
cd be
./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Start Frontend
echo "🎨 Starting Frontend..."
cd ../fe
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access points:"
echo "   Frontend:      http://localhost:5173"
echo "   Backend API:   http://localhost:8080"
echo "   MinIO Console: http://localhost:9001"
echo "   H2 Console:    http://localhost:8080/h2-console"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
