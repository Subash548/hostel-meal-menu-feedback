import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { LogOut, Star, MessageSquare, Utensils, Calendar, Home as HomeIcon, AlertTriangle, ShieldCheck, Bell } from 'lucide-react';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(null);
    const [weekMenu, setWeekMenu] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [view, setView] = useState('today'); // 'today', 'week', 'alerts', 'feedback'
    const [feedback, setFeedback] = useState({ meal_type: 'Breakfast', rating: 5, comment: '' });
    const [msg, setMsg] = useState('');

    const loadData = React.useCallback(async () => {
        try {
            const todayRes = await axios.get('/api/menu/today').catch(e => ({ data: null }));
            if (todayRes.data && !todayRes.data.message) {
                setMenu(todayRes.data);
            } else {
                setMenu(null);
            }
            
            const weekRes = await axios.get('/api/menu/week').catch(e => ({ data: [] }));
            setWeekMenu(weekRes.data || []);

            const alertsRes = await axios.get('/api/alerts/my-alerts').catch(e => ({ data: [] }));
            setAlerts(alertsRes.data || []);
        } catch (err) {
            console.error("Dashboard Load Error:", err);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/feedback', feedback);
            setMsg('Feedback submitted successfully!');
            setFeedback({ meal_type: 'Breakfast', rating: 5, comment: '' });
        } catch (err) {
            setMsg(err.response?.data?.error || 'Error submitting feedback');
        }
    };

    // Helper to get dish alert status
    const getDishAlert = (dishName, mealType, menuDate) => {
        if (!alerts || !dishName) return null;
        // Find if there's an alert for this specific dish on this date
        return alerts.find(a => 
            a.dishName === dishName && 
            a.mealType === mealType && 
            new Date(a.date).toLocaleDateString() === new Date(menuDate).toLocaleDateString()
        );
    };

    // New MenuIdx component capable of rendering complex dishes and their alert status
    const MenuIdxExt = ({ title, mealType, dishes, menuDate, icon }) => {
        // Find if the whole meal has a critical alert
        const mealAlerts = dishes?.map(d => getDishAlert(d.name, mealType, menuDate)).filter(Boolean) || [];
        const hasCritical = mealAlerts.some(a => a.severity === 'Critical');
        const hasCaution = mealAlerts.some(a => a.severity === 'Caution');

        const borderColor = hasCritical ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                          : hasCaution ? 'border-yellow-500/50' 
                          : 'border-slate-700 hover:border-slate-500 hover:shadow-lg';

        return (
            <div className={`bg-slate-800/40 border transition-all p-6 rounded-xl ${borderColor} group`}>
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white flex items-center gap-2 text-lg">
                        <span>{icon}</span> {title}
                    </h4>
                    {hasCritical && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow shadow-red-500/50 animate-pulse">DANGER</span>}
                    {hasCaution && !hasCritical && <span className="bg-yellow-500 text-slate-900 text-[10px] font-bold px-2 py-1 rounded">CAUTION</span>}
                    {!hasCritical && !hasCaution && <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><ShieldCheck size={12}/> SAFE</span>}
                </div>
                
                {dishes && dishes.length > 0 ? (
                    <div className="space-y-3">
                        {dishes.map((dish, i) => {
                            const dishAlert = getDishAlert(dish.name, mealType, menuDate);
                            return (
                                <div key={i} className={`p-2 rounded-lg border text-sm ${
                                    dishAlert?.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' 
                                  : dishAlert?.severity === 'Caution' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
                                  : 'bg-slate-800/50 border-transparent text-slate-300'
                                }`}>
                                    <div className="font-medium flex justify-between items-center">
                                        <span>{dish.name}</span>
                                        {dishAlert && <AlertTriangle size={14} className={dishAlert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}/>}
                                    </div>
                                    {dish.ingredients && dish.ingredients.length > 0 && (
                                        <div className="text-[10px] opacity-70 mt-1 truncate" title={dish.ingredients.join(', ')}>
                                            {dish.ingredients.join(', ')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-slate-400 text-sm italic">Not specified</p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen text-slate-200 p-4 md:p-8 relative overflow-hidden flex flex-col">
            <header className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-2 font-bold text-xl text-white">
                    <Utensils className="text-neo-accent animate-float" size={24} />
                    <span className="text-glow">HostelFresh</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/')} className="flex items-center gap-2 text-sm border-slate-700/50 hover:bg-slate-800/80 text-slate-300 bg-slate-900/40 backdrop-blur-sm" title="Go Home">
                        <HomeIcon size={16} />
                    </Button>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">{user?.name}</p>
                        <p className="text-xs text-neo-accent">Student</p>
                    </div>
                    <div className="h-10 w-10 bg-gradient-to-br from-neo-primary to-neo-accent rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-neo-accent/30 border border-white/10 relative">
                        {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                        {alerts.filter(a => a.severity === 'Critical').length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
                            </span>
                        )}
                    </div>
                    <Button variant="secondary" onClick={logout} className="flex items-center gap-2 text-sm border-slate-700/50 hover:bg-slate-800/80 text-slate-300 bg-slate-900/40 backdrop-blur-sm">
                        <LogOut size={16} />
                    </Button>
                </div>
            </header>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-4 mb-8">
                <button onClick={() => setView('today')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${view === 'today' ? 'bg-gradient-to-r from-neo-primary to-neo-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-transparent' : 'glass-panel text-slate-300 hover:bg-slate-800/60'}`}>Today's Menu</button>
                <button onClick={() => setView('week')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-gradient-to-r from-neo-primary to-neo-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-transparent' : 'glass-panel text-slate-300 hover:bg-slate-800/60'}`}>Upcoming</button>
                <button onClick={() => setView('alerts')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${view === 'alerts' ? 'bg-gradient-to-r from-neo-primary to-neo-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-transparent' : 'glass-panel text-slate-300 hover:bg-slate-800/60'}`}>
                    <Bell size={16}/> Alerts 
                    {alerts.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
                </button>
                <button onClick={() => setView('feedback')} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${view === 'feedback' ? 'bg-gradient-to-r from-neo-primary to-neo-accent text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-transparent' : 'glass-panel text-slate-300 hover:bg-slate-800/60'}`}>Feedback</button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 w-full glass-nav border-t border-slate-700/50 flex justify-around p-3 pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <NavBtn active={view === 'today'} onClick={() => setView('today')} icon={<Utensils size={20} />} label="Today" />
                <NavBtn active={view === 'week'} onClick={() => setView('week')} icon={<Calendar size={20} />} label="Upcoming" />
                <NavBtn active={view === 'alerts'} onClick={() => setView('alerts')} icon={
                    <div className="relative">
                        <Bell size={20} />
                        {alerts.length > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>}
                    </div>
                } label="Alerts" />
                <NavBtn active={view === 'feedback'} onClick={() => setView('feedback')} icon={<MessageSquare size={20} />} label="Feedback" />
            </div>

            {/* Content Area */}
            <div className="pb-24 md:pb-0 space-y-6 flex-grow">

                {view === 'today' && (
                    <div className="glass-panel rounded-2xl p-6 md:p-8 animate-in mt-4">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="bg-neo-accent w-2 h-8 rounded-full"></span>
                                {menu && menu.day ? new Date(menu.day).toLocaleDateString('en-US', { weekday: 'long' }) : 'Today'}'s Menu
                            </h2>
                            {user?.allergies?.length > 0 && (
                                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 text-right">
                                    <ShieldCheck size={14} className="text-neo-accent" /> Personalized to your profile
                                </div>
                            )}
                        </div>

                        {menu ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <MenuIdxExt title="Breakfast" mealType="breakfast" dishes={menu.breakfast} menuDate={menu.day} icon="🌅" />
                                <MenuIdxExt title="Lunch" mealType="lunch" dishes={menu.lunch} menuDate={menu.day} icon="☀️" />
                                <MenuIdxExt title="Snacks" mealType="snacks" dishes={menu.snacks} menuDate={menu.day} icon="☕" />
                                <MenuIdxExt title="Dinner" mealType="dinner" dishes={menu.dinner} menuDate={menu.day} icon="🌙" />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-400 text-lg">No menu configured for today.</p>
                            </div>
                        )}
                    </div>
                )}

                {view === 'week' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-in mt-4">
                        <div className="flex justify-between items-end border-b border-slate-700/50 pb-4 mb-6">
                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                <span className="bg-neo-primary w-2 h-8 rounded-full"></span>
                                Upcoming Schedule
                            </h2>
                        </div>

                        {weekMenu && weekMenu.length > 0 ? weekMenu.map((m) => {
                            const date = new Date(m.day);
                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <div key={m._id} className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 ${isToday ? 'border-neo-accent box-glow scale-[1.01]' : 'border-slate-700/50 hover:bg-slate-800/40'}`}>
                                    <div className={`px-6 py-4 flex justify-between items-center border-b border-slate-700/50 ${isToday ? 'bg-gradient-to-r from-neo-primary/20 to-transparent' : 'bg-slate-800/30'}`}>
                                        <div className="flex items-baseline gap-3">
                                            <span className={`font-bold text-xl ${isToday ? 'text-white text-glow' : 'text-slate-200'}`}>
                                                {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                            </span>
                                            <span className="text-sm text-slate-400">
                                                {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                        {/* For the week view, we simplify the display of multiple dishes */}
                                        <WeekItem label="Breakfast" items={m.breakfast} time="7:30 AM" icon="🌅" />
                                        <WeekItem label="Lunch" items={m.lunch} time="12:30 PM" icon="☀️" />
                                        <WeekItem label="Snacks" items={m.snacks} time="5:00 PM" icon="☕" />
                                        <WeekItem label="Dinner" items={m.dinner} time="7:30 PM" icon="🌙" />
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="glass-panel p-12 text-center rounded-xl">
                                <p className="text-slate-400 italic text-lg">No upcoming menu data available.</p>
                            </div>
                        )}
                    </div>
                )}

                {view === 'alerts' && (
                    <div className="glass-panel rounded-2xl p-6 md:p-8 animate-in mt-4 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                                <Bell className="text-red-400" /> Allergy Risk Alerts
                            </h2>
                        </div>
                        
                        {alerts.length === 0 ? (
                            <div className="text-center py-16 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                                <ShieldCheck className="mx-auto text-green-500 mb-3 block" size={48} />
                                <p className="text-slate-200 text-lg font-bold mb-1">You're All Clear!</p>
                                <p className="text-slate-400 text-sm">No allergens detected in upcoming meals.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {alerts.map(alert => (
                                    <div key={alert._id} className={`p-4 rounded-xl border flex gap-4 transition-all hover:scale-[1.01] ${
                                        alert.severity === 'Critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
                                    }`}>
                                        <div className="mt-1 flex-shrink-0">
                                            <AlertTriangle size={24} className={alert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'} />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-bold uppercase tracking-wider ${alert.severity === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                    {alert.severity} ALERT
                                                </h4>
                                                <span className="text-xs text-slate-400 font-medium bg-slate-800/50 px-2 py-1 rounded">
                                                    {new Date(alert.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-200 font-medium mb-1">{alert.message}</p>
                                            <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-2">
                                                <span>Meal: <strong className="text-slate-300 uppercase">{alert.mealType}</strong></span>
                                                <span>Dish: <strong className="text-slate-300">{alert.dishName}</strong></span>
                                                <span className="ml-auto">Trigger: <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded">{alert.matchedAllergens.join(', ')}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'feedback' && (
                    <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 md:p-8 animate-in mt-4 relative">
                        {/* Feedback form existing logic unchanged but preserved */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neo-accent/10 blur-[50px] rounded-full pointer-events-none"></div>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white border-b border-slate-700/50 pb-4">
                            <MessageSquare className="text-neo-accent" /> Share Your Thoughts
                        </h2>

                        {msg && (
                            <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 backdrop-blur-md ${msg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                                <div className={`w-2 h-2 rounded-full ${msg.includes('success') ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                {msg}
                            </div>
                        )}

                        <form onSubmit={handleFeedbackSubmit} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Meal Type</label>
                                <select className="w-full p-3.5 border border-slate-600 rounded-xl bg-slate-800/60 text-white focus:border-neo-accent focus:ring-1 focus:ring-neo-accent outline-none appearance-none transition-all" value={feedback.meal_type} onChange={(e) => setFeedback({ ...feedback, meal_type: e.target.value })}>
                                    <option className="bg-slate-800 text-white">Breakfast</option>
                                    <option className="bg-slate-800 text-white">Lunch</option>
                                    <option className="bg-slate-800 text-white">Snacks</option>
                                    <option className="bg-slate-800 text-white">Dinner</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button type="button" key={star} onClick={() => setFeedback({ ...feedback, rating: star })} className={`p-2 rounded-lg transition-all duration-300 ${feedback.rating >= star ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30' : 'text-slate-500 hover:text-yellow-400/50 hover:bg-slate-800 bg-slate-800/50 border border-slate-700'}`}>
                                            <Star fill={feedback.rating >= star ? "currentColor" : "none"} size={28} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Comments (Optional)</label>
                                <textarea className="w-full p-4 border border-slate-600 rounded-xl h-36 focus:border-neo-accent focus:ring-1 focus:ring-neo-accent outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500 resize-none" value={feedback.comment} onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })} placeholder="Tell us what you loved or what needs improvement..." />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-neo-primary to-neo-accent text-white py-4 rounded-xl hover:opacity-90 box-glow transition-all font-bold text-lg mt-4 shadow-lg shadow-neo-accent/20">
                                Submit Feedback
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

// UI helpers
const NavBtn = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 px-4 py-2 rounded-xl ${active ? 'text-neo-accent font-bold bg-neo-accent/10 shadow-[inset_0_-2px_0_rgba(6,182,212,1)]' : 'text-slate-400 font-medium hover:text-slate-200'}`}>
        <div className={`${active ? 'animate-bounce-slight' : ''}`}>{icon}</div>
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </button>
);

const WeekItem = ({ label, items, time, icon }) => (
    <div className="flex gap-4 items-start py-3 border-b border-slate-700/50 last:border-0 group">
        <div className="min-w-[5rem] flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/50 border border-slate-700 mt-1">
            <span className="text-lg mb-1">{icon}</span>
            <span className="text-[10px] font-bold text-neo-accent uppercase tracking-widest leading-none">{label.substring(0, 3)}</span>
        </div>
        <div className="flex-grow pt-1">
            {items && items.length > 0 ? (
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {items.map((dish, i) => (
                        <span key={i} className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors">
                            {dish.name}{i < items.length - 1 ? ',' : ''}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500 text-sm italic">Not specified</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 block"></span>
                {time}
            </p>
        </div>
    </div>
);

export default StudentDashboard;
