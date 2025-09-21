import React from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import ResponsibleSection from '../components/ResponsibleSection'
import GroupDiscountSection from '../components/GroupDiscountSection'
import TestimonialsSection from '../components/TestimonialsSection'
import WhyChooseUsSection from '../components/WhyChooseUsSection'
import PopularToursSection from '../components/PopularToursSection'
import NewsletterFooterSection from '../components/NewsletterFooterSection'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main>
        {/* S5 - Hero + Stats (ảnh 5) */}
        <section id="home">
          <HeroSection />
        </section>

        {/* S1 - Responsible/Eco (ảnh 1) */}
        <section id="responsible">
          <ResponsibleSection />
        </section>

        {/* S2 - Ưu đãi nhóm (ảnh 2) */}
        <section id="group-discount">
          <GroupDiscountSection />
        </section>

        {/* S3 - Testimonials (ảnh 3) */}
        <section id="testimonials">
          <TestimonialsSection />
        </section>

        {/* S6 - Lý do chọn (ảnh 6) */}
        <section id="why-choose-us">
          <WhyChooseUsSection />
        </section>

        {/* S7 - Tours yêu thích (ảnh 7) */}
        <section id="tours">
          <PopularToursSection />
        </section>

        {/* S4 - Newsletter/Footer (ảnh 4) */}
        <section id="contact">
          <NewsletterFooterSection />
        </section>
      </main>
    </div>
  )
}

export default Home
