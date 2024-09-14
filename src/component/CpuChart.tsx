import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';
import { toast } from 'react-toastify';
import { db } from '../db'; // Adjust according to your project structure

interface Log {
  timestamp: Date; // ISO string format
  cpu_power: number;
  gpu_power: number;
  mem_usage: number;
  mem_total: number;
  cpu_temp_avg: number;
  gpu_temp_avg: number;
  ecpu_usage: [number, number];
  pcpu_usage: [number, number];
  gpu_usage: [number, number];
}


export default function AreaChartInteractive() {
  const [selectedValue, setSelectedValue] = useState("CPU");
  const [chartData, setChartData] = useState<Log[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  const query = {
    logs: {
      $: {
        limit: 50,
        order: {
          serverCreatedAt: "desc" as const, // Correct field name
        },
      },
    },
  };

  const { error, data } = db.useQuery(query);

  useEffect(() => {
    if (data && data.logs) {
      const thelogs: Log[] = data.logs.map((log: any) => ({
        id: log.id,
        timestamp: log.timestamp, // Ensure timestamp is a string
        cpu_power: log.cpu_power,
        gpu_power: log.gpu_power,
        mem_usage: log.mem_usage,
        mem_total: log.mem_total,
        cpu_temp_avg: log.cpu_temp_avg,
        gpu_temp_avg: log.gpu_temp_avg,
        ecpu_usage: log.ecpu_usage,
        pcpu_usage: log.pcpu_usage,
        gpu_usage: log.gpu_usage,
      }));
      console.log("Mapped Data:", thelogs); // Debug
      setChartData(thelogs);
    }
  }, [data]);

  if (error) {
    toast.error("Failed to fetch data " + error.message);
  }

  return (
    <div className="container" ref={chartRef}>
      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between">
          <h5 className="card-title">System Metrics</h5>
          <select
            className="form-select w-auto"
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
          >
            <option value="CPU">CPU</option>
            <option value="GPU">GPU</option>
          </select>
        </div>
        <div className="card-body">
          <AreaChart width={800} height={500} data={chartData}>
            {selectedValue === "CPU" && (
              <>
                <defs>
                  <linearGradient
                    id="fillCPU"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--bs-primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--bs-primary)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  }}
                />
                <YAxis domain={[0, 'auto']} />
                <Area
                  type="monotone"
                  dataKey="cpu_power"
                  stroke="var(--bs-primary)"
                  fillOpacity={1}
                  fill="url(#fillCPU)"
                />
              </>
            )}
            {selectedValue === "GPU" && (
              <>
                <defs>
                  <linearGradient
                    id="fillGPU"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--bs-success)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--bs-success)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  }}
                />
                <YAxis domain={[0, 'auto']} />
                <Area
                  type="monotone"
                  dataKey="gpu_power"
                  stroke="var(--bs-success)"
                  fillOpacity={1}
                  fill="url(#fillGPU)"
                />
              </>
            )}
          </AreaChart>
        </div>
      </div>
    </div>
  );
}