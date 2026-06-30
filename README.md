# Fullstack Learning Platform

An end-to-end production-grade project to master the full engineering stack used at top-tier tech companies.

Tech Stack: TypeScript, React, Node.js, GraphQL, PostgreSQL, ElasticSearch, Apache Kafka, Apache Airflow, Kubernetes, AWS, CircleCI, Git, JIRA

---

## Architecture Overview

CLIENT LAYER: React (TypeScript) + Apollo Client (GraphQL)
API LAYER: Node.js + Express + Apollo Server (GraphQL) with JWT Auth
DATABASE: PostgreSQL (AWS RDS) via TypeORM
EVENTS: Apache Kafka (AWS MSK) - Topics: jobs, users, events
SEARCH: ElasticSearch (AWS OpenSearch) - Full-text job search
PIPELINE: Apache Airflow - DAG orchestration, ETL, scheduling
INFRA: Kubernetes (AWS EKS), Docker, Helm Charts
CICD: CircleCI - Build, test, deploy pipeline

---

## What We Are Building: A Job Board Platform

A real-world Job Board application where:

1. Employer signs up and posts a job (React UI -> GraphQL mutation -> PostgreSQL)
2. Job posting fires a Kafka event on the jobs-created topic
3. Kafka consumer picks up the event and indexes the job in ElasticSearch
4. Job seekers search listings via full-text ElasticSearch queries
5. Airflow DAG runs hourly to sync missed jobs from PostgreSQL to ElasticSearch
6. Analytics DAG runs nightly to aggregate stats into a reporting table
7. CircleCI builds Docker images on every PR and deploys to AWS EKS on merge to main

---

## Project Structure

frontend/                        React + TypeScript SPA
  src/components/                Reusable UI components (JobCard, SearchBar, Navbar)
  src/pages/                     Route pages (Home, JobDetail, PostJob, Login)
  src/graphql/                   GraphQL queries and mutations
  src/hooks/                     Custom React hooks
  src/context/                   React Context (Auth, Theme)
  src/types/                     Shared TypeScript interfaces

backend/                         Node.js + GraphQL API server
  src/graphql/schema.ts          GraphQL type definitions
  src/graphql/resolvers/         Job and User resolvers
  src/models/                    TypeORM entities (Job, User, Company)
  src/services/                  Business logic (JobService, SearchService)
  src/kafka/producer.ts          Kafka event publisher
  src/kafka/consumer.ts          Kafka event subscriber
  src/elasticsearch/client.ts    ES indexing and search client
  src/middleware/auth.ts         JWT authentication middleware
  src/config/                    App configuration

database/
  migrations/                    TypeORM SQL migration files
  seeds/                         Sample data scripts

airflow/
  dags/etl_pipeline.py           ETL: raw data to processed data warehouse
  dags/reindex_search.py         Sync PostgreSQL to ElasticSearch hourly
  dags/analytics_report.py       Daily analytics aggregation DAG

infra/
  kubernetes/                    Kubernetes deployment manifests
    frontend-deployment.yaml
    backend-deployment.yaml
    kafka-statefulset.yaml
    elasticsearch-deployment.yaml
    ingress.yaml
  aws/                           Terraform infrastructure as code
    main.tf
    eks.tf
    rds.tf
    msk.tf

.circleci/config.yml             CircleCI CI/CD pipeline
docker-compose.yml               Full local development stack
README.md

---

## Tech Stack and Learning Goals

TypeScript        | All layers   | Type-safe code across frontend and backend
React 18          | Frontend     | SPA with hooks, suspense, Apollo Client
Apollo Client     | Frontend     | GraphQL queries, mutations, caching
Node.js + Express | Backend      | HTTP server, middleware, REST endpoints
Apollo Server     | Backend      | GraphQL schema-first API
GraphQL           | API          | Schema, resolvers, subscriptions, directives
PostgreSQL        | Database     | Relational schema, transactions, TypeORM
ElasticSearch     | Search       | Full-text search, aggregations, mappings
Apache Kafka      | Messaging    | Event-driven microservices, topics, offsets
Apache Airflow    | Pipeline     | DAG orchestration, scheduling, ETL jobs
Docker            | DevOps       | Multi-container local development
Kubernetes        | DevOps       | Pods, services, deployments, ingress, HPA
AWS               | Cloud        | EKS, RDS, MSK, OpenSearch, S3, ECR, IAM
CircleCI          | CI/CD        | Automated test, build, and deploy pipeline
Git               | VCS          | Feature branching, PR workflows, tagging
JIRA              | Management   | Agile sprints, epics, story point tracking

---

## Quick Start

Prerequisites: Docker + Docker Compose, Node.js 18+, Python 3.9+, AWS CLI

1. Clone: git clone https://github.com/Srinivasbanda11/fullstack-learning-platform.git
2. Copy env files: cp backend/.env.example backend/.env
3. Start infrastructure: docker-compose up -d
4. Run backend: cd backend && npm install && npm run migrate && npm run seed && npm run dev
5. Run frontend: cd frontend && npm install && npm start

Service URLs:
  React App            http://localhost:3000
  GraphQL Playground   http://localhost:4000/graphql
  Kibana (ES UI)       http://localhost:5601
  Airflow UI           http://localhost:8080
  Kafka Control Center http://localhost:9021

---

## Learning Path (16 Weeks)

Phase 1 - Core Application (Weeks 1-6)
  Week 1-2: TypeScript fundamentals and React hooks and context
  Week 3-4: Node.js and Apollo Server GraphQL API
  Week 5-6: PostgreSQL schema design and TypeORM migrations

Phase 2 - Search and Events (Weeks 7-10)
  Week 7-8: ElasticSearch indexing, mappings, and full-text queries
  Week 9-10: Apache Kafka producers, consumers, and event-driven architecture

Phase 3 - Data Pipelines (Weeks 11-12)
  Week 11-12: Apache Airflow DAG design and scheduling

Phase 4 - Infrastructure (Weeks 13-16)
  Week 13-14: Docker multi-stage builds and Kubernetes manifests
  Week 15-16: AWS infrastructure (EKS, RDS, MSK) and CircleCI CI/CD pipeline

---

## Git Workflow

Branch naming: feature/JIRA-123-description, fix/JIRA-456-description
Commit format: feat: add elasticsearch search, fix: resolve kafka consumer bug
On every PR: CircleCI runs lint, type-check, unit tests, integration tests, Docker build
On merge to main: CircleCI pushes to AWS ECR and deploys to AWS EKS

---

## License

MIT License
