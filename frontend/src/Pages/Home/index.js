import Navbar from "./Components/Navbar";
import WhyCCS from "./Components/WhyCCS";
import Carousel from "./Components/Carousel";
import Footer from "./Components/Footer";
import Hero from "./Components/Hero";
import "./Home_Page.css";

function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <WhyCCS />
      <Carousel />
      <Footer />
    </div>
  );
}

export default Home;
