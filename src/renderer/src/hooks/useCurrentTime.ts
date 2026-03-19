import { useState, useEffect } from 'react'

interface CurrentTime {
  hours: number
  minutes: number
  seconds: number
  dateString: string
  dayName: string
  dayIndex: number // 0=일, 1=월, ... 6=토
}

const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']

export function useCurrentTime(): CurrentTime {
  const [time, setTime] = useState<CurrentTime>(getTime)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTime())
    }, 1000)
    return (): void => clearInterval(interval)
  }, [])

  return time
}

function getTime(): CurrentTime {
  const now = new Date()
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    dateString: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`,
    dayName: DAY_NAMES[now.getDay()],
    dayIndex: now.getDay()
  }
}
