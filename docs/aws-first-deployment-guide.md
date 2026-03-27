# AWS first-time deployment with Serverless Framework

This guide is for developers who have **never deployed to AWS** before. It explains **what each piece is for**, what you must create **manually**, and what the **Serverless Framework creates for you** when you run `serverless deploy`.

It matches this project’s target stack: **Express on AWS Lambda**, **API Gateway**, **Prisma + Neon PostgreSQL** (see [deployment.md](./deployment.md)).

---

## 1. What you are building (big picture)

```text
Internet → API Gateway → Lambda (your Express app) → Neon PostgreSQL (TLS)
```

| Piece | What it does |
|--------|----------------|
| **API Gateway** | Public HTTP endpoint (URL). Routes requests to Lambda. |
| **Lambda** | Runs your Node.js code in short-lived containers (no servers to manage). |
| **IAM (users & roles)** | **Who** can call AWS APIs. **Lambda execution role** = what your function may do inside AWS (e.g. write logs). **Your IAM user** = what *you* (or CI) may do to *deploy* (create Lambda, stacks, etc.). |
| **CloudFormation** | AWS “infrastructure as code” stacks. Serverless uses it under the hood to create/update Lambda, API Gateway, IAM roles, etc. |
| **S3** | Serverless uploads the deployment package (zip) to a bucket; CloudFormation references it. |

You do **not** need to click through every service in the console if you use Serverless: **one deploy command** creates/updates most resources.

---

## 2. Do you need a VPC?

A **VPC** is a private network in AWS (subnets, routing, often NAT for outbound internet).

| Scenario | VPC needed? |
|----------|-------------|
| **Database is Neon** (hosted, reachable over the internet with `sslmode=require`) | **Usually no.** Lambda can connect to Neon **without** being inside a VPC. This is the **simplest** path for this repo. |
| **Redis/ElastiCache or RDS inside a private VPC** | **Yes.** Lambda must run **in the same VPC** (with security groups) to reach those resources. Extra setup: subnets, NAT or VPC endpoints, security groups, and Lambda needs IAM permission for ENI management. |

**Recommendation for your first deploy:** use **Neon without VPC** for the database. Add VPC later only if you move the DB or add in-VPC services.

---

## 3. Prerequisites

1. **AWS account** (credit card required for the account; many services have a free tier, but always set a **billing alarm** in AWS Billing).
2. **Node.js** (LTS, e.g. 20.x) — already used by this project.
3. **Git** and this repository cloned locally.

You will install:

- **AWS CLI v2** — talks to AWS from your terminal using your IAM user keys.
- **Serverless Framework** (`serverless` CLI) — packages the app and drives CloudFormation.

---

## 4. Step A — Create an IAM **user** for deployments (not the root user)

**Why:** Never use the AWS account **root** user for daily work or deploys. Create a dedicated **IAM user** (e.g. `serverless-deploy`) with programmatic access.

1. Sign in to **AWS Console** → **IAM**.
2. **Users** → **Create user**.
3. Name: e.g. `serverless-deploy`.
4. **Access type:** enable **Programmatic access** (access key). Console password is optional for this user.
5. **Permissions** — for **learning / first success**, attaching **AdministratorAccess** is the fastest path (broad permissions). For production or shared accounts, replace this later with a **least-privilege** custom policy (Serverless docs publish example policies that list `lambda:*`, `cloudformation:*`, `iam:*`, `apigateway:*`, `s3:*`, `logs:*`, etc.).
6. Create the user and **save the Access Key ID and Secret Access Key** in a password manager. **You cannot retrieve the secret again** if you lose it (you can rotate keys and create a new pair).

**What about “IAM roles”?**  
- **Your IAM user** = identity used by **you** (CLI) to **deploy**.  
- **Lambda execution role** = identity used by **Lambda at runtime**. Serverless **creates** this role automatically unless you point `provider.iam.role` to an existing ARN.

You typically **do not** manually create the Lambda execution role on first deploy.

---

## 5. Step B — Configure AWS CLI

Install AWS CLI v2 (follow the official install steps for your OS), then:

```bash
aws configure
```

Enter:

- **AWS Access Key ID** / **Secret** — from the IAM user above.
- **Default region** — e.g. `us-east-1` (must match what you set in `serverless.yml` `provider.region`).
- **Default output format** — `json` is fine.

