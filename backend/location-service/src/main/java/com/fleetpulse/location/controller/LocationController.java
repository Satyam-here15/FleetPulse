package com.fleetpulse.location.controller;

import com.fleetpulse.location.model.LocationEvent;
import com.fleetpulse.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/ping")
    public ResponseEntity<String> receiveLocation(@RequestBody LocationEvent event) {
        locationService.processLocation(event);
        return ResponseEntity.ok("Location processed for vehicle: " + event.getVehicleId());
    }

    @GetMapping("/history/{vehicleId}")
    public ResponseEntity<List<LocationEvent>> getHistory(@PathVariable String vehicleId) {
        return ResponseEntity.ok(locationService.getVehicleHistory(vehicleId));
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5.0") double radius) {
        return ResponseEntity.ok(locationService.getNearbyVehicles(lat, lng, radius));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Location Service is running!");
    }
}