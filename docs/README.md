# bimgis docs

Design notes and decisions for the bimgis smart city platform. Keep these short and current. When a decision changes, update the doc and add a new ADR. Don't silently rewrite history.

**Start with [design/00-participation-design-framework.md](design/00-participation-design-framework.md).** It derives the platform's requirements from our thesis ([inspo/thesis.typ](inspo/thesis.typ)) and is the main influence on what we build.

## Layout

```
docs/
  README.md                 ← you are here
  inspo/                    ← source material (the thesis); not edited here
    thesis.typ
  design/                   ← living design considerations (edit freely)
    00-participation-design-framework.md   ← primary: requirements (FID/INC/SOC/KNO/GOV)
    01-vision-and-domain.md
    02-frontend-architecture.md
    03-3d-data-and-ifc.md
    04-capabilities-and-planning-process.md
    05-planning-evidence.md                ← observation → investigation → finding → plan provision
  decisions/                ← ADRs: numbered, append-only, one decision each
    0000-template.md
    0001-vue-pinia-frontend.md
    0002-giro3d-as-renderer.md
    0003-ifc-delivery-strategy.md
    0004-thesis-framework-drives-features.md
    0005-identity-oidc-keycloak.md
  assessments/              ← the thesis framework applied to bimgis, one file per milestone
    2026-10-12-baseline.md
```

- **design/** answers "how do we think about X?". These docs can change as we learn.
- **[../spec/](../spec/README.md)** holds the machine-readable data specification (YAML), aligned with Lantmäteriet's Detaljplan 4.1.
- **assessments/** answers "how participation-friendly is the platform right now?".
- **decisions/** answers "what did we decide, when, and why?". Once a decision is accepted, don't edit it. Write a new ADR that supersedes it.
