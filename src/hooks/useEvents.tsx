import { useEffect, useState, useRef } from 'react'
import type { Event } from '../types/types'

type UseEventsOptions = {
  pollingInterval?: number
}

export function useEvents({ pollingInterval = 60000 }: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const mounted = useRef(true)

  async function fetchEvents() {
    setLoading(true)
    const query = `
      query {
        events(pagination: { page: 1, pageSize: 50 }) {
          title
          description
          datetime
          image { url alternativeText }
          instructor { name }
          event_categories { name }
          slug
          studio { name }
          spots
          minutes
          bookings { datetime }
          recurrence_weekday
          recurrence_interval
          recurrence_end_date
          recurrence_time
        }
      }`

    try {
      const base = (import.meta as any).env?.VITE_STRAPI_URL || 'https://competent-addition-09352633f0.strapiapp.com/graphql'
      const url = base.replace(/\/$/, '')
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (!mounted.current) return
      const fetchedEvents = Array.isArray(data.data?.events) ? data.data.events : []
      const occurrences: Event[] = []

      const weekdayMap: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0
      }

      fetchedEvents.forEach((event) => {
        if (!event.recurrence_weekday) {
          occurrences.push(event)
          return
        }

        const start = new Date()
        const end = event.recurrence_end_date ? new Date(event.recurrence_end_date) : new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000)
        const [h, m] = event.recurrence_time?.split(':').map(Number) || [0, 0]

        const current = new Date(start)
        while (current <= end) {
          if (current.getDay() === weekdayMap[event.recurrence_weekday]) {
            const occurrenceDate = new Date(current)
            occurrenceDate.setHours(h, m, 0, 0)
            occurrences.push({
              ...event,
              datetime: occurrenceDate.toISOString()
            })
          }
          current.setDate(current.getDate() + 1)
        }
      })

      setEvents(occurrences)
    } catch (e) {
      console.error('Failed to fetch events', e)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  useEffect(() => {
    mounted.current = true
    fetchEvents()
    const id = setInterval(fetchEvents, pollingInterval)
    return () => {
      mounted.current = false
      clearInterval(id)
    }
  }, [pollingInterval])

  return { events, loading, refetch: fetchEvents }
}
