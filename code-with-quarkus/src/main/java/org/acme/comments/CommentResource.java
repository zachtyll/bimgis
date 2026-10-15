package org.acme.comments;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.acme.comments.CommentDtos.CommentView;
import org.acme.comments.CommentDtos.NewComment;
import org.eclipse.microprofile.jwt.JsonWebToken;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;

/** Comments on objects selected in the viewer. Reading is public; posting requires a citizen account. */
@Path("/api/comments")
public class CommentResource {

    @Inject
    SecurityIdentity identity;

    @GET
    @PermitAll
    public List<CommentView> list(@QueryParam("layer") @NotBlank String layer,
            @QueryParam("target") @NotBlank String target) {
        return Comment.publishedFor(layer, target).stream().map(CommentView::of).toList();
    }

    @POST
    @RolesAllowed("citizen")
    @Transactional
    public Response create(@Valid NewComment request) {
        if (request.body().isBlank()) {
            throw new BadRequestException("Comment is empty");
        }

        Comment c = new Comment();
        c.id = UUID.randomUUID();
        c.targetLayer = request.layerId();
        c.targetId = request.targetId();
        c.targetLabel = request.targetLabel();
        c.body = request.body().strip();
        c.authorSub = identity.getPrincipal().getName();
        c.authorName = publicName();
        c.viewpoint = request.viewpoint() == null ? null
                : new Comment.Viewpoint(request.viewpoint().position(), request.viewpoint().target());
        c.createdAt = OffsetDateTime.now();
        c.persist();

        return Response.created(URI.create("/api/comments/" + c.id)).entity(CommentView.of(c)).build();
    }

    /** The pseudonymous username, never the real name or email (GOV-3). */
    private String publicName() {
        if (identity.getPrincipal() instanceof JsonWebToken token
                && token.getClaim("preferred_username") instanceof String username) {
            return username;
        }
        return identity.getPrincipal().getName();
    }
}
