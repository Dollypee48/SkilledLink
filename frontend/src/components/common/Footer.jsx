import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

      
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-3 sm:mb-4">
            <Logo variant="full" size="lg" textColor="white" />
          </div>
          <p className="text-xs sm:text-sm">
            SkilledLink is an online platform that connects people who need skilled services with verified, local artisans who are trained in different trades such as plumbing, electrical work, carpentry, cleaning, tailoring, painting, mechanics, and more.
          </p>
        </div>

       
        <div>
          <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Quick Links</h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/services" className="hover:text-white">Services</a></li>
            <li><a href="/work" className="hover:text-white">How it works</a></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Contact</h3>
          <ul className="text-xs sm:text-sm space-y-1 sm:space-y-2">
            <li className="flex items-center gap-2">
              <Phone size={14} className="sm:w-4 sm:h-4" /> +234 123 456 7890
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="sm:w-4 sm:h-4" /> support@yourcompany.com
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="sm:w-4 sm:h-4" /> 123 Business Street, Lagos, Nigeria
            </li>
          </ul>
        </div>

       
        <div>
          <h3 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Follow Us</h3>
          <div className="flex space-x-3 sm:space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <Facebook size={18} className="sm:w-5 sm:h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <Twitter size={18} className="sm:w-5 sm:h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <Instagram size={18} className="sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </div>

     
      <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-3 sm:pt-4 text-center text-xs sm:text-sm text-gray-500">
        © {new Date().getFullYear()} SkilledLink. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
