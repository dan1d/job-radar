import { JobCategory } from "./types";

export const defaultCategories: JobCategory[] = [
  {
    id: "rails",
    label: "Ruby on Rails",
    query: "ruby on rails",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of experience, including extensive Ruby on Rails work in production environments.

At Acima Credit (fintech), I built and maintained Rails microservices handling credit workflows on AWS EKS. At 2U (edtech), I worked across Rails, Python, and Node.js services with a focus on DevOps. I also built a full Rails CMS at HP.

My Rails expertise includes:
- API-only and full-stack applications
- Microservices architecture (Kafka, RabbitMQ)
- Background jobs (Sidekiq/GoodJob)
- PostgreSQL optimization & migrations
- RSpec with high coverage
- AWS, Heroku, Fly.io deployment

Happy to discuss your project in detail. Available to start right away.`,
  },
  {
    id: "nodejs",
    label: "Node.js / TypeScript Backend",
    query: "node.js OR nodejs",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of experience. Node.js and TypeScript are core tools in my stack.

Professional experience includes backend services at 2U (edtech) and Acima Credit (fintech, microservices on AWS EKS). I've also published multiple MCP servers to npm and built a payment integration platform (MercadoPago) — all in strict TypeScript with full test coverage.

What I bring:
- REST, GraphQL & WebSocket APIs
- TypeScript strict mode, no shortcuts
- TDD with Vitest/Jest (90%+ coverage)
- Docker, CI/CD, AWS deployment
- Clean architecture & clear documentation

Let's discuss your needs. Available to start immediately.`,
  },
  {
    id: "react",
    label: "React / Next.js",
    query: "react",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of experience building production React and Next.js applications.

At Acima Credit I built React frontends for fintech workflows, and at 2U I worked on edtech platforms. I also built LiveVenta — a React + Vite + Tailwind app for TikTok Live sellers with 247 tests passing.

My frontend skills include:
- React, Next.js, Vite
- TypeScript strict mode throughout
- TanStack Query, Zustand, Redux
- Tailwind CSS, shadcn/ui
- Comprehensive test suites (Vitest, Testing Library)

I'd love to hear more about your project. Available to start now.`,
  },
  {
    id: "react-native",
    label: "React Native / Mobile",
    query: "react native",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of experience. I build React Native / Expo apps with modern patterns.

I built Cobroya — a payment management app using Expo SDK 55, React Native 0.83, Expo Router, TanStack Query, and TypeScript strict mode. It has 109 tests at 95% coverage with Android .aab builds ready for production.

My mobile experience includes:
- Expo & bare React Native workflows
- Cross-platform Android + iOS builds
- Deep linking & push notifications
- Offline-first patterns
- Full TDD with high coverage

I can deliver a polished, well-tested mobile app. Let me know more about your project.`,
  },
  {
    id: "fullstack",
    label: "Full-Stack / Senior",
    query: "full stack OR fullstack",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of professional experience across the entire stack.

Career highlights:
- Acima Credit (fintech): Rails microservices, React frontends, AWS EKS, Kafka
- 2U (edtech): Rails, Python, Node.js, DevOps
- HP: Rails CMS platform
- Open source: MCP servers published on npm, React Native payment app

My stack: Rails, Node.js, TypeScript, React, React Native, PostgreSQL, Redis, Docker, AWS. I write clean, well-tested code with strong typing and thorough documentation.

Based in Argentina — available to start immediately. Let's discuss your project.`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    query: "typescript",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of experience. TypeScript is my primary language — I use strict mode across all projects with no shortcuts.

I've shipped TypeScript in production at Acima Credit (fintech) and 2U (edtech), and across personal projects: MCP servers published on npm, a React Native payment app (95% test coverage), and a real-time TikTok seller platform (247 tests).

I build:
- Full-stack applications (Next.js, Node.js, Hono)
- SDK/library packages (npm published)
- API integrations & developer tools
- Comprehensive test suites (Vitest/Jest)

Clean code, strong types, thorough tests. Available to start now.`,
  },
  {
    id: "ai-tools",
    label: "AI / LLM Tooling",
    query: "LLM OR MCP OR openai OR langchain OR AI engineer",
    proposalTemplate: `Hi! I'm a senior full-stack engineer with 12+ years of experience, currently building AI developer tooling.

I've built and published multiple MCP (Model Context Protocol) servers to npm — including integrations for MercadoLibre, DolarAPI, and MercadoPago. I have deep experience with the MCP SDK, SSE transport, tool integration patterns, and Claude/OpenAI APIs.

What I can deliver:
- MCP servers (TypeScript, full test coverage, npm published)
- LLM-powered features & agent workflows
- AI API integrations (Claude, OpenAI, embeddings)
- Production-ready tooling with CI/CD

I'd love to discuss your requirements. Available to start immediately.`,
  },
];
