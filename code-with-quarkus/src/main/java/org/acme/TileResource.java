package org.acme;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Paths;

@Path("/tiles")
public class TileResource {
    private final S3Client s3 = S3Client
        .builder()
        .endpointOverride(URI.create(System.getenv().getOrDefault("AWS_ENDPOINT_URL", "http://localhost:9000")))
        .region(Region.US_EAST_1) // RustFS does not validate regions
        // Reads AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
        .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
        .forcePathStyle(true) // Required for RustFS compatibility
        .build();

    private final String bucket = "bimgis-3d-tiles";

    @GET
    @Path("{path: .+}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getTile(@PathParam("path") String path) {

        try {
            // 4. Download file
            ResponseInputStream<GetObjectResponse> resp = s3.getObject(
                GetObjectRequest.builder()
                    .bucket(bucket)
                    .key("ISSUE_098_R8_F1_MAB_AR_M3_XX_XXX_MO_7000/v1/tileset.json")
                    .build()
                );
            System.out.println("Downloaded ISSUE_098_R8_F1_MAB_AR_M3_XX_XXX_MO_7000/v1/tileset.json");
// f"{building}/v1/{rel}"

            return Response.ok(resp.readAllBytes())
                .build();

        } catch (NoSuchKeyException e) {
            return Response.status(404).build();
        } catch (IOException e) {
            return Response.status(500).build();
        }
    }
}