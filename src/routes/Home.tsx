import { useMemo } from 'react'
import './Home.css'
import { useEvents } from '../hooks/useEvents.tsx'
import { useArticles } from '../hooks/useArticles.tsx'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

function Home() {
  const { events, loading } = useEvents({ pollingInterval: 60000 })

  const { articles } = useArticles()

  const upcoming = useMemo(() =>
    events
      .filter((e) => new Date(e.datetime).getTime() >= Date.now())
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
      .slice(0, 3),
    [events]
  )

  return (
    <main className="home-page">
      <header
        className="hero"
        style={{ backgroundImage: `url('/hero.jpeg')` }}
        aria-label="Hero"
      >
        <div className="hero-overlay">
          <h1>Unity Fitness</h1>
          <p className="lead">Stilrent. Effektivt. För alla.</p>
          <div className="hero-actions">
            <a href="#classes" className="btn primary">
              Se schema
            </a>
            <a className="btn ghost" href="#membership">
              Bli medlem
            </a>
          </div>
        </div>
      </header>

      <section className="next-pass card center" aria-live="polite">
          <h3>Nästa pass</h3>
          {loading ? (
            <SkeletonTheme baseColor="#dfebff" highlightColor="#f6f6f6">
              <div className="next-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="next-item">
                    <div className="next-left">
                      <Skeleton height={18} width="60%" style={{ marginBottom: 6 }} />
                      <div className="time"><Skeleton height={14} width={140} /></div>
                    </div>
                    <div className="next-right">
                      <small><Skeleton height={12} width={80} /></small>
                      <div style={{ marginTop: 8 }}><Skeleton height={28} width={70} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </SkeletonTheme>
          ) : upcoming.length === 0 ? (
            <p>Inga kommande pass.</p>
          ) : (
            <div className="next-grid">
              {upcoming.map((e) => (
                <div key={e.slug ?? e.title} className="next-item">
                  <div className="next-left">
                    <strong>{e.title}</strong>
                    <div className="time">{new Date(e.datetime).toLocaleString('sv-SE', { hour: '2-digit', minute: '2-digit', weekday: 'short', day: 'numeric' })}</div>
                  </div>
                  <div className="next-right">
                    <small>{e.instructor?.name ?? ''}</small>
                    <button className="btn primary small">Boka</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      <section id="articles" className="articles" aria-label="Senaste artiklar">
        <h2>Nyheter</h2>
        {articles.length === 0 ? (
          <p>Inga nyheter</p>
        ) : (
          <div className="articles-grid">
            {articles.slice(0, 3).map((a: any) => (
              <article key={a.id ?? a.slug} className="article-card card">
                {a.image?.url && <img src={a.image.url} alt={a.image.alternativeText ?? a.title} className="article-image" />}
                <h3 className="article-title">{a.title}</h3>
                {a.excerpt && <p className="article-excerpt">{a.excerpt}</p>}
                <a className="btn ghost" href={`/articles/${a.slug ?? ''}`}>Läs mer</a>
              </article>
            ))}
          </div>
        )}
      </section>

      
    </main>
  )
}

export default Home
