import { useCallback, useEffect, useState } from "react"

const STRAPI_GRAPHQL_URL =
  "https://competent-addition-09352633f0.strapiapp.com/graphql"

const STRAPI_BASE = "https://competent-addition-09352633f0.strapiapp.com"
const API_BASE = `${STRAPI_BASE}/api`

const TOKEN =
  "d92570d93a81097b957d04b6a423ca6ffb8709b2bf0cfed185aed7f664605709068043b9d9a159eca26126a9578a21ff73ee0ef1a24b7a7328419b26aba43aad9c8e4b25d2b8ebdc9f9f61f52cd5975ea3056959f83fb0f3628d89912e4afcb988180456cdaebd14719844ffbe102f85b09181f8ea9b5c1414a04241b8d38492"

const EVENTS_QUERY = `
query AdminDashboard {
  events(pagination: { pageSize: 1000 }, sort: "datetime:asc") {
    documentId
    title
    slug
    datetime
    spots
    studio { documentId name }
    instructor { documentId name }
    event_categories { documentId name }
  }
}
`

const META_QUERY = `
query AdminMeta {
  instructors { documentId name }
  eventCategories { documentId name }
  studios { documentId name }
}
`

export type Studio = { documentId: string; name: string }
export type Instructor = { documentId: string; name: string }
export type Category = { documentId: string; name: string }

export type EventItem = {
  documentId: string
  title: string
  slug?: string | null
  datetime: string
  spots?: number | null
  studio?: Studio | null
  instructor?: Instructor | null
  event_categories?: Category[] | null
}

export type CreateEventInput = {
  title: string
  datetimeIso: string
  spots: number
  studioDocId: string
  instructorDocId?: string
  categoryDocIds?: string[]
  slug?: string
}

export type UpdateEventInput = {
  title: string
  datetimeIso: string
  spots: number
  studioDocId: string
}

function makeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
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
  }
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`)
  return json
}

export function useAdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [studios, setStudios] = useState<Studio[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasToken = Boolean(TOKEN)

  const refreshAll = useCallback(async () => {
    const [eventData, meta] = await Promise.all([
      gqlFetch<{ events: EventItem[] }>(EVENTS_QUERY),
      gqlFetch<{
        instructors: Instructor[]
        eventCategories: Category[]
        studios: Studio[]
      }>(META_QUERY),
    ])

    setEvents(eventData.events ?? [])
    setInstructors(meta.instructors ?? [])
    setCategories(meta.eventCategories ?? [])
    setStudios(meta.studios ?? [])
  }, [])

  useEffect(() => {
    refreshAll()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [refreshAll])

  const createEvent = useCallback(
    async (input: CreateEventInput) => {
      if (!hasToken) return

      setSaving(true)
      setError(null)

      try {
        const slug =
          input.slug ??
          makeSlug(`${input.title}-${input.datetimeIso.slice(0, 10)}`)

        const payload: any = {
          data: {
            title: input.title,
            slug,
            datetime: input.datetimeIso,
            spots: input.spots,
            studio: { connect: [input.studioDocId] },
            instructor: input.instructorDocId
              ? { connect: [input.instructorDocId] }
              : undefined,
            event_categories: input.categoryDocIds?.length
              ? { connect: input.categoryDocIds }
              : undefined,
          },
        }

        await apiFetch("/events", {
          method: "POST",
          body: JSON.stringify(payload),
        })

        await refreshAll()
      } catch (e: any) {
        setError(e.message)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [hasToken, refreshAll]
  )

  const updateEvent = useCallback(
    async (documentId: string, input: UpdateEventInput) => {
      if (!hasToken) return

      setSaving(true)
      setError(null)

      try {
        const payload = {
          data: {
            title: input.title,
            datetime: input.datetimeIso,
            spots: input.spots,
            studio: { connect: [input.studioDocId] },
          },
        }

        await apiFetch(`/events/${documentId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })

        await refreshAll()
      } catch (e: any) {
        setError(e.message)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [hasToken, refreshAll]
  )

  const deleteEvent = useCallback(
    async (documentId: string) => {
      if (!hasToken) return
      if (!confirm("Ta bort passet?")) return

      setSaving(true)
      setError(null)

      try {
        await apiFetch(`/events/${documentId}`, { method: "DELETE" })
        await refreshAll()
      } catch (e: any) {
        setError(e.message)
        throw e
      } finally {
        setSaving(false)
      }
    },
    [hasToken, refreshAll]
  )

  return {
    // data
    events,
    studios,
    instructors,
    categories,

    // state
    loading,
    saving,
    error,
    hasToken,

    // actions
    refreshAll,
    createEvent,
    updateEvent,
    deleteEvent,
  }
}
