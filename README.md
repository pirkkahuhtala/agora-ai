# Agora

This app takes that spirit online: a real-time group chat room built around a chosen topic, where AI acts as a secretary — keeping a live summary of what's been discussed and welcoming new participants so they can join the conversation without missing context.

In ancient Greece, the _agora_ was the central public space where citizens gathered to debate, deliberate, and exchange ideas. It was the beating heart of democratic discourse.

## Architecture

### System overview

```mermaid
graph TD
    subgraph Client["Browser (Next.js)"]
        LP[Landing page\nCreate / join room]
        CR[Chat room]
        CR --> ML[Message list]
        CR --> MI[Message input]
        CR --> SP[Summary panel]
        CR --> PL[Participant list]
    end

    subgraph Supabase
        Auth[Auth\nanonymous / email]
        DB[(PostgreSQL\nrooms · messages · summaries)]
        RT[Realtime\npresence + broadcast]
    end

    subgraph AI["AI backend (server actions)"]
        SUM[Summariser\ngpt-4o-mini]
        WEL[Welcome composer\ngpt-4o-mini]
    end

    LP -->|create / join| Auth
    Auth --> CR
    MI -->|insert message| DB
    DB -->|row-level events| RT
    RT -->|live messages| ML
    RT -->|presence| PL

    DB -->|new messages trigger| SUM
    SUM -->|upsert summary| DB
    DB --> SP

    RT -->|new participant event| WEL
    WEL -->|post welcome message| DB
```

### Data model

```mermaid
erDiagram
    ROOM {
        uuid id PK
        text topic
        text slug
        timestamptz created_at
    }

    PARTICIPANT {
        uuid id PK
        uuid room_id FK
        text display_name
        timestamptz joined_at
    }

    MESSAGE {
        uuid id PK
        uuid room_id FK
        uuid participant_id FK
        text content
        text role "user | assistant"
        timestamptz created_at
    }

    SUMMARY {
        uuid id PK
        uuid room_id FK
        text content
        int message_count
        timestamptz updated_at
    }

    ROOM ||--o{ PARTICIPANT : "has"
    ROOM ||--o{ MESSAGE : "contains"
    ROOM ||--|| SUMMARY : "has"
    PARTICIPANT ||--o{ MESSAGE : "sends"
```

### Message & summary flow

```mermaid
sequenceDiagram
    actor User
    participant Chat as Chat room
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    participant AI as AI (server action)

    User->>Chat: Type & send message
    Chat->>DB: INSERT message
    DB-->>RT: Broadcast new message
    RT-->>Chat: All clients receive message

    Note over DB,AI: After every N messages
    DB->>AI: Trigger summarisation
    AI->>DB: UPSERT summary
    DB-->>RT: Broadcast summary update
    RT-->>Chat: Summary panel refreshes

    actor NewUser
    NewUser->>Chat: Join room
    Chat->>RT: Presence join event
    RT->>AI: Compose welcome (summary + topic)
    AI->>DB: INSERT welcome message
    DB-->>RT: Broadcast welcome
    RT-->>Chat: All clients see welcome
```

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for local Supabase)
- A [Supabase](https://supabase.com) project (for cloud deployment)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
#    Copy the template and fill in your Supabase project URL and anon key
#    (Settings → API in the Supabase dashboard)
cp .env.local .env.local   # edit NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

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
npm run build    # production build
npm run start    # production server
npm run lint     # linter
```

### Supabase

```bash
npx supabase start                                          # start local Supabase (Docker)
npx supabase stop                                          # stop local Supabase
npx supabase db reset                                      # reset local DB and re-run migrations
npx supabase db push                                       # push migrations to cloud project
npx supabase gen types typescript --local > types/database.ts  # regenerate TypeScript types
```
