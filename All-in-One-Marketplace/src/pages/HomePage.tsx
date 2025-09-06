import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Recycle, Briefcase, Plane, ArrowRight, Star, Users, Globe, ChevronRight, Sparkles, Zap, ShieldCheck, Leaf, Heart, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// --- Reusable Hooks & Components ---

// Custom hook to detect if an element is in view
const useInView = (options) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return [ref, isInView];
};

// Particle background component
const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = canvas.parentElement?.clientHeight || 800;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const particleColors = [
            'rgba(165, 180, 252, 0.4)', // indigo-300
            'rgba(196, 181, 253, 0.4)', // violet-300
            'rgba(147, 197, 253, 0.4)', // blue-300
        ];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: particleColors[Math.floor(Math.random() * particleColors.length)],
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x > canvas.width || p.x < 0) p.speedX *= -1;
                if (p.y > canvas.height || p.y < 0) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// AnimatedText component for revealing text
const AnimatedText = ({ text, className = '' }) => {
    return (
        <span className={className}>
            {text.split('').map((char, index) => (
                <span key={index} className="animate-text-reveal inline-block" style={{ animationDelay: `${index * 35}ms` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

// Counter animation component
const Counter = ({ value, label, icon: Icon }) => {
    const [ref, isInView] = useInView({ threshold: 0.5 });
    const [count, setCount] = useState(0);
    const numValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const duration = 2000;
            const timer = setInterval(() => {
                start += numValue / (duration / 30);
                if (start >= numValue) {
                    setCount(numValue);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 30);
            return () => clearInterval(timer);
        }
    }, [isInView, numValue]);

    return (
        <div ref={ref} className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
                {value.includes('%') ? `${count}%` : `${count.toLocaleString()}+`}
            </div>
            <div className="text-gray-600 font-medium">{label}</div>
        </div>
    );
};

// --- Main HomePage Component ---
const HomePage = () => {
    const { t } = useTranslation();
    const categories = [
        { id: 'marketplace', title: t('marketplace.title'), description: t('marketplace.description'), icon: ShoppingBag, color: 'indigo' },
        { id: 'secondhand', title: t('secondhand.title'), description: t('secondhand.description'), icon: Recycle, color: 'green' },
        { id: 'jobs', title: t('jobs.title'), description: t('jobs.description'), icon: Briefcase, color: 'orange' },
        { id: 'travel', title: t('travel.title'), description: t('travel.description'), icon: Plane, color: 'sky' }
    ];

    const features = [
        { icon: Zap, title: t('home.features.ai'), description: t('home.features.aiDesc') },
        { icon: ShieldCheck, title: t('home.features.secure'), description: t('home.features.secureDesc') },
        { icon: Leaf, title: t('home.features.eco'), description: t('home.features.ecoDesc') },
        { icon: Heart, title: t('home.features.community'), description: t('home.features.communityDesc') },
        { icon: Clock, title: t('home.features.fast'), description: t('home.features.fastDesc') },
        { icon: MapPin, title: t('home.features.local'), description: t('home.features.localDesc') }
    ];
    
    const stats = [
        { label: t('home.stats.users'), value: '50K+', icon: Users },
        { label: t('home.stats.countries'), value: '100+', icon: Globe },
        { label: t('home.stats.success'), value: '98%', icon: Star }
    ];

    const testimonials = [
        {
            name: "မြန်မာမြတ်",
            role: t('home.testimonials.seller'),
            content: t('home.testimonials.content1'),
            rating: 5
        },
        {
            name: "ကျော်ထက်အောင်",
            role: t('home.testimonials.buyer'),
            content: t('home.testimonials.content2'),
            rating: 5
        },
        {
            name: "နှင်းသဉ္ဇာလှိုင်",
            role: t('home.testimonials.traveler'),
            content: t('home.testimonials.content3'),
            rating: 5
        }
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; }
                @keyframes text-reveal {
                    0% { opacity: 0; transform: translateY(15px) skewY(5deg); }
                    100% { opacity: 1; transform: translateY(0) skewY(0); }
                }
                .animate-text-reveal {
                    animation: text-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    opacity: 0;
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    opacity: 0;
                    animation: fade-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .category-card-glow {
                    --glow-color: transparent;
                    box-shadow: 0 0 0.5rem var(--glow-color), inset 0 0 0.5rem var(--glow-color);
                }
            `}</style>
            <div className="min-h-screen bg-slate-50 text-gray-800 overflow-x-hidden">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-indigo-50 to-purple-50 py-28 overflow-hidden">
                    <ParticleBackground />
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/30 mb-8">
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                                <span className="text-sm font-medium text-indigo-900">{t('home.welcome')}</span>
                            </div>
                            
                            <AnimatedText text={t('home.title')} className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight" />
                            
                            <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '800ms', opacity: 0 }}>
                                {t('home.subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '1000ms', opacity: 0 }}>
                                <a href="/marketplace" className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1">
                                    {t('home.exploreNow')} <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </a>
                                <a href="/signup" className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1">
                                    {t('auth.signup')}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.whyChooseUs')}</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('home.whyChooseDesc')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {features.map((feature, index) => {
                                const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
                                return (
                                    <div ref={ref} key={index} className={`p-8 bg-gray-50 rounded-2xl transition-all duration-500 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 150}ms` }}>
                                        <div className="w-16 h-16 mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <feature.icon className="w-8 h-8 text-indigo-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
                
                {/* Categories Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.categoriesTitle')}</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('home.categoriesDesc')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categories.map((category, index) => {
                                 const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
                                 const colorClasses = {
                                    indigo: { hoverBg: 'bg-indigo-100', iconBg: 'bg-indigo-500' },
                                    green: { hoverBg: 'bg-green-100', iconBg: 'bg-green-500' },
                                    orange: { hoverBg: 'bg-orange-100', iconBg: 'bg-orange-500' },
                                    sky: { hoverBg: 'bg-sky-100', iconBg: 'bg-sky-500' }
                                 };
                                 const currentColors = colorClasses[category.color] || colorClasses.indigo;
                                return (
                                    <div ref={ref} key={category.id} className={`transition-all duration-500 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 150}ms` }}>
                                        <a href={`/${category.id}`} className="group block h-full">
                                            <div className="h-full p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden">
                                                <div className={`absolute -top-8 -right-8 w-24 h-24 ${currentColors.hoverBg} rounded-full transition-transform duration-500 group-hover:scale-[10]`}></div>
                                                <div className="relative z-10">
                                                    <div className={`w-16 h-16 mb-6 rounded-2xl ${currentColors.iconBg} text-white flex items-center justify-center shadow-lg`}>
                                                        <category.icon className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.title}</h3>
                                                    <p className="text-gray-500 mb-6">{category.description}</p>
                                                    <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform duration-300">
                                                        <span>{t('home.exploreNow')}</span>
                                                        <ChevronRight className="w-5 h-5 ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.statsTitle')}</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('home.statsDesc')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {stats.map((stat) => (
                                <Counter key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-24 bg-indigo-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.testimonialsTitle')}</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('home.testimonialsDesc')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {testimonials.map((testimonial, index) => {
                                const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
                                return (
                                    <div ref={ref} key={index} className={`bg-white p-8 rounded-2xl shadow-lg transition-all duration-500 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${index * 150}ms` }}>
                                        <div className="flex mb-4">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                                        <div>
                                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                            <div className="text-sm text-gray-500">{testimonial.role}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative">
                    <ParticleBackground />
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-bold mb-6">{t('home.ctaTitle')}</h2>
                        <p className="text-xl mb-10 text-indigo-100 max-w-2xl mx-auto">
                            {t('home.ctaDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="/signup" className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-full shadow-2xl hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                                {t('auth.signup')} <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </a>
                            <a href="/marketplace" className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-700/50 border border-indigo-300 rounded-full shadow-2xl hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1">
                                {t('home.browseMarketplace')}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default HomePage;