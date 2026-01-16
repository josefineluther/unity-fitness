import { useEffect, useMemo, useState } from "react"
import "./AdminDashboard.css"

const STRAPI_GRAPHQL_URL =
  "https://competent-addition-09352633f0.strapiapp.com/graphql"

const STRAPI_BASE = "https://competent-addition-09352633f0.strapiapp.com"
const API_BASE = `${STRAPI_BASE}/api`

const TOKEN =
  "d92570d93a81097b957d04b6a423ca6ffb8709b2bf0cfed185aed7f664605709068043b9d9a159eca26126a9578a21ff73ee0ef1a24b7a7328419b26aba43aad9c8e4b25d2b8ebdc9f9f61f52cd5975ea3056959f83fb0f3628d89912e4afcb988180456cdaebd14719844ffbe102f85b09181f8ea9b5c1414a04241b8d38492"

const hasToken = Boolean(TOKEN)

const EVENTS_QUERY = `
query AdminDashboard {
  events(pagination: { pageSize: 1000 }, sort: "datetime:asc") {
    documentId
    title
    datetime
    instructor { name documentId }
    event_categories { name documentId }
  }
}
`

const META_QUERY = `
query AdminMeta {
  instructors { documentId name }
  eventCategories { documentId name }
}
`

type EventItem = {
  documentId: string
  title: string
  datetime: string
  instructor?: { name: string; documentId?: string } | null
  event_categories?: { name: string; documentId?: string }[] | null
}

type Instructor = { documentId: string; name: string }
type Category = { documentId: string; name: string }

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("sv-SE", { dateStyle: "medium", timeStyle: "short" })
}

function toLocal(iso: string) {
  return iso.slice(0, 16)
}

function toIsoFromLocal(localValue: string) {
  return new Date(localValue).toISOString()
}

