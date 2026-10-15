package org.acme.events;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

/** What the viewer gets: upcoming events, grouped per event, and the venues they take place at. */
public final class EventDtos {

    private EventDtos() {
    }

    public record EventsView(
            LocalDate from,
            LocalDate to,
            List<EventView> events,
            List<VenueView> venues,
            /** When the listing was read from visitlulea.se. */
            OffsetDateTime fetchedAt,
            String source) {
    }

    /**
     * One event with all its dates in the window. {@code venueId} is null when the location text
     * matches no known venue (it is then listed but not pinned). {@code url} links out to the event
     * page on visitlulea.se.
     */
    public record EventView(
            long id,
            String title,
            String category,
            String location,
            String venueId,
            String url,
            List<Occurrence> dates) {
    }

    /** Local times (Europe/Stockholm). Midnight usually means "no time given". */
    public record Occurrence(LocalDateTime start, LocalDateTime end) {
    }

    /** A pinned place, EPSG:3006. */
    public record VenueView(String id, String name, double x, double y) {
    }
}
