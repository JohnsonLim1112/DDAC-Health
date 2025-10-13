'use client';

import { useRouter } from 'next/navigation';
import { Heart, Activity, Calendar, Users, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Activity,
      title: "Health Tracking",
      description: "Monitor blood pressure, heart rate, BMI, and more in real-time with precision."
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments with doctors instantly, online or in-person, hassle-free."
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Visualize your health trends with interactive, easy-to-read charts."
    },
    {
      icon: Users,
      title: "Expert Doctors",
      description: "Connect with qualified healthcare professionals remotely, anytime."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Doctors" },
    { number: "50K+", label: "Appointments" },
    { number: "98%", label: "Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 -left-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 -right-20 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 container mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-green-500 p-2.5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              HLife
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 sm:px-6 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-medium hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                Trusted by 10,000+ users
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Your Health,
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 bg-clip-text text-transparent">
                  Simplified & Smart
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Monitor your vital signs, track health trends, and connect with doctors—all in one powerful platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16">
                <button
                  onClick={() => router.push('/register')}
                  className="group px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-xl font-medium text-base sm:text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 sm:px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-medium text-base sm:text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Sign In
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto">
            Comprehensive health management tools at your fingertips.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-gradient-to-br from-blue-100 to-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 sm:p-12 text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Take Control?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their health smarter.
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-6 sm:px-8 py-3 bg-white text-blue-600 rounded-xl font-medium text-base sm:text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 sm:px-6 py-10 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-blue-600 to-green-500 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">HLife</span>
          </motion.div>
          
          <p className="text-gray-500 text-sm">
            © 2025 HLife. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}