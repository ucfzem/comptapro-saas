# ComptaPro SaaS

Plateforme SaaS d'expertise comptable nouvelle génération — multi-tenant, multilingue (FR/EN/ES/AR), chiffrée de bout en bout.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.10-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS-blue)
![AES-256](https://img.shields.io/badge/Chiffrement-AES--256--GCM-green)
![RAG](https://img.shields.io/badge/IA-RAG%20(BOFIP%2FCGI)-orange)

---

## Stack Technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Base de données** | PostgreSQL + Row-Level Security |
| **IA** | LangChain + OpenAI GPT-4o + pgvector |
| **OCR** | Mindee API |
| **Sécurité** | AES-256-GCM, bcrypt, 2FA (TOTP) |
| **Déploiement** | Docker, Vercel, Supabase |

## Prérequis

- Node.js 18+
- PostgreSQL 15+ avec pgvector
- Compte Supabase (gratuit)
- Clés API : OpenAI, Mindee

## Installation

```bash
git clone https://github.com/ucfzem/comptapro-saas.git
cd comptapro-saas
npm install
cp .env.example .env
# Éditer .env avec vos clés
npx prisma db push
npx prisma db seed
npm run dev
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL avec pgvector |
| `ENCRYPTION_KEY` | Clé AES-256 (32 caractères) |
| `NEXTAUTH_SECRET` | Secret JWT |
| `MINDEE_API_KEY` | Clé API Mindee OCR |
| `OPENAI_API_KEY` | Clé API OpenAI (RAG) |

## Architecture

```
src/
├── app/[locale]/          # Routes i18n (fr, en, es, ar)
│   ├── page.tsx           # Dashboard
│   ├── saisie/            # OCR & saisie automatique
│   ├── cloture/           # Lettrage & clôture
│   ├── ia/                # Assistant IA (RAG)
│   └── security/          # Sécurité & infrastructure
├── components/            # UI (KpiCard, DataTable, Sidebar)
├── lib/                   # Prisma, crypto, auth, RAG
├── locales/               # Traductions 4 langues
└── middleware.ts          # next-intl routing
```

## Fonctionnalités

- **Dashboard** — KPI trésorerie, TVA, écritures en attente, graphique prévisionnel
- **Saisie OCR** — Scan Mindee, suggestion PCG, comptabilisation partie double
- **Lettrage** — Rapprochement débit/crédit, validation, export FEC norme 2013
- **Assistant IA** — RAG sur BOFIP/CGI avec citations des sources
- **Sécurité** — Chiffrement AES-256, RLS PostgreSQL, audit logs, 2FA

## Licence

MIT
