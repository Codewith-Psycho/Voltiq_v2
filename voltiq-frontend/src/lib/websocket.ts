import { useVoltStore } from './store';
import type { TariffMode } from './store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/colony';
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_DELAY = 3000;

let ws: WebSocket | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let mockInterval: NodeJS.Timeout | null = null;

function generateMockUpdate() {
  const store = useVoltStore.getState();
  const tariffs: TariffMode[] = ['peak', 'mid', 'sasta'];
  const currentIndex = tariffs.indexOf(store.tariffMode);

  // Occasional tariff shift
  let newTariff = store.tariffMode;
  if (Math.random() > 0.9) {
    const shift = Math.random() > 0.5 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(2, currentIndex + shift));
    newTariff = tariffs[newIndex];
  }

  // Fluctuate kW
  const kw = Math.max(80, Math.min(220, store.liveKW + (Math.random() - 0.5) * 10));

  // Update flats with small variations
  const flats = store.colonyData.flats.map((f) => ({
    ...f,
    kw: Math.max(0.3, Math.min(1.5, f.kw + (Math.random() - 0.5) * 0.1)),
    energyScore: Math.max(50, Math.min(99, f.energyScore + Math.floor((Math.random() - 0.5) * 3))),
  }));

  store.setTariffMode(newTariff);
  store.setLiveKW(Math.round(kw * 10) / 10);
  store.setColonyData({
    ...store.colonyData,
    totalKW: Math.round(kw * 10) / 10,
    tariff: newTariff,
    flats: flats.sort((a, b) => b.energyScore - a.energyScore).map((f, i) => ({ ...f, rank: i + 1 })),
  });
}

export function startMockUpdates() {
  if (mockInterval) return;
  useVoltStore.getState().setWsConnected(true);
  mockInterval = setInterval(generateMockUpdate, 3000);
}

export function stopMockUpdates() {
  if (mockInterval) {
    clearInterval(mockInterval);
    mockInterval = null;
  }
}

export function connectWebSocket() {
  if (ws?.readyState === WebSocket.OPEN) return;

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      useVoltStore.getState().setWsConnected(true);
      stopMockUpdates();

      // Clear existing heartbeat timer to prevent stacking
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }

      // Start heartbeat
      heartbeatTimer = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, HEARTBEAT_INTERVAL);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const store = useVoltStore.getState();
        
        if (data.type === 'colony_update') {
          if (data.tariff) store.setTariffMode(data.tariff);
          if (data.totalKW) store.setLiveKW(data.totalKW);
          if (data.colonyData) store.setColonyData(data.colonyData);
        }
        
        if (data.type === 'appliance_status') {
          // Handle appliance status updates
          const { applianceId } = data;
          if (applianceId) {
            store.toggleAppliance(applianceId);
          }
        }
        
        if (data.type === 'alert') {
          // Push new alerts
          const { alertType, title, message, actionLabel } = data;
          if (title && message) {
            store.addAlert({
              type: alertType || 'tariff',
              title,
              message,
              actionLabel,
            });
          }
        }
      } catch (error) {
        console.warn('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      cleanup();
      useVoltStore.getState().setWsConnected(false);
      // Fallback to mock data
      startMockUpdates();
      // Try reconnecting (only if not already scheduled)
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY);
      }
    };

    ws.onerror = () => {
      ws?.close();
    };
  } catch {
    // WebSocket connection failed, use mock
    startMockUpdates();
  }
}

function cleanup() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function disconnectWebSocket() {
  cleanup();
  stopMockUpdates();
  ws?.close();
  ws = null;
  useVoltStore.getState().setWsConnected(false);
}
