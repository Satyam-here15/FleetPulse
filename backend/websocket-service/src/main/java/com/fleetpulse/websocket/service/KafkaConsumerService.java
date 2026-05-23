package com.fleetpulse.websocket.service;

import com.fleetpulse.websocket.model.LocationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "vehicle.location", groupId = "websocket-group")
    public void consumeLocation(LocationEvent event) {
        // Push to all connected WebSocket clients
        messagingTemplate.convertAndSend("/topic/vehicles", event);
        System.out.println("Pushed to WebSocket: " + event.getVehicleId());
    }
}