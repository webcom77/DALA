# DALA — Sistema de Gestão para Loja de Roupas

Sistema web moderno e modular desenvolvido em **Next.js com App Router**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** e **Supabase**.

---

## 🚀 Módulos Implementados

### 1. Fundação Técnica & Autenticação
- Arquitetura limpa com App Router e Server/Client Components.
- Sistema de autenticação via Supabase Auth e sessão administrativa integrada.
- Proteção estrita de rotas via Next.js Middleware.
- Recuperação de senha funcional (`/forgot-password`).
- Layout administrativo SaaS responsivo (desktop-first 1366x768 e drawer mobile).
- Alternância instantânea de **Tema Claro** e **Tema Escuro** (`next-themes`).
- Formatação monetária e de datas no padrão brasileiro (`pt-BR`, `BRL`, `America/Sao_Paulo`).

### 2. Catálogo de Produtos & Grade de Vestuário
- Categorias de vestuário (Vestidos, Camisas e Blusas, Calças e Jeans, etc.).
- Catálogo de peças com busca instantânea, filtros por categoria e status ativo/inativo.
- **Gerador Rápido de Grade**: Matriz de combinações cruzadas entre Tamanhos (PP, P, M, G, GG, 36 a 44, Único) e Cores com geração automática de SKUs.
- Cálculo e exibição automática de Margem Bruta Estimada da peça.

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui tokens
- **Banco de Dados**: PostgreSQL (Supabase) com RLS e triggers
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide Icons
- **Notificações**: Sonner (Toasts)

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

---

## 📦 Scripts Disponíveis

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build

# Iniciar servidor de produção
npm start

# Executar linter
npm run lint
```
