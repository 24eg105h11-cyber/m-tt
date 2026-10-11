import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import { getWebSocketUrl } from '../config/apiConfig';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  stompClient: null,
  connected: false,

  initWebSocket: () => {
    try {
      const brokerURL = getWebSocketUrl();
      if (!brokerURL) {
        // No valid backend / WS endpoint resolved yet (e.g. on Vercel before backend is linked)
        return;
      }

      // If client exists and is connected to same URL, do nothing
      if (get().stompClient && get().connected) return;

      // If an existing client was running, deactivate it first
      if (get().stompClient) {
        try {
          get().stompClient.deactivate();
        } catch (_) {}
      }

      const client = new Client({
        brokerURL,
        reconnectDelay: 10000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          set({ connected: true });
          // Subscribe to public allocations channel
          client.subscribe('/topic/allocations', (message) => {
            try {
              const data = JSON.parse(message.body);
              get().addNotification({
                id: Date.now() + Math.random(),
                title: 'Classroom Allocation Updated',
                message: `${data.payload?.classroom?.roomNumber || 'A classroom'} schedule status changed to ${data.payload?.status || 'UPDATED'}`,
                type: 'info',
                time: new Date().toLocaleTimeString(),
              });
            } catch (err) {
              console.warn('Failed to parse allocation event', err);
            }
          });

          // Subscribe to general notifications
          client.subscribe('/topic/notifications', (message) => {
            try {
              const data = JSON.parse(message.body);
              get().addNotification({
                id: Date.now() + Math.random(),
                title: 'System Notification',
                message: `Update received: ${data.type}`,
                type: 'success',
                time: new Date().toLocaleTimeString(),
              });
            } catch (err) {
              console.warn('Failed to parse system notification', err);
            }
          });
        },
        onDisconnect: () => {
          set({ connected: false });
        },
        onStompError: (frame) => {
          // Graceful handling of broker STOMP frame issues
          set({ connected: false });
        },
        onWebSocketError: () => {
          // Graceful handling when backend is cold-starting
          set({ connected: false });
        },
      });

      client.activate();
      set({ stompClient: client });
    } catch (e) {
      console.warn('WebSocket initialization notice:', e);
    }
  },

  reconnectWebSocket: () => {
    const existing = get().stompClient;
    if (existing) {
      try {
        existing.deactivate();
      } catch (_) {}
      set({ stompClient: null, connected: false });
    }
    get().initWebSocket();
  },

  addNotification: (notif) => {
    set((state) => ({
      notifications: [notif, ...state.notifications].slice(0, 30),
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearUnread: () => {
    set({ unreadCount: 0 });
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
