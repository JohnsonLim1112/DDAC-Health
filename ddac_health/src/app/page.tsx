'use client';

import { useRouter } from 'next/navigation';
import { Heart, Activity, Calendar, Users, ArrowRight, CheckCircle, TrendingUp, Shield, Zap, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Activity,
      title: "Health Tracking",
      description: "Monitor blood pressure, heart rate, BMI, and more in real-time with precision.",
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments with doctors instantly, online or in-person, hassle-free.",
      gradient: "from-purple-500 to-pink-400"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Visualize your health trends with interactive, easy-to-read charts.",
      gradient: "from-green-500 to-emerald-400"
    },
    {
      icon: Users,
      title: "Expert Doctors",
      description: "Connect with qualified healthcare professionals remotely, anytime.",
      gradient: "from-orange-500 to-amber-400"
    }
  ];

  const benefits = [
    { icon: Shield, text: "100% Secure & Private" },
    { icon: Zap, text: "Real-time Updates" },
    { icon: Clock, text: "24/7 Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 overflow-hidden font-sans relative flex flex-col">
      {/* Advanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -left-32 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.4, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Floating particles - only render on client */}
        {isVisible && [...Array(20)].map((_, i) => {
          const leftPos = ((i * 37) % 100);
          const topPos = ((i * 53) % 100);
          const xOffset = ((i * 7) % 20) - 10;
          
          return (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30"
              style={{
                left: `${leftPos}%`,
                top: `${topPos}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, xOffset, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: (i % 10) * 0.2,
              }}
            />
          );
        })}
      </div>

      {/* Navigation */}
      <nav className="relative z-20 container mx-auto px-4 sm:px-6 py-6">
        <motion.div
          className="flex flex-wrap items-center justify-between backdrop-blur-sm bg-white/60 rounded-2xl px-6 py-4 shadow-lg border border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="bg-gradient-to-br from-blue-600 via-purple-500 to-green-500 p-2.5 rounded-xl shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Heart className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 bg-clip-text text-transparent">
              HLife
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <motion.button
              onClick={() => router.push('/login')}
              className="px-4 sm:px-6 py-2.5 text-gray-700 font-semibold rounded-xl hover:bg-white/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button
              onClick={() => router.push('/register')}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="text-center max-w-5xl mx-auto flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Your Health,
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 bg-clip-text text-transparent">
                    Simplified & Smart
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 w-full h-3 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-green-400/30 -z-10 rounded-full blur-sm"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  />
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Monitor your vital signs, track health trends, and connect with doctors—all in one powerful platform.
              </motion.p>

              <motion.div 
                className="flex flex-wrap gap-5 justify-center items-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  onClick={() => router.push('/register')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Start Free Today</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500 via-purple-500 to-blue-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
                <motion.button
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl font-bold text-lg hover:border-blue-500 hover:text-blue-600 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
              </motion.div>

              {/* Benefits badges */}
              <motion.div 
                className="flex flex-wrap justify-center gap-4 mb-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <benefit.icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
            Everything You Need
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto font-medium">
            Comprehensive health management tools at your fingertips.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-6 justify-center">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl -z-10"
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                }}
              />
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 h-full flex flex-col">
                <motion.div 
                  className={`bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <motion.div
          className="relative bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 rounded-3xl p-12 sm:p-16 text-center shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }} />
          </div>
          
          <motion.h2 
            className="relative text-4xl sm:text-5xl font-black text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Ready to Take Control?
          </motion.h2>
          <motion.p 
            className="relative text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Join thousands managing their health smarter with HLife.
          </motion.p>
          <motion.button
            onClick={() => router.push('/register')}
            className="relative px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 sm:px-6 py-12 border-t border-gray-200/50">
        <div className="flex flex-wrap justify-between items-center gap-6">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-blue-600 via-purple-500 to-green-500 p-2.5 rounded-xl shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-green-500 bg-clip-text text-transparent">
              HLife
            </span>
          </motion.div>
          
          <motion.p 
            className="text-gray-500 text-sm font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            © 2025 HLife. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}