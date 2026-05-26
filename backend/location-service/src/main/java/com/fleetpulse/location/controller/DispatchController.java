package com.fleetpulse.location.controller;

import com.fleetpulse.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.GeoResult;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatch")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DispatchController {

    private final LocationService locationService;

    @GetMapping("/nearest")
    public ResponseEntity<Map<String, Object>> findNearestDriver(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radius) {

        var results = locationService.getNearbyVehicles(lat, lng, radius);
        Map<String, Object> response = new HashMap<>();

        if (results == null || results.getContent().isEmpty()) {
            response.put("message", "No vehicles found within " + radius + "km");
            response.put("assigned", false);
            return ResponseEntity.ok(response);
        }

        GeoResult<RedisGeoCommands.GeoLocation<String>> nearest =
                results.getContent().get(0);

        String vehicleId = nearest.getContent().getName();
        double distance = nearest.getDistance().getValue();

        response.put("assigned", true);
        response.put("vehicleId", vehicleId);
        response.put("distanceKm", Math.round(distance * 100.0) / 100.0);
        response.put("message", "Nearest driver assigned: " + vehicleId);

        return ResponseEntity.ok(response);
    }
}