export type ParkingType = "居民共享" | "老旧小区改造" | "商业共享" | "综合体" | "路侧错时车位";

export type Priority = "high" | "low";

export interface ParkingSpot {
  name: string;
  type: ParkingType;
  dist: number;
  priority: Priority;
}

export interface HubData {
  lat: number;
  lon: number;
  parking: ParkingSpot[];
}

export interface HubCollection {
  [key: string]: HubData;
}

export type AppStatus = 'IDLE' | 'CHECKING_LIMITS' | 'PREDICTING' | 'WAITING' | 'ASSIGNED';

export interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'cmd';
}

export interface SimulationResult {
  name: string;
  type: ParkingType;
  dist: number;
  coords: [number, number];
}
