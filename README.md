# Hello, team Incubyte! 👋

This is a collection of documents that walk you through how I approached the salary management tool assignment. From my understanding of the requirements, all the way to how I implemented the code. Each document builds on the previous one, so I'd recommend reading them in the order listed below.

I use Alacritty as my terminal of choice and tmux to run multiple sessions and split panes. I have Claude Code open in a split pane to the left of my screen, and to the right I usually have the application server running.

---

## Reading order

### 1. [Event Storm](1_EVENT_STORM.md)

Before touching any specs or schemas, I ran an event storm to identify the domain's natural boundaries, and surface any edge cases early. This process has always helped me translate business requirements to events and actions.

### 2. [Data Model](2_DATA_MODEL.md)

The schema follows directly from the event storm. This document covers the required tables and indexes, and the reasoning behind a handful of non-obvious field choices.

### 3. [API Contract](3_API_CONTRACT.md)

With the data model settled, this defines the JSON interface between the Rails backend and the Next.js frontend.

### 4. [Architecture Decisions](4_ARCHITECTURE_DECISIONS.md)

A record of the non-obvious decisions I made across the design. For example, why PostgreSQL over SQLite, why a dedicated salary endpoint, why flat JSON over JSON:API, and so on. For the scope of this assignment this allowed me to think out loud and convey my decisions with you.

### 5. [Project Structure](5_PROJECT_STRUCTURE.md)

How the Rails monolith and the Next.js frontend are organised. Including the reasoning behind structural choices like service objects, PORO serializers, and choice of tests.

### 6. [Testing Strategy](6_TESTING_STRATEGY.md)

How I approach testing this system: what gets tested, at which layer, and why. Covers the choice of Minitest and fixtures, and what I consider a meaningful suite of tests for this codebase.

---

I've tried my best to make the commit history in each repo reflect the incremental development approach I adopted in these documents.
