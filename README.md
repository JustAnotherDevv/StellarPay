## Payment Splitter

```mermaid
graph TD
    A[User] -->|Interacts with| B[React Mobile-first dApp]
    B -->|Sends requests to| D[Stellar Network]
    D -->|Executes| E[Smart Contract]
    E -->|Manages| F[Payment Splitting Logic]
    F -->|Sends| G[Stablecoins]
    G -->|To| H[Recipients]
    
    subgraph Frontend
    B -->|State Management| I[React Hooks/Context]
    B -->|UI Components| J[shadcn/ui]
    B -->|Auth| K[Passkeys / Freighter]
    end
    
    subgraph Stellar
    D -->|Account Management| N[Stellar Accounts]
    D -->|Transaction Handling| O[Stellar SDK]
    end
```

### Links

### Problem

### Solution

### Impact

## Features

-

## Tech Stack

- **Dapp** - React + Vite + shadcn/ui
- **Web3** - Stellar + Soroban smart contracts
- **Auth** - Passkeys

### Getting Started

- Install dependenciex - `pnpm i`
- Build smart Soroban smart contracts and deploy to chosen network(optional)
- Copy content of `.env.example` to `.env` and fill it out with your variables
- Start dapp with command `pnpm run dev`
