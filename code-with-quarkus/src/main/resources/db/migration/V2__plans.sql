-- Detaljplaner authored in the platform. Append-only: every save is a new version.
-- `delivery` is the Lantmäteriet Detaljplan 4.1 FeatureCollection; `draft` is the editor's
-- working model (geometry timestamps, template variables, codes) it was generated from.
CREATE TABLE plan_version (
    id          uuid PRIMARY KEY,
    plan_id     uuid        NOT NULL,   -- = LM objektidentitet of the detaljplan
    version     integer     NOT NULL CHECK (version >= 1),
    name        text        NOT NULL,
    status      text        NOT NULL,   -- LM planstatus, denormalised for listing/visibility
    draft       jsonb       NOT NULL,
    delivery    jsonb       NOT NULL,
    created_by  text        NOT NULL,   -- OIDC subject
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (plan_id, version)
);

CREATE INDEX plan_version_latest_idx ON plan_version (plan_id, version DESC);
