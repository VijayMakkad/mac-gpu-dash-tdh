import { init } from '@instantdb/react';

// ID for app: gpu_back
const APP_ID = '6a55c788-dcac-4e57-9be9-d06fe014de53';

type MyAppSchema = {
  logs: {
    timestamp: Date;
    cpu_power: number;
    gpu_power: number;
    mem_usage: number;
    mem_total: number;
    cpu_temp_avg: number;
    gpu_temp_avg: number;
    ecpu_usage: [number, number];
    pcpu_usage: [number, number];
    gpu_usage: [number, number];
  }[];
};

export const db = init<MyAppSchema>({ appId: APP_ID });




