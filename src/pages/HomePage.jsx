// src/pages/HomePage.jsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutUsSection from '../components/AboutUsSection';
import Footer from '../components/Footer';

function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutUsSection />
      <Footer />
    </>
  );
}

export default HomePage;