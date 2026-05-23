package com.fleetpulse.location.repository;

import com.fleetpulse.location.model.LocationEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface LocationRepository extends MongoRepository<LocationEvent, String> {
    List<LocationEvent> findByVehicleIdOrderByTimestampDesc(String vehicleId);
}