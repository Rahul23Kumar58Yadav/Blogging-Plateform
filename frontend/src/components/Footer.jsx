import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github,
  Heart,
  ArrowUp,
  BookOpen,
  PenTool,
  Users,
  Shield,
  FileText,
  HelpCircle,
  Rss
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      // Add newsletter subscription logic here
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'Home', href: '/', icon: BookOpen },
    { name: 'All Blogs', href: '/blogs', icon: BookOpen },
    { name: 'Categories', href: '/categories', icon: BookOpen },
    { name: 'Write Article', href: '/create', icon: PenTool },
    { name: 'Authors', href: '/authors', icon: Users },
    { name: 'RSS Feed', href: '/rss', icon: Rss },
  ];

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Backend Development',
    'DevOps',
    'Artificial Intelligence',
    'Data Science',
    'Cybersecurity'
  ];

  const supportLinks = [
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
    { name: 'Terms of Service', href: '/terms', icon: FileText },
    { name: 'Contact Us', href: '/contact', icon: Mail },
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook, color: 'hover:text-blue-600' },
    { name: 'Twitter', href: '#', icon: Twitter, color: 'hover:text-sky-500' },
    { name: 'Instagram', href: '#', icon: Instagram, color: 'hover:text-pink-600' },
    { name: 'LinkedIn', href: '#', icon: Linkedin, color: 'hover:text-blue-700' },
    { name: 'Github', href: '#', icon: Github, color: 'hover:text-gray-900 dark:hover:text-white' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                Stay in the Loop
              </h3>
              <p className="text-blue-100 mb-8 text-lg">
                Get the latest articles, tutorials, and tech insights delivered straight to your inbox.
              </p>
              
              {subscribed ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-2 text-white">
                    <Heart className="w-6 h-6 text-red-400 fill-current" />
                    <span className="font-semibold">Thank you for subscribing!</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B</span>
                  </div>
                  <span className="font-bold text-2xl">BlogSpace</span>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Empowering writers and readers with a platform for sharing knowledge, 
                  stories, and insights that inspire and educate.
                </p>
                
                {/* Contact Info */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <span>hello@blogspace.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transform hover:scale-110 transition-all duration-200`}
                      aria-label={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
                      >
                        <link.icon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        <span>{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-lg mb-6 text-white">Categories</h4>
                <ul className="space-y-3">
                  {categories.map((category) => (
                    <li key={category}>
                      <a
                        href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block hover:translate-x-1 transform"
                      >
                        {category}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="font-bold text-lg mb-6 text-white">Support</h4>
                <ul className="space-y-3">
                  {supportLinks.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
                      >
                        <link.icon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        <span>{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Stats */}
                <div className="mt-8 p-4 bg-gray-800 rounded-xl">
                  <h5 className="font-semibold text-white mb-3">Community Stats</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Articles</span>
                      <span className="text-blue-400 font-medium">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Authors</span>
                      <span className="text-blue-400 font-medium">463</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Readers</span>
                      <span className="text-blue-400 font-medium">28K+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-gray-400">
                <span>© {currentYear} BlogSpace. Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                <span>for the community.</span>
              </div>

              {/* Additional Links */}
              <div className="flex items-center space-x-6 text-sm">
                <a href="/sitemap" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Sitemap
                </a>
                <a href="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Cookie Policy
                </a>
                <a href="/accessibility" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Accessibility
                </a>
              </div>

              {/* Version Info */}
              <div className="text-gray-500 text-sm">
                Version 2.1.0
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center group"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-200" />
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;