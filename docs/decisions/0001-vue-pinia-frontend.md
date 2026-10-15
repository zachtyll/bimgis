# 0001: Vue 3 + Pinia for the frontend

- **Status:** accepted
- **Date:** 2026-10-12

## Context
The frontend is a single imperative `main.ts` that writes straight to the DOM. The product needs many panels (layers, feature info, comments, cases, decisions), routing, and shareable state. The team prefers Vue.

## Decision
Use Vue 3 (Composition API, TypeScript), Pinia for state and Vue Router. The app lives in `web/`. The structure is described in [design/02](../design/02-frontend-architecture.md).

## Consequences
- giro3d/three objects must stay outside reactive state (`markRaw`, viewer service pattern).
- Stores hold serialisable data only, which makes viewpoints and URLs easy.
- Existing `main.ts` logic gets split up and moved into `web/src/viewer/`.
