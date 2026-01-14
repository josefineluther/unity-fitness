import { useMemo } from 'react'
import './Home.css'
import { useEvents } from '../hooks/useEvents.tsx'
import { useArticles } from '../hooks/useArticles.tsx'

function Home() {
  const { events, loading } = useEvents({ pollingInterval: 60000 })

  const { articles, loading: articlesLoading } = useArticles({ pollingInterval: 0 })

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
        style={{ backgroundImage: `url('/Copilot_20260109_102947.png')` }}
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
          <p>Laddar</p>
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

      <section className="features simple" aria-label="Vad vi erbjuder">
        <div className="feature">
          <div className="icon"></div>
          <h4>Styrka</h4>
          <p>.</p>
        </div>
        <div className="feature">
          <div className="icon"></div>
          <h4>Rörlighet</h4>
          <p>.</p>
        </div>
        <div className="feature">
          <div className="icon"></div>
          <h4>Flexibelt</h4>
          <p>.</p>
        </div>
      </section>

      <section id="articles" className="articles" aria-label="Senaste artiklar">
        <h2>Nyheter</h2>
        {articlesLoading ? (
          <p>Laddar nyheter</p>
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

      <section id="classes" className="classes" aria-label="Kommande pass">
        <h2>Kommande pass</h2>
        {loading ? (
          <p>Laddar pass</p>
        ) : (
          <ul className="class-list">
            {events
              .filter((e) => new Date(e.datetime).getTime() >= Date.now())
              .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
              .slice(0, 8)
              .map((ev) => (
                <li key={ev.slug} className="class-item">
                  <div>
                    <strong>{ev.title}</strong>
                    <div className="time">{new Date(ev.datetime).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className="actions">
                    <span className="instructor">{ev.instructor?.name}</span>
                    <button className="btn ghost small">Boka</button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default Home
