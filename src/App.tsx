import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Fleet from './components/Fleet'
import About from './components/About'
import Services from './components/Services'
import Tourism from './components/Tourism'
import BusinessServices from './components/BusinessServices'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Fleet />
      <About />
      <Services />
      <Tourism />
      <BusinessServices />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
