package org.acme.plans;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** One saved version of a plan. Append-only; see V2__plans.sql. */
@Entity
@Table(name = "plan_version")
public class PlanVersion extends PanacheEntityBase {

    /** Plans that only officials may see (not yet public). */
    public static final String NOT_PUBLIC_STATUS = "påbörjad";

    @Id
    public UUID id;

    @Column(name = "plan_id")
    public UUID planId;

    public int version;

    public String name;

    public String status;

    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode draft;

    @JdbcTypeCode(SqlTypes.JSON)
    public JsonNode delivery;

    @Column(name = "created_by")
    public String createdBy;

    @Column(name = "created_at")
    public OffsetDateTime createdAt;

    public static Optional<PlanVersion> latest(UUID planId) {
        return find("planId = ?1 order by version desc", planId).firstResultOptional();
    }

    /** Latest version of every plan, newest first. */
    public static List<PlanVersion> latestOfEach() {
        return list("""
                from PlanVersion v
                where v.version = (select max(v2.version) from PlanVersion v2 where v2.planId = v.planId)
                order by v.createdAt desc""");
    }
}
