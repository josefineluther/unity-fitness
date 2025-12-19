import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Button from './components/Button'
import Home from './routes/Home'
import { useState, useEffect } from 'react'
import type { Page } from './types/types'

function App() {
  const [pages, setPages] = useState([])

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

      const res = await fetch('http://localhost:1337/graphql', {
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

  return (
    <BrowserRouter>
      <nav>
        <div>
          <Link to='/' className='logo'>
            <img alt='Unity Fitness Logo' src='/logo.jpg' />
            Unity Fitness
          </Link>
        </div>
        <div>
          {pages.map((page: Page) => (
            <Link key={page.documentId} to={'/' + page.slug === 'hem' ? page.slug : ''}>
              {page.title}
            </Link>
          ))}
          <Button text='Boka pass'></Button>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Unity Fitness</p>
      </footer>
    </BrowserRouter>
  )
}

export default App
