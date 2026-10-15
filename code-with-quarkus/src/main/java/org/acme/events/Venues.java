package org.acme.events;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

/**
 * Known event venues (resources/events/venues.json) and matching of free-text event locations
 * to them: "Konsthallen, Kulturens hus" and "Kulturens Hus, Stora salen" are both Kulturens hus.
 */
@ApplicationScoped
public class Venues {

    public record Venue(String id, String name, List<String> aliases, double x, double y, String located) {
    }

    record File(String about, List<Venue> venues) {
    }

    private record Key(String text, Venue venue) {
    }

    private final List<Venue> venues;
    private final Map<String, Venue> byId;
    /** Names and aliases, normalised, longest first, so the most specific one wins. */
    private final List<Key> keys;

    @Inject
    public Venues(ObjectMapper mapper) {
        this(load(mapper));
    }

    Venues(List<Venue> venues) {
        this.venues = List.copyOf(venues);
        this.byId = venues.stream().collect(Collectors.toMap(Venue::id, Function.identity()));
        List<Key> all = new ArrayList<>();
        for (Venue v : venues) {
            all.add(new Key(normalise(v.name()), v));
            for (String alias : v.aliases()) {
                all.add(new Key(normalise(alias), v));
            }
        }
        all.sort(Comparator.comparingInt((Key k) -> k.text().length()).reversed());
        this.keys = List.copyOf(all);
    }

    public List<Venue> all() {
        return venues;
    }

    public Optional<Venue> byId(String id) {
        return Optional.ofNullable(byId.get(id));
    }

    /** The venue whose name or alias occurs in the location text, if any. */
    public Optional<Venue> match(String location) {
        if (location == null || location.isBlank()) {
            return Optional.empty();
        }
        String text = normalise(location);
        return keys.stream().filter(k -> text.contains(k.text())).map(Key::venue).findFirst();
    }

    static String normalise(String s) {
        return s.toLowerCase(Locale.ROOT).replace('&', ' ').replaceAll("[\\s\\-–,]+", " ").strip();
    }

    private static List<Venue> load(ObjectMapper mapper) {
        try (InputStream in = Venues.class.getResourceAsStream("/events/venues.json")) {
            if (in == null) {
                throw new IllegalStateException("events/venues.json is missing");
            }
            return mapper.readValue(in, File.class).venues();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
