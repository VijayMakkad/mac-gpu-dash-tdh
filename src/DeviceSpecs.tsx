// DeviceSpecs.tsx
import React, { useEffect, useState } from 'react'

const DeviceSpecs: React.FC = () => {
  const [specs, setSpecs] = useState({
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    deviceMemory: navigator.deviceMemory || 'Not supported',
    hardwareConcurrency: navigator.hardwareConcurrency || 'Not supported',
  })

  useEffect(() => {
    const updateSpecs = () => {
      setSpecs({
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        deviceMemory: navigator.deviceMemory || 'Not supported',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Not supported',
      })
    }

    // Add resize event listener to update specs
    window.addEventListener('resize', updateSpecs)

    return () => {
      window.removeEventListener('resize', updateSpecs)
    }
  }, [])

  return (
    <div>
      <h4>Device Specifications</h4>
      <p>Screen Width: {specs.screenWidth}px</p>
      <p>Screen Height: {specs.screenHeight}px</p>
      <p>Device Memory: {specs.deviceMemory} GB</p>
      <p>CPU Cores: {specs.hardwareConcurrency}</p>
    </div>
  )
}

export default DeviceSpecs
