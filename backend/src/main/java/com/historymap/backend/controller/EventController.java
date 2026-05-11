package com.historymap.backend.controller;

import com.historymap.backend.domain.Event;
import com.historymap.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;

    @GetMapping("/events")
    public List<Event> getEvents(
            @RequestParam(defaultValue = "-3000") int min_year,
            @RequestParam(defaultValue = "2026") int max_year) {
        return eventRepository.findByYearBetween(min_year, max_year);
    }

    @GetMapping("/search")
    public List<Event> searchEvents(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return List.of();
        }
        return eventRepository.findByTitleRegex(q);
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of("total_events", eventRepository.count());
    }
}
