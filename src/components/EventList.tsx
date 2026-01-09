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
          <div className='image-wrapper'>
            <img src={event.image.url} />
            <div className='categories'>
              {event.event_categories.map((category) => (
                <div className='category' key={category.name}>
                  {category.name}{' '}
                </div>
              ))}
            </div>
            <Button color='light' text='Boka'></Button>
          </div>
          <div className='text-wrapper'>
            <div>
              <p>
                {new Date(event.datetime).toLocaleTimeString('sv-SE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p style={{ whiteSpace: 'nowrap' }}>45 min</p>
              {/* <p>
              {new Date(event.datetime).toLocaleDateString('sv-SE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p> */}
            </div>
            <div>
              <p>
                <b>{event.title}</b>
              </p>
              <p>med {event.instructor.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EventList
