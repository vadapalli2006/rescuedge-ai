# RescuEdge AI 🛡️⚡
> **An Offline-First, Agentic DevOps CLI Tool for Resilient Deployments in Network-Constrained Environments.**

*Built for the Copado Agentia Headless Virtual Hackathon.*

---

## 🚨 The Problem
Traditional enterprise deployment pipelines (like Copado and cloud DevOps runners) depend heavily on persistent, high-speed network connections. When software developers, DevOps engineers, or field agents operate in network-constrained environments, remote locations, or face temporary internet outages:
* Deployment jobs crash mid-execution.
* Uncommitted pipeline updates get lost.
* Emergency hotfixes and patches are delayed, creating operational risk.

---

## 💡 The Solution: RescuEdge AI
**RescuEdge AI** acts as an offline safety net and resilient gateway for software delivery. Built with Node.js, TypeScript, Commander, and SQLite, it introduces a store-and-forward queueing model and local validation guardrails.

When network connectivity drops, deployment actions do not fail. Instead:
1. **Local Pre-Validation:** Payload metadata and syntax are verified locally before staging.
2. **Offline Store-and-Forward Queue:** Validated deployment commands are securely saved in a local SQLite database (`rescuedge_queue.db`).
3. **Automated Reconciliation:** Upon network restoration, the queue automatically syncs and triggers execution against remote Agentia/Copado pipelines in strict sequential order.

---

## 🏗️ Solution Architecture

```text
                      ┌─────────────────────────┐
                      │    RescuEdge AI CLI     │
                      └────────────┬────────────┘
                                   │
                           [ Metadata Gate ]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
            (Network Offline)             (Network Online)
           ┌─────────────────┐          ┌───────────────────┐
           │ Local SQLite    │          │ Agentia / Copado  │
           │ Action Queue    │          │ Pipeline Execution│
           └────────┬────────┘          └───────────────────┘
                    │
            [ Auto-Sync Sync ]
                    │
                    └───────────────────────────



Tech Stack
Language: Node.js, TypeScript (tsx)

CLI Command Framework: Commander

Local Persistence: SQLite3

Network Heartbeat & Connectivity: Axios

Interactive Terminal UI: Chalk, Ora Spinners


CLI Commands & Usage Guide
1. Execute or Queue Deployment (deploy)
Validates payload syntax locally. Executes directly if online, or safely queues in SQLite if offline.

Bash
npx tsx src/index.ts deploy -m "User_Auth_Module"
2. Inspect Pending Queue (status)
Displays all currently queued offline deployments, execution timestamps, and pending IDs stored locally.

Bash
npx tsx src/index.ts status
3. Reconcile & Sync Queue (sync)
Monitors connection status and flushes all pending local queue items to the pipeline sequentially when online.

Bash
npx tsx src/index.ts sync
📂 Project Structure
Plaintext
rescuedge-ai/
├── src/
│   ├── db.ts          # SQLite store-and-forward persistence
│   ├── executor.ts    # Network monitoring and automated queue sync
│   ├── validator.ts   # Local metadata quality gate rules
│   └── index.ts       # Main Commander CLI entry point
├── package.json
├── tsconfig.json
└── README.md
🌟 Key Features
Zero Data-Loss Staging: Guarantees critical deployment actions are safely logged even during complete network loss.

Local Pre-Validation Quality Gates: Prevents malformed or invalid component names from queueing locally.

Autonomous Reconciliation: Sequentially executes queued actions in creation order once connectivity returns.

Interactive Terminal UX: Clear status spinners and color-coded feedback for fast visual debugging.
