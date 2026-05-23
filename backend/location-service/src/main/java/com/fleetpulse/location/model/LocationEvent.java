package com.fleetpulse.location.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "location_history")
public class LocationEvent {

    @Id
    private String id;
    private String vehicleId;
    private double latitude;
    private double longitude;
    private double speed;
    private LocalDateTime timestamp;
}