Verify identity:

```bash
aws sts get-caller-identity
```

You should see your **Account** and **Arn** for the IAM user.

---

## 6. Step C — Install Serverless Framework

```bash
npm install -g serverless
```

Or use `npx serverless` without global install. Check version:

```bash
serverless --version
```

Optional: create a **Serverless account** only if you use Serverless Dashboard features; **deployment to AWS does not require** the dashboard.

---

## 7. Step D — `serverless.yml` and the Express → Lambda adapter

### 7.1 Which package: Codegenie vs Vendia

Use **`@codegenie/serverless-express`** (npm). It is the **actively maintained** project (successor to the old `aws-serverless-express`).

**`@vendia/serverless-express`** is **legacy**: it is largely a thin wrapper that depends on `@codegenie/serverless-express` and is **not** where new fixes land. Prefer installing **`@codegenie/serverless-express`** directly.

Both solve the same problem: translate **API Gateway (HTTP API or REST)** events into Node **`IncomingMessage` / `ServerResponse`** so your existing Express `app` runs unchanged inside Lambda.

### 7.2 How the adapter fits this repo

| File | Role |
|------|------|
| `src/app.js` | Builds `express()`, mounts routes, **`module.exports = app`**. Same app for local and Lambda. |
| `src/index.js` | Local only: `dotenv`, `app.listen(PORT)`. **Not used** by Lambda. |
| `src/lambda.js` (you add this) | Imports `app`, wraps it with `serverlessExpress({ app })`, exports **`handler`**. Must match `serverless.yml` → `handler: src/lambda.handler`. |

Lambda **does not** call `app.listen`. API Gateway invokes `handler`; the adapter runs Express for that single request and returns the response.

Environment variables for deploy come from **`serverless.yml` `provider.environment`** (and optionally SSM/Secrets Manager). You do **not** need `dotenv` inside `lambda.js` for production if all vars are injected there. Keep `dotenv` in `src/index.js` for local dev.

### 7.3 Install

```bash
npm install @codegenie/serverless-express
```

Use the **v4** style API (current major):

```javascript
// src/lambda.js
const serverlessExpress = require('@codegenie/serverless-express');
const app = require('./app');

exports.handler = serverlessExpress({ app });
```

That matches `functions.api.handler: src/lambda.handler` in `serverless.yml`.

### 7.4 API Gateway HTTP API (`httpApi`) vs REST

This project’s `serverless.yml` uses **`httpApi`** (API Gateway v2). `@codegenie/serverless-express` supports v2; the library’s repo includes examples under **`examples/basic-starter-api-gateway-v2`** if you need a reference.

### 7.4.1 Optional: binary responses (files, PDFs)

If you return non-JSON binary bodies, configure **binary media types** in API Gateway and the adapter’s `binarySettings` / `contentTypes` per the [upstream README](https://github.com/CodeGenieApp/serverless-express). A typical JSON REST API can ignore this at first.

### 7.5 Prisma and cold starts

Run **`npm run db:generate`** before `serverless deploy` so the Prisma client is in the deployment bundle. Reuse a **single Prisma client** at module scope (your `prisma.config.js` pattern) to avoid opening new connections on every invocation.

### 7.6 Checklist before `serverless deploy`

- [ ] `serverless.yml` present with `handler` pointing to your Lambda file.
- [ ] `src/lambda.js` (or equivalent) exports `handler` as above.
- [ ] `@codegenie/serverless-express` in `package.json` dependencies.
- [ ] Required env vars set for the deploy (shell `export`, CI secrets, or SSM), including `DATABASE_URL` for Neon.

See also [deployment.md](./deployment.md) for env vars and the minimal provider block.

---

## 8. Step E — Environment variables and secrets

Lambda needs the same logical config as local `.env`, but you should **not** commit secrets.

**Options:**

1. **CI/CD or local deploy:** export variables in the shell before deploy, or use a **`.env`** with `serverless-dotenv-plugin` (do not commit `.env` with production secrets).
2. **AWS Systems Manager Parameter Store** or **Secrets Manager** — reference ARNs in `serverless.yml` and grant the **Lambda execution role** `ssm:GetParameters` or `secretsmanager:GetSecretValue` as needed.
3. For a **first test**, minimal vars often include: `DATABASE_URL` (Neon), `JWT_SECRET`, `JWT_EXPIRES_IN`, and rate-limit vars (see [deployment.md](./deployment.md)). Create a **`users`** row (after migrations) via `SEED_ADMIN_*` + `db:seed` or manual SQL.

**Neon:** use a connection string with **`sslmode=require`**.

---

## 9. Step F — Database migrations (production)

Run migrations **against Neon** from your machine or CI **before or after** deploy (not inside every HTTP request):

```bash
npx prisma migrate deploy
```

Ensure `DATABASE_URL` points to the **Neon** database for that environment.

---

## 10. Step G — Deploy

From the project root (after `npm install` and `npm run db:generate`):

```bash
serverless deploy
```

Or with stage/region:

```bash
serverless deploy --stage dev --region us-east-1
```

**What Serverless roughly does:**

1. Packages your function(s) into a zip.
2. Uploads to an **S3** deployment bucket (created/managed by Serverless).
3. Updates or creates a **CloudFormation** stack with **Lambda**, **API Gateway**, **IAM roles**, **CloudWatch Logs**, etc.
4. Prints the **HTTP API endpoint URL** at the end.

---

## 11. Step H — Verify

1. Call **GET** `{baseUrl}/api/health` (or whatever path your app mounts — confirm in `src/app.js`).
2. Test login and a read endpoint.
3. In **CloudWatch** → **Log groups** → `/aws/lambda/<function-name>`, check logs if something fails.

---

## 12. What you almost never do manually on the first Serverless deploy

- **Create Lambda by hand** in the console — Serverless creates it.
- **Create API Gateway by hand** — defined in `serverless.yml` `events`.
- **Create the Lambda execution role** — Serverless creates it unless you override `provider.iam.role`.

You **do** create manually:

- **AWS account**, **IAM deploy user**, **access keys**.
- **Neon** project and `DATABASE_URL`.
- **`serverless.yml` + handler** in the repo.

---

## 13. Optional: VPC for Lambda (advanced)

Only if you need private resources:

1. VPC with **private subnets** (and **NAT Gateway** or **VPC endpoints** for AWS APIs if required).
2. **Security groups** allowing Lambda → DB/Redis port.
3. In `serverless.yml`, attach **VPC** `subnetIds` and `securityGroupIds` under `provider.vpc` or per function.
4. Extend the **Lambda execution role** with **EC2 network interface** permissions (`ec2:CreateNetworkInterface`, `DescribeNetworkInterfaces`, `DeleteNetworkInterface`, etc.). Serverless examples often add these via `iam.role.statements`.

Cold starts can get slower with VPC; that is normal.

---

## 14. Troubleshooting (common first-time issues)

| Symptom | Likely cause |
|---------|----------------|
| `Access Denied` on deploy | IAM user missing permissions (e.g. CloudFormation, S3, IAM PassRole). |
| API returns 502 | Lambda crash on startup — check CloudWatch logs; often missing `DATABASE_URL` or Prisma client not generated in package. |
| DB connection errors | Wrong `DATABASE_URL`, Neon firewall/IP allowlist, or missing `sslmode=require`. |
| Wrong region | `aws configure` region ≠ `serverless.yml` `provider.region`. |

---

## 15. Cleanup (destroy stack)

To remove resources created by Serverless for this service (be careful in shared accounts):

```bash
serverless remove --stage dev
```

Confirm in **CloudFormation** console that the stack is deleted.

---

## 16. Security checklist (before production)

- [ ] No secrets in git; use Parameter Store / Secrets Manager or CI secrets.
- [ ] JWT secret is strong and unique per environment.
- [ ] Restrict IAM deploy user permissions when you are comfortable with IAM.
- [ ] Enable AWS **billing alarms** and review Lambda/API Gateway costs.

---

## 17. Further reading in this repo

- [deployment.md](./deployment.md) — target architecture, env vars, minimal `serverless.yml` blueprint, Prisma notes.
- [architecture.md](./architecture.md) — how the Express app is structured.

For official Serverless AWS provider details (IAM, `serverless.yml`), see the [Serverless Framework AWS guide](https://www.serverless.com/framework/docs/providers/aws/guide/intro).
