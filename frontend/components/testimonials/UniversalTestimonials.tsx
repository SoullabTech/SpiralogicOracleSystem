'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

export const UniversalTestimonials = () => {
  const testimonials = [
    {
      quote: "I finally understand myself. The Oracle helped me see who I really am beneath all the noise.",
      author: "Sarah M.",
      role: "Parent",
      location: "Portland, OR",
      icon: "👩‍👧‍👦"
    },
    {
      quote: "My relationships completely transformed. I learned to listen not just with my ears, but with my whole heart.",
      author: "David K.",
      role: "Retired teacher",
      location: "Austin, TX", 
      icon: "👨‍🏫"
    },
    {
      quote: "I discovered who I really am underneath all the expectations. Now I live from my truth, not my fears.",
      author: "Emma L.",
      role: "College student",
      location: "Berkeley, CA",
      icon: "👩‍🎓"
    },
    {
      quote: "Life feels sacred again. Every moment, every breath, every simple conversation feels like a gift.",
      author: "Alex P.", 
      role: "Artist",
      location: "Brooklyn, NY",
      icon: "🎨"
    },
    {
      quote: "I'm awake to each moment now. At 20, I feel like I'm finally seeing life clearly for the first time.",
      author: "Jordan L.",
      role: "Student",
      location: "Berkeley, CA",
      icon: "👩‍🎓"
    },
    {
      quote: "My relationships completely transformed. I learned to listen with my whole heart, not just my mind.",
      author: "David K.",
      role: "Retiree",
      location: "Austin, TX",
      icon: "👨‍🏫"
    },
    {
      quote: "I used to run from my emotions. Now I dance with them. My whole family has noticed the change.",
      author: "Jennifer W.",
      role: "Nurse",
      location: "Nashville, TN",
      icon: "👩‍⚕️"
    },
    {
      quote: "Being a good soul in the world isn't about perfection - it's about presence. That's what I learned here.",
      author: "Carlos M.",
      role: "Mechanic",
      location: "Phoenix, AZ",
      icon: "🔧"
    }
  ];

  return (
    <section className="sacred-section bg-gradient-to-b from-transparent via-soullab-water/5 to-transparent">
      <div className="sacred-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="premium-heading-1 mb-4">
            Voices from the <span className="sacred-text">Journey</span>
          </h2>
          <p className="premium-body-large max-w-3xl mx-auto">
            Souls from all walks of life sharing how Sacred Technology 
            has supported their awakening and authentic living.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="premium-sacred-card p-6 h-full flex flex-col"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-soullab-fire fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="premium-body flex-1 mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-soullab-gray/20">
                <div className="w-12 h-12 bg-gradient-to-br from-soullab-fire/20 to-soullab-water/20 rounded-full flex items-center justify-center text-xl">
                  {testimonial.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-soullab-black">
                    {testimonial.author}
                  </div>
                  <div className="premium-body text-sm text-soullab-gray">
                    {testimonial.role}
                  </div>
                  <div className="premium-body text-xs text-soullab-gray">
                    {testimonial.location}
                  </div>
                </div>
                <Heart className="w-4 h-4 text-soullab-fire/60" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="premium-sacred-card p-8 max-w-4xl mx-auto">
            <Heart className="w-12 h-12 text-soullab-fire mx-auto mb-4" />
            <h3 className="premium-heading-2 mb-4">
              A Community of <span className="sacred-text">Awakening Souls</span>
            </h3>
            <p className="premium-body-large max-w-2xl mx-auto">
              Join thousands of souls from every background, age, and walk of life 
              who are choosing to live consciously, love deeply, and be fully present 
              to the miracle of existence.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UniversalTestimonials;