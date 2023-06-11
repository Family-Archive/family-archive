import NavBar from '@/components/NavBar/NavBar'

const Home = async () => {
  return (
    <main>
      <NavBar />
      <div className='page'>
        <h1 className='title'>Homepage</h1>
      </div>
    </main>
  )
}

export default Home
