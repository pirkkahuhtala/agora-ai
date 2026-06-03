# Agora

Agora is a real-time group chat where users discuss a topic together. Users can ask the AI secretary into the conversation by starting a message with `@agora` — it responds with context awareness of the full conversation.

In ancient Greece, the _agora_ was the central public space where citizens gathered to debate, deliberate, and exchange ideas. It was the beating heart of democratic discourse.

## Architecture

### System overview

```mermaid
graph TD
    subgraph Client["Browser (Next.js)"]
        NM[NicknameModal]
        CR[Chat room]
        CR --> RD[RoomDetails\ntopic + summary]
        CR --> ML[MessageList]
        CR --> MI[MessageInput]
        CR --> PL[ParticipantList\nsidebar]
    end

    subgraph Supabase
        DB[(PostgreSQL\nrooms · messages · participants)]
        RT[Realtime]
    end

    subgraph AI["AI backend (API route)"]
        AGO[AI handler\ngpt-4o-mini]
    end

    NM -->|nickname → localStorage| CR
    NM -->|INSERT participant| DB
    MI -->|INSERT message| DB
    DB -->|row-level events| RT
    RT -->|live messages| ML
    RT -->|participant INSERT/DELETE| PL

    MI -->|"@agora mention"| AGO
    AGO -->|SELECT messages context| DB
    AGO -->|INSERT message is_ai=true| DB
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

### Message flow

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
    Chat->>AI: POST /api/ai {roomId, userMessage}
    AI->>DB: SELECT all messages (context)
    AI-->>AI: generateText (gpt-4o-mini)
    AI->>DB: INSERT message (is_ai=true)
    DB-->>RT: Broadcast AI message
    RT-->>Chat: All clients see AI reply
```

### Participant lifecycle

```mermaid
sequenceDiagram
    actor User
    participant Modal as NicknameModal
    participant LS as localStorage
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    participant Others as Other clients

    User->>Modal: Enter nickname
    Modal->>LS: persist agora:nickname
    Modal->>DB: DELETE stale rows (room_id + name)
    Modal->>DB: INSERT participant
    DB-->>RT: Broadcast INSERT
    RT-->>Others: Participant list updated

    Note over User,DB: On page unload / unmount
    User->>DB: DELETE participant (by id)
    DB-->>RT: Broadcast DELETE
    RT-->>Others: Participant list updated
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
npx supabase start                                              # start local Supabase (Docker)
npx supabase stop                                               # stop local Supabase
npx supabase db reset                                           # reset local DB and re-run migrations
npx supabase login                                              # login to Supabase CLI with access token
npx supabase link                                               # link local project to cloud project
npx supabase db push                                            # push migrations to cloud project
npx supabase gen types typescript --local > types/database.ts   # regenerate TypeScript types
```
