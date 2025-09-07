# ---- Spiralogic Oracle Dev Shortcuts ----

.PHONY: dev frontend backend stop help

dev:
	@npm run dev:all

frontend:
	@npm run dev:frontend

backend:
	@npm run dev:backend

stop:
	@pkill -f "next dev" || true
	@pkill -f "node dist/server.js" || true
	@pkill -f "concurrently" || true
	@echo "Stopped dev processes (if any)."

help:
	@echo ""
	@echo "🔮 Spiralogic Oracle Development Commands:"
	@echo ""
	@echo "  make dev        - Start frontend + backend together"
	@echo "  make frontend   - Start only Next.js frontend"
	@echo "  make backend    - Start only Express backend"
	@echo "  make stop       - Stop all development processes"
	@echo ""
	@echo "🐳 Docker commands:"
	@echo ""
	@echo "  docker compose -f docker-compose.dev.yml up postgres redis"
	@echo "  npm run dev:all"
	@echo ""

