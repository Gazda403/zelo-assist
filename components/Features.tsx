import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Smile, Clock, Brain, Layout } from 'lucide-react';
import { Feature } from '../types';

const features: Feature[] = [
  {
    title: "Instant Drafts",
    description: "AI reads your context and drafts replies in your voice instantly.",
    icon: <Zap className="w-6 h-6 text-white" />,
  },
  {
    title: "Privacy First",
    description: "Your data is processed securely and never trained on without consent.",
    icon: <Shield className="w-6 h-6 text-white" />,
  },
  {
    title: "Tone Adjustment",
    description: "Switch from professional to friendly with a single click.",
    icon: <Smile className="w-6 h-6 text-white" />,
  },
  {
    title: "Smart Scheduling",
    description: "We find the perfect time to send emails for maximum impact.",
    icon: <Clock className="w-6 h-6 text-white" />,
  },
  {
    title: "Context Aware",
    description: "Understands thread history to provide relevant responses.",
    icon: <Brain className="w-6 h-6 text-white" />,
  },
  {
    title: "Clutter Free",
    description: "A zen-like interface designed to reduce cognitive load.",
    icon: <Layout className="w-6 h-6 text-white" />,
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to master your inbox
          </h3>
          <p className="text-lg text-gray-600">
            Powerful tools wrapped in a minimalist design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl bg-[#FAFAF9] border border-gray-100 hover:shadow-soft transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;