import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Handshake, ShieldCheck, User, Star, Clock, 
  MapPin, CreditCard, MessageSquare, CheckCircle, 
  ArrowRight, Users, Award, Zap, Heart, Target,
  Phone, Mail, Calendar, FileText, Camera, Shield
} from 'lucide-react';
import Footer from '../components/common/Footer';
import Logo from '../components/common/Logo';

const HowItWorks = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const customerSteps = [
    {
      step: "01",
      title: "Find & Search",
      icon: Search,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      details: [
        "Browse through 40+ service categories",
        "Use advanced filters (location, price, rating)",
        "Search by specific skills or keywords",
        "View detailed artisan profiles and portfolios"
      ],
      features: [
        { icon: MapPin, text: "Location-based search" },
        { icon: Star, text: "Filter by ratings" },
        { icon: Clock, text: "Check availability" },
        { icon: Users, text: "Read customer reviews" }
      ]
    },
    {
      step: "02", 
      title: "Connect & Book",
      icon: Handshake,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      details: [
        "Message artisans directly through our platform",
        "Discuss project details and get quotes",
        "Schedule appointments at your convenience",
        "Secure booking with payment protection"
      ],
      features: [
        { icon: MessageSquare, text: "Direct messaging" },
        { icon: Calendar, text: "Easy scheduling" },
        { icon: CreditCard, text: "Secure payments" },
        { icon: FileText, text: "Service agreements" }
      ]
    },
    {
      step: "03",
      title: "Get It Done",
      icon: ShieldCheck,
      color: "from-purple-500 to-purple-600", 
      bgColor: "from-purple-50 to-purple-100",
      details: [
        "Track work progress in real-time",
        "Communicate throughout the project",
        "Review and rate completed work",
        "Enjoy quality guarantee and support"
      ],
      features: [
        { icon: CheckCircle, text: "Progress tracking" },
        { icon: Star, text: "Rate your experience" },
        { icon: Shield, text: "Quality guarantee" },
        { icon: Heart, text: "Customer support" }
      ]
    }
  ];

  const artisanSteps = [
    {
      step: "01",
      title: "Create Profile",
      icon: User,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
      details: [
        "Complete your professional profile",
        "Upload portfolio images and certifications",
        "Set your service areas and availability",
        "Verify your identity and skills"
      ]
    },
    {
      step: "02",
      title: "Get Discovered",
      icon: Target,
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100",
      details: [
        "Appear in relevant search results",
        "Receive job notifications and requests",
        "Build your reputation with reviews",
        "Access premium features for more visibility"
      ]
    },
    {
      step: "03",
      title: "Earn & Grow",
      icon: Award,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
      details: [
        "Complete jobs and get paid securely",
        "Build long-term client relationships",
        "Access business tools and analytics",
        "Grow your professional network"
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Verified & Safe",
      description: "All artisans are background-checked and verified for your safety and peace of mind"
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Your money is protected with our secure payment system and quality guarantee"
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "Only 5-star rated professionals with proven track records and customer satisfaction"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer support to help you with any questions or issues"
    }
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
              How SkilledLink
              <span className="block text-[#F59E0B] mt-2">Works</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connecting skilled artisans with customers across Nigeria has never been easier. 
              Discover how our platform makes finding and providing services simple, safe, and reliable.
            </p>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#151E3D]/5 to-[#1E2A4A]/10 p-8 rounded-2xl border border-[#151E3D]/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Simple Search</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Find the perfect artisan for your needs with our intuitive search and filtering system. 
                Browse by category, location, rating, and availability.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#F59E0B]/5 to-[#D97706]/10 p-8 rounded-2xl border border-[#F59E0B]/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Easy Booking</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Connect directly with artisans, discuss your project, get quotes, and book services 
                with just a few clicks. Secure payments and quality guarantees included.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/5 to-green-600/10 p-8 rounded-2xl border border-green-500/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Quality Assured</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                All artisans are verified and background-checked. Track progress, communicate throughout 
                the project, and enjoy our quality guarantee and 24/7 support.
              </p>
            </div>
          </div>

          {/* Process Overview */}
          <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-3xl p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#151E3D] mb-6">Three Simple Steps</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're looking for services or offering them, our platform makes everything simple and secure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-[#151E3D] mb-4">Search & Find</h3>
                <p className="text-gray-600">Browse services or create your profile</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-[#151E3D] mb-4">Connect & Book</h3>
                <p className="text-gray-600">Message artisans and schedule services</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-[#151E3D] mb-4">Get It Done</h3>
                <p className="text-gray-600">Complete work and rate your experience</p>
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
              Join over 50,000 satisfied customers and artisans who trust SkilledLink
            </p>
          </div>
        </div>
      </section>

      {/* Customer Journey Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-[#151E3D] mb-8">
              For Customers
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Get your tasks done by skilled professionals in just 3 simple steps. 
              Our platform makes finding and booking services effortless and secure.
            </p>
          </div>

          <div className="space-y-20">
            {customerSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className={`bg-gradient-to-r ${step.color} text-white p-8`}>
                        <div className="flex items-center mb-6">
                          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                            <IconComponent className="w-10 h-10" />
                          </div>
                          <div>
                            <div className="text-3xl font-bold opacity-90">Step {step.step}</div>
                            <h3 className="text-4xl font-bold">{step.title}</h3>
                          </div>
                        </div>
                        <ul className="space-y-4">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start text-white/95 text-lg">
                              <CheckCircle className="w-6 h-6 mr-4 text-white/90 mt-1 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300">
                      <h4 className="text-3xl font-bold text-[#151E3D] mb-8 text-center">Key Features</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {step.features.map((feature, featureIndex) => {
                          const FeatureIcon = feature.icon;
                          return (
                            <div key={featureIndex} className="flex items-center bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/10 p-6 rounded-2xl border border-[#151E3D]/10 hover:shadow-lg transition-all duration-300">
                              <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-xl flex items-center justify-center mr-4">
                                <FeatureIcon className="w-6 h-6 text-white" />
                              </div>
                              <span className="font-semibold text-[#151E3D] text-lg">{feature.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Artisan Journey Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-[#151E3D] mb-8">
              For Artisans
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Start earning by offering your skills and building your professional reputation. 
              Join thousands of successful artisans who trust SkilledLink to grow their business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {artisanSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-4 border border-gray-100">
                    <div className={`bg-gradient-to-r ${step.color} p-8 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center mb-6">
                          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6">
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold opacity-90">Step {step.step}</div>
                            <h3 className="text-3xl font-bold">{step.title}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <ul className="space-y-4">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start text-gray-600 text-lg">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Artisan Benefits */}
          <div className="mt-20 bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-[#151E3D] mb-6">Why Artisans Choose SkilledLink</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join a platform designed to help you succeed and grow your business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#151E3D] mb-3">More Customers</h4>
                <p className="text-gray-600">Access to thousands of potential customers looking for your services</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#151E3D] mb-3">Secure Payments</h4>
                <p className="text-gray-600">Get paid securely and on time with our protected payment system</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#151E3D] mb-3">Build Reputation</h4>
                <p className="text-gray-600">Build your professional reputation through customer reviews and ratings</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-[#151E3D] mb-3">Grow Business</h4>
                <p className="text-gray-600">Access tools and insights to grow and scale your business</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-[#151E3D] mb-8">
              Why Choose SkilledLink?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We ensure every interaction is safe, reliable, and delivers exceptional results. 
              Our platform is designed with your success and satisfaction in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform group-hover:-translate-y-2 border border-gray-100 h-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-[#151E3D] mb-4">{benefit.title}</h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Trust Indicators */}
          <div className="mt-20 bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-[#151E3D] mb-6">Trusted by Thousands</h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join the growing community of satisfied customers and successful artisans
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#F59E0B] mb-4">500+</div>
                <div className="text-2xl font-semibold text-[#151E3D] mb-2">Verified Artisans</div>
                <div className="text-gray-600">Professionally vetted and ready to serve</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#F59E0B] mb-4">10,000+</div>
                <div className="text-2xl font-semibold text-[#151E3D] mb-2">Completed Jobs</div>
                <div className="text-gray-600">Successfully delivered projects</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-[#F59E0B] mb-4">98%</div>
                <div className="text-2xl font-semibold text-[#151E3D] mb-2">Satisfaction Rate</div>
                <div className="text-gray-600">Customer happiness guaranteed</div>
              </div>
            </div>
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
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join over <span className="text-[#F59E0B] font-bold">50,000+</span> satisfied customers and skilled artisans who trust SkilledLink 
              for their service needs. Start your journey today and experience the difference!
            </p>
          </div>

          {/* Enhanced Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mr-6">
                  <Search className="w-8 h-8 text-white" />
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
                Find Artisans Now
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

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
