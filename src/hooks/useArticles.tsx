import { useEffect, useState, useRef } from 'react'

type Article = {
  id?: string | number
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  image?: { url?: string; alternativeText?: string }
  published_at?: string
}

export function useArticles({ pollingInterval = 0 }: { pollingInterval?: number } = {}) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const mounted = useRef(true)

  async function fetchArticles() {
    setLoading(true)
    const gqlQuery = `
      query {
        articles {
          id
          title
          slug
          excerpt
          content
          published_at
          image { url alternativeText }
        }
      }`

    try {
      const base = (import.meta as any).env?.VITE_STRAPI_URL || 'https://competent-addition-09352633f0.strapiapp.com'
      const url = base.replace(/\/$/, '')


      if (url.toLowerCase().includes('graphql')) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: gqlQuery })
        })
        const data = await res.json()
        if (!mounted.current) return
        setArticles(Array.isArray(data.data?.articles) ? data.data.articles : [])
        return
      }

     
      const restRes = await fetch(`${url}/api/articles?populate=*&sort=published_at:desc`)
      const restJson = await restRes.json()
      if (!mounted.current) return

      if (Array.isArray(restJson?.data)) {
        const mapped = restJson.data.map((item: any) => {
          const attrs = item.attributes || {}
          const imageData = attrs.image?.data?.attributes || attrs.image?.attributes || {}
          return {
            id: item.id,
            title: attrs.title,
            slug: attrs.slug,
            excerpt: attrs.excerpt ?? attrs.summary,
            content: attrs.content,
            published_at: attrs.publishedAt ?? attrs.published_at,
            image: imageData ? { url: imageData.url, alternativeText: imageData.alternativeText || imageData.alternative_text } : undefined
          }
        })
        setArticles(mapped)
        return
      }

     
      const fallbackRes = await fetch(`${url}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: gqlQuery })
      })
      const fallbackJson = await fallbackRes.json()
      setArticles(Array.isArray(fallbackJson.data?.articles) ? fallbackJson.data.articles : [])
    } catch (e) {
      console.error('Failed to fetch articles', e)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }

  useEffect(() => {
    mounted.current = true
    fetchArticles()
    let id: any = null
    if (pollingInterval && pollingInterval > 0) id = setInterval(fetchArticles, pollingInterval)
    return () => {
      mounted.current = false
      if (id) clearInterval(id)
    }
    
  }, [pollingInterval])

  return { articles, loading, refetch: fetchArticles }
}
