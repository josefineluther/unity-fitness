import { useState, useEffect } from 'react'
import type { Event } from '../types/types'
import '../styles/eventlist.css'
import Button from './Button'

function EventList() {
  const [events, setEvents] = useState<Event[]>([])

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

  return (
    <div className='list'>
      {events.map((event) => (
        <div className='event-in-list' key={event.slug}>
          <img src={event.image.url} />
          <p>
            {event.event_categories.map((category) => (
              <span key={category.name}>{category.name} </span>
            ))}
          </p>
          <p>
            {new Date(event.datetime).toLocaleDateString('sv-SE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <h2>{event.title}</h2>
          <p>Instruktör: {event.instructor.name}</p>
          <Button color='light' text='Boka Pass'></Button>
        </div>
      ))}
    </div>
  )
}

export default EventList
