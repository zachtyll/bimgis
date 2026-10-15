package org.acme.comments;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** A comment on a selected object. Append-only; see V1__comments.sql. */
@Entity
public class Comment extends PanacheEntityBase {

    public static final String PUBLISHED = "published";

    @Id
    public UUID id;

    @Column(name = "target_layer")
    public String targetLayer;

    @Column(name = "target_id")
    public String targetId;

    @Column(name = "target_label")
    public String targetLabel;

    public String body;

    @Column(name = "author_sub")
    public String authorSub;

    @Column(name = "author_name")
    public String authorName;

    @JdbcTypeCode(SqlTypes.JSON)
    public Viewpoint viewpoint;

    public String status = PUBLISHED;

    @Column(name = "created_at")
    public OffsetDateTime createdAt;

    /** Camera position and look-at target in the scene CRS (EPSG:3006). */
    public record Viewpoint(List<Double> position, List<Double> target) {
    }

    public static List<Comment> publishedFor(String layer, String target) {
        return list("targetLayer = ?1 and targetId = ?2 and status = ?3 order by createdAt",
                layer, target, PUBLISHED);
    }
}
