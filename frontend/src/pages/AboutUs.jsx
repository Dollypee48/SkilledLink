import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Lightbulb, Handshake, Target, Heart, Shield, 
  Star, Award, Globe, Zap, Clock, CheckCircle,
  ArrowRight, MapPin, Phone, Mail, MessageSquare,
  TrendingUp, Users2, Briefcase, Sparkles, Crown
} from 'lucide-react';
import Footer from '../components/common/Footer';
import Logo from '../components/common/Logo';

const AboutUs = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "500+", label: "Verified Artisans", icon: Users },
    { number: "10,000+", label: "Completed Jobs", icon: CheckCircle },
    { number: "36", label: "States Covered", icon: MapPin },
    { number: "98%", label: "Customer Satisfaction", icon: Star }
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "We prioritize safety and security in every interaction, ensuring all artisans are verified and background-checked.",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100"
    },
    {
      icon: Star,
      title: "Quality Excellence",
      description: "We maintain the highest standards of service quality, connecting you only with top-rated professionals.",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100"
    },
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in building strong communities where artisans and customers support and uplift each other.",
      color: "from-pink-500 to-pink-600",
      bgColor: "from-pink-50 to-pink-100"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously innovate to provide the best platform experience for both artisans and customers.",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100"
    }
  ];

  const team = [
    {
      name: "Our Story",
      role: "Founded in 2024",
      description: "SkilledLink was born from a simple yet powerful vision: to bridge the gap between skilled artisans and customers across Nigeria. We recognized that finding reliable, quality service providers was often challenging, while talented artisans struggled to reach customers who needed their expertise.",
      icon: Lightbulb,
      color: "from-green-500 to-green-600"
    },
    {
      name: "Our Mission",
      role: "Empowering Communities",
      description: "To democratize access to skilled services by creating a trusted platform where artisans can showcase their talents and customers can find reliable professionals for any task, big or small. We're building a more connected Nigeria, one service at a time.",
      icon: Target,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      name: "Our Vision",
      role: "Future of Work",
      description: "To become Nigeria's leading platform for skilled services, where every artisan has the opportunity to thrive and every customer can access quality services with confidence. We envision a future where talent knows no boundaries.",
      icon: Globe,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "Platform Launch",
      year: "2024",
      description: "Successfully launched SkilledLink with comprehensive service categories and state-of-the-art features"
    },
    {
      icon: Users2,
      title: "500+ Artisans",
      year: "2024",
      description: "Onboarded over 500 verified artisans across all 36 states of Nigeria"
    },
    {
      icon: Briefcase,
      title: "10,000+ Jobs",
      year: "2024",
      description: "Facilitated over 10,000 successful service completions with 98% customer satisfaction"
    },
    {
      icon: Crown,
      title: "Premium Services",
      year: "2024",
      description: "Introduced premium artisan subscriptions and advanced platform features"
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
            About
              <span className="block text-[#F59E0B] mt-2">SkilledLink</span>
          </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            We're revolutionizing how Nigeria connects with skilled professionals. 
            Our platform bridges the gap between talented artisans and customers who need their expertise, 
            creating opportunities and building communities across the nation.
          </p>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-[#151E3D]/5 to-[#1E2A4A]/10 p-8 rounded-2xl border border-[#151E3D]/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Community Driven</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                We believe in the power of community. Our platform brings together skilled artisans and customers 
                to create meaningful connections and mutual growth.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#F59E0B]/5 to-[#D97706]/10 p-8 rounded-2xl border border-[#F59E0B]/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Trust & Safety</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Every artisan is thoroughly verified and background-checked. We prioritize your safety and 
                ensure quality through our comprehensive verification process.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/5 to-green-600/10 p-8 rounded-2xl border border-green-500/10 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#151E3D] mb-4 text-center">Growth & Innovation</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                We continuously innovate to provide the best platform experience. Our advanced matching algorithms 
                and user-friendly interface make finding and providing services effortless.
              </p>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-[#151E3D]/5 to-[#1E2A4A]/5 rounded-3xl p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#151E3D] mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                To democratize access to skilled services by creating a trusted platform where artisans can showcase 
                their talents and customers can find reliable professionals for any task, big or small.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story, Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-6">
              Our Foundation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on strong values and a clear vision for the future of skilled services in Nigeria
            </p>
          </div>

          <div className="space-y-16">
            {team.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className={`bg-gradient-to-r ${item.color} text-white p-8 rounded-2xl shadow-xl`}>
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold opacity-80">{item.role}</div>
                          <h3 className="text-3xl font-bold">{item.name}</h3>
                        </div>
                      </div>
                      <p className="text-white/90 text-lg leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className={`bg-gradient-to-r ${item.bgColor} p-8 rounded-2xl`}>
                      <h4 className="text-2xl font-bold text-[#151E3D] mb-6">Key Highlights</h4>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span className="text-[#151E3D] font-medium">Comprehensive verification process</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span className="text-[#151E3D] font-medium">Nationwide coverage across all states</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span className="text-[#151E3D] font-medium">Advanced matching algorithms</span>
                        </div>
                        <div className="flex items-start">
                          <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                          <span className="text-[#151E3D] font-medium">24/7 customer support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our platform's culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${value.color} p-6 text-white`}>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">{value.title}</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Timeline */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#151E3D] mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to transform skilled services in Nigeria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-[#151E3D] mb-2">{achievement.year}</div>
                  <h3 className="text-lg font-bold text-[#151E3D] mb-3">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-24 bg-gradient-to-br from-[#151E3D] via-[#1E2A4A] to-[#2D3B5A] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#F59E0B]/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full mb-8">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Contact Us
          </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
              Have questions, feedback, or need support? We're here to help! 
              Get in touch with our team and we'll respond as soon as possible.
            </p>
          </div>

          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Phone</h3>
              <p className="text-gray-300 mb-4">Call us for immediate assistance</p>
              <p className="text-[#F59E0B] font-semibold text-lg">+234 (0) 800 123 4567</p>
              <p className="text-gray-400 text-sm mt-2">Mon - Fri: 8:00 AM - 6:00 PM</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#151E3D] to-[#1E2A4A] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Email</h3>
              <p className="text-gray-300 mb-4">Send us an email anytime</p>
              <p className="text-[#F59E0B] font-semibold text-lg">support@skilledlink.ng</p>
              <p className="text-gray-400 text-sm mt-2">We respond within 24 hours</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Office</h3>
              <p className="text-gray-300 mb-4">Visit our headquarters</p>
              <p className="text-[#F59E0B] font-semibold text-lg">Lagos, Nigeria</p>
              <p className="text-gray-400 text-sm mt-2">123 Victoria Island, Lagos</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4">Send us a Message</h3>
              <p className="text-gray-300 text-lg">Fill out the form below and we'll get back to you</p>
            </div>
            
            <form className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-white font-semibold mb-3">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] transition-colors duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-3">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] transition-colors duration-300"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-white font-semibold mb-3">Subject</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] transition-colors duration-300"
                  placeholder="What's this about?"
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-white font-semibold mb-3">Message</label>
                <textarea 
                  rows={6}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#F59E0B] transition-colors duration-300 resize-none"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                  <ArrowRight className="inline-block ml-3 w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Additional Contact Info */}
          <div className="text-center mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-white mb-4">Customer Support</h4>
                <p className="text-gray-300 mb-4">Need help with your account or have questions about our services?</p>
                <p className="text-[#F59E0B] font-semibold">support@skilledlink.ng</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="text-xl font-bold text-white mb-4">Business Inquiries</h4>
                <p className="text-gray-300 mb-4">Partnership opportunities and business collaborations</p>
                <p className="text-[#F59E0B] font-semibold">business@skilledlink.ng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
