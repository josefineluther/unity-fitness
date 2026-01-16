import { useEffect, useState } from 'react'
import type { Article } from '../types/types'

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    async function getArticles() {
      const query = `
      query {
        articles {
          title
          description
          slug
          cover { url alternativeText }
          author { name }
          category { name }
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
      setArticles(data.data.articles)
    }
    getArticles()
  }, [])

  return { articles }
}
