import { useMemo } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useCurrentTime } from './useCurrentTime'

interface CurrentPeriodInfo {
  currentPeriod: number | null // null = 수업 시간 아님
  periodLabel: string
  timeRange: string
  isBreak: boolean
  minutesLeft: number
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function useCurrentPeriod(): CurrentPeriodInfo {
  const { hours, minutes } = useCurrentTime()
  const periodTimes = useSettingsStore((s) => s.settings.periodTimes)

  return useMemo(() => {
    const nowMinutes = hours * 60 + minutes

    for (const pt of periodTimes) {
      const start = timeToMinutes(pt.startTime)
      const end = timeToMinutes(pt.endTime)

      if (nowMinutes >= start && nowMinutes < end) {
        return {
          currentPeriod: pt.period,
          periodLabel: `${pt.period}교시`,
          timeRange: `${pt.startTime} ~ ${pt.endTime}`,
          isBreak: false,
          minutesLeft: end - nowMinutes
        }
      }
    }

    // 쉬는 시간 체크
    for (let i = 0; i < periodTimes.length - 1; i++) {
      const currentEnd = timeToMinutes(periodTimes[i].endTime)
      const nextStart = timeToMinutes(periodTimes[i + 1].startTime)

      if (nowMinutes >= currentEnd && nowMinutes < nextStart) {
        return {
          currentPeriod: periodTimes[i].period,
          periodLabel: '쉬는 시간',
          timeRange: `${periodTimes[i].endTime} ~ ${periodTimes[i + 1].startTime}`,
          isBreak: true,
          minutesLeft: nextStart - nowMinutes
        }
      }
    }

    return {
      currentPeriod: null,
      periodLabel: '수업 외 시간',
      timeRange: '',
      isBreak: false,
      minutesLeft: 0
    }
  }, [hours, minutes, periodTimes])
}
