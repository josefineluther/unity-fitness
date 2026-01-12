import { useEffect, useMemo, useState } from "react"
import "./AdminDashboard.css"

const STRAPI_GRAPHQL_URL =
  "https://competent-addition-09352633f0.strapiapp.com/graphql"

const QUERY = `
query AdminDashboard {
  events {
    documentId
    title
    datetime
    instructor {
      name
    }
    event_categories {
      name
    }
  }
}
`

type EventItem = {
  documentId: string
  title: string
  datetime: string
  instructor?: { name: string } | null
  event_categories?: { name: string }[] | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("sv-SE")
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(STRAPI_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: QUERY }),
        })

        const json = await res.json()

        if (json.errors) {
          throw new Error(json.errors[0].message)
        }

        setEvents(json.data.events)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase()

    return events.filter((e) => {
      const categories =
        e.event_categories?.map((c) => c.name).join(" ") ?? ""

      const instructor = e.instructor?.name ?? ""

      return (
        e.title.toLowerCase().includes(q) ||
        instructor.toLowerCase().includes(q) ||
        categories.toLowerCase().includes(q)
      )
    })
  }, [events, search])

  return (
    <div className="admin">
      <h1>Admin Dashboard</h1>
      <p className="muted">Översikt över pass, instruktörer och kategorier.</p>

      <input
        placeholder="Sök pass / instruktör / typ"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="muted">Laddar…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && filteredEvents.length === 0 && (
        <p className="muted">Inga pass hittades.</p>
      )}

      {!loading && !error && filteredEvents.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Pass</th>
              <th>Datum</th>
              <th>Instruktör</th>
              <th>Kategori</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.documentId}>
                <td>{event.title}</td>
                <td>{formatDate(event.datetime)}</td>
                <td>{event.instructor?.name ?? "—"}</td>
                <td>
                  {event.event_categories
                    ?.map((c) => c.name)
                    .join(", ") ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
