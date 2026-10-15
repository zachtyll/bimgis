# 0004: The thesis design framework drives platform features

- **Status:** accepted
- **Date:** 2026-10-12

## Context
Without a clear source for what the platform should do, feature ideas came from technology (BIM, 3D) and from one municipality's process description. Our thesis (Frisenstam & Tyllström, 2026, [docs/inspo/thesis.typ](../inspo/thesis.typ)) reviewed the literature on what enables and hinders participatory planning, and produced a five-dimension design framework: fidelity, inclusion, social engagement, collaborative knowledge, and governance.

## Decision
- [design/00](../design/00-participation-design-framework.md) turns the thesis framework into prioritised requirements (FID/INC/SOC/KNO/GOV). It is the primary source for features; other design docs serve it.
- Every capability and feature traces to at least one requirement ID.
- The thesis framework is also our acceptance check: we assess the platform at each milestone in `docs/assessments/`.

## Consequences
- Participation, transparency and inclusion features come before more 3D fidelity. BIM is a bonus (FID-3, *Could*).
- The first vertical slice moves from samråd (Phase 3) to a förstudie dialogue (Phase 1–2). See [design/04](../design/04-capabilities-and-planning-process.md) §5.
- The citizen view must work on phones without spatial skills (INC-1/2/3). This constrains frontend design from now on.
