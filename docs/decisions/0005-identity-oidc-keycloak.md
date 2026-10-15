# 0005: Identity via OIDC with Keycloak; the platform owns discussions, federation comes later

- **Status:** accepted (identity); proposed (discussions and federation)
- **Date:** 2026-10-12

## Context
We need users: citizens who contribute (SOC-1, KNO-3), officials who run dialogues and respond (KNO-5, KNO-7), and moderators (SOC-2). Several things will need the same identity: the web app, our backends (Quarkus/Python), and possibly a federated chat or forum (Matrix, ActivityPub). Formal comments in granskning may later require Swedish eID (BankID/Freja).

Options considered:
- **PocketBase auth.** Simple and already in the repo. But PocketBase is an OIDC *client*, not a provider: Matrix, Quarkus and others couldn't use its users, so it would become an identity silo.
- **Keycloak.** Open source, mature OIDC/SAML provider. It can broker upstream identity providers (eID brokers, municipal Azure AD for officials), and it's the provider most integrations already document.
- **Zitadel / Authentik.** Also viable and lighter, but less established in Swedish public-sector setups.

## Decision
1. **All authentication is OIDC.** The web app uses Authorization Code + PKCE with a public client (`oidc-client-ts`). Backends validate bearer JWTs (e.g. `quarkus-oidc`). Nothing in the platform stores passwords.
2. **The identity provider is Keycloak.** Dev setup: `infra/keycloak/` (realm `bimgis`, client `bimgis-web`, port 8180). Realm roles are `citizen` (default for everyone), `official` and `moderator`, exposed as a `roles` claim.
3. **Privacy (GOV-3):** the public display name is `preferred_username`, a pseudonym. Email is never shown publicly. Reading requires no login; posting does (INC-1: "light sign-in").
4. **Discussions are stored in the platform's own database, not in Matrix or ActivityPub.** Contributions and replies are planning records: they need moderation, lineage to decisions (GOV-5), records management (allmänna handlingar) and GDPR erasure. Federated copies can't be reliably recalled or kept consistent.
5. **Federation is a later bridge, not the store.** If we federate:
   - **ActivityPub** for forum-style public discussion. A dialogue maps naturally to a Group with threaded Notes, which Lemmy/Mastodon users can follow and reply to (inbound replies go through moderation).
   - **Matrix** for real-time rooms, e.g. a live workshop chat. Matrix's next-generation auth (Matrix Authentication Service) can use Keycloak as its upstream provider, so users keep one account.
   Both work *because* of decision 1, so we don't need to choose now.

## Consequences
- An extra service (Keycloak) to run. Its realm config lives in the repo, and dev users are `alice`/`olle`/`mona` with password `dev` (dev only).
- PocketBase is not used for identity. Whether it stays as a data store is a separate decision.
- Swedish eID can be added later as a Keycloak identity broker, without app changes. The app would only check a claim such as an `acr` level for formal submissions.
- Before production: real TLS, a production Keycloak database, SMTP for email verification and password reset, a themed login page in Swedish, and redirect URIs per environment (`VITE_OIDC_AUTHORITY`, `VITE_OIDC_CLIENT_ID`).
