package com.fleetpulse.location.streams;

import com.fleetpulse.location.model.LocationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnomalyDetectionService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Store last location time per vehicle
    private final Map<String, LocalDateTime> lastSeenMap = new HashMap<>();
    // Store last speed per vehicle
    private final Map<String, Double> lastSpeedMap = new HashMap<>();

    private static final double SPEED_LIMIT = 80.0;
    private static final int IDLE_MINUTES = 2;

    @KafkaListener(topics = "vehicle.location", groupId = "anomaly-detector")
    public void detectAnomalies(LocationEvent event) {
        String vehicleId = event.getVehicleId();
        double speed = event.getSpeed();
        LocalDateTime now = LocalDateTime.now();

        // Check speed violation
        if (speed > SPEED_LIMIT) {
            System.out.println("🚨 SPEED ALERT: " + vehicleId +
                " is going " + speed + " km/h (limit: " + SPEED_LIMIT + " km/h)");
            kafkaTemplate.send("speed.alert", vehicleId,
                "SPEED_VIOLATION: " + vehicleId + " at " + speed + " km/h");
        }

        // Check idle vehicle
        if (lastSeenMap.containsKey(vehicleId)) {
            LocalDateTime lastSeen = lastSeenMap.get(vehicleId);
            double lastSpeed = lastSpeedMap.getOrDefault(vehicleId, 0.0);

            long minutesIdle = java.time.Duration.between(lastSeen, now).toMinutes();

            if (lastSpeed < 2.0 && minutesIdle >= IDLE_MINUTES) {
                System.out.println("⚠️ IDLE ALERT: " + vehicleId +
                    " has been idle for " + minutesIdle + " minutes!");
                kafkaTemplate.send("idle.alert", vehicleId,
                    "IDLE_VEHICLE: " + vehicleId + " idle for " + minutesIdle + " mins");
            }
        }

        // Update tracking maps
        lastSeenMap.put(vehicleId, now);
        lastSpeedMap.put(vehicleId, speed);
    }
}