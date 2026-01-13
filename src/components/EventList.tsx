import { useState, useEffect } from 'react'
import type { Event } from '../types/types'
import '../styles/eventlist.css'
import { ChevronLeft, ChevronRight, Clock, Flag, User, Users } from 'lucide-react'

function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString())
  const [startDate, setStartDate] = useState(0)

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
      const query = `
        query {
          events {
            title
            description
            datetime
            image {
              url
              alternativeText
            }
            instructor {
              name
            }
            event_categories {
              name
            }
            slug
            studio {
              name
            }
            spots
            minutes
            bookings {
              booking_reference
            }
          }
        }`

      const res = await fetch('https://competent-addition-09352633f0.strapiapp.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      const data = await res.json()
      setEvents(data.data.events)
    }
    getEvents()
  }, [])

  console.log(events)

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
          {filteredEvents.length > 0 &&
            filteredEvents.map((event) => {
              const booked = event.bookings?.length || 0
              const availableSpots = event.spots - booked

              return (
                <div className='event-in-list' key={event.slug}>
                  <div className='image-wrapper'>
                    <img src={event.image.url} />
                    {availableSpots > 0 ? (
                      <div className='spots available info-section'>
                        <Users size={12} /> {availableSpots} lediga platser
                      </div>
                    ) : (
                      <div className='spots full info-section'>
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
                      <p className='small-text'>
                        {new Date(event.datetime).toLocaleTimeString('sv-SE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className='info-section'>
                      <User size={16} />
                      <p className='small-text'>{event.instructor.name}</p>
                    </div>
                    <div className='info-section'>
                      <Flag size={13} />
                      <p className='small-text'>{event.studio.name}</p>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
        {filteredEvents.length === 0 && <p className='no-events'>Inga pass denna dag!</p>}
      </div>
    </>
  )
}

export default EventList
