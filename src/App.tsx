import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Card, Row, Col, Spinner, Tabs, Tab } from 'react-bootstrap';
import DeviceInfo from './DeviceInfo';
import DeviceSpecs from './DeviceSpecs';
import './App.css';
import { db } from './db';
import { id, tx } from '@instantdb/react';
import AreaChartInteractive from './component/CpuChart'; // Adjust the import according to your project structure

interface MetricsResponse {
  cpu_power: number;
  gpu_power: number;
  mem_usage: number;
  mem_total: number;
  cpu_temp_avg: number;
  gpu_temp_avg: number;
  ecpu_usage: [number, number]; // freq, percent_from_max
  pcpu_usage: [number, number]; // freq, percent_from_max
  gpu_usage: [number, number]; // freq, percent_from_max
}

const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get<MetricsResponse>('http://localhost:8000/metrics');
        const data = res.data;
        setMetrics(data);

        // Store fetched metrics into the db using transact
        await db.transact([
          tx.logs[id()].update({
            timestamp: new Date(),
            cpu_power: data.cpu_power,
            gpu_power: data.gpu_power,
            mem_usage: data.mem_usage,
            mem_total: data.mem_total,
            cpu_temp_avg: data.cpu_temp_avg,
            gpu_temp_avg: data.gpu_temp_avg,
            ecpu_usage: data.ecpu_usage,
            pcpu_usage: data.pcpu_usage,
            gpu_usage: data.gpu_usage,
          }),
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch metrics', error);
        setError('Failed to fetch metrics');
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!metrics) {
    return <div>No data available</div>;
  }

  const createChartData = (value: number, name: string, unit: string) => {
    const percentage = value * 100;
    return [
      {
        name: name,
        value: percentage,
        fill: `hsl(${120 - percentage * 1.2}, 70%, 50%)`,
      },
    ];
  };

  

  const cpuPowerData = createChartData(metrics.cpu_power, 'CPU Power', 'W');
  const gpuPowerData = createChartData(metrics.gpu_power, 'GPU Power', 'W');
  const memoryUsageData = createChartData(metrics.mem_usage / metrics.mem_total, 'Memory Usage', '%');
  const cpuTemperatureData = [
    {
      name: 'CPU Temperature',
      value: metrics.cpu_temp_avg,
      fill: `hsl(${120 - metrics.cpu_temp_avg * 1.2}, 70%, 50%)`,
    },
  ];
  const gpuTemperatureData = [
    {
      name: 'GPU Temperature',
      value: metrics.gpu_temp_avg,
      fill: `hsl(${120 - metrics.gpu_temp_avg * 1.2}, 70%, 50%)`,
    },
  ];
  const ecpuUsageData = createChartData(metrics.ecpu_usage[1] / 1, 'E-CPU Usage', '%');
  const pcpuUsageData = createChartData(metrics.pcpu_usage[1] / 1, 'P-CPU Usage', '%');
  const gpuUsageData = createChartData(metrics.gpu_usage[1] / 1, 'GPU Usage', '%');

  const RadialChart: React.FC<{ data: any[], title: string, unit?: string }> = ({ data, title, unit = '%' }) => (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          innerRadius="80%"
          outerRadius="110%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill={data[0].fill}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
            itemStyle={{ color: '#000' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="chart-text">{data[0].value.toFixed(1)}{unit}</div>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <h1 className="dashboard-title">System Metrics</h1>
        <Tabs defaultActiveKey="details" id="metrics-tabs" className="mb-3">
          <Tab eventKey="details" title="Details">
            <Row className="g-4 mb-4">
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>Device Details</Card.Title>
                    <p><strong>Total Memory:</strong> {(metrics.mem_total / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
                    <p><strong>Memory Usage:</strong> {(metrics.mem_usage / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
                    <p><strong>E-CPU Frequency:</strong> {metrics.ecpu_usage[0]} MHz</p>
                    <p><strong>P-CPU Frequency:</strong> {metrics.pcpu_usage[0]} MHz</p>
                    <p><strong>GPU Frequency:</strong> {metrics.gpu_usage[0]} MHz</p>
                    <p><strong>GPU Usage:</strong> {metrics.gpu_usage[1].toFixed(1)}%</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="h-100">
                  <Card.Body>
                    {/* <Card.Title>Device Specifications</Card.Title> */}
                    {/* Add details from DeviceSpecs here if needed */}
                    <DeviceInfo />
                    <DeviceSpecs />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="radial-charts" title="Radial Charts">
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>CPU Power</Card.Title>
                    <RadialChart data={cpuPowerData} title="CPU Power" unit="W" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>GPU Power</Card.Title>
                    <RadialChart data={gpuPowerData} title="GPU Power" unit="W" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>Memory Usage</Card.Title>
                    <RadialChart data={memoryUsageData} title="Memory Usage" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>CPU Temperature</Card.Title>
                    <RadialChart data={cpuTemperatureData} title="CPU Temperature" unit="°C" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>GPU Temperature</Card.Title>
                    <RadialChart data={gpuTemperatureData} title="GPU Temperature" unit="°C" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>E-CPU Usage</Card.Title>
                    <RadialChart data={ecpuUsageData} title="E-CPU Usage" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>P-CPU Usage</Card.Title>
                    <RadialChart data={pcpuUsageData} title="P-CPU Usage" />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <Card.Title>GPU Usage</Card.Title>
                    <RadialChart data={gpuUsageData} title="GPU Usage" />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="graphs" title="Graphs">
            <Row className="g-4 mb-4">
              <Col md={12}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>CPU and GPU Usage</Card.Title>
                    <AreaChartInteractive />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default MetricsDashboard;
