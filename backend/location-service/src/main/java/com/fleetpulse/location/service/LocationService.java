package com.fleetpulse.location.service;

import com.fleetpulse.location.model.LocationEvent;
import com.fleetpulse.location.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, LocationEvent> kafkaTemplate;

    private static final String REDIS_GEO_KEY = "fleet:vehicles";
    private static final String KAFKA_TOPIC = "vehicle.location";

    public void processLocation(LocationEvent event) {
        event.setTimestamp(LocalDateTime.now());

        // Save to MongoDB
        locationRepository.save(event);

        // Save to Redis GeoSpatial
        redisTemplate.opsForGeo().add(
            REDIS_GEO_KEY,
            new Point(event.getLongitude(), event.getLatitude()),
            event.getVehicleId()
        );

        // Publish to Kafka
        kafkaTemplate.send(KAFKA_TOPIC, event.getVehicleId(), event);
    }

    public List<LocationEvent> getVehicleHistory(String vehicleId) {
        return locationRepository.findByVehicleIdOrderByTimestampDesc(vehicleId);
    }

    public GeoResults<RedisGeoCommands.GeoLocation<String>> getNearbyVehicles(
            double latitude, double longitude, double radiusKm) {
        return redisTemplate.opsForGeo().radius(
            REDIS_GEO_KEY,
            new Circle(
                new Point(longitude, latitude),
                new Distance(radiusKm, Metrics.KILOMETERS)
            )
        );
    }
}