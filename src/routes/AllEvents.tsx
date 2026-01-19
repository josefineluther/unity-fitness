import type { Page } from '../types/types'
import { usePages } from '../hooks/usePages'
import { useLocation } from 'react-router-dom'
import EventList from '../components/EventList'

function AllEvents() {
  const { pages } = usePages()
  const location = useLocation()

  const currentSlug = location.pathname === '/' ? 'hem' : location.pathname.slice(1)
  const page = pages.find((p: Page) => p.slug === currentSlug)

  return (
    <>
      <h1 className='all-events'>{page?.title}</h1>
      <EventList />
    </>
  )
}

export default AllEvents
