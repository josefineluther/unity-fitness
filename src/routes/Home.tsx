import { useMemo } from 'react'
import './Home.css'
import { useEvents } from '../hooks/useEvents.tsx'
import { useArticles } from '../hooks/useArticles.tsx'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Link } from 'react-router-dom'
import placeholderImg from '/placeholder.jpeg'
import { Clock, Flag, User, Users } from 'lucide-react'

function Home() {
  const { events, loading } = useEvents({ pollingInterval: 60000 })
  const { articles } = useArticles()

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => typeof e.datetime === 'string' && new Date(e.datetime).getTime() >= Date.now())
        .sort((a, b) => new Date(a.datetime as string).getTime() - new Date(b.datetime as string).getTime())
        .slice(0, 3),
    [events]
  )

  return (
    <main className='home-page'>
      <header className='hero' style={{ backgroundImage: `url('/hero.jpeg')` }} aria-label='Hero'>
        <div className='hero-overlay'>
          <h1>Unity Fitness</h1>
          <p className='lead'>Stilrent. Effektivt. För alla.</p>
          <div className='hero-actions'>
            <a href='#classes' className='btn primary'>
              Se schema
            </a>
            <a className='btn ghost' href='#membership'>
              Bli medlem
            </a>
          </div>
        </div>
      </header>
      <section className='next-pass' aria-live='polite'>
        <h2>Nästa pass</h2>
        <div className='next-pass-grid'>
          {loading ? (
            <SkeletonTheme baseColor='#dfebff' highlightColor='#f6f6f6'>
              {[...Array(3)].map((_, i) => (
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
          ) : upcoming.length === 0 ? (
            <p>Inga kommande pass.</p>
          ) : (
            upcoming.map((event) => {
              const filteredBookings = event.bookings?.filter((booking) => new Date(booking.datetime).getTime() === new Date(event.datetime).getTime()) ?? []
              const booked = filteredBookings?.length
              const availableSpots = event.spots - booked

              const date = new Date(event.datetime).toLocaleDateString('sv-SE', {
                day: '2-digit',
                month: 'long'
              })

              const time = new Date(event.datetime).toLocaleTimeString('sv-SE', {
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <Link to={`/pass/${event.slug}?datetime=${event.datetime}`} key={`${event.slug}-${event.datetime}`}>
                  <div className='event-in-list'>
                    <div className='image-wrapper'>
                      <img src={event.image?.url || placeholderImg} alt={event.title} />
                      {availableSpots > 0 ? (
                        <div className='spots available'>
                          <Users size={12} /> {availableSpots} lediga platser
                        </div>
                      ) : (
                        <div className='spots full'>
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
                          {date} kl. {time}
                        </p>

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
            })
          )}
        </div>
      </section>
      <section id='articles' className='articles' aria-label='Senaste artiklar'>
        <h2>Nyheter</h2>
        {articles.length === 0 ? (
          <p>Inga nyheter</p>
        ) : (
          <div className='articles-grid'>
            {articles.slice(0, 3).map((a: any) => (
              <article key={a.id ?? a.slug} className='article-card card'>
                {a.cover?.url && <img src={a.cover.url} alt={a.cover.alternativeText ?? a.title} className='article-image' />}

                <h3 className='article-title'>{a.title}</h3>
                {a.description && <p className='article-excerpt'>{a.description}</p>}

               
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Home
