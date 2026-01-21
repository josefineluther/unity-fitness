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
          publishedAt
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
      
      const list = Array.isArray(data?.data?.articles) ? data.data.articles : []
      list.sort((a: any, b: any) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
        return db - da
      })
      setArticles(list)
    }
    getArticles()
  }, [])

  return { articles }
}
