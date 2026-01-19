import { useState, useEffect } from 'react'
import type { Event } from '../types/types'
import './EventList.css'
import { ChevronLeft, ChevronRight, Clock, Flag, User, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import placeholderImg from '/placeholder.jpeg'
import Button from './Button'

function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString())
  const [startDate, setStartDate] = useState(0)
  const [loading, setLoading] = useState(true)

  const dates = []
  for (let i = 0; i <= 13; i++) {
    const date = new Date()
    date.setDate(date.getDate() + startDate + i)
    dates.push(date)
  }

  const filteredEvents = events
    .filter((event) => new Date(event.datetime).toDateString() === selectedDate)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

  useEffect(() => {
    async function getEvents() {
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
          bookings { booking_reference }
          recurrence_weekday
          recurrence_interval
          recurrence_end_date
          recurrence_time
        }
      }`

      const res = await fetch('https://competent-addition-09352633f0.strapiapp.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data = await res.json()
      const fetchedEvents: Event[] = data.data.events
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
      setLoading(false)
    }

    getEvents()
  }, [])

  return (
    <>
      <div className='date-picker'>
        <button className='arrow' onClick={() => setStartDate(startDate - 14)} disabled={startDate < 14}>
          <ChevronLeft />
        </button>
        {dates.map((date) => (
          <button
            key={date.toDateString()}
            className='date-button'
            aria-selected={selectedDate === date.toDateString()}
            onClick={() => setSelectedDate(date.toDateString())}
          >
            <div>{date.toLocaleDateString('sv-SE', { weekday: 'short' })}</div> <div className='date-number'>{date.getDate()}</div>
          </button>
        ))}
        <button className='arrow' onClick={() => setStartDate(startDate + 14)}>
          <ChevronRight />
        </button>
      </div>
      <div className='wrapper'>
        <div className='list'>
          {loading && (
            <SkeletonTheme baseColor='#dfebff' highlightColor='#f6f6f6'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='event-in-list'>
                  <div className='image-wrapper'>
                    <Skeleton height={200} />
                  </div>
                  <div className='text-wrapper'>
                    <Skeleton height={20} width='80%' style={{ marginBottom: '10px' }} />
                    <div className='info-section'>
                      <Skeleton height={14} width='60%' />
                    </div>
                  </div>
                </div>
              ))}
            </SkeletonTheme>
          )}
          {!loading &&
            filteredEvents.length > 0 &&
            filteredEvents.map((event) => {
              const booked = event.bookings?.length || 0
              const availableSpots = event.spots - booked
              const time = new Date(event.datetime).toLocaleTimeString('sv-SE', {
                hour: '2-digit',
                minute: '2-digit'
              })
              const eventDate = new Date(event.datetime)
              const now = new Date()
              const hasPassed = eventDate < now

              return (
                !hasPassed && (
                  <Link to={`/pass/${event.slug}?datetime=${event.datetime}`} key={event.slug}>
                    <div className='event-in-list'>
                      <div className='image-wrapper'>
                        <img src={event.image?.url || placeholderImg} alt={event.title} />
                        {availableSpots > 0 ? (
                          <div className='spots available'>
                            <Users size={12} /> {availableSpots} lediga platser
                          </div>
                        ) : (
                          <div className='spots full'>
                            {' '}
                            <Users size={12} /> Fullbokat
                          </div>
                        )}
                      </div>
                      <div className='text-wrapper'>
                        <p className='event-title'>
                          {event.title}, {event.minutes} min
                        </p>
                        <div className='info-section'>
                          <Clock size={13} />
                          <p className='small-text'>{time}</p>
                          {event.instructor && (
                            <>
                              <User size={13} />
                              <p className='small-text'>{event.instructor.name}</p>
                            </>
                          )}
                          {event.studio && (
                            <>
                              <Flag size={13} />
                              <p className='small-text'>{event.studio?.name}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )
            })}
        </div>
        {!loading && filteredEvents.length === 0 && (
          <div className='no-events'>
            <p>Inga pass denna dag!</p>
            <Button
              text='Visa nästa dag'
              onClick={() => {
                const nextDay = new Date(selectedDate)
                nextDay.setDate(nextDay.getDate() + 1)
                setSelectedDate(nextDay.toDateString())
              }}
            ></Button>
          </div>
        )}
        {!loading && filteredEvents.length > 0 && filteredEvents.every((e) => new Date(e.datetime) < new Date()) && (
          <div className='no-events'>
            <p>Alla pass för dagen har varit</p>
            <Button
              text='Visa nästa dag'
              onClick={() => {
                const nextDay = new Date(selectedDate)
                nextDay.setDate(nextDay.getDate() + 1)
                setSelectedDate(nextDay.toDateString())
              }}
            ></Button>
          </div>
        )}
      </div>
    </>
  )
}

export default EventList
