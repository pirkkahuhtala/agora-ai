# Agora

Agora is a real-time group chat where users discuss a topic together, with AI acting as a secretary that keeps a live summary and welcomes new participants so they can join without missing context. Users bring AI into the conversation by starting a message with @agora.

In ancient Greece, the _agora_ was the central public space where citizens gathered to debate, deliberate, and exchange ideas. It was the beating heart of democratic discourse.

## Architecture

### System overview

```mermaid
graph TD
    subgraph Client["Browser (Next.js)"]
        CR[Chat room]
        CR --> ML[Message list]
        CR --> MI[Message input]
    end

    subgraph Supabase
        DB[(PostgreSQL\nrooms · messages · participants)]
        RT[Realtime]
    end

    subgraph AI["AI backend (API route)"]
        AGO[AI handler\ngpt-4o-mini]
    end

    MI -->|insert message| DB
    DB -->|row-level events| RT
    RT -->|live messages| ML

    MI -->|"@agora mention"| AGO
    AGO -->|fetch context| DB
    AGO -->|insert AI message| DB
    DB -->|row-level event| RT
```

### Data model

```mermaid
erDiagram
    ROOM {
        uuid id PK
        text topic
        text summary
        timestamptz created_at
    }

    PARTICIPANT {
        uuid id PK
        uuid room_id FK
        text name
        timestamptz joined_at
    }

    MESSAGE {
        uuid id PK
        uuid room_id FK
        text author
        text content
        boolean is_ai
        timestamptz created_at
    }

    ROOM ||--o{ PARTICIPANT : "has"
    ROOM ||--o{ MESSAGE : "contains"
```

### Message & summary flow

```mermaid
sequenceDiagram
    actor User
    participant Chat as Chat room
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    participant AI as AI (POST /api/ai)

    User->>Chat: Type & send message
    Chat->>DB: INSERT message
    DB-->>RT: Broadcast new message
    RT-->>Chat: All clients receive message

    Note over Chat,AI: When message starts with @agora
    Chat->>AI: POST /api/ai
    AI->>DB: SELECT all messages (context)
    AI-->>AI: generateText (gpt-4o-mini)
    AI->>DB: INSERT message (is_ai=true)
    DB-->>RT: Broadcast AI message
    RT-->>Chat: All clients see AI reply
```

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local Supabase)
- A [Supabase](https://supabase.com) project (for cloud deployment)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local and fill in your credentials
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-local-anon-key>
OPENAI_API_KEY=sk-...
EOF

# 3. Start local Supabase (requires Docker)
npx supabase start

# 4. Apply database migrations
npx supabase db reset

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Supabase Studio is available at [http://localhost:54323](http://localhost:54323).

## Commands

```bash
npm run dev      # development server
npm run validate # validate code and types
npm run build    # production build
npm run start    # production server
```

### Supabase

```bash
npx supabase start                                          # start local Supabase (Docker)
npx supabase stop                                          # stop local Supabase
npx supabase db reset                                      # reset local DB and re-run migrations
npx supabase db push                                       # push migrations to cloud project
npx supabase gen types typescript --local > types/database.ts  # regenerate TypeScript types
```
