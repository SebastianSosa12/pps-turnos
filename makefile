# 🏥 HealthTrack - Simple Makefile
# The one who knocks... with efficient commands!

# Config
COMPOSE = docker compose
CDK = cdklocal
STACK = HealthTrackStack
ENDPOINT = --endpoint-url=http://localhost:4566

# AWS LocalStack creds
export AWS_ACCESS_KEY_ID ?= test
export AWS_SECRET_ACCESS_KEY ?= test 
export AWS_DEFAULT_REGION ?= us-east-1

.PHONY: help
help:
	@echo "🏥 HealthTrack Commands:"
	@echo ""
	@echo "⚡ Quick Start:"
	@echo "  make setup             - Deploy EVERYTHING (backend + frontend + AWS)"
	@echo "  make dev               - Start development mode"
	@echo "  make down              - Stop all services"
	@echo ""
	@echo "☁️ AWS (LocalStack):"
	@echo "  make aws-deploy        - Deploy AWS infrastructure (CDK)"
	@echo "  make aws-destroy       - Destroy AWS stack"
	@echo ""
	@echo "💾 Database:"
	@echo "  make db-reset          - Reset database"
	@echo "  make db-seed           - Seed test data"

# ⚡ THE SETUP COMMAND THAT DOES IT ALL
.PHONY: setup check-tools
check-tools:
	@echo "🔧 Checking required tools..."
	@docker --version >nul 2>&1 || (echo "❌ Docker required. Install from docker.com" && exit 1)
	@cdklocal --version >nul 2>&1 || (echo "❌ CDKLocal required. Run: npm i -g aws-cdk aws-cdk-local" && exit 1)
	@mysql --version >nul 2>&1 || echo "⚠️  MySQL client recommended but not required"
	@echo "✅ Tools check passed!"

setup: check-tools
	@echo "🐳 Starting LocalStack..."
	@$(COMPOSE) up -d localstack
	@echo "⏳ Waiting for services..."
	@powershell -Command "Start-Sleep -Seconds 3"
	
	@echo "🌱 Seeding AWS resources..."
	@make aws-seed
	@echo "🚀 Starting full application stack..."
	@$(COMPOSE) up -d --build
	@echo "⏳ Database warmup..."
	@powershell -Command "Start-Sleep -Seconds 10"
	@echo "💾 Seeding database..."
	@make db-seed
	@echo ""
	@echo "✅ BOOM! Everything deployed!"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend: http://localhost:8080"
	@echo "   Test users: admin/password123, doctor/doctor123"

# 🚀 Development
.PHONY: dev down
dev:
	@echo "🧪 Starting dev mode..."
	@$(COMPOSE) up -d
	@echo "✅ Dev stack running! Frontend: http://localhost:5173"

down:
	@$(COMPOSE) down -v

# ☁️ AWS Infrastructure  
.PHONY: aws-deploy aws-destroy aws-seed
aws-deploy:
	@$(COMPOSE) up -d localstack
	@powershell -Command "Start-Sleep -Seconds 3"
	@cd infra/cdk && $(CDK) bootstrap
	@cd infra/cdk && $(CDK) deploy $(STACK) --require-approval never

aws-destroy:
	@cd infra/cdk && $(CDK) destroy $(STACK) --force

aws-seed:
	@aws $(ENDPOINT) dynamodb create-table --table-name FeatureFlags --attribute-definitions AttributeName=Key,AttributeType=S --key-schema AttributeName=Key,KeyType=HASH --billing-mode PAY_PER_REQUEST >nul 2>&1 || true
	@aws $(ENDPOINT) dynamodb put-item --table-name FeatureFlags --item '{"Key":{"S":"appointments.notes.enabled"},"Value":{"BOOL":true}}'
	@aws $(ENDPOINT) sqs create-queue --queue-name AppointmentReminders >nul 2>&1 || true
	@aws $(ENDPOINT) s3api create-bucket --bucket healthtrack-attachments >nul 2>&1 || true
	@echo "✅ AWS resources seeded!"

# 💾 Database
.PHONY: db-reset db-seed
db-reset:
	@echo "🗑️ Dropping database..."
	@mysql -h localhost -P 3306 -u root -pYour_password123 -e "DROP DATABASE IF EXISTS HealthTrack; CREATE DATABASE HealthTrack;" 2>nul || echo "⚠️ MySQL might not be running"
	@echo "✅ Database reset! Restart API to recreate."

db-seed:
	@echo "🌱 Seeding database..."
	@mysql -h localhost -P 3306 -u root -pYour_password123 HealthTrack < backend/seeds/01-seed-users.sql
	@echo "✅ Database seeded!"
