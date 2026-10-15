-- Comments on selected objects in the viewer (buildings, IFC elements, ...).
-- Append-only: users never edit or delete; moderation changes `status`, never the row content.
CREATE TABLE comment (
    id           uuid PRIMARY KEY,
    -- What is commented on: the layer it lives in plus an ID that is stable across sessions
    -- (GBA/OSM feature id, IFC GlobalId). target_label is the name shown at the time.
    target_layer text        NOT NULL,
    target_id    text        NOT NULL,
    target_label text,
    body         text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    -- OIDC subject (stable account id) and the public pseudonym at the time of posting.
    author_sub   text        NOT NULL,
    author_name  text        NOT NULL,
    -- Camera when the comment was written, so readers can see what the author saw.
    viewpoint    jsonb,
    status       text        NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX comment_target_idx ON comment (target_layer, target_id, created_at);
