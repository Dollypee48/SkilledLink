import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#151E3D] text-gray-300 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

      
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">SkilledLink</h2>
          <p className="text-sm">
            SkilledLink is an online platform that connects people who need skilled services with verified, local artisans who are trained in different trades such as plumbing, electrical work, carpentry, cleaning, tailoring, painting, mechanics, and more.
          </p>
        </div>

       
        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
            <li><a href="/services" className="hover:text-white">Services</a></li>
            <li><a href="/work" className="hover:text-white">How it works</a></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-white font-semibold mb-3">Contact</h3>
          <ul className="text-sm space-y-2">
            <li className="flex items-center gap-2">
              <Phone size={16} /> +234 123 456 7890
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> support@yourcompany.com
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} /> 123 Business Street, Lagos, Nigeria
            </li>
          </ul>
        </div>

       
        <div>
          <h3 className="text-white font-semibold mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>

     
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} SkilledLink. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
