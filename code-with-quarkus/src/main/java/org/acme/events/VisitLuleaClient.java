package org.acme.events;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Reads the event listing behind visitlulea.se/evenemang (the JSON endpoint their own page
 * uses). It is undocumented and sends no CORS headers, which is why the browser can't call it
 * and this backend does. Only the listing is read; event pages are linked to, not copied.
 */
@ApplicationScoped
public class VisitLuleaClient {

    /** One occurrence of an event, as the site returns it (only the fields we use). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Hit(
            @JsonProperty("ContentId") long contentId,
            @JsonProperty("Header") String header,
            @JsonProperty("Category") String category,
            @JsonProperty("Location") String location,
            @JsonProperty("Url") String url,
            @JsonProperty("StartDate") LocalDateTime startDate,
            @JsonProperty("EndDate") LocalDateTime endDate) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Page(@JsonProperty("CurrentFilter") Filter filter, @JsonProperty("Hits") List<Hit> hits) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Filter(@JsonProperty("TotalPages") int totalPages) {
    }

    /** Safety stop: 48 hits per page, about 130 occurrences a year in practice. */
    private static final int MAX_PAGES = 20;

    @Inject
    ObjectMapper mapper;

    @ConfigProperty(name = "bimgis.events.base-url", defaultValue = "https://visitlulea.se")
    String baseUrl;

    /** Id of the /evenemang page; the endpoint needs it to know which listing is meant. */
    @ConfigProperty(name = "bimgis.events.page-id", defaultValue = "3925")
    int pageId;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public String baseUrl() {
        return baseUrl;
    }

    /** All occurrences between the dates (inclusive), in date order. */
    public List<Hit> fetch(LocalDate from, LocalDate to) throws IOException, InterruptedException {
        List<Hit> hits = new ArrayList<>();
        int pages = 1;
        for (int page = 1; page <= pages && page <= MAX_PAGES; page++) {
            Page result = fetchPage(from, to, page);
            if (result.hits() != null) {
                hits.addAll(result.hits());
            }
            pages = result.filter() == null ? 1 : result.filter().totalPages();
        }
        return hits;
    }

    private Page fetchPage(LocalDate from, LocalDate to, int page) throws IOException, InterruptedException {
        Map<String, Object> filter = Map.of(
                "CurrentPageId", pageId,
                "CurrentLanguage", "sv",
                "Sorting", "date_asc",
                "Category", "all",
                "Between", Map.of("Start", from.toString(), "End", to.toString()),
                "Text", "",
                "Segment", "",
                "HitsPerPage", 48,
                "Page", page,
                "SingleDates", false);
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/umbraco/api/eventsapi/filter"))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("User-Agent", "bimgis (event map; links back to visitlulea.se)")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(filter)))
                .build();
        HttpResponse<byte[]> response = http.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() != 200) {
            throw new IOException("visitlulea.se answered " + response.statusCode());
        }
        return mapper.readValue(response.body(), Page.class);
    }
}
