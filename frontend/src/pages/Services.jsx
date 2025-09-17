import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, Home, Car, Paintbrush, Camera, Scissors, 
  Laptop, Phone, Zap, Hammer, Shield, Star,
  Clock, MapPin, Users, Award, CheckCircle,
  ArrowRight, Sparkles, Heart, Target, TrendingUp
} from 'lucide-react';
import Footer from '../components/common/Footer';
import Logo from '../components/common/Logo';

const Services = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const serviceCategories = [
    {
      title: "Home & Maintenance",
      icon: Home,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      services: [
        { name: "Plumber", description: "Leak repairs, pipe installation, drainage solutions" },
        { name: "Electrician", description: "Wiring, electrical repairs, installations" },
        { name: "Carpenter", description: "Furniture making, repairs, custom woodwork" },
        { name: "Painter", description: "Interior/exterior painting, color consultation" },
        { name: "Welder", description: "Metal fabrication, repairs, custom welding" },
        { name: "Mason", description: "Brickwork, stone work, concrete repairs" },
        { name: "Tiler", description: "Floor tiling, wall tiling, bathroom renovations" },
        { name: "AC Technician", description: "AC installation, repair, maintenance" }
      ]
    },
    {
      title: "Technology & Electronics",
      icon: Laptop,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      services: [
        { name: "Computer Repair", description: "Hardware fixes, software issues, upgrades" },
        { name: "Phone Repair", description: "Screen replacement, battery issues, water damage" },
        { name: "Web Developer", description: "Website design, development, maintenance" },
        { name: "Mobile App Developer", description: "iOS/Android app development" },
        { name: "Graphics Designer", description: "Logo design, branding, digital graphics" },
        { name: "Data Analyst", description: "Data analysis, reporting, insights" }
      ]
    },
    {
      title: "Personal & Lifestyle",
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      services: [
        { name: "Hair Stylist", description: "Haircuts, styling, coloring, treatments" },
        { name: "Makeup Artist", description: "Wedding makeup, special events, tutorials" },
        { name: "Photographer", description: "Portraits, events, commercial photography" },
        { name: "Videographer", description: "Wedding videos, corporate videos, editing" },
        { name: "Tutor", description: "Academic tutoring, exam preparation" },
        { name: "Coach", description: "Life coaching, career guidance, motivation" },
        { name: "Trainer", description: "Fitness training, personal training" }
      ]
    },
    {
      title: "Professional Services",
      icon: Award,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      services: [
        { name: "Accountant", description: "Bookkeeping, tax preparation, financial advice" },
        { name: "Lawyer", description: "Legal consultation, document preparation" },
        { name: "Consultant", description: "Business consulting, strategy development" },
        { name: "Event Planner", description: "Wedding planning, corporate events" },
        { name: "Interior Designer", description: "Space planning, decoration, renovation" },
        { name: "Translator", description: "Document translation, interpretation services" }
      ]
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Artisans",
      description: "All artisans are background-checked and verified for your safety"
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "5-star rated professionals with proven track records"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Find and book artisans anytime, anywhere in Nigeria"
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Connect with artisans in your local area"
    }
  ];

  const stats = [
    { number: "500+", label: "Verified Artisans" },
    { number: "10,000+", label: "Completed Jobs" },
    { number: "36", label: "States Covered" },
    { number: "98%", label: "Customer Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <Logo textColor="dark" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-[#151E3D]">
              Professional Services
              <span className="block text-[#F59E0B] mt-2">At Your Fingertips</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with thousands of verified, skilled artisans across Nigeria for all your home, business, and personal needs. 
              From emergency repairs to luxury services, we bring quality professionals directly to your doorstep.
            </p>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#151E3D]/5 to-[#1E2A4A]/10 p-8 rounded-2xl border border-[#151E3D]/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">100% Verified</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Every artisan undergoes rigorous background checks, skill verification, and customer review validation to ensure your safety and satisfaction.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#F59E0B]/5 to-[#D97706]/10 p-8 rounded-2xl border border-[#F59E0B]/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">24/7 Availability</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Whether it's an emergency repair at midnight or a planned renovation, our artisans are available around the clock to serve your needs.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/5 to-green-600/10 p-8 rounded-2xl border border-green-500/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Quality Guaranteed</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                With over 98% customer satisfaction rate and comprehensive quality assurance, we guarantee exceptional results for every project.
              </p>
            </div>
          </div>

          {/* Service Highlights */}
          <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-3xl p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#151E3D] mb-6">Why Choose SkilledLink?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're not just a platform - we're your trusted partner in finding the perfect professional for any task.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#F59E0B] mb-2">500+</div>
                <div className="text-[#151E3D] font-semibold mb-2">Verified Artisans</div>
                <div className="text-gray-600 text-sm">Professionally vetted and ready to serve</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#F59E0B] mb-2">10,000+</div>
                <div className="text-[#151E3D] font-semibold mb-2">Completed Jobs</div>
                <div className="text-gray-600 text-sm">Successfully delivered projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#F59E0B] mb-2">36</div>
                <div className="text-[#151E3D] font-semibold mb-2">States Covered</div>
                <div className="text-gray-600 text-sm">Nationwide service coverage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#F59E0B] mb-2">98%</div>
                <div className="text-[#151E3D] font-semibold mb-2">Satisfaction Rate</div>
                <div className="text-gray-600 text-sm">Customer happiness guaranteed</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/find-artisans" 
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Find Artisans Now
                <ArrowRight className="ml-3 w-6 h-6" />
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] hover:from-[#1E2A4A] hover:to-[#151E3D] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Join as Artisan
                <Users className="ml-3 w-6 h-6" />
              </Link>
            </div>
            <p className="text-gray-500 mt-6 text-lg">
              Join over 50,000 satisfied customers who trust SkilledLink for their service needs
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-6">
              Our Service Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From home maintenance to professional services, we have skilled artisans 
              ready to help with any task you need completed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {serviceCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold">{category.title}</h3>
                    </div>
                    <p className="text-white/90">
                      Professional {category.title.toLowerCase()} services across Nigeria
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {category.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className={`bg-gradient-to-r ${category.bgColor} p-4 rounded-lg hover:shadow-md transition-all duration-200`}>
                          <h4 className="font-semibold text-[#151E3D] mb-2">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-6">
              Why Choose SkilledLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We ensure every interaction is safe, reliable, and delivers exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#151E3D] mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#F59E0B]/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full mb-8">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join over <span className="text-[#F59E0B] font-bold">50,000+</span> satisfied customers who trust SkilledLink for their service needs. 
              From emergency repairs to luxury services, we connect you with the perfect artisan for every task.
            </p>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mr-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Find Your Perfect Artisan</h3>
                  <p className="text-gray-300">Browse verified professionals in your area</p>
                </div>
              </div>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Search through our extensive database of skilled artisans, read reviews, compare prices, 
                and book the perfect professional for your specific needs.
              </p>
              <Link 
                to="/find-artisans" 
                className="inline-flex items-center bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Browse All Services
                <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-2xl flex items-center justify-center mr-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Become an Artisan</h3>
                  <p className="text-gray-300">Join our professional network</p>
                </div>
              </div>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Showcase your skills, build your reputation, and earn money by providing quality services 
                to customers who need your expertise.
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-300 transform hover:scale-105"
              >
                Join as Artisan
                <ArrowRight className="ml-3 w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Trusted by Thousands</h3>
              <p className="text-gray-300">See what our customers say about their experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-[#F59E0B] fill-current" />
                  ))}
                </div>
                <p className="text-gray-200 italic mb-2">
                  "SkilledLink connected me with an amazing electrician who fixed my wiring issues in no time!"
                </p>
                <p className="text-[#F59E0B] font-semibold">- Sarah M.</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-[#F59E0B] fill-current" />
                  ))}
                </div>
                <p className="text-gray-200 italic mb-2">
                  "The platform is so easy to use and the quality of artisans is outstanding."
                </p>
                <p className="text-[#F59E0B] font-semibold">- John D.</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-[#F59E0B] fill-current" />
                  ))}
                </div>
                <p className="text-gray-200 italic mb-2">
                  "I've been using SkilledLink for all my home maintenance needs. Highly recommended!"
                </p>
                <p className="text-[#F59E0B] font-semibold">- Maria L.</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-4">Start Your Project Today</h3>
                <p className="text-gray-300 text-lg">Ready to get started? Choose from our verified artisans below.</p>
              </div>
              <Link 
                to="/register" 
                className="bg-white/20 hover:bg-white/30 text-white px-12 py-6 rounded-2xl font-bold text-xl backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                Join Our Network
                <Users className="ml-3 w-6 h-6" />
              </Link>
            </div>
            <p className="text-gray-400 mt-8 text-lg">
              No registration fees • Instant booking • 100% satisfaction guaranteed
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
