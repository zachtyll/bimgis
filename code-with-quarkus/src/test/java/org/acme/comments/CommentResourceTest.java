package org.acme.comments;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasKey;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.oidc.Claim;
import io.quarkus.test.security.oidc.OidcSecurity;
import io.restassured.http.ContentType;

@QuarkusTest
class CommentResourceTest {

    private static String newComment(String target, String body) {
        return """
                {"layerId":"lulea-buildings-gba","targetId":"%s","targetLabel":"Storgatan 1",
                 "body":"%s","viewpoint":{"position":[829100,7292300,80],"target":[829200,7292420,0]}}
                """.formatted(target, body);
    }

    @Test
    void listIsPublicAndEmptyForUnknownTarget() {
        given().queryParam("layer", "lulea-buildings-gba").queryParam("target", "nothing-here")
                .when().get("/api/comments")
                .then().statusCode(200).body("$", hasSize(0));
    }

    @Test
    void anonymousCannotPost() {
        given().contentType(ContentType.JSON).body(newComment("gba:1", "Hej"))
                .when().post("/api/comments")
                .then().statusCode(401);
    }

    @Test
    @TestSecurity(user = "no-role-user")
    void userWithoutCitizenRoleCannotPost() {
        given().contentType(ContentType.JSON).body(newComment("gba:1", "Hej"))
                .when().post("/api/comments")
                .then().statusCode(403);
    }

    @Test
    @TestSecurity(user = "sub-alice", roles = "citizen")
    @OidcSecurity(claims = @Claim(key = "preferred_username", value = "alice"))
    void citizenCanPostAndEveryoneCanRead() {
        String target = "gba:" + UUID.randomUUID();

        given().contentType(ContentType.JSON).body(newComment(target, "Bra med fler cykelställ här"))
                .when().post("/api/comments")
                .then().statusCode(201)
                .body("authorName", equalTo("alice"))
                .body("$", not(hasKey("authorSub")));

        given().queryParam("layer", "lulea-buildings-gba").queryParam("target", target)
                .when().get("/api/comments")
                .then().statusCode(200)
                .body("$", hasSize(1))
                .body("[0].body", equalTo("Bra med fler cykelställ här"))
                .body("[0].targetLabel", equalTo("Storgatan 1"))
                .body("[0].viewpoint.position", hasSize(3));
    }

    @Test
    @TestSecurity(user = "sub-alice", roles = "citizen")
    void rejectsEmptyAndTooLongComments() {
        given().contentType(ContentType.JSON).body(newComment("gba:2", "   "))
                .when().post("/api/comments")
                .then().statusCode(400);

        given().contentType(ContentType.JSON).body(newComment("gba:2", "x".repeat(2001)))
                .when().post("/api/comments")
                .then().statusCode(400);
    }
}
