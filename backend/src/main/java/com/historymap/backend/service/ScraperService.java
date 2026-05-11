package com.historymap.backend.service;

import com.historymap.backend.domain.Event;
import com.historymap.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScraperService {

    private final EventRepository eventRepository;
    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://ko.wikipedia.org/w/api.php")
            .defaultHeader("User-Agent", "HistoryEventBot/1.0 (https://history-map-engine.edu; contact@history-map-engine.edu)")
            .build();

    private final List<String> CATEGORIES = Arrays.asList(
            "분류:한국의_전투", "분류:한국의_전쟁", "분류:조선_시대의_전투", "분류:삼국_시대의_전투", 
            "분류:고려_시대의_전투", "분류:임진왜란의_전투", "분류:한국_전쟁의_전투", "분류:세계의_전투", 
            "분류:제1차_세계_대전의_전투", "분류:제2차_세계_대전의_전투", "분류:고대_로마의_전투",
            "분류:중국의_전투", "분류:일본의_전투", "분류:혁명", "분류:역사적_사건", "분류:한국의_역사적_사건",
            "분류:중국의_역사적_사건", "분류:일본의_역사적_사건", "분류:근대_사건", "분류:현대_사건"
    );

    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void onApplicationReady() {
        seedData();
    }

    public void seedData() {
        log.info("⚔️ [Spring Boot] 전 시대 통합 역사적 사건 수집 시작...");
        Set<String> processedCategories = new HashSet<>();
        Queue<String> queue = new LinkedList<>(CATEGORIES);
        Set<String> seenPages = new HashSet<>();
        int totalAdded = 0;

        while (!queue.isEmpty() && totalAdded < 1000) {
            String currentCat = queue.poll();
            if (processedCategories.contains(currentCat)) continue;
            processedCategories.add(currentCat);

            log.info("🔍 탐색 중: {} (현재까지 {}개 수집)", currentCat, totalAdded);
            List<Map<String, Object>> members = getCategoryMembers(currentCat);

            for (Map<String, Object> member : members) {
                if (totalAdded >= 1000) break;

                int ns = ((Number) member.get("ns")).intValue();
                String title = (String) member.get("title");
                String pageId = String.valueOf(member.get("pageid"));

                if (ns == 0) { // Article
                    if (!seenPages.contains(pageId)) {
                        seenPages.add(pageId);
                        Event details = getPageDetails(pageId);
                        if (details != null && isHistoryEvent(details.getTitle())) {
                            eventRepository.save(details);
                            totalAdded++;
                            if (totalAdded % 50 == 0) log.info("🚩 역사 데이터 누적: {}개", totalAdded);
                        }
                    }
                } else if (ns == 14) { // Subcategory
                    if (!processedCategories.contains(title) && processedCategories.size() < 150) {
                        queue.add(title);
                    }
                }
                try { Thread.sleep(20); } catch (InterruptedException ignored) {}
            }
        }
        log.info("🏁 수집 완료: 총 {}개의 역사적 기록이 적재되었습니다.", totalAdded);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getCategoryMembers(String category) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("action", "query")
                            .queryParam("list", "categorymembers")
                            .queryParam("cmtitle", category)
                            .queryParam("cmlimit", 100)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(res -> {
                        Map<String, Object> query = (Map<String, Object>) res.get("query");
                        if (query == null) return Collections.<Map<String, Object>>emptyList();
                        return (List<Map<String, Object>>) query.get("categorymembers");
                    })
                    .block(Duration.ofSeconds(10));
        } catch (Exception e) {
            log.error("Error fetching category {}: {}", category, e.getMessage());
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private Event getPageDetails(String pageId) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("action", "query")
                            .queryParam("pageids", pageId)
                            .queryParam("prop", "extracts|coordinates|description")
                            .queryParam("exintro", true)
                            .queryParam("explaintext", true)
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .map(res -> {
                        Map<String, Object> query = (Map<String, Object>) res.get("query");
                        Map<String, Object> pages = (Map<String, Object>) query.get("pages");
                        Map<String, Object> page = (Map<String, Object>) pages.get(pageId);

                        if (page != null && page.containsKey("coordinates")) {
                            List<Map<String, Object>> coordsList = (List<Map<String, Object>>) page.get("coordinates");
                            Map<String, Object> coords = coordsList.get(0);
                            double lon = ((Number) coords.get("lon")).doubleValue();
                            double lat = ((Number) coords.get("lat")).doubleValue();
                            String summary = (String) page.get("extracts");
                            String title = (String) page.get("title");
                            String description = (String) page.getOrDefault("description", "역사적 주요 사건입니다.");

                            return Event.builder()
                                    .title(title)
                                    .summary(summary != null && summary.length() > 1500 ? summary.substring(0, 1500) + "..." : summary)
                                    .description(description)
                                    .location(new GeoJsonPoint(lon, lat))
                                    .year(extractYear(summary))
                                    .category("역사적 사건")
                                    .build();
                        }
                        return null;
                    })
                    .block(Duration.ofSeconds(10));
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isHistoryEvent(String title) {
        return Arrays.stream(new String[]{"전투", "전쟁", "대첩", "공방전", "사태", "혁명", "침공", "난", "싸움", "조약", "건국", "정변", "선언"})
                .anyMatch(title::contains);
    }

    private int extractYear(String text) {
        if (text == null) return 1000;
        Pattern bcPattern = Pattern.compile("(기원전|BC)\\s*(\\d{1,4})년?", Pattern.CASE_INSENSITIVE);
        Matcher bcMatcher = bcPattern.matcher(text);
        if (bcMatcher.find()) return -Integer.parseInt(bcMatcher.group(2));

        Pattern centuryPattern = Pattern.compile("(\\d{1,2})세기");
        Matcher centuryMatcher = centuryPattern.matcher(text);
        if (centuryMatcher.find()) return (Integer.parseInt(centuryMatcher.group(1)) - 1) * 100 + 50;

        Pattern yearPattern = Pattern.compile("(\\d{1,4})년");
        Matcher yearMatcher = yearPattern.matcher(text);
        if (yearMatcher.find()) return Integer.parseInt(yearMatcher.group(1));

        Pattern strictYearPattern = Pattern.compile("\\b(1\\d{3}|20[0-2]\\d)\\b");
        Matcher strictYearMatcher = strictYearPattern.matcher(text);
        if (strictYearMatcher.find()) return Integer.parseInt(strictYearMatcher.group(1));

        return 1000;
    }
}
