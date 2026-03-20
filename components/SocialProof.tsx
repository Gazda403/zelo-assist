import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Product Manager",
    content: "The mental load of answering emails is gone. It captures my tone perfectly. I can't imagine working without it.",
    avatar: "https://picsum.photos/100/100?random=1"
  },
  {
    id: 2,
    name: "David Chen",
    role: "Freelance Developer",
    content: "Simple, clean, and fast. The concise mode is a lifesaver for quick client updates.",
    avatar: "https://picsum.photos/100/100?random=2"
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "Marketing Director",
    content: "Finally, an AI tool that doesn't feel cluttered. InboxZen actually makes email peaceful.",
    avatar: "https://picsum.photos/100/100?random=3"
  }
];

const SocialProof: React.FC = () => {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by 10,000+ users</h2>
          <p className="mt-4 text-gray-600">Join the movement for calmer communication.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="bg-[#FAFAF9] p-8 rounded-3xl border border-gray-100 relative shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">"{t.content}"</p>
              
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">{t.name}</h5>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Logo Cloud */}
        <div className="mt-20 pt-10 border-t border-gray-100">
           <p className="text-center text-sm font-semibold text-gray-400 mb-8 uppercase tracking-widest">Trusted by teams at</p>
           <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholders for logos */}
             {['Acme', 'Globex', 'Soylent', 'Initech', 'Umbrella'].map((company) => (
               <span key={company} className="text-xl font-bold font-sans text-gray-800">{company}</span>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;