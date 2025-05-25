# ==========================
# SpiralogicOracleSystem Makefile
# ==========================

.PHONY: help install run clean format lint freeze reset-env test coverage

help:
	@echo ""
	@echo "Available targets:"
	@echo "  make install       - Install dependencies from requirements.txt"
	@echo "  make run           - Run the soul reflection flow"
	@echo "  make test          - Run unit tests with pytest"
	@echo "  make coverage      - Run tests with coverage reporting"
	@echo "  make format        - Auto-format code with black"
	@echo "  make lint          - Check code style with flake8"
	@echo "  make clean         - Remove __pycache__ files"
	@echo "  make freeze        - Export current environment to requirements.txt"
	@echo "  make reset-env     - Rebuild the Python virtual environment"
	@echo ""

install:
	pip install -r requirements.txt

run:
	PYTHONPATH=oracle-backend python oracle-backend/run_soul_reflection.py

test:
	PYTHONPATH=oracle-backend pytest tests

coverage:
	PYTHONPATH=oracle-backend pytest --cov=oracle-backend --cov-report=html

format:
	black .

lint:
	flake8 .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +

freeze:
	pip freeze > requirements.txt

reset-env:
	rm -rf .venv
	python3 -m venv .venv
	source .venv/bin/activate && pip install -r requirements.txt

