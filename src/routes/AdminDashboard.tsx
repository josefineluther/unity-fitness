import { useMemo, useState } from "react"
import "./AdminDashboard.css"
import { useAdminDashboard, type EventItem } from "../hooks/useAdminDashboard"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function toLocal(iso: string) {
  return iso.slice(0, 16)
}

function toIsoFromLocal(localValue: string) {
  return new Date(localValue).toISOString()
}

export default function AdminDashboard() {
  const {
    events,
    studios,
    instructors,
    categories,
    loading,
    saving,
    error,
    hasToken,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useAdminDashboard()

  const [search, setSearch] = useState("")

  // Create
  const [newTitle, setNewTitle] = useState("")
  const [newDatetime, setNewDatetime] = useState("")
  const [newSpots, setNewSpots] = useState(20)
  const [newStudio, setNewStudio] = useState("")
  const [newInstructor, setNewInstructor] = useState("")
  const [newCategories, setNewCategories] = useState<string[]>([])

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDatetime, setEditDatetime] = useState("")
  const [editSpots, setEditSpots] = useState(1)
  const [editStudio, setEditStudio] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events

    return events.filter((e) => {
      const hay = [
        e.title,
        e.slug,
        e.studio?.name,
        e.instructor?.name,
        e.event_categories?.map((c) => c.name).join(" "),
        e.spots?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return hay.includes(q)
    })
  }, [events, search])

  function startEdit(ev: EventItem) {
    setEditingId(ev.documentId)
    setEditTitle(ev.title)
    setEditDatetime(toLocal(ev.datetime))
    setEditSpots(ev.spots ?? 1)
    setEditStudio(ev.studio?.documentId ?? "")
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!hasToken) return

    await createEvent({
      title: newTitle,
      datetimeIso: toIsoFromLocal(newDatetime),
      spots: newSpots,
      studioDocId: newStudio,
      instructorDocId: newInstructor || undefined,
      categoryDocIds: newCategories.length ? newCategories : undefined,
    })

    // reset
    setNewTitle("")
    setNewDatetime("")
    setNewSpots(20)
    setNewStudio("")
    setNewInstructor("")
    setNewCategories([])
  }

  async function onSaveEdit() {
    if (!editingId || !hasToken) return

    await updateEvent(editingId, {
      title: editTitle,
      datetimeIso: toIsoFromLocal(editDatetime),
      spots: editSpots,
      studioDocId: editStudio,
    })

    cancelEdit()
  }

  return (
    <div className="aoPage">
      <h1 className="aoTitle">Admin Dashboard</h1>
      <p className="aoSubtitle aoMuted">Skapa, ändra och ta bort pass (demo).</p>

      <div className="aoContent">
        <div className="aoCard">
          <h2 className="aoH2">Skapa nytt pass</h2>

          <form className="aoForm" onSubmit={onCreate}>
            <label className="aoLabel">
              Titel
              <input
                className="aoInput"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </label>

            <label className="aoLabel">
              Datum & tid
              <input
                className="aoInput"
                type="datetime-local"
                value={newDatetime}
                onChange={(e) => setNewDatetime(e.target.value)}
                required
              />
            </label>

            <label className="aoLabel">
              Platser (max)
              <input
                className="aoInput"
                type="number"
                min={1}
                value={newSpots}
                onChange={(e) => setNewSpots(Number(e.target.value))}
                required
              />
            </label>

            <label className="aoLabel">
              Studio (rum)
              <select
                className="aoInput"
                value={newStudio}
                onChange={(e) => setNewStudio(e.target.value)}
                required
              >
                <option value="">Välj studio…</option>
                {studios.map((s) => (
                  <option key={s.documentId} value={s.documentId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="aoLabel">
              Instruktör
              <select
                className="aoInput"
                value={newInstructor}
                onChange={(e) => setNewInstructor(e.target.value)}
              >
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
                value={newCategories}
                onChange={(e) =>
                  setNewCategories(
                    Array.from(e.target.selectedOptions).map((o) => o.value)
                  )
                }
              >
                {categories.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.name}
                  </option>
                ))}
              </select>
              <small className="aoTiny aoMuted">
                Håll ctrl/cmd för att välja flera.
              </small>
            </label>

            <button
              className="aoBtn"
              type="submit"
              disabled={!hasToken || saving}
            >
              {saving ? "Sparar…" : "Skapa"}
            </button>

            {!hasToken && (
              <small className="aoTiny aoMuted">
                CRUD är avstängt utan token.
              </small>
            )}
          </form>
        </div>

        <input
          className="aoSearch"
          placeholder="Sök pass / slug / studio / instruktör / kategori…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <p className="aoCenter aoMuted">Laddar…</p>}
        {saving && <p className="aoCenter aoMuted">Uppdaterar…</p>}
        {error && <p className="aoCenter aoError">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="aoCenter aoMuted">Inga pass hittades.</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="aoTableWrap">
            <table className="aoTable">
              <thead>
                <tr>
                  <th>Pass</th>
                  <th>Slug</th>
                  <th>Datum</th>
                  <th>Platser</th>
                  <th>Studio</th>
                  <th>Instruktör</th>
                  <th>Kategorier</th>
                  <th>Åtgärder</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((ev) => {
                  const editing = editingId === ev.documentId

                  return (
                    <tr key={ev.documentId}>
                      <td>
                        {editing ? (
                          <input
                            className="aoInlineInput"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        ) : (
                          ev.title
                        )}
                      </td>

                      <td className="aoTiny">{ev.slug ?? "—"}</td>

                      <td>
                        {editing ? (
                          <input
                            className="aoInlineInput"
                            type="datetime-local"
                            value={editDatetime}
                            onChange={(e) => setEditDatetime(e.target.value)}
                          />
                        ) : (
                          formatDate(ev.datetime)
                        )}
                      </td>

                      <td>
                        {editing ? (
                          <input
                            className="aoInlineInput"
                            type="number"
                            min={1}
                            value={editSpots}
                            onChange={(e) =>
                              setEditSpots(Number(e.target.value))
                            }
                          />
                        ) : (
                          ev.spots ?? "—"
                        )}
                      </td>

                      <td>
                        {editing ? (
                          <select
                            className="aoInlineInput"
                            value={editStudio}
                            onChange={(e) => setEditStudio(e.target.value)}
                          >
                            <option value="">Välj studio…</option>
                            {studios.map((s) => (
                              <option key={s.documentId} value={s.documentId}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          ev.studio?.name ?? "—"
                        )}
                      </td>

                      <td>{ev.instructor?.name ?? "—"}</td>

                      <td>
                        {ev.event_categories?.map((c) => c.name).join(", ") ??
                          "—"}
                      </td>

                      <td>
                        <div className="aoActions">
                          {!editing ? (
                            <>
                              <button
                                className="aoBtn aoBtnSecondary"
                                type="button"
                                onClick={() => startEdit(ev)}
                                disabled={!hasToken || saving}
                              >
                                Ändra
                              </button>

                              <button
                                className="aoBtn aoBtnDanger"
                                type="button"
                                onClick={() => deleteEvent(ev.documentId)}
                                disabled={!hasToken || saving}
                              >
                                Ta bort
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="aoBtn"
                                type="button"
                                onClick={onSaveEdit}
                                disabled={!hasToken || saving}
                              >
                                {saving ? "Sparar…" : "Spara"}
                              </button>

                              <button
                                className="aoBtn aoBtnSecondary"
                                type="button"
                                onClick={cancelEdit}
                                disabled={saving}
                              >
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
