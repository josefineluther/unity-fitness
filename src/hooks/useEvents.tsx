import { useEffect, useState, useRef } from 'react'
import type { Event } from '../types/types'

type UseEventsOptions = {
  pollingInterval?: number // ms
}

export function useEvents({ pollingInterval = 60000 }: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const mounted = useRef(true)

  async function fetchEvents() {
    setLoading(true)
    const query = `
      query {
        events {
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
        }
      }`

    try {
      const res = await fetch('https://competent-addition-09352633f0.strapiapp.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (!mounted.current) return
      setEvents(Array.isArray(data.data?.events) ? data.data.events : [])
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
