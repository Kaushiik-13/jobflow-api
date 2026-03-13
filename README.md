<p align="center">
  <img src="architecture/image.png" width="800" alt="JobFlow Architecture" />
</p>

<h1 align="center">JobFlow API</h1>

<p align="center">
  Production-Ready Backend with CI/CD on AWS
</p>

---

## About

JobFlow is a production-ready NestJS REST API with TypeORM + MySQL, implementing JWT-based RBAC for secure job creation and status management. Containerized using Docker and automated build/test/deploy with GitHub Actions CI/CD. Provisioned and deployed on AWS ECS (Fargate) using Terraform (IaC) with ALB, VPC, RDS, and IAM, following least-privilege access.

---

## Tech Stack

| Category           | Technology                                 |
| ------------------ | ------------------------------------------ |
| **Backend**        | NestJS, TypeScript, TypeORM                |
| **Database**       | MySQL (AWS RDS)                            |
| **Authentication** | JWT, Passport, RBAC                        |
| **Container**      | Docker                                     |
| **Cloud**          | AWS (ECS Fargate, RDS, ALB, ECR, VPC, IAM) |
| **IaC**            | Terraform                                  |
| **CI/CD**          | GitHub Actions                             |

---

## Features

- **User Authentication** - JWT-based login/register
- **Role-Based Access Control** - Admin and User roles
- **Job Management** - Create, read, update, delete job postings
- **Health Monitoring** - Health check endpoint

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud (ap-south-1 - Mumbai)                       │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User / Client  │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   Route 53      │
                              └────────┬────────┘
                                       │
                                       ▼
                         ┌─────────────────────────┐
                         │  Application Load      │
                         │  Balancer (Port 80)     │
                         └───────────┬─────────────┘
                                     │
                                     ▼
                         ┌─────────────────────────┐
                         │   Target Group          │
                         │   (Port 3000)           │
                         │   Health: /health       │
                         └───────────┬─────────────┘
                                     │
                                     ▼
                         ┌─────────────────────────┐
                         │  ECS Fargate Cluster    │
                         │  ┌───────────────────┐  │
                         │  │  NestJS Container │  │
                         │  │  (2 Tasks)        │  │
                         │  │  Port: 3000       │  │
                         │  └───────────────────┘  │
                         └───────────┬─────────────┘
                                     │
                                     ▼
                         ┌─────────────────────────┐
                         │  RDS MySQL              │
                         │  (Private Subnet)       │
                         │  Port: 3306             │
                         └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD Pipeline (GitHub Actions)                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

  Git Push → CI (Build/Test) → CD (Push to ECR) → ECS (Deploy)
```

---

## Live Deployment

| Resource    | Details                                                                      |
| ----------- | ---------------------------------------------------------------------------- |
| **API URL** | http://jobflow-alb-production-1484565429.ap-south-1.elb.amazonaws.com/api/docs |
| **Health**  | http://jobflow-alb-production-1484565429.ap-south-1.elb.amazonaws.com/health |
| **Region**  | ap-south-1 (Mumbai, India)                                                   |
| **Status**  | ✅ Production                                                                |

---

## AWS Resources

| Service         | Name                       | Details             |
| --------------- | -------------------------- | ------------------- |
| **VPC**         | jobflow-vpc-production     | 10.0.0.0/16         |
| **ECS Cluster** | jobflow-cluster-production | Fargate             |
| **ECS Service** | jobflow-service-production | 2 tasks             |
| **ALB**         | jobflow-alb-production     | Port 80             |
| **RDS**         | jobflow-mysql-production   | MySQL 8.0, t3.micro |
| **ECR**         | jobflow-api                | Docker registry     |

---

## Security

| Layer             | Implementation                              |
| ----------------- | ------------------------------------------- |
| **Network**       | VPC with public/private subnets             |
| **Load Balancer** | ALB with security groups                    |
| **Compute**       | ECS tasks in private subnets (no public IP) |
| **Database**      | RDS in private subnets, no public access    |
| **Access**        | IAM roles with least-privilege              |
| **Auth**          | JWT-based authentication with RBAC          |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL (local development)
- Docker

### Installation

```bash
# Clone repository
git clone https://github.com/Kaushiik-13/jobflow-api.git
cd jobflow-api

# Install dependencies
npm install
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=jobflow_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600
```

### Run Locally

```bash
# Development
npm run start:dev

# Production
npm run start:prod

# Build
npm run build

# Test
npm run test
```

---

## API Endpoints

### Authentication

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| POST   | /auth/register | Register new user |
| POST   | /auth/login    | Login user        |

### Users

| Method | Endpoint   | Description    |
| ------ | ---------- | -------------- |
| GET    | /users     | Get all users  |
| GET    | /users/:id | Get user by ID |
| PATCH  | /users/:id | Update user    |
| DELETE | /users/:id | Delete user    |

### Jobs

| Method | Endpoint  | Description   |
| ------ | --------- | ------------- |
| GET    | /jobs     | Get all jobs  |
| GET    | /jobs/:id | Get job by ID |
| POST   | /jobs     | Create job    |
| PATCH  | /jobs/:id | Update job    |
| DELETE | /jobs/:id | Delete job    |

### Health

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| GET    | /health  | Health check |

---

## License

MIT License
