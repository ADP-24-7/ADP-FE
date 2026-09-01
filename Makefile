SHELL := /bin/sh

COMPOSE ?= docker compose

.DEFAULT_GOAL := help

.PHONY: help env docker-network docker-up docker-rebuild docker-down docker-logs docker-ps check

help:
	@printf "%s\n" \
		"ADP-FE commands:" \
		"  make env            Create .env.local from .env.example if missing" \
		"  make docker-network Ensure shared adp-local Docker network exists" \
		"  make docker-up      Start BE, FE, DA, Docs and PostgreSQL dev stack" \
		"  make docker-rebuild Rebuild and start the full dev stack" \
		"  make docker-logs    Follow full dev stack logs" \
		"  make docker-ps      Show full dev stack containers" \
		"  make docker-down    Stop full dev stack" \
		"  make check          Run FE lint, test and build"

env:
	@if [ ! -f .env.local ]; then cp .env.example .env.local; fi

docker-network:
	docker network inspect adp-local >/dev/null 2>&1 || docker network create adp-local

docker-up: env docker-network
	$(COMPOSE) up -d --build

docker-rebuild: env docker-network
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

docker-down:
	$(COMPOSE) down

docker-logs:
	$(COMPOSE) logs -f

docker-ps:
	$(COMPOSE) ps

check:
	npm run lint
	npm run test
	npm run build
