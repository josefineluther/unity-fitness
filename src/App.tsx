import Button from './components/Button'

function App() {
  return (
    <>
      <nav>
        <div>
          <img alt='Unity Fitness Logo' src='/logo.jpg' />
          <p>Unity Fitness</p>
        </div>
        <div>
          <p>Hem</p>
          <Button text='Boka pass'></Button>
        </div>
      </nav>
      <main>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className='primary'>Primärfärg</div>
          <div className='secondary'>Sekundärfärg</div>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Unity Fitness</p>
      </footer>
    </>
  )
}

export default App
