import { useState, useEffect } from 'react'
import type { Page } from '../types/types'

export function usePages() {
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    async function getPages() {
      const query = `
      query {
        pages {
          title
          slug
          documentId
          showInMenu
          menuOrder
        }
      }`

      const res = await fetch('https://competent-addition-09352633f0.strapiapp.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      const data = await res.json()
      setPages(data.data.pages)
    }
    getPages()
  }, [])

  return { pages }
}
