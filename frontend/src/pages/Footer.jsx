import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart, 
  ArrowUp,
  BookOpen,
  Users,
  Shield,
  FileText,
  Send,
  Star,
  Globe,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  Play,
  ArrowRight,
  Briefcase,
  HelpCircle,
  Lock
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const footerSections = [
    {
      title: 'Product',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'group-hover:text-blue-500',
      links: [
        { name: 'AI Writing Assistant', href: '/ai-writer', icon: Zap, badge: 'NEW', badgeColor: 'bg-gradient-to-r from-emerald-400 to-cyan-400' },
        { name: 'Smart Templates', href: '/templates', icon: Star },
        { name: 'Analytics Pro', href: '/analytics', icon: TrendingUp, badge: 'PRO', badgeColor: 'bg-gradient-to-r from-purple-400 to-pink-400' },
        { name: 'SEO Optimizer', href: '/seo', icon: Globe }
      ]
    },
    {
      title: 'Company',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'group-hover:text-purple-500',
      links: [
        { name: 'About Us', href: '/about', icon: Users },
        { name: 'Careers', href: '/careers', icon: Briefcase, badge: 'HIRING', badgeColor: 'bg-gradient-to-r from-green-400 to-emerald-400' },
        { name: 'Press & Media', href: '/press', icon: FileText },
        { name: 'Brand Assets', href: '/brand', icon: Award }
      ]
    },
    {
      title: 'Resources',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-500',
      hoverColor: 'group-hover:text-emerald-500',
      links: [
        { name: 'Documentation', href: '/docs', icon: FileText },
        { name: 'API Guide', href: '/api', icon: BookOpen },
        { name: 'Help Center', href: '/help', icon: HelpCircle },
        { name: 'Video Tutorials', href: '/tutorials', icon: Play }
      ]
    },
    {
      title: 'Legal',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      hoverColor: 'group-hover:text-orange-500',
      links: [
        { name: 'Privacy Policy', href: '/privacy', icon: Lock },
        { name: 'Terms of Service', href: '/terms', icon: FileText },
        { name: 'Cookie Policy', href: '/cookies', icon: Shield },
        { name: 'GDPR Info', href: '/gdpr', icon: Globe }
      ]
    }
  ];

  const socialLinks = [
    { 
      name: 'Twitter', 
      icon: Twitter, 
      href: 'https://twitter.com',
      color: 'hover:bg-blue-500 hover:text-white hover:shadow-blue-500/25',
      followers: '12.5K'
    },
    { 
      name: 'GitHub', 
      icon: Github, 
      href: 'https://github.com',
      color: 'hover:bg-gray-900 hover:text-white hover:shadow-gray-900/25',
      followers: '8.2K'
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      href: 'https://linkedin.com',
      color: 'hover:bg-blue-600 hover:text-white hover:shadow-blue-600/25',
      followers: '5.8K'
    },
    { 
      name: 'Email', 
      icon: Mail, 
      href: 'mailto:hello@blogcraft.com',
      color: 'hover:bg-purple-600 hover:text-white hover:shadow-purple-600/25',
      followers: 'Contact'
    }
  ];

  const stats = [
    { 
      label: 'Active Users', 
      value: '50K+', 
      icon: Users,
      description: 'Growing daily',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Blog Posts', 
      value: '1M+', 
      icon: FileText,
      description: 'Stories shared',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Countries', 
      value: '120+', 
      icon: Globe,
      description: 'Worldwide reach',
      color: 'from-emerald-500 to-teal-500'
    },
    { 
      label: 'Uptime', 
      value: '99.9%', 
      icon: Award,
      description: 'Reliable service',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <footer className="relative overflow-hidden mt-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-gray-900 dark:to-blue-950/50">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000 opacity-60" />
        
        {/* Dynamic Grid */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20">
          <div 
            className="h-full w-full bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px]"
            style={{
              maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, transparent 70%, black 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, transparent 70%, black 100%)'
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-60" />
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-500 opacity-60" />
        <div className="absolute top-40 left-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-1000 opacity-60" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Stats Section with Enhanced Animations */}
        <div className="pt-16 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="group relative"
                  onMouseEnter={() => setHoveredStat(index)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl p-5 transition-all duration-500 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:scale-105 overflow-hidden">
                    
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    {/* Icon with Enhanced Animation */}
                    <div className="flex items-center justify-center mb-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Stats Content */}
                    <div className="text-center space-y-1">
                      <div className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent transition-all duration-300 group-hover:scale-110`}>
                        {stat.value}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        {stat.label}
                      </div>
                      <div className={`text-xs text-gray-500 dark:text-gray-400 transition-all duration-300 ${hoveredStat === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        {stat.description}
                      </div>
                    </div>

                    {/* Hover Ring Effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content with Premium Layout */}
        <div className="pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Enhanced Brand Section */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Logo & Brand */}
              <div className="group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transform transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-xl opacity-20 scale-150 group-hover:opacity-40 transition-opacity duration-300" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                      BlogCraft
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Craft. Share. Inspire.
                      </p>
                      <div className="px-2 py-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-xs font-bold rounded-full animate-pulse">
                        LIVE
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Empowering creators worldwide with AI-powered blogging tools that transform ideas into compelling stories. Join thousands of writers crafting the future of content.
                </p>
              </div>
              
              {/* Premium Newsletter Signup */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Weekly Insights</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Join 10,000+ creators</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-xs font-bold rounded-full">
                        FREE
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for exclusive content..."
                      className="w-full px-5 py-4 pr-32 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50/80 dark:bg-gray-900/80 text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all duration-300"
                      onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit(e)}
                    />
                    <button
                      onClick={handleNewsletterSubmit}
                      disabled={isSubscribed}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      {isSubscribed ? (
                        <span className="text-sm">✓ Subscribed!</span>
                      ) : (
                        <>
                          <span className="text-sm">Subscribe</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>No spam, unsubscribe anytime. Privacy guaranteed.</span>
                  </p>
                </div>
              </div>

              {/* Enhanced Social Links */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>Connect With Us</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600" />
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`group flex items-center text-gray-500 space-x-3 px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-black/5 transform hover:-translate-y-1 ${social.color}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-500 truncate">{social.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{social.followers}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Enhanced Links Grid */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {footerSections.map((section, sectionIndex) => {
                const SectionIcon = section.icon;
                return (
                  <div key={sectionIndex} className="space-y-6 group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                        <SectionIcon className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{section.title}</h4>
                    </div>
                    
                    <ul className="space-y-3">
                      {section.links.map((link, linkIndex) => {
                        const LinkIcon = link.icon;
                        return (
                          <li key={linkIndex}>
                            <a
                              href={link.href}
                              className={`group/link flex items-center space-x-3 text-gray-600 dark:text-gray-300 ${section.hoverColor} transition-all duration-200 py-2 px-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-md transform hover:translate-x-1`}
                            >
                              <LinkIcon className="w-4 h-4 text-gray-400 group-hover/link:text-current transition-colors duration-200" />
                              <span className="font-medium flex-1">{link.name}</span>
                              {link.badge && (
                                <span className={`px-2 py-0.5 ${link.badgeColor} text-white text-xs font-bold rounded-full shadow-sm`}>
                                  {link.badge}
                                </span>
                              )}
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transform translate-x-1 group-hover/link:translate-x-0 transition-all duration-200" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Premium Bottom Section */}
        <div className="border-t border-white/30 dark:border-gray-700/30 backdrop-blur-sm py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <span className="font-medium">© 2025 BlogCraft Inc.</span>
                <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
                <span>Made in India</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span>All rights reserved</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>Global Platform</span>
                </span>
              </div>
            </div>

            {/* Premium Scroll to Top */}
            {showScrollButton && (
              <button
                onClick={scrollToTop}
                className="group fixed bottom-8 right-8 lg:relative lg:bottom-auto lg:right-auto flex items-center space-x-3 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 z-50"
                aria-label="Back to top"
              >
                <span className="font-semibold">Back to top</span>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-white transform group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 opacity-60" />
        <div className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
    </footer>
  )
}

export default Footer;