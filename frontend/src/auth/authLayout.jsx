import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, Sun, Moon, Shield, Zap, Users, Star } from 'lucide-react';

const FaUserPlus = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
  </svg>
);

const AuthLayout = ({ title, subtitle, showBackButton = false, onBack }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(isDark);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const features = [
    {
      icon: Shield,
      title: "Bank-level Security",
      description: "Your data is protected with enterprise-grade encryption"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance for the best user experience"
    },
    {
      icon: Users,
      title: "Trusted by Millions",
      description: "Join thousands of satisfied users worldwide"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-colors duration-300 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl max-h-[60rem] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex h-full min-h-[60rem]">
          {/* Left Panel - 40% width */}
          <div className="w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 dark:from-indigo-800 dark:via-purple-800 dark:to-cyan-800 relative overflow-hidden flex items-center justify-center">
            {/* Left Panel Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            {/* Centered Content Container */}
            <div className="relative z-10 max-w-md px-8 text-center text-white space-y-8">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-3xl shadow-2xl backdrop-blur-sm">
                <FaUserPlus className="w-12 h-12 text-white" />
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">Welcome to BlogSpace</h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Join our community of writers and readers. Share your thoughts, connect with others, and discover amazing content.
                </p>
              </div>
              
              {/* Feature List */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-white/90 text-left">Create and publish articles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-white/90 text-left">Connect with fellow writers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-white/90 text-left">Build your audience</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2px Separator */}
          <div className="w-0.5 bg-gray-200 dark:bg-gray-600"></div>

          {/* Right Panel - 60% width with y-axis scrolling */}
          <div className="w-3/5 flex flex-col overflow-y-auto">
            {/* Main Content Area - Improved white space utilization */}
            <div className="flex-1 flex items-center justify-center px-2 py-2">
              <div className="w-full max-w-lg space-y-8">
               
             

                {/* Outlet for Register/Login Components */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-3xl p-2 shadow-inner border border-gray-100 dark:border-gray-600">
                  <Outlet />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center">
              <div className="flex flex-col space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-center space-x-6">
                  <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                    Privacy Policy
                  </a>
                  <span>•</span>
                  <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                    Terms of Service
                  </a>
                  <span>•</span>
                  <a href="/help" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
                    Help Center
                  </a>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  © 2025 AuthFlow. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;