import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";   // ✅ adjust path based on your folder
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Logo from "../components/common/Logo";

const Home = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "How do I book a service on SkilledLink?",
      answer: "Simply search for the service you need, browse through available artisans, check their ratings and reviews, then click 'Book Now' to schedule your service. You can choose your preferred date and time."
    },
    {
      id: 2,
      question: "Are all artisans verified and background checked?",
      answer: "Yes, all artisans on SkilledLink go through a thorough verification process including identity verification, skill assessment, and background checks to ensure you get reliable and professional service."
    },
    {
      id: 3,
      question: "How does payment work?",
      answer: "We offer secure payment options including card payments and bank transfers. Payment is held securely until the service is completed to your satisfaction, then released to the artisan."
    },
    {
      id: 4,
      question: "What if I'm not satisfied with the service?",
      answer: "If you're not satisfied with the service, you can request a refund within 24 hours. Our customer support team will review your case and ensure you get a full refund if the service doesn't meet our standards."
    },
    {
      id: 5,
      question: "How much does it cost to use SkilledLink?",
      answer: "Using SkilledLink is free for customers. You only pay for the services you book. Artisans pay a small commission fee only when they complete a job successfully."
    },
    {
      id: 6,
      question: "Can I become an artisan on SkilledLink?",
      answer: "Absolutely! If you have skills in any of our service categories, you can register as an artisan. Complete the verification process, set up your profile, and start earning by providing services to customers."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Hero images array
  const heroImages = [
    {
      url: "https://media.istockphoto.com/id/1349015011/photo/a-male-electrician-works-in-a-switchboard-with-an-electrical-connecting-cable.jpg?s=612x612&w=0&k=20&c=3Gxg0vKDPXdnwH1t_dvTRWBhXcQWQRPI1xPSw0JZSKg=",
      alt: "Electrician working on electrical connections"
    },
    {
      url: "https://cdn.pixabay.com/photo/2022/08/15/03/59/india-7387062_1280.jpg",
      alt: "Skilled craftsman at work"
    },
    {
      url: "https://cdn.pixabay.com/photo/2013/12/13/21/13/plumber-228010_960_720.jpg",
      alt: "Professional plumber working"
    },
    {
      url: "https://cdn.pixabay.com/photo/2015/09/10/20/13/child-labor-934900_1280.jpg",
      alt: "Skilled artisan craftsmanship"
    },
    {
      url: "https://cdn.pixabay.com/photo/2019/11/12/23/00/artist-4622221_1280.jpg",
      alt: "Creative artist at work"
    }
  ];

  // Auto-rotate images every 5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [heroImages.length]);


  return (
    <div className="bg-gray-50">
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <section 
        className="h-[400px] sm:h-[500px] relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images with smooth transitions */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${image.url}')`,
              }}
            />
          ))}
        </div>
        <div className="bg-black/40 absolute inset-0"></div>
        <div className="relative z-10 text-white px-4 py-12 sm:py-20 lg:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Main Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                  Where <span className="text-[#F59E0B]">Skills</span> Meet <span className="text-[#F59E0B]">Opportunity</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 leading-relaxed">
                  The marketplace that connects talented artisans with customers who need their expertise. 
                  Every project is a chance to showcase your skills and build your reputation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    to="/find-artisans"
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Find Services
                  </Link>
                  <Link
                    to="/register"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#151E3D] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Right Side - Testimonial Card */}
              <div className="relative mt-8 lg:mt-0">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-2xl">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F59E0B] rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-white">
                      A
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Aisha Mohammed</h3>
                      <p className="text-sm sm:text-base text-white/70">Customer, Lagos</p>
                    </div>
                  </div>
                  <blockquote className="text-sm sm:text-base lg:text-lg text-white/90 italic mb-4 sm:mb-6">
                    "SkilledLink transformed my home renovation project. The electrician I found was not only skilled but also punctual and professional. The platform made everything so easy!"
                  </blockquote>
                  <div className="flex text-[#F59E0B] text-lg sm:text-xl">
                    ★★★★★
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-[#F59E0B] text-white p-3 rounded-full shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full shadow-lg">
                  <span className="text-2xl">🔧</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentImageIndex((prevIndex) => 
              prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
            )}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Dots */}
          <div className="flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-[#F59E0B] scale-110'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Next Button */}
          <button
            onClick={() => setCurrentImageIndex((prevIndex) => 
              prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
            )}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
            aria-label="Next image"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Features & Services */}
      <section 
        className="py-16 text-center"
        style={{
          backgroundColor: 'rgba(21, 30, 61, 0.05)'
        }}
      >
        {/* Feature Highlights */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <span className="text-5xl text-blue-500">🛡️</span>
            <h3 className="text-xl font-semibold mt-4 text-gray-800">Verified Artisans</h3>
            <p className="text-gray-600 mt-2">
              All professionals on our platform are thoroughly vetted and verified for quality and reliability.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <span className="text-5xl text-green-500">🔒</span>
            <h3 className="text-xl font-semibold mt-4 text-gray-800">Secure Payments</h3>
            <p className="text-gray-600 mt-2">
              Our secure payment system ensures your transactions are protected and hassle-free.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <span className="text-5xl text-orange-500">⭐</span>
            <h3 className="text-xl font-semibold mt-4 text-gray-800">Ratings & Reviews</h3>
            <p className="text-gray-600 mt-2">
              Make informed decisions based on authentic ratings and reviews from other customers.
            </p>
          </div>
        </div>

        {/* Popular Services */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">Popular Services</h2>
        <p className="text-gray-600 mb-6 sm:mb-10 text-lg sm:text-xl">Find the right professional for any job</p>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 px-4">
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 h-24 sm:h-32 w-full flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-4xl text-blue-500">🚰</span>
            <h4 className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-800">Plumbing</h4>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 h-24 sm:h-32 w-full flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-4xl text-yellow-500">💡</span>
            <h4 className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-800">Electrical</h4>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 h-24 sm:h-32 w-full flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-4xl text-green-500">🧹</span>
            <h4 className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-800">Cleaning</h4>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 h-24 sm:h-32 w-full flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-4xl text-purple-500">✂️</span>
            <h4 className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-800">Tailoring</h4>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 h-24 sm:h-32 w-full flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-4xl text-pink-500">🎨</span>
            <h4 className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-800">Painting</h4>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 h-24 sm:h-32 w-full flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-4xl text-red-500">🔧</span>
            <h4 className="text-xs sm:text-sm font-semibold mt-1 sm:mt-2 text-gray-800">Mechanic</h4>
          </div>
        </div>
      </section>

      {/* How SkilledLink Works */}
      <section 
        className="py-16 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E2A4A 0%, #151E3D 50%, #0F172A 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black/15"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-white">How SkilledLink Works</h2>
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4">
            <div className="bg-white/15 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl border border-[#F59E0B]/30 hover:bg-white/20 transition-all duration-300">
              <span className="text-3xl sm:text-4xl lg:text-5xl text-[#F59E0B]">1️⃣</span>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 text-white">Search for a Service</h3>
              <p className="text-sm sm:text-base text-white/90 mt-2">
                Browse through our wide range of services or search for specific skills you need.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl border border-[#F59E0B]/30 hover:bg-white/20 transition-all duration-300">
              <span className="text-3xl sm:text-4xl lg:text-5xl text-[#F59E0B]">2️⃣</span>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 text-white">Book an Artisan</h3>
              <p className="text-sm sm:text-base text-white/90 mt-2">
                Choose from available professionals based on ratings, reviews, and availability.
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl border border-[#F59E0B]/30 hover:bg-white/20 transition-all duration-300">
              <span className="text-3xl sm:text-4xl lg:text-5xl text-[#F59E0B]">3️⃣</span>
              <h3 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 text-white">Get the Job Done</h3>
              <p className="text-sm sm:text-base text-white/90 mt-2">
                Receive quality service, pay securely, and leave a review to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-8 sm:py-12 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Customer Reviews</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <p className="text-yellow-500 text-sm sm:text-base">★★★★★ 5.0</p>
            <p className="text-gray-600 text-sm sm:text-base">
              "SkilledLink made it so easy to find a reliable plumber for my emergency. The service was outstanding and highly recommended!"
            </p>
            <p className="text-green-500 mt-2 text-xs sm:text-sm">- Sololake Bose, Lagos</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <p className="text-yellow-500 text-sm sm:text-base">★★★★★ 5.0</p>
            <p className="text-gray-600 text-sm sm:text-base">
              "I needed an electrician to fix some wiring issues. The artisan I found through SkilledLink was knowledgeable and quick!"
            </p>
            <p className="text-green-500 mt-2 text-xs sm:text-sm">- Muyiwa Tomori, Ibadan</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <p className="text-yellow-500 text-sm sm:text-base">★★★★ 4.0</p>
            <p className="text-gray-600 text-sm sm:text-base">
              "The cleaning service I booked through SkilledLink was fantastic. My home has never looked better, will definitely use again!"
            </p>
            <p className="text-green-500 mt-2 text-xs sm:text-sm">- Adam Ridwan, Abuja</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <p className="text-yellow-500 text-sm sm:text-base">★★★★★ 5.0</p>
            <p className="text-gray-600 text-sm sm:text-base">
              "Excellent platform! Found a skilled tailor who made my wedding dress perfectly. The quality and attention to detail was amazing."
            </p>
            <p className="text-green-500 mt-2 text-xs sm:text-sm">- Fatima Ahmed, Kano</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <p className="text-yellow-500 text-sm sm:text-base">★★★★★ 5.0</p>
            <p className="text-gray-600 text-sm sm:text-base">
              "The painter I hired through SkilledLink transformed my living room beautifully. Professional work and fair pricing. Highly recommended!"
            </p>
            <p className="text-green-500 mt-2 text-xs sm:text-sm">- Chinedu Okoro, Port Harcourt</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <p className="text-yellow-500 text-sm sm:text-base">★★★★ 4.5</p>
            <p className="text-gray-600 text-sm sm:text-base">
              "Great experience with the mechanic I found. Fixed my car's engine issue quickly and explained everything clearly. Will use again!"
            </p>
            <p className="text-green-500 mt-2 text-xs sm:text-sm">- Aisha Mohammed, Kaduna</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 lg:py-16 text-center" style={{ backgroundColor: 'rgba(21, 30, 61, 0.05)' }}>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-gray-800">Frequently Asked Questions</h2>
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-3 sm:space-y-4">
            {faqData.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 sm:p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 pr-4">{faq.question}</h3>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === faq.id && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan Call-to-Action */}
      <section className="bg-[#151E3D] text-white py-8 sm:py-12 lg:py-16 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Are you a Skilled Worker?</h2>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base px-4">
          Join SkilledLink and grow your business by connecting with customers looking for <strong>expertise</strong>.
        </p>
        <Link
          to="/register"
          className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 text-sm sm:text-base"
        >
          Join as an Artisan
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
