package com.classroom.prediction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastAllocationChange(String eventType, Object payload) {
        try {
            Map<String, Object> message = Map.of(
                    "type", eventType,
                    "payload", payload,
                    "timestamp", System.currentTimeMillis()
            );
            messagingTemplate.convertAndSend("/topic/allocations", message);
            messagingTemplate.convertAndSend("/topic/notifications", message);
            log.info("Broadcasted {} event via WebSocket", eventType);
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket message", e);
        }
    }

    public void notifyUser(String userEmail, String eventType, Object payload) {
        try {
            Map<String, Object> message = Map.of(
                    "type", eventType,
                    "payload", payload,
                    "timestamp", System.currentTimeMillis()
            );
            messagingTemplate.convertAndSendToUser(userEmail, "/queue/notifications", message);
        } catch (Exception e) {
            log.error("Failed to send user notification to {}", userEmail, e);
        }
    }
}
