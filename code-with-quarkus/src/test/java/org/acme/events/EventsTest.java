package org.acme.events;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.acme.events.EventDtos.EventView;
import org.acme.events.EventDtos.EventsView;
import org.acme.events.VisitLuleaClient.Hit;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/** Venue matching and grouping, without calling visitlulea.se. */
class EventsTest {

    private final Venues venues = new Venues(new ObjectMapper());

    @Test
    void locationsMatchTheMostSpecificVenue() {
        assertEquals(Optional.of("kulturens-hus"), id("Konsthallen, Kulturens hus"));
        assertEquals(Optional.of("kulturens-hus"), id("Kulturens Hus, Stora salen"));
        assertEquals(Optional.of("kulturens-hus"), id("Konsthallen"));
        assertEquals(Optional.of("slojd-och-formcenter"), id("Slöjd och Formcenter"));
        assertEquals(Optional.of("sunderby-folkhogskola"), id("Galleri Y, Sunderby folkhögskola"));
        assertEquals(Optional.of("gammelstad-visitor-center"), id("Gammelstad Visitor Center och friluftsmuseet Hägnan"));
        assertEquals(Optional.of("sodra-hamn"), id("Isbanan vid Södra hamn – Tentipi-tältet"));
        assertEquals(Optional.of("shopping"), id("Ljusgården i Shopping"));
        assertEquals(Optional.of("bakfickan"), id("Bakfickan"));
    }

    @Test
    void vagueOrUnknownLocationsAreNotPinned() {
        assertEquals(Optional.empty(), id("Luleå"));
        assertEquals(Optional.empty(), id("Någonstans i Piteå"));
        assertEquals(Optional.empty(), id(null));
    }

    @Test
    void occurrencesAreGroupedPerEventAndLinkOut() {
        EventResource resource = new EventResource();
        resource.venues = venues;
        resource.client = new VisitLuleaClient();
        resource.client.baseUrl = "https://visitlulea.se";

        List<Hit> hits = List.of(
                hit(1, "Guidad visning", "Gammelstad Visitor Center", "/evenemang/2026/guidad/", "2026-10-20T00:00:00"),
                hit(1, "Guidad visning", "Gammelstad Visitor Center", "/evenemang/2026/guidad/", "2026-10-13T00:00:00"),
                hit(2, "Monsterjakten", "Luleå", "https://elsewhere.example/x", "2026-10-24T00:00:00"));
        EventsView view = resource.toView(hits, LocalDate.parse("2026-10-13"), LocalDate.parse("2026-11-12"),
                OffsetDateTime.parse("2026-10-13T12:00:00+02:00"));

        assertEquals(2, view.events().size());
        EventView guided = view.events().get(0);
        assertEquals("gammelstad-visitor-center", guided.venueId());
        assertEquals("https://visitlulea.se/evenemang/2026/guidad/", guided.url());
        assertEquals(LocalDateTime.parse("2026-10-13T00:00:00"), guided.dates().get(0).start());
        assertEquals(2, guided.dates().size());

        EventView vague = view.events().get(1);
        assertNull(vague.venueId());
        assertTrue(vague.url().startsWith("https://visitlulea.se/"), "only links on visitlulea.se are passed on");
        assertEquals(1, view.venues().size());
    }

    @Test
    void parsesTheSitesJson() throws Exception {
        String json = """
                {"CurrentFilter":{"TotalPages":1},"Hits":[{"Id":"25880_1","ContentId":25880,"Header":"Guidad visning",
                "Category":"Underhållning","Url":"/evenemang/2026/x/","Location":"Gammelstad Visitor Center",
                "StartDate":"2026-10-13T00:00:00","EndDate":"2026-10-13T00:00:00","EventDates":[]}]}""";
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        VisitLuleaClient.Page page = mapper.readValue(json, VisitLuleaClient.Page.class);
        assertEquals(1, page.filter().totalPages());
        assertEquals(25880, page.hits().get(0).contentId());
    }

    private Optional<String> id(String location) {
        return venues.match(location).map(Venues.Venue::id);
    }

    private static Hit hit(long id, String title, String location, String url, String start) {
        LocalDateTime t = LocalDateTime.parse(start);
        return new Hit(id, title, "Underhållning", location, url, t, t);
    }
}
