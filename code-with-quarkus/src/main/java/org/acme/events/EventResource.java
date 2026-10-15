package org.acme.events;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.acme.events.EventDtos.EventView;
import org.acme.events.EventDtos.EventsView;
import org.acme.events.EventDtos.Occurrence;
import org.acme.events.EventDtos.VenueView;
import org.acme.events.VisitLuleaClient.Hit;
import org.jboss.logging.Logger;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.ServiceUnavailableException;

/**
 * What's on in Luleå: events from visitlulea.se for the next {@code days} days, grouped per event
 * and placed at known venues. Public.
 *
 * The listing is kept in memory for a few minutes so that every page load doesn't hit
 * visitlulea.se; nothing is written to disk.
 */
@Path("/api/events")
public class EventResource {

    private static final Logger LOG = Logger.getLogger(EventResource.class);
    private static final ZoneId LULEA = ZoneId.of("Europe/Stockholm");
    private static final Duration KEEP = Duration.ofMinutes(10);

    private record Cached(EventsView view, OffsetDateTime until) {
    }

    private final Map<Integer, Cached> cache = new ConcurrentHashMap<>();

    @Inject
    VisitLuleaClient client;

    @Inject
    Venues venues;

    @GET
    @PermitAll
    public EventsView list(@QueryParam("days") Integer days) {
        int window = days == null ? 30 : Math.max(1, Math.min(days, 366));
        OffsetDateTime now = OffsetDateTime.now(LULEA);
        Cached cached = cache.get(window);
        if (cached != null && now.isBefore(cached.until()) && cached.view().from().equals(now.toLocalDate())) {
            return cached.view();
        }

        LocalDate from = now.toLocalDate();
        LocalDate to = from.plusDays(window);
        try {
            EventsView view = toView(client.fetch(from, to), from, to, now);
            cache.put(window, new Cached(view, now.plus(KEEP)));
            return view;
        } catch (IOException e) {
            LOG.warnf("Reading events from visitlulea.se failed: %s", e.getMessage());
            if (cached != null) {
                return cached.view(); // stale beats nothing
            }
            throw new ServiceUnavailableException("visitlulea.se didn't answer");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ServiceUnavailableException("interrupted");
        }
    }

    /** Groups occurrences per event and resolves venues; only venues in use are returned. */
    EventsView toView(List<Hit> hits, LocalDate from, LocalDate to, OffsetDateTime fetchedAt) {
        record Group(Hit first, List<Occurrence> dates) {
        }
        Map<Long, Group> groups = new LinkedHashMap<>();
        for (Hit hit : hits) {
            groups.computeIfAbsent(hit.contentId(), id -> new Group(hit, new ArrayList<>()))
                    .dates().add(new Occurrence(hit.startDate(), hit.endDate()));
        }

        Map<String, VenueView> used = new LinkedHashMap<>();
        List<EventView> events = groups.values().stream().map(g -> {
            Hit h = g.first();
            String location = h.location() == null ? null : h.location().strip();
            String venueId = venues.match(location).map(v -> {
                used.putIfAbsent(v.id(), new VenueView(v.id(), v.name(), v.x(), v.y()));
                return v.id();
            }).orElse(null);
            List<Occurrence> dates = g.dates().stream()
                    .sorted(Comparator.comparing(Occurrence::start, Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();
            return new EventView(h.contentId(), h.header(), h.category(), location, venueId, link(h.url()), dates);
        }).toList();

        return new EventsView(from, to, events, List.copyOf(used.values()), fetchedAt, client.baseUrl() + "/evenemang/");
    }

    /** Absolute link to the event page; only links on visitlulea.se itself are passed on. */
    private String link(String url) {
        if (url == null || !url.startsWith("/")) {
            return client.baseUrl() + "/evenemang/";
        }
        return client.baseUrl() + url;
    }
}
