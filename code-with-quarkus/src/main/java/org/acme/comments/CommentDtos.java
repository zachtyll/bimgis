package org.acme.comments;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class CommentDtos {

    private CommentDtos() {
    }

    public record ViewpointDto(
            @NotNull @Size(min = 3, max = 3) List<@NotNull Double> position,
            @NotNull @Size(min = 3, max = 3) List<@NotNull Double> target) {
    }

    public record NewComment(
            @NotBlank @Size(max = 200) String layerId,
            @NotBlank @Size(max = 200) String targetId,
            @Size(max = 300) String targetLabel,
            @NotBlank @Size(max = 2000) String body,
            @Valid ViewpointDto viewpoint) {
    }

    /** Public view of a comment. The author's account id (OIDC sub) is never exposed. */
    public record CommentView(
            UUID id,
            String layerId,
            String targetId,
            String targetLabel,
            String body,
            String authorName,
            ViewpointDto viewpoint,
            OffsetDateTime createdAt) {

        static CommentView of(Comment c) {
            ViewpointDto vp = c.viewpoint == null ? null
                    : new ViewpointDto(c.viewpoint.position(), c.viewpoint.target());
            return new CommentView(c.id, c.targetLayer, c.targetId, c.targetLabel, c.body,
                    c.authorName, vp, c.createdAt);
        }
    }
}
