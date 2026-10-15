package org.acme.plans;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;

@QuarkusTest
class PlanResourceTest {

    private static String body(UUID id, String status, Integer expectedVersion) {
        return """
                {"expectedVersion": %s,
                 "draft": {"name": "Testplan"},
                 "delivery": {"type": "FeatureCollection", "feature:mediatyp": "application/vnd.lm.detaljplan.v4+json",
                   "features": [{"type": "Feature", "id": "%s", "geometry": null,
                     "properties": {"feature:typ": "detaljplan", "objektidentitet": "%s",
                                    "namn": "Testplan", "status": "%s"}}]}}
                """.formatted(expectedVersion, id, id, status);
    }

    @Test
    @TestSecurity(user = "olle", roles = { "citizen", "official" })
    void officialCreatesAndUpdatesWithVersionCheck() {
        UUID id = UUID.randomUUID();
        given().contentType(ContentType.JSON).body(body(id, "påbörjad", null))
                .when().post("/api/plans")
                .then().statusCode(201).body("version", equalTo(1)).body("id", equalTo(id.toString()));

        given().contentType(ContentType.JSON).body(body(id, "samråd", 1))
                .when().put("/api/plans/" + id)
                .then().statusCode(200).body("version", equalTo(2)).body("status", equalTo("samråd"));

        // stale version
        given().contentType(ContentType.JSON).body(body(id, "granskning", 1))
                .when().put("/api/plans/" + id)
                .then().statusCode(409);

        given().contentType(ContentType.JSON).body(body(id, "påbörjad", null))
                .when().post("/api/plans")
                .then().statusCode(409);
    }

    @Test
    @TestSecurity(user = "alice", roles = "citizen")
    void citizenCannotCreate() {
        given().contentType(ContentType.JSON).body(body(UUID.randomUUID(), "påbörjad", null))
                .when().post("/api/plans")
                .then().statusCode(403);
    }

    @Test
    void anonymousCannotCreate() {
        given().contentType(ContentType.JSON).body(body(UUID.randomUUID(), "påbörjad", null))
                .when().post("/api/plans")
                .then().statusCode(401);
    }

    @Test
    void publicSeesOnlyPlansPastPaborjad() {
        UUID draft = UUID.randomUUID();
        UUID consultation = UUID.randomUUID();
        createAsOfficial(draft, "påbörjad");
        createAsOfficial(consultation, "samråd");

        given().when().get("/api/plans").then().statusCode(200)
                .body("id", hasItem(consultation.toString()))
                .body("id", not(hasItem(draft.toString())));
        given().when().get("/api/plans/" + draft).then().statusCode(404);
        given().when().get("/api/plans/" + consultation + "/delivery").then().statusCode(200)
                .contentType("application/vnd.lm.detaljplan.v4+json")
                .body("features[0].properties.namn", equalTo("Testplan"));
    }

    @Test
    @TestSecurity(user = "olle", roles = { "citizen", "official" })
    void rejectsNonDeliveries() {
        given().contentType(ContentType.JSON).body("{\"draft\": {}, \"delivery\": {\"type\": \"FeatureCollection\"}}")
                .when().post("/api/plans")
                .then().statusCode(400);
    }

    @TestSecurity(user = "olle", roles = { "citizen", "official" })
    void createAsOfficial(UUID id, String status) {
        PlanVersion v = new PlanVersion();
        // Direct insert keeps this test independent of the security context of the caller.
        io.quarkus.narayana.jta.QuarkusTransaction.requiringNew().run(() -> {
            v.id = UUID.randomUUID();
            v.planId = id;
            v.version = 1;
            v.name = "Testplan";
            v.status = status;
            v.draft = new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode();
            try {
                v.delivery = new com.fasterxml.jackson.databind.ObjectMapper().readTree(body(id, status, null)).get("delivery");
            } catch (Exception e) {
                throw new IllegalStateException(e);
            }
            v.createdBy = "olle";
            v.createdAt = java.time.OffsetDateTime.now();
            v.persist();
        });
    }
}
