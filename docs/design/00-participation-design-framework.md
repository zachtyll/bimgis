# 00: Participation design framework (read this first)

**This document is the primary source for what the platform does.** It turns the findings and the design framework of our thesis into platform requirements:

> Frisenstam, C. & Tyllström, Z. (2026). *A framework to elicit insights about smart city platforms that enable participatory futuring.* Stockholm University. Source: [docs/inspo/thesis.typ](../inspo/thesis.typ)

The other design docs serve this one. [01](01-vision-and-domain.md) covers the domain, [02](02-frontend-architecture.md)/[03](03-3d-data-and-ifc.md) cover how we build it, and [04](04-capabilities-and-planning-process.md) maps requirements to capabilities and Luleå's planning process. When they disagree with this document, this document wins. Changes to it should be traceable to the thesis or to new evidence.

## 1. What the thesis found

1. **Governance limits participation more than technology does.** The solutions reviewed got stuck at *placation* or *consultation* on Arnstein's ladder. This wasn't because the tech couldn't do more, but because they sat inside top-down decision structures. Pilots also tend to drop participation later in the project because of time and budget pressure.
2. **The field is crowded at one point:** a *Planner-Cockpit* (a complex interactive system, per Noennig et al.) used in **Phase 3, generating and evaluating alternatives** (per Kahachi et al.). Experts, however, recommend involving citizens **at the earliest stages**, with transparent evaluation criteria to avoid tokenism.
3. **Fidelity versus accessibility.** Realism and immersion increase engagement and a sense of belonging. High-fidelity tools, though, demand hardware and skills that exclude people, and they tend to lack collaboration features.
4. **Spatial literacy is the main barrier.** Feature-rich tools exclude non-experts. What helps: simple multi-device interfaces, onboarding, starter examples, and social support such as intergenerational help.
5. **Participation works as a social activity:** dialogue, shared knowledge, user-generated content (photos, ratings, stories), asynchronous collaboration, and playful elements. One-way feedback forms underperform.
6. **People need to see what happened to their input.** In one cited review, 40% of platforms gave citizens no way to track whether their proposals were implemented.
7. **Trust requires transparent processes and visible governance:** data ownership, privacy, communication, equitable access, open source and open specifications. These should be visible *inside* the platform, not just on a separate website (the Helsinki lesson). Tools should **complement existing decision structures**, not replace them.

## 2. Where we position the platform

| Axis | Typical today (thesis) | Our target |
|---|---|---|
| Planning phase (Kahachi) | Phase 3, alternatives | **All five phases**, with deliberate investment in **Phase 1–2** (collecting and analysing local knowledge) and **Phase 5** (monitoring, "what happened with my input"), where the literature is thin |
| Typology / interaction (Noennig) | Planner-Cockpit for everyone | **Viewer/Finder + simple contribution for citizens; Planner-Cockpit for officials.** Same data, progressive disclosure by role |
| Arnstein's ladder | Placation / consultation | Mechanisms that can support **partnership**. The platform must also **state honestly which rung each activity is on**, because the municipality's governance sets the ceiling |
| Governance model | Hybrid / middle-out | Hybrid, **embedded in the municipality's existing process** (Luleå's ÖP process, PBL), not a parallel track |
| Fidelity | Either immersive *or* accessible | Web-based, runs on phones, LoD tiers with heavy work on the server, and a street-level view for "being there" |

## 3. Requirements by dimension

The IDs are referenced from [04](04-capabilities-and-planning-process.md), from issues and from assessments. Priority uses MoSCoW: **M**ust, **S**hould, **C**ould, **W**on't-yet. Each requirement traces to a question in the thesis framework (§ Design framework).

### FID: Experiential fidelity and representational realism

| ID | Requirement | Pri | Thesis basis |
|---|---|---|---|
| FID-1 | Show the real place: terrain, imagery and buildings at the best available LoD, with the LoD made visible to the user | M | "Reflect the physical environment?"; fidelity drives engagement |
| FID-2 | Street-level / first-person view so users can situate themselves, not just a bird's-eye view | S | "Immerse the user?"; the Helsinki assessment criticised bird's-eye-only views |
| FID-3 | Explore inside buildings where BIM exists, as a reason to engage that also invites contributions back | C | Conclusion RQ3: "explore the insides of buildings" |
| FID-4 | Show proposals in context: a proposed building or change next to the existing city, with before/after | M | Phase 3 still needs to be done well |
| FID-5 | Real-time city data (sensors, energy, weather) as layers | W | "Provide realtime data…?"; low value for planning participation now |
| FID-6 | Embodiment (avatars, presence) | W | Needs VR; conflicts with INC-2 |

### INC: Fairness and inclusion

| ID | Requirement | Pri | Thesis basis |
|---|---|---|---|
| INC-1 | **Contributing must not require spatial skills.** Tap a place, write, attach a photo; no polygon drawing, no layer management | M | Spatial literacy is the main barrier |
| INC-2 | Runs in a mobile browser on mid-range phones. No install, no special hardware | M | "Run on constrained hardware?"; "Require specialized hardware?" |
| INC-3 | Progressive disclosure: citizen view by default, expert tools behind role or opt-in. No redundant features in the default view | M | "Exclude users by providing redundant features?" |
| INC-4 | Every map interaction has a list/text equivalent; screen-reader support; WCAG 2.1 AA (also a Swedish public-sector legal requirement) | M | "Settings to support disabilities?" |
| INC-5 | Onboarding: a short guided first visit, help, starter examples ("what a good comment looks like") | M | "Provide onboarding material?" |
| INC-6 | Colour-blind-safe palettes, contrast and text-size settings, plain-language texts (Swedish first, other languages and easy-to-read Swedish later) | S | Accessibility settings; plain language |
| INC-7 | Assisted participation: someone (a librarian, relative or official) can help another person submit, and it's recorded as assisted | C | Intergenerational support structures |

