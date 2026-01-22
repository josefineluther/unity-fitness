import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Button from './components/Button'
import Home from './routes/Home'
import AdminDashboard from './routes/AdminDashboard'
import InstructorOverview from './routes/InstructorOverview'
import type { Page } from './types/types'
import AllEvents from './routes/AllEvents'
import { usePages } from './hooks/usePages'
import PassDetails from './routes/PassDetails'
import ScrollToTop from './hooks/scrollToTop'
import Subscriptions from './routes/Subscriptions'
import Footer from './components/footer'

function App() {
  const { pages } = usePages()

  return (
    <BrowserRouter>
      <nav>
        <div>
          <Link to='/' className='logo'>
            <img alt='Unity Fitness Logo' src='/logo.jpg' />
            <p className='brand-name'>Unity Fitness</p>
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
        </div>
      </nav>
      <main>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/alla-pass' element={<AllEvents />} />
          <Route path='/pass/:id' element={<PassDetails />} />
          <Route path='/admin' element={<AdminDashboard />} />
          <Route path='/admin/instructors' element={<InstructorOverview />} />
          <Route path='/medlemskap' element={<Subscriptions />} />
        </Routes>
      </main>
      <Footer />

      {/* <footer>
        <div className='staff'>
          <h2>Admin</h2>
          <Link to='/admin' className='footer-admin-link'>
            Dashboard
          </Link>
          <Link to='/admin/instructors' className='footer-admin-link'>
            Instruktörer
          </Link>
        </div>

        <hr />
        <p>&copy; {new Date().getFullYear()} Unity Fitness</p>
      </footer> */}
    </BrowserRouter>
  )
}

export default App
