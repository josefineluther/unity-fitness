import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Button from './components/Button'
import Home from './routes/Home'
import AdminDashboard from './routes/AdminDashboard'
import InstructorOverview from './routes/InstructorOverview'
import type { Page } from './types/types'
import AllEvents from './routes/AllEvents'
import { usePages } from './hooks/usePages'

function App() {
  const { pages } = usePages()

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
          {pages
            .filter((page: Page) => page.showInMenu)
            .sort((a: Page, b: Page) => a.menuOrder - b.menuOrder)
            .map((page: Page) => {
              const to = page.slug === 'hem' ? '/' : `/${page.slug}`

              return (
                <Link key={page.documentId} to={to}>
                  {page.title}
                </Link>
              )
            })}
          <Link to='/alla-pass'>
            <Button text='Boka pass'></Button>
          </Link>
  <Link to="/admin">Admin</Link>
  <Link to="/admin/instructors">Instruktörer</Link>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/alla-pass' element={<AllEvents />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/instructors" element={<InstructorOverview />} />
        </Routes>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Unity Fitness</p>
      </footer>
    </BrowserRouter>
  )
}

export default App
