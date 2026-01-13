import { useState } from 'react'
import '../styles/eventlist.css'
import { useEvents } from '../hooks/useEvents.tsx'

function EventList() {
  const { events } = useEvents()
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

  const availableSpots = 2


  return (
    <>
      <div className='date-picker'>
        <button className='arrow' onClick={() => setStartDate(startDate - 14)} disabled={startDate < 14}>
          Vänsterpil
        </button>
        {dates.map((date) => (
          <button className='date-button' aria-selected={selectedDate === date.toDateString()} onClick={() => setSelectedDate(date.toDateString())}>
            <div>{date.toLocaleDateString('sv-SE', { weekday: 'short' })}</div> <div className='date-number'>{date.getDate()}</div>
          </button>
        ))}
        <button className='arrow' onClick={() => setStartDate(startDate + 14)}>
          Högerpil
        </button>
      </div>
      <div className='wrapper'>
        <div className='list'>
          {filteredEvents.length > 0 &&
            filteredEvents.map((event) => (
              <div className='event-in-list' key={event.slug}>
                <div className='image-wrapper'>
                  <img src={event.image.url} />
                
                  {availableSpots > 0 ? <div className='spots available'>{availableSpots} lediga platser</div> : <div className='spots full'>Fullbokat</div>}
                </div>
                <div className='text-wrapper'>
                  <p className='event-title'>
                    {event.title}, {event.minutes} min
                  </p>
                
                  <p className='small-text'>
                    {new Date(event.datetime).toLocaleTimeString('sv-SE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className='small-text'>{event.instructor.name}</p>
                  <p className='small-text'>{event.studio.name}</p>
                </div>
              </div>
            ))}
        </div>
        {filteredEvents.length === 0 && <p className='no-events'>Inga pass denna dag!</p>}
      </div>
    </>
  )
}

export default EventList