### SOC: Social engagement and collective participation

| ID | Requirement | Pri | Thesis basis |
|---|---|---|---|
| SOC-1 | Contributions are visible to others (after moderation) and can be **replied to and supported**. Participation is a conversation, not a form | M | "Frame participation as social?"; dialogue |
| SOC-2 | Moderation: rules, reporting, a moderation queue, and transparent moderation decisions | M | "Features to moderate users?" |
| SOC-3 | Follow a place, plan or topic and get notified about replies and status changes | S | Sustained engagement, retention |
| SOC-4 | **The reward is visible impact**: "your input was used here", shown on your contributions and on the map. No points-for-volume | M | "Reward the user?"; must avoid gamifying volume |
| SOC-5 | Groups/communities around a neighbourhood or topic (associations, school classes) | C | "Creating communities?" |
| SOC-6 | Light playful elements: exploration, guided "walks" through a proposal | C | Gamification lowers barriers |
| SOC-7 | Facilitation support that reduces dominance by loud voices, e.g. AI clustering that weights arguments, not repetitions | C | AI facilitation "taking the power out of the room" |

### KNO: Collaborative knowledge production and coordination

| ID | Requirement | Pri | Thesis basis |
|---|---|---|---|
| KNO-1 | **Track status** of every plan, proposal and contribution, publicly: where in the process, what was decided, why | M | "Track and visualize status?"; 40% of platforms lack it |
| KNO-2 | Shared **knowledge base**: the evidence (kunskapsunderlag) behind plans, *plus* citizen-contributed local knowledge, both linkable to places and plan statements | M | "Space to store shared knowledge?" |
| KNO-3 | Contribute artefacts: photos, place markers, ratings of places ("I like / feel unsafe here") | M | "Uploading artifacts?"; "Rating points of interest?" |
| KNO-4 | **Stories**: a sequence of viewpoints with text and images that frames a proposal or a problem. Can be made by citizens or officials | S | "Creating stories to frame proposals?"; the story-feature request in the thesis |
| KNO-5 | Asynchronous discussion between experts and non-experts on the same object, with roles visible | M | "Collaboration between experts and non-experts?" |
| KNO-6 | Citizen-generated alternatives, constrained to feasible choices, with the constraints (cost, rules, goals) explained | C | Expert worry about feasibility; the need to educate |
| KNO-7 | Synthesis: officials turn many contributions into shared insights, with AI assistance and human ownership | S | "Synthesis of several citizens' opinions" |

### GOV: Governance, infrastructure and platforms

| ID | Requirement | Pri | Thesis basis |
|---|---|---|---|
| GOV-1 | **Transparent process**: each participation activity shows its phase, timeline, who decides, and *how input will be used and what is not open for influence* (its Arnstein rung, stated honestly) | M | "Transparent process management?"; tokenism |
| GOV-2 | Embedded in existing decision structures: follows the municipality's process (Luleå ÖP / PBL), and outputs feed its documents (e.g. samrådsredogörelse) | M | "Complement existing decision-making structures?" |
| GOV-3 | In-platform pages for data governance, ownership/licences per dataset, privacy (GDPR), communication policy, equitable access and security, linked from where they matter | M | Six framework questions; the Helsinki lesson |
| GOV-4 | Open source, open specifications (OGC, CityGML/CityJSON, IFC, BCF) | M | "Reason to not be open source?"; "Open specifications?" |
| GOV-5 | Lineage: decisions link to the contributions and evidence they considered | M | Trust; transparency of outcomes |
| GOV-6 | Start small: one real process in one area, alongside analogue methods (meetings, paper) rather than replacing them; analogue input can be entered too | M | "Small-scale projects integrated into existing structures… complement analog processes" |

## 4. Tensions and how we resolve them

| Tension | Resolution |
|---|---|
| Fidelity vs accessibility | Web + LoD tiers + server-side heavy lifting (pre-converted 3D Tiles, see [03](03-3d-data-and-ifc.md)). High fidelity is opt-in and never required in order to contribute |
| Powerful tools vs simplicity | Role-based progressive disclosure (INC-3). Citizens contribute with place + text + photo; drawing and scenario tools are for officials and interested users |
| Citizen creativity vs expert feasibility concerns | Show the constraints alongside the canvas (KNO-6). Officials must respond (KNO-1, SOC-4) rather than silently filtering |
| Openness vs privacy and ownership | Public content is pseudonymous by default, personal data is minimised, and licences are shown per layer (GOV-3) |
| Engagement mechanics vs seriousness | Reward impact, not activity (SOC-4). Playful exploration is fine; leaderboards are not |
| Platform ambition vs governance ceiling | Don't promise influence the process can't give. State the rung (GOV-1); push upwards by making outcomes traceable (GOV-5) |

## 5. Using the framework on ourselves

The thesis framework is also our **acceptance check**. Assessments live in [docs/assessments/](../assessments/), using the thesis's own question form. Re-assess at each milestone; a feature isn't done if it makes a "Must" answer worse.

Baseline: [assessments/2026-10-12-baseline.md](../assessments/2026-10-12-baseline.md).
