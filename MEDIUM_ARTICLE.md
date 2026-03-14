# How I Built a Production-Ready Backend API on AWS (Without Prior Cloud Experience)

_A journey from local development to production deployment on AWS ECS Fargate_

---

## The Beginning

A few months ago, I didn't know what AWS ECS Fargate was. I knew Python and had built a few REST APIs with Flask and Django. But when I decided to build a real-world application — a job management API called **JobFlow** — I wanted to do things the right way.

I didn't just want to deploy code. I wanted to understand:

- How production applications are hosted
- How to secure infrastructure
- How to automate deployments

This is the story of how I built a production-ready backend on AWS, and what I learned along the way.

---

## The Project: JobFlow

Before diving into the cloud, let me explain what I built.

**JobFlow** is a REST API for job management with:

- User authentication (JWT-based)
- Role-based access control (Admin/User)
- CRUD operations for job postings
- Health monitoring

**Tech Stack:**

- **Backend**: NestJS + TypeScript + TypeORM
- **Database**: MySQL (AWS RDS)
- **Container**: Docker
- **Cloud**: AWS (ECS, RDS, ALB, ECR, VPC, IAM)
- **Infrastructure as Code**: Terraform
- **CI/CD**: GitHub Actions

---

## Why AWS? Why Not Heroku or Vercel?

I considered several platforms:

| Platform     | Pros                        | Cons                     |
| ------------ | --------------------------- | ------------------------ |
| Heroku       | Easy, managed               | Gets expensive quickly   |
| Vercel       | Great for frontend          | Limited for backend      |
| AWS          | Enterprise-grade, free tier | Steep learning curve     |
| DigitalOcean | Simple, affordable          | Less enterprise features |

I chose AWS because:

1. **Free Tier** - Enough for a portfolio project
2. **Enterprise-ready** - Skills that matter for jobs
3. **Infrastructure as Code** - Terraform support

---

## Step 1: Designing the Architecture

I spent days researching how production applications are structured. Here's what I learned:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AWS Cloud (ap-south-1 - Mumbai)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌────────────────┐     ┌─────────────────┐ │
│  │  Internet │────►│      ALB       │────►│   ECS Fargate   │ │
│  └──────────┘     │  (Port 80)     │     │  (NestJS App)  │ │
│                   └────────────────┘     └────────┬────────┘ │
│                                                   │           │
│                                                   ▼           │
│                                           ┌─────────────────┐ │
│                                           │   RDS MySQL    │ │
│                                           │ (Private Subnet)│ │
│                                           └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions:

1. **Private Subnets** - My database (RDS) is not accessible from the internet
2. **Security Groups** - Only allow necessary traffic between services
3. **No Public IPs for ECS** - The container has no direct internet exposure
4. **ALB as Entry Point** - Handles load balancing and health checks

---

## Step 2: Containerization with Docker

The first step was containerizing the application. This ensures the app runs the same everywhere.

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**What I learned:**

- Multi-stage builds for smaller images
- Don't expose secrets in Dockerfiles
- Use `.dockerignore` to exclude unnecessary files

---

## Step 3: Infrastructure as Code with Terraform

This was the most challenging part. I had to learn:

- How to create a VPC
- How to set up RDS with private subnets
- How to configure ECS with ALB

Here's a snippet of my ECS task definition:

```hcl
resource "aws_ecs_task_definition" "main" {
  family                   = "jobflow-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "nestjs"
      image     = "${var.ecr_repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      environment = [
        { name = "DB_HOST", value = var.db_host },
        { name = "JWT_SECRET", value = var.jwt_secret }
      ]
    }
  ])
}
```

### What I learned:

- Start small, then expand
- Terraform state needs to be managed (I used local for simplicity)
- Always plan before applying

---

## Step 4: CI/CD with GitHub Actions

Automation was a game-changer. Every push to `main` triggers:

1. **CI Pipeline:**
   - Install dependencies
   - Run linter
   - Build project
   - Run tests

2. **CD Pipeline:**
   - Build Docker image
   - Push to AWS ECR
   - Deploy to ECS Fargate

