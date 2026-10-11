import { create } from 'zustand';
import { Client } from '@stomp/stompjs';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  stompClient: null,
  connected: false,

  initWebSocket: () => {
    if (get().stompClient && get().connected) return;

    try {
      const loc = window.location;
      const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      const brokerURL = import.meta.env.VITE_WS_URL || `${protocol}//${loc.host}/ws`;

      const client = new Client({
        brokerURL,
        reconnectDelay: 5000,
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
          console.warn('STOMP protocol error:', frame.headers['message']);
        },
      });

      client.activate();
      set({ stompClient: client });
    } catch (e) {
      console.warn('WebSocket connection initialization error:', e);
    }
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
