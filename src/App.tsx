import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css' // Import the CSS file

interface MetricsResponse {
  cpu_power: number
  gpu_power: number
  mem_usage: number
  mem_total: number
}

const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get<MetricsResponse>('http://localhost:8000/metrics')
        setMetrics(res.data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch metrics', error)
        setError('Failed to fetch metrics')
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 2000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!metrics) {
    return <div>No data available</div>
  }

  const createChartData = (value: number, name: string) => {
    const percentage = value * 100
    return [
      {
        name: name,
        value: percentage,
        fill: `hsl(${120 - percentage * 1.2}, 70%, 50%)`, // Color based on value
      },
    ]
  }

  const cpuPowerData = createChartData(metrics.cpu_power, 'CPU Power')
  const gpuPowerData = createChartData(metrics.gpu_power, 'GPU Power')
  const memoryUsageData = createChartData(metrics.mem_usage / metrics.mem_total, 'Memory Usage')

  const RadialChart: React.FC<{ data: any[], title: string }> = ({ data, title }) => (
    <div className="chart-container">
      <h2 className="chart-title">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          innerRadius="80%" // Adjust inner radius
          outerRadius="110%" // Adjust outer radius
          data={data}
          startAngle={180} // Adjust start angle
          endAngle={0} // Adjust end angle
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10} // Adjust corner radius
            fill={data[0].fill} // Set fill color
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }} // Customize tooltip background and border
            itemStyle={{ color: '#000' }} // Customize tooltip text color
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="chart-text">{data[0].value.toFixed(1)}%</div>
    </div>
  )

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard">
        <h1 className="dashboard-title">System Metrics</h1>
        <div className="charts-container">
          <RadialChart data={cpuPowerData} title="CPU Power" />
          <RadialChart data={gpuPowerData} title="GPU Power" />
          <RadialChart data={memoryUsageData} title="Memory Usage" />
        </div>
        <div className="memory-info">
          <p>Memory Usage: {(metrics.mem_usage / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
          <p>Total Memory: {(metrics.mem_total / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
        </div>
      </div>
    </div>
  )
}

export default MetricsDashboard
