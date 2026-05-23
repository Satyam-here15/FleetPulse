package com.fleetpulse.websocket.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationEvent {
    private String vehicleId;
    private double latitude;
    private double longitude;
    private double speed;
    private LocalDateTime timestamp;
}