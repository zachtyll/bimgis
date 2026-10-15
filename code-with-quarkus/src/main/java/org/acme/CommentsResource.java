// package org.acme;

// import java.util.List;

// import org.openapi.quarkus.bcf_openapi_yaml.api.CommentsApi;
// import org.openapi.quarkus.bcf_openapi_yaml.model.CommentGET;
// import org.openapi.quarkus.bcf_openapi_yaml.model.CommentPOST;
// import org.openapi.quarkus.bcf_openapi_yaml.model.CommentPUT;

// import jakarta.ws.rs.GET;
// import jakarta.ws.rs.POST;
// import jakarta.ws.rs.Path;
// import jakarta.ws.rs.Produces;
// import jakarta.ws.rs.core.MediaType;
// import jakarta.ws.rs.core.Response;

// @Path("/hello")
// public class CommentsResource implements CommentsApi {

//     @GET
//     @Produces(MediaType.TEXT_PLAIN)
//     public String hello() {
//         return "Hello from Quarkus REST";
//     }

//     @POST
//     public Response bcfCreateProject(String nameString) {
//         throw new UnsupportedOperationException("Unimplemented method 'bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete'");
//     }


//     @Override
//     public Response bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete(String version, String projectId,
//             String topicId, String commentId) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdDelete'");
//     }

//     @Override
//     public CommentGET bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet(String version, String projectId,
//             String topicId, String commentId) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdGet'");
//     }

//     @Override
//     public CommentGET bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut(String version, String projectId,
//             String topicId, String commentId, CommentPUT commentPUT) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'bcfVersionProjectsProjectIdTopicsTopicIdCommentsCommentIdPut'");
//     }

//     @Override
//     public List<CommentGET> bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet(String version, String projectId,
//             String topicId, String $filter, String $orderby) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'bcfVersionProjectsProjectIdTopicsTopicIdCommentsGet'");
//     }

//     @Override
//     public CommentGET bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost(String version, String projectId,
//             String topicId, CommentPOST commentPOST) {
//         // TODO Auto-generated method stub
//         throw new UnsupportedOperationException("Unimplemented method 'bcfVersionProjectsProjectIdTopicsTopicIdCommentsPost'");
//     }
// }