async function gqlFetch<T>(query: string): Promise<T> {
  const res = await fetch(STRAPI_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data as T
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(json?.error?.message || `Request failed: ${res.status}`)
  return json
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form
  const [newTitle, setNewTitle] = useState("")
  const [newDatetime, setNewDatetime] = useState("")
  const [newInstructorDocId, setNewInstructorDocId] = useState("")
  const [newCategoryDocIds, setNewCategoryDocIds] = useState<string[]>([])

  // Inline edit
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDatetime, setEditDatetime] = useState("")

  async function refreshEvents() {
    const data = await gqlFetch<{ events: EventItem[] }>(EVENTS_QUERY)
    setEvents(data.events ?? [])
  }

  async function loadMetaOnce() {
    const data = await gqlFetch<{ instructors: Instructor[]; eventCategories: Category[] }>(
      META_QUERY
    )
    setInstructors(data.instructors ?? [])
    setCategories(data.eventCategories ?? [])
  }

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        setError(null)
        await Promise.all([refreshEvents(), loadMetaOnce()])
      } catch (e: any) {
        setError(e.message ?? "Kunde inte hämta data")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events

    return events.filter((e) => {
      const instructor = e.instructor?.name ?? ""
      const cats = e.event_categories?.map((c) => c.name).join(" ") ?? ""
      return (
        e.title.toLowerCase().includes(q) ||
        instructor.toLowerCase().includes(q) ||
        cats.toLowerCase().includes(q)
      )
    })
  }, [events, search])

  function startEdit(ev: EventItem) {
    setError(null)
    setEditingDocId(ev.documentId)
    setEditTitle(ev.title)
    setEditDatetime(toLocal(ev.datetime))
  }

  function cancelEdit() {
    setEditingDocId(null)
    setEditTitle("")
    setEditDatetime("")
  }

  async function createNew(e: React.FormEvent) {
    e.preventDefault()
    if (!hasToken) return

    setSaving(true)
    setError(null)
    try {
      const payload: any = {
        data: {
          title: newTitle,
          datetime: toIsoFromLocal(newDatetime),
        },
      }

      if (newInstructorDocId) payload.data.instructor = { connect: [newInstructorDocId] }
      if (newCategoryDocIds.length) payload.data.event_categories = { connect: newCategoryDocIds }

      await apiFetch("/events", { method: "POST", body: JSON.stringify(payload) })
      await refreshEvents()

      setNewTitle("")
      setNewDatetime("")
      setNewInstructorDocId("")
      setNewCategoryDocIds([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!editingDocId || !hasToken) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        data: {
          title: editTitle,
          datetime: toIsoFromLocal(editDatetime),
        },
      }

      await apiFetch(`/events/${editingDocId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })

      await refreshEvents()
      cancelEdit()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteEvent(ev: EventItem) {
    if (!hasToken) return
    if (!confirm("Ta bort passet?")) return

    setSaving(true)
    setError(null)
    try {
      await apiFetch(`/events/${ev.documentId}`, { method: "DELETE" })
      await refreshEvents()
      if (editingDocId === ev.documentId) cancelEdit()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="aoPage">
      <h1 className="aoTitle">Admin Dashboard</h1>
      <p className="aoSubtitle aoMuted">Översikt för pass.</p>

      <div className="aoContent">
        <div className="aoCard">
          <h2 className="aoH2">Skapa nytt pass</h2>

          <form className="aoForm" onSubmit={createNew}>
            <label className="aoLabel">
              Titel
              <input className="aoInput" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
            </label>

            <label className="aoLabel">
              Datum & tid
              <input className="aoInput" type="datetime-local" value={newDatetime} onChange={(e) => setNewDatetime(e.target.value)} required />
            </label>

            <label className="aoLabel">
              Instruktör
              <select className="aoInput" value={newInstructorDocId} onChange={(e) => setNewInstructorDocId(e.target.value)}>
                <option value="">Välj instruktör…</option>
                {instructors.map((i) => (
                  <option key={i.documentId} value={i.documentId}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="aoLabel">
              Kategorier
              <select
                className="aoInput"
                multiple
                value={newCategoryDocIds}
                onChange={(e) => setNewCategoryDocIds(Array.from(e.target.selectedOptions).map((o) => o.value))}
              >
                {categories.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.name}
                  </option>
                ))}
              </select>
              <small className="aoTiny aoMuted">Tips: håll ctrl/cmd för att välja flera.</small>
            </label>

            <button className="aoBtn" type="submit" disabled={!hasToken || saving}>
              {saving ? "Sparar…" : "Skapa"}
            </button>

            {!hasToken && (
              <small className="aoTiny aoMuted">
                CRUD är avstängt utan token (.env.local).
              </small>
            )}
          </form>
        </div>

        <input className="aoSearch" placeholder="Sök pass / instruktör / typ" value={search} onChange={(e) => setSearch(e.target.value)} />

        {loading && <p className="aoCenter aoMuted">Laddar…</p>}
        {saving && <p className="aoCenter aoMuted">Uppdaterar…</p>}
        {error && <p className="aoCenter aoError">{error}</p>}

        {!loading && !error && filtered.length === 0 && <p className="aoCenter aoMuted">Inga pass hittades.</p>}

        {!loading && filtered.length > 0 && (
          <div className="aoTableWrap">
            <table className="aoTable">
              <thead>
                <tr>
                  <th>Pass</th>
                  <th>Datum</th>
                  <th>Instruktör</th>
                  <th>Kategori</th>
                  <th>Åtgärder</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((ev) => {
                  const isEditing = editingDocId === ev.documentId

                  return (
                    <tr key={ev.documentId}>
                      <td>
                        {isEditing ? (
                          <input className="aoInlineInput" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        ) : (
                          ev.title
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <input className="aoInlineInput" type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)} />
                        ) : (
                          formatDate(ev.datetime)
                        )}
                      </td>

                      <td>{ev.instructor?.name ?? "—"}</td>

                      <td>{ev.event_categories?.map((c) => c.name).join(", ") ?? "—"}</td>

                      <td>
                        <div className="aoActions">
                          {!isEditing ? (
                            <>
                              <button className="aoBtn aoBtnSecondary" onClick={() => startEdit(ev)} disabled={!hasToken || saving} type="button">
                                Ändra
                              </button>

                              <button className="aoBtn aoBtnDanger" onClick={() => deleteEvent(ev)} disabled={!hasToken || saving} type="button">
                                Ta bort
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="aoBtn" onClick={saveEdit} disabled={!hasToken || saving} type="button">
                                {saving ? "Sparar…" : "Spara"}
                              </button>

                              <button className="aoBtn aoBtnSecondary" onClick={cancelEdit} disabled={saving} type="button">
                                Avbryt
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
