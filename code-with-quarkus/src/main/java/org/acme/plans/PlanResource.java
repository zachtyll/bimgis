package org.acme.plans;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ClientErrorException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Detaljplaner authored in the platform. Officials create and edit; everyone can read plans
 * that have left the "påbörjad" stage. Each save is a new version (optimistic concurrency).
 *
 * The delivery is validated in the editor (JSON schema + vägledning rules); here we only check
 * that it is a Detaljplan 4.1 delivery for this plan.
 */
@Path("/api/plans")
public class PlanResource {

    static final String LM_MEDIA_TYPE = "application/vnd.lm.detaljplan.v4+json";

    @Inject
    SecurityIdentity identity;

    public record PlanSummary(UUID id, int version, String name, String status, OffsetDateTime updatedAt) {
        static PlanSummary of(PlanVersion v) {
            return new PlanSummary(v.planId, v.version, v.name, v.status, v.createdAt);
        }
    }

    public record PlanView(UUID id, int version, String name, String status, OffsetDateTime updatedAt,
            JsonNode draft, JsonNode delivery) {
        static PlanView of(PlanVersion v) {
            return new PlanView(v.planId, v.version, v.name, v.status, v.createdAt, v.draft, v.delivery);
        }
    }

    public record SavePlan(Integer expectedVersion, @NotNull JsonNode draft, @NotNull JsonNode delivery) {
    }

    @GET
    @PermitAll
    public List<PlanSummary> list() {
        return PlanVersion.latestOfEach().stream().filter(this::visible).map(PlanSummary::of).toList();
    }

    @GET
    @Path("{id}")
    @PermitAll
    public PlanView get(@PathParam("id") UUID id) {
        return PlanView.of(visibleLatest(id));
    }

    /** The Lantmäteriet delivery itself, e.g. as the viewer's layer source. */
    @GET
    @Path("{id}/delivery")
    @PermitAll
    @Produces({ LM_MEDIA_TYPE, MediaType.APPLICATION_JSON })
    public Response delivery(@PathParam("id") UUID id) {
        return Response.ok(visibleLatest(id).delivery).type(LM_MEDIA_TYPE).build();
    }

    @POST
    @RolesAllowed("official")
    @Transactional
    public Response create(@Valid SavePlan request) {
        UUID id = planIdOf(request.delivery());
        if (PlanVersion.latest(id).isPresent()) {
            throw new ClientErrorException("Plan " + id + " already exists", Response.Status.CONFLICT);
        }
        PlanVersion v = persist(id, 1, request);
        return Response.created(URI.create("/api/plans/" + id)).entity(PlanView.of(v)).build();
    }

    @PUT
    @Path("{id}")
    @RolesAllowed("official")
    @Transactional
    public PlanView update(@PathParam("id") UUID id, @Valid SavePlan request) {
        if (!id.equals(planIdOf(request.delivery()))) {
            throw new BadRequestException("Delivery is for another plan");
        }
        PlanVersion current = PlanVersion.latest(id).orElseThrow(NotFoundException::new);
        if (request.expectedVersion() == null || request.expectedVersion() != current.version) {
            throw new ClientErrorException("Plan was changed by someone else (now version " + current.version + ")",
                    Response.Status.CONFLICT);
        }
        return PlanView.of(persist(id, current.version + 1, request));
    }

    private PlanVersion persist(UUID planId, int version, SavePlan request) {
        JsonNode plan = request.delivery().path("features").path(0).path("properties");
        PlanVersion v = new PlanVersion();
        v.id = UUID.randomUUID();
        v.planId = planId;
        v.version = version;
        v.name = requireText(plan, "namn");
        v.status = requireText(plan, "status");
        v.draft = request.draft();
        v.delivery = request.delivery();
        v.createdBy = identity.getPrincipal().getName();
        v.createdAt = OffsetDateTime.now();
        v.persist();
        return v;
    }

    /** The plan id is the delivery's detaljplan objektidentitet. */
    private static UUID planIdOf(JsonNode delivery) {
        if (!LM_MEDIA_TYPE.equals(delivery.path("feature:mediatyp").asText())) {
            throw new BadRequestException("Not a Detaljplan 4.1 delivery");
        }
        JsonNode plan = delivery.path("features").path(0).path("properties");
        if (!"detaljplan".equals(plan.path("feature:typ").asText())) {
            throw new BadRequestException("The first feature must be the detaljplan");
        }
        try {
            return UUID.fromString(plan.path("objektidentitet").asText());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid objektidentitet");
        }
    }

    private static String requireText(JsonNode node, String field) {
        String value = node.path(field).asText("").strip();
        if (value.isEmpty()) {
            throw new BadRequestException("Missing " + field);
        }
        return value;
    }

    private PlanVersion visibleLatest(UUID id) {
        return PlanVersion.latest(id).filter(this::visible).orElseThrow(NotFoundException::new);
    }

    private boolean visible(PlanVersion v) {
        return !PlanVersion.NOT_PUBLIC_STATUS.equals(v.status) || identity.hasRole("official");
    }
}
