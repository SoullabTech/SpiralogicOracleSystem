#!/bin/bash
echo "🔮 Starting Spiralogic Oracle Development Environment"
echo ""

# Start backend in background
echo "🖥️  Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Oracle system started!"
echo ""
echo "🌐 Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
