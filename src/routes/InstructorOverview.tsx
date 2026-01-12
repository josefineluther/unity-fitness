import { useEffect, useMemo, useState } from "react"
import "./InstructorOverview.css"

const STRAPI_GRAPHQL_URL =
  "https://competent-addition-09352633f0.strapiapp.com/graphql"

const QUERY = `
query InstructorOverview {
  instructors {
    documentId
    name
    events {
      documentId
      title
      datetime
    }
  }
}
`

type EventItem = {
  documentId: string
  title: string
  datetime: string
}

type Instructor = {
  documentId: string
  name: string
  events?: EventItem[] | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("sv-SE")
}

export default function InstructorOverview() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInstructors() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(STRAPI_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: QUERY }),
        })

        const json = await res.json()

        if (json.errors) {
          throw new Error(json.errors[0].message)
        }

        // sortera instruktörer alfabetiskt + deras pass på datum
        const sorted: Instructor[] = [...(json.data.instructors as Instructor[])]
          .sort((a, b) => a.name.localeCompare(b.name, "sv"))
          .map((i) => ({
            ...i,
            events: [...(i.events ?? [])].sort(
              (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
            ),
          }))

        setInstructors(sorted)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return instructors
    return instructors.filter((i) => i.name.toLowerCase().includes(q))
  }, [instructors, search])

  return (
    <div className="admin">
      <h1>Instruktörer</h1>
      <p className="muted">Översikt över instruktörer.</p>

      <input
        placeholder="Sök instruktör…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="muted">Laddar…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="muted">Inga instruktörer hittades.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="cards">
          {filtered.map((i) => (
            <div key={i.documentId} className="card">
              <div className="cardHead">
                <h2>{i.name}</h2>
                <span className="muted">{i.events?.length ?? 0} pass</span>
              </div>

              {(i.events?.length ?? 0) === 0 ? (
                <p className="muted">Inga pass kopplade.</p>
              ) : (
                <ul>
                  {i.events!.map((e) => (
                    <li key={e.documentId}>
                      <strong>{e.title}</strong>{" "}
                      <span className="muted">— {formatDate(e.datetime)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