```yaml
# GitHub Actions CD workflow
- name: Build and push Docker image
  run: |
    docker build -t $ECR_REGISTRY/jobflow-api:${{ github.sha }} .
    docker push $ECR_REGISTRY/jobflow-api:${{ github.sha }}

- name: Deploy to ECS
  run: |
    aws ecs update-service --cluster production --service jobflow-service --force-new-deployment
```

---

## Step 5: Security Hardening

Production apps need security. Here's what I implemented:

| Layer        | Implementation                           |
| ------------ | ---------------------------------------- |
| **Network**  | VPC with public/private subnets          |
| **Database** | RDS in private subnets, no public access |
| **Compute**  | ECS tasks without public IPs             |
| **Access**   | IAM roles with least-privilege           |
| **Auth**     | JWT with expiration                      |

### The Security Mistake I Almost Made

Initially, I stored database credentials directly in the ECS task definition. Then I learned about:

- AWS Secrets Manager
- Environment variables vs. secrets

I moved credentials to Terraform variables (for simplicity in this project), but in production, you'd use AWS Secrets Manager.

---

## The Problems I Faced (And How I Solved)

### Problem 1: Health Checks Failing

**Issue:** ALB kept returning 503 errors even though the container was running.

**Solution:**

- The health check path was `/` but my app returned 404
- Changed health check to `/health` which returns `{"status": "ok"}`

### Problem 2: Database Connection Timeout

**Issue:** App couldn't connect to RDS.

**Solution:**

- Database host included port (e.g., `host:3306`) but the app also appended the port
- Fixed by separating `db_host` and `db_port`

### Problem 3: Multi-Container Networking

**Issue:** Tried to add Nginx but it couldn't communicate with NestJS.

**Solution:**

- Kept it simple: NestJS directly behind ALB
- Added Nginx later with proper configuration (optional)

---

## What I Learned

1. **Cloud is not magic** - It's infrastructure that requires understanding
2. **Start simple** - Don't over-engineer from day one
3. **Documentation is your friend** - AWS docs, Terraform docs, NestJS docs
4. **Errors are learning opportunities** - Each bug taught me something new

---

## The Final Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         AWS Infrastructure                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Region: ap-south-1 (Mumbai, India)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ VPC: 10.0.0.0/16                                       │  │
│  │                                                         │  │
│  │ Public Subnets: 10.0.1.0/24, 10.0.2.0/24              │  │
│  │   └── Application Load Balancer (Port 80)              │  │
│  │                                                         │  │
│  │ Private Subnets: 10.0.10.0/24, 10.0.20.0/24            │  │
│  │   └── ECS Fargate (2 tasks, NestJS)                   │  │
│  │   └── RDS MySQL (db.t3.micro)                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ECR: jobflow-api (Docker registry)                          │
│  CI/CD: GitHub Actions                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## Live Demo

The API is live and running!

- **API URL**: http://jobflow-alb-production-1484565429.ap-south-1.elb.amazonaws.com
- **Health**: http://jobflow-alb-production-1484565429.ap-south-1.elb.amazonaws.com/health
- **Swagger Docs**: http://jobflow-alb-production-1484565429.ap-south-1.elb.amazonaws.com/api/docs

---

## What's Next?

This project is just the beginning. Here's what I plan to add:

1. **HTTPS** - Add SSL certificate with ACM
2. **Domain Name** - Route 53 custom domain
3. **Monitoring** - CloudWatch dashboards
4. **Caching** - ElastiCache Redis
5. **Media Storage** - S3 for file uploads

---

## Conclusion

Building this project transformed me from someone who only knew local development to someone who understands production systems.

The key takeaway? **Don't be afraid to learn in public.** I made mistakes, encountered errors, and learned from each one.

If you're starting your cloud journey, my advice is simple:

1. Start with a simple project
2. Deploy it to AWS
3. Break things and fix them
4. Repeat

---

## Connect With Me

- **GitHub**: [Kaushiik-13/jobflow-api](https://github.com/Kaushiik-13/jobflow-api)
- **LinkedIn**: [Your LinkedIn Profile]

---

_Have questions about AWS, NestJS, or deployment? Drop a comment below!_
