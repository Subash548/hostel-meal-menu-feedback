import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Utensils, ArrowRight } from 'lucide-react';

const Home = () => {
    const [todayMenu, setTodayMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/menu/today')
            .then(res => {
                setTodayMenu(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError("Could not load menu. Please check your connection.");
                setLoading(false);
            });
    }, []);

    const getCurrentMeal = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'breakfast';
        if (hour < 15) return 'lunch';
        if (hour < 18) return 'snacks';
        return 'dinner';
    };

    const currentMeal = getCurrentMeal();

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Plain background */}

            {/* Navbar */}
            <nav className="glass-nav sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                        <Utensils className="text-neo-accent animate-float" size={24} />
                        <span className="text-glow">HostelFresh</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-neo-primary to-neo-accent text-white hover:opacity-90 box-glow transition-all rounded-lg">Register</Link>
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-6xl mx-auto px-6 py-16 w-full space-y-16">
                {/* Header */}
                <div className="space-y-4 max-w-2xl mt-10">
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium text-neo-accent tracking-widest uppercase mb-4">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        Today's Menu <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neo-primary to-neo-accent">Served Fresh.</span>
                    </h1>
                    <p className="text-xl text-slate-400 mt-4 max-w-lg">
                        Check out what’s being served today in the mess. Designed to keep you energized.
                    </p>
                </div>

                {error && (
                    <div className="p-4 glass-panel border-red-500/30 text-red-400 rounded-xl">
                        <p>{error}</p>
                    </div>
                )}

                {/* Live Menu Grid */}
                {loading ? (
                    <div className="py-12">
                        <div className="animate-pulse flex space-x-4">
                            <div className="h-32 bg-slate-800 rounded w-full"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
                        <MealCard
                            title="Breakfast"
                            items={todayMenu?.breakfast}
                            active={currentMeal === 'breakfast'}
                        />
                        <MealCard
                            title="Lunch"
                            items={todayMenu?.lunch}
                            active={currentMeal === 'lunch'}
                        />
                        <MealCard
                            title="Snacks"
                            items={todayMenu?.snacks}
                            active={currentMeal === 'snacks'}
                        />
                        <MealCard
                            title="Dinner"
                            items={todayMenu?.dinner}
                            active={currentMeal === 'dinner'}
                        />
                    </div>
                )}

                {!loading && !error && (!todayMenu || todayMenu.message) && (
                    <div className="py-12 glass-panel rounded-xl text-center">
                        <p className="text-slate-400">Menu not available for today yet.</p>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-24 p-12 glass-panel rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-neo-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="space-y-4 max-w-xl relative z-10">
                        <h3 className="text-3xl font-bold text-white">Have Feedback?</h3>
                        <p className="text-slate-400 text-lg">
                            We're constantly improving. If you have suggestions or complaints about the food, let us know.
                        </p>
                        <Link to="/login" className="inline-flex items-center gap-2 text-neo-accent font-medium hover:text-white transition-colors mt-6 text-lg group/link">
                            Submit Feedback <ArrowRight className="group-hover/link:translate-x-1 transition-transform" size={20} />
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-800/50 py-8 text-center text-slate-500 text-sm glass-nav mt-auto">
                &copy; {new Date().getFullYear()} HostelFresh. Premium Dining Experience.
            </footer>
        </div>
    );
};

const MealCard = ({ title, items, active }) => {
    return (
        <div className={`p-6 rounded-2xl transition-all duration-300
            ${active
                ? 'glass-panel border-neo-accent box-glow scale-105 z-10'
                : 'bg-slate-900/40 backdrop-blur-md border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/60'}
        `}>
            <div className="mb-6 flex justify-between items-start">
                <h3 className={`font-bold text-xl ${active ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
                {active && (
                    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold text-neo-bg bg-neo-accent rounded-full animate-pulse">
                        LIVE
                    </span>
                )}
            </div>

            <div className="min-h-[5rem]">
                <p className={`text-base leading-relaxed ${active ? 'text-slate-200' : 'text-slate-400'}`}>
                    {Array.isArray(items) && items.length > 0
                        ? items.map(dish => dish.name).join(', ')
                        : items || "Not available"
                    }
                </p>
            </div>
        </div>
    );
};

export default Home;
