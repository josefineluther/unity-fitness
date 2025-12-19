function Home() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div className='primary'>Primärfärg</div>
      <div className='secondary'>Sekundärfärg</div>
    </div>
  )
}

export default Home
