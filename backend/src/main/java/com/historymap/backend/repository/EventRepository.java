package com.historymap.backend.repository;

import com.historymap.backend.domain.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByYearBetween(int minYear, int maxYear);
    
    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    List<Event> findByTitleRegex(String query);
    
    long count();
}
