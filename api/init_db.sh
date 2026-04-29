#!/bin/bash
echo "Attente Postgres..."
sleep 2

echo "Initialisation Alembic..."
alembic init db/migrations
alembic revision --autogenerate -m "init"
alembic upgrade head

echo "DB prête."