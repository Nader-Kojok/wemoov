import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import CarRental from './components/CarRental'
import Tourism from './components/Tourism'
import AirportShuttle from './components/AirportShuttle'
import BusinessServices from './components/BusinessServices'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <CarRental />
      <Tourism />
      <AirportShuttle />
      <BusinessServices />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
