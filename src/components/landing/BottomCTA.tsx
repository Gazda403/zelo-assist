
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';

interface BottomCTAProps {
    onGetStarted: () => void;
}

const BottomCTA: React.FC<BottomCTAProps> = ({ onGetStarted }) => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-gray-900 rounded-[3rem] px-8 py-20 text-center text-white overflow-hidden shadow-2xl"
                >
                    {/* Background decorations */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[100px]" />

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm"
                        >
                            <Mail className="w-8 h-8 text-primary" />
                        </motion.div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to reclaim <br /><span className="text-primary italic">your focus?</span></h2>
                        <p className="text-xl text-gray-400 mb-10 font-sans">
                            Join over 10,000+ professionals who have turned their chaotic inbox into a productive workspace.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={onGetStarted}
                                className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-200 bg-primary rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-95 cursor-pointer"
                            >
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-gray-300 transition-all duration-200 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer">
                                Book a Demo
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-8">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <img
                                        key={i}
                                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                        className="w-10 h-10 rounded-full border-2 border-gray-900 ring-2 ring-primary/20"
                                        alt="User avatar"
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 font-medium">10,000+ people joined this month</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BottomCTA;
