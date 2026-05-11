# pet-visit 后端

NestJS + TypeScript + Prisma + PostgreSQL。

## 启动开发环境

1. 本地 PostgreSQL（首次）：

```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s pet_visit
createdb -O pet_visit pet_visit
```

2. 复制环境变量：

```bash
cp .env.example .env
```

3. 安装依赖并迁移数据库：

```bash
pnpm install
pnpm prisma:migrate
```

4. 启动：

```bash
pnpm start:dev
```

服务监听 `http://localhost:8090`，接口前缀为 `/api`。

## 健康检查

```bash
curl http://localhost:8090/api/health
```

## 项目结构

参见 `docs/superpowers/plans/2026-05-09-01-foundation.md`。
