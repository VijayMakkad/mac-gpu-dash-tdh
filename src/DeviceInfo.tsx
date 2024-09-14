// DeviceInfo.tsx
import React, { useEffect, useState } from 'react'
import platform from 'platform'

const DeviceInfo: React.FC = () => {
  const [osName, setOsName] = useState<string>('')

  useEffect(() => {
    const os = platform.os
    setOsName(`${os.family} ${os.version}`)
  }, [])

  return (
    <div>
      <h4>Operating System</h4>
      <p>{osName}</p>
    </div>
  )
}

export default DeviceInfo
