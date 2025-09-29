import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Target,
  Heart,
  Globe,
  Shield,
  Zap,
  Award,
  MessageCircle,
  TrendingUp,
  Code,
  Lightbulb,
  Coffee,
  Mail,
  MapPin,
  Calendar,
  Github,
  Twitter,
  Linkedin,
  Phone,
  ExternalLink,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const AboutPage = ({ darkMode = false }) => {
  const [activeTab, setActiveTab] = useState("story");
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    communities: 0,
    countries: 0,
  });

  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const targets = { users: 25000, posts: 50000, communities: 150, countries: 45 };
      const start = Date.now();

      const updateStats = () => {
        const now = Date.now();
        const progress = Math.min((now - start) / duration, 1);

        setStats({
          users: Math.floor(targets.users * progress),
          posts: Math.floor(targets.posts * progress),
          communities: Math.floor(targets.communities * progress),
          countries: Math.floor(targets.countries * progress),
        });

        if (progress < 1) {
          requestAnimationFrame(updateStats);
        }
      };

      requestAnimationFrame(updateStats);
    };

    animateStats();
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Founder & CEO",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=300&h=300&fit=crop&crop=face",
      bio: "Former tech lead at Google with 10+ years building scalable platforms. Passionate about democratizing knowledge sharing.",
      social: {
        twitter: "@sarahchen",
        linkedin: "sarah-chen-dev",
        github: "sarahchen",
      },
      achievements: ["Forbes 30 Under 30", "Google Developer Expert", "Open Source Contributor"],
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "CTO",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      bio: "Full-stack engineer and system architect. Previously built infrastructure for millions of users at Netflix.",
      social: {
        twitter: "@marcusdev",
        linkedin: "marcus-rodriguez",
        github: "marcusrod",
      },
      achievements: ["Netflix Innovation Award", "AWS Community Hero", "Speaker at DockerCon"],
    },
    {
      id: 3,
      name: "Emily Watson",
      role: "Head of Community",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Community building expert who grew developer communities from 0 to 100K+ members across multiple platforms.",
      social: {
        twitter: "@emilywatson",
        linkedin: "emily-watson-community",
      },
      achievements: ["Community Leader Award", "DEV Community Moderator", "Conference Organizer"],
    },
    {
      id: 4,
      name: "David Kim",
      role: "Lead Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "UX/UI designer focused on creating inclusive and accessible digital experiences. Former design lead at Airbnb.",
      social: {
        twitter: "@davidkimux",
        linkedin: "david-kim-design",
      },
      achievements: ["Webby Award Winner", "Design Systems Expert", "Accessibility Advocate"],
    },
  ];

  const values = [
    {
      icon: BookOpen,
      title: "Knowledge Sharing",
      description:
        "We believe knowledge grows when shared. Our platform empowers writers to share their expertise and readers to learn from diverse perspectives.",
    },
    {
      icon: Users,
      title: "Inclusive Community",
      description:
        "We foster an inclusive environment where everyone feels welcome to contribute, learn, and grow together regardless of their background or experience level.",
    },
    {
      icon: Shield,
      title: "Quality Content",
      description:
        "We maintain high standards for content quality through community moderation, editorial guidelines, and advanced AI-powered tools.",
    },
    {
      icon: Globe,
      title: "Global Impact",
      description:
        "Our mission extends worldwide, connecting minds across borders and making quality educational content accessible to everyone.",
    },
    {
      icon: Zap,
      title: "Innovation First",
      description:
        "We continuously innovate to provide the best writing and reading experience, incorporating cutting-edge technology and user feedback.",
    },
    {
      icon: Heart,
      title: "Community First",
      description:
        "Every decision we make prioritizes our community's needs, ensuring we remain a platform built by and for content creators and learners.",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "The Beginning",
      description:
        "BlogSpace was founded with a vision to democratize knowledge sharing and create a platform where anyone could become a teacher.",
      icon: Lightbulb,
      stats: "3 founders, 1 big dream",
    },
    {
      year: "2021",
      title: "Community Growth",
      description:
        "Reached our first 1,000 users and published 5,000 articles. Introduced our community guidelines and moderation system.",
      icon: Users,
      stats: "1K users, 5K articles",
    },
    {
      year: "2022",
      title: "Platform Evolution",
      description:
        "Launched advanced features like collaborative writing, real-time comments, and our AI-powered content recommendations.",
      icon: Code,
      stats: "10K users, 25K articles",
    },
    {
      year: "2023",
      title: "Global Expansion",
      description:
        "Expanded internationally, added multi-language support, and partnered with educational institutions worldwide.",
      icon: Globe,
      stats: "25K users, 50K articles, 45 countries",
    },
    {
      year: "2024",
      title: "Innovation Hub",
      description:
        "Became a recognized platform for tech innovation content, launched our mentorship program, and introduced premium features.",
      icon: Award,
      stats: "50K users, 100K articles, 150 communities",
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toString();
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-purple-900 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Empowering
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                Knowledge Sharing
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              BlogSpace is where curious minds come together to share ideas, learn from each other, and build the future of collaborative knowledge.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatNumber(stats.users)}+
                </div>
                <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                  Active Writers
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {formatNumber(stats.posts)}+
                </div>
                <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                  Articles Published
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stats.communities}+
                </div>
                <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                  Communities
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl lg:text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                  {stats.countries}+
                </div>
                <div className="text-base text-gray-600 dark:text-gray-300 font-medium">
                  Countries
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-4">
            {[
              { id: "story", label: "Our Story", icon: BookOpen },
              { id: "values", label: "Our Values", icon: Heart },
              { id: "team", label: "Meet the Team", icon: Users },
              { id: "journey", label: "Our Journey", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Our Story */}
        {activeTab === "story" && (
          <div className="space-y-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900  mb-8 text-center tracking-tight z-10">
                How It All Started
              </h2>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 lg:p-12">
                  <div className="flex items-start space-x-4 mb-8">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        The Problem We Saw
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        In 2020, we noticed a gap in the digital content landscape. While there were platforms for quick posts and professional networking, there wasn't a dedicated space for in-depth, quality technical and educational content that could truly help people learn and grow.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 mb-8">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Our Vision
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        We envisioned a platform where knowledge seekers and sharers could come together in a meaningful way. A place where a senior developer could share their expertise with newcomers, where researchers could publish their findings, and where curious minds could explore diverse topics in depth.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 mb-8">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Building the Solution
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        We started with a simple goal: create the best possible experience for both writers and readers. This meant intuitive tools for content creation, powerful discovery features, and a community-driven approach to maintaining quality and fostering meaningful discussions.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Today's Impact
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      Today, BlogSpace hosts thousands of high-quality articles covering everything from cutting-edge technology to personal development. Our community includes developers, designers, researchers, entrepreneurs, and learners from around the world, all united by a shared passion for knowledge and growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Our Values */}
        {activeTab === "values" && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900  mb-6 tracking-tight z-10">
                What Drives Us
              </h2>
              <p className="text-lg text-gray-600 ">
                Our values shape everything we do, from product decisions to community interactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 group"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
                    {value.title}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed text-center sm:text-left">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === "team" && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900  mb-6 tracking-tight z-10">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 ">
                The passionate individuals behind BlogSpace, working tirelessly to build the future of knowledge sharing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8"
                >
                  <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-24 h-24 rounded-2xl shadow-lg"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {member.name}
                      </h3>
                      <p className="text-base text-blue-600 dark:text-blue-400 font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {member.bio}
                      </p>

                      {/* Social Links */}
                      <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
                        {member.social.twitter && (
                          <a
                            href={`https://twitter.com/${member.social.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                        {member.social.linkedin && (
                          <a
                            href={`https://linkedin.com/in/${member.social.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {member.social.github && (
                          <a
                            href={`https://github.com/${member.social.github}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      {/* Achievements */}
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {member.achievements.map((achievement, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Join Us Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-800 dark:to-purple-900 rounded-2xl p-8 lg:p-12 text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Want to Join Our Team?
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                We're always looking for passionate individuals who share our vision of democratizing knowledge. Check out our open positions and become part of the BlogSpace family.
              </p>
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-medium">
                View Open Positions
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Journey Timeline */}
        {activeTab === "journey" && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900  mb-6 tracking-tight z-10">
                Our Journey
              </h2>
              <p className="text-lg text-gray-600">
                From a simple idea to a thriving global community - here's how we've grown together.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 md:transform md:-translate-x-1/2"></div>

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center md:transform md:-translate-x-1/2 z-10">
                      <milestone.icon className="w-4 h-4 text-white" />
                    </div>

                    <div
                      className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                        index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                      }`}
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {milestone.year}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {milestone.stats}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                          {milestone.title}
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Vision */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl p-8 lg:p-12 text-center mt-16">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  What's Next?
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  We're just getting started. Our roadmap includes AI-powered content assistance, immersive learning experiences, global community events, and partnerships with leading educational institutions. The future of knowledge sharing is bright, and we're excited to build it together with our amazing community.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <span className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                    AI Writing Assistant
                  </span>
                  <span className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                    Virtual Events
                  </span>
                  <span className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                    Mobile App
                  </span>
                  <span className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300 font-medium">
                    Certification Courses
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white dark:text-gray-100 mb-6 tracking-tight z-10">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
              Have questions, ideas, or just want to say hello? We'd love to hear from you.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Email Us
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                  Reach out to our support team for any inquiries or feedback.
                </p>
                <a
                  href="mailto:support@blogspace.com"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
                >
                  support@blogspace.com
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl mb-4">
                  <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Visit Us
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                  We're headquartered in the heart of Silicon Valley.
                </p>
                <p className="text-base text-blue-600 dark:text-blue-400 font-medium">
                  123 Knowledge St, Palo Alto, CA 94301
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Join the Conversation
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                  Connect with us on social media for updates and community discussions.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Github className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 font-medium">
                Contact Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;