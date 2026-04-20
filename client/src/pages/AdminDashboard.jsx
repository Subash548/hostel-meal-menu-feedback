import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { LogOut, Plus, Trash2, PieChart, Star, Settings, Home as HomeIcon, AlertTriangle, Sparkles, Wand2 } from 'lucide-react';

const ALLERGY_OPTIONS = ['Nuts', 'Gluten', 'Dairy', 'Egg', 'Soy', 'Seafood', 'Spices', 'Sulfites'];
const MEAL_TYPES = ['breakfast', 'lunch', 'snacks', 'dinner'];

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [view, setView] = useState('menu'); // 'menu', 'feedback', 'allergy_stats'
    const [aiSummary, setAiSummary] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMenuLoading, setAiMenuLoading] = useState(false);
    const [aiGeneratedMenus, setAiGeneratedMenus] = useState(null);
    const [detectingDish, setDetectingDish] = useState(null); // track as 'mealType-index'
    const [savingDayIdx, setSavingDayIdx] = useState(null);
    
    // Complex menu state for adding/editing dishes with allergens
    const initialMenuState = {
        id: null,
        day: '',
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: []
    };
    
    const [newMenu, setNewMenu] = useState(initialMenuState);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (view === 'menu') {
                const res = await api.get('/api/menu/week');
                setMenus(res.data);
            } else if (view === 'feedback') {
                const res = await api.get('/api/feedback');
                setFeedbacks(res.data);
                setAiSummary(null); // Reset summary when viewing fresh feedback
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, [view]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleGenerateAiMenu = async () => {
        setAiMenuLoading(true);
        setAiGeneratedMenus(null);
        try {
            const res = await api.post('/api/menu/ai-generate');
            setAiGeneratedMenus(res.data.menus);
        } catch (err) {
            console.error('AI menu generation failed', err);
            setMsg(`AI Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setAiMenuLoading(false);
        }
    };

    const handleSaveAiDay = async (dayMenu, idx) => {
        setSavingDayIdx(idx);
        try {
            await api.post('/api/menu', {
                day: dayMenu.day,
                date: dayMenu.day,
                breakfast: dayMenu.breakfast,
                lunch: dayMenu.lunch,
                snacks: dayMenu.snacks,
                dinner: dayMenu.dinner,
            });
            // Remove saved day from preview
            setAiGeneratedMenus(prev => prev.filter((_, i) => i !== idx));
            setMsg(`Menu for ${dayMenu.day} saved!`);
            setTimeout(() => setMsg(''), 3000);
            loadData();
        } catch (err) {
            setMsg(`Save failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setSavingDayIdx(null);
        }
    };

    const handleSaveAllAiMenus = async () => {
        if (!aiGeneratedMenus) return;
        for (let i = 0; i < aiGeneratedMenus.length; i++) {
            await handleSaveAiDay(aiGeneratedMenus[i], i);
        }
        setAiGeneratedMenus(null);
        setMsg('All 7 days saved successfully!');
        setTimeout(() => setMsg(''), 3000);
    };

    const handleGenerateAiSummary = async () => {
        if (feedbacks.length === 0) return;
        setAiLoading(true);
        try {
            const res = await api.get('/api/feedback/ai-summary');
            setAiSummary(res.data.summary);
        } catch (err) {
            console.error("Failed to generate AI summary", err);
            setAiSummary(`Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddDish = (mealType) => {
        setNewMenu({
            ...newMenu,
            [mealType]: [...newMenu[mealType], { name: '', ingredients: '', allergenTags: [] }]
        });
    };

    const handleRemoveDish = (mealType, index) => {
        const updatedMeals = [...newMenu[mealType]];
        updatedMeals.splice(index, 1);
        setNewMenu({ ...newMenu, [mealType]: updatedMeals });
    };

    const handleDishChange = (mealType, index, field, value) => {
        const updatedMeals = [...newMenu[mealType]];
        updatedMeals[index][field] = value;
        setNewMenu({ ...newMenu, [mealType]: updatedMeals });
    };

    const handleDishAllergyToggle = (mealType, index, allergy) => {
        const updatedMeals = [...newMenu[mealType]];
        const currentTags = updatedMeals[index].allergenTags;
        if (currentTags.includes(allergy)) {
            updatedMeals[index].allergenTags = currentTags.filter(t => t !== allergy);
        } else {
            updatedMeals[index].allergenTags = [...currentTags, allergy];
        }
        setNewMenu({ ...newMenu, [mealType]: updatedMeals });
    };

    const handleAddMenu = async (e) => {
        e.preventDefault();
        try {
            // Convert ingredients string to array for backend
            const payload = {
                id: newMenu.id,
                day: newMenu.day,
                date: newMenu.day,
            };

            MEAL_TYPES.forEach(meal => {
                payload[meal] = newMenu[meal].map(dish => ({
                    ...dish,
                    ingredients: typeof dish.ingredients === 'string' 
                        ? dish.ingredients.split(',').map(i => i.trim()).filter(i => i)
                        : dish.ingredients
                }));
            });

            await api.post('/api/menu', payload);
            setNewMenu(initialMenuState);
            loadData();
            setMsg('Menu saved successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Error saving menu");
        }
    };

    const handleEditMenu = (menu) => {
        // Convert API format back to form format (ingredients array back to string)
        const formatDishesForForm = (dishes) => {
            if (!dishes || dishes.length === 0) return [];
            return dishes.map(d => ({
                name: d.name || '',
                ingredients: Array.isArray(d.ingredients) ? d.ingredients.join(', ') : '',
                allergenTags: d.allergenTags || []
            }));
        };

        const parsedDate = new Date(menu.day).toISOString().split('T')[0];

        setNewMenu({
            id: menu._id,
            day: parsedDate,
            breakfast: formatDishesForForm(menu.breakfast),
            lunch: formatDishesForForm(menu.lunch),
            snacks: formatDishesForForm(menu.snacks),
            dinner: formatDishesForForm(menu.dinner)
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMenu = async (id) => {
        if (!window.confirm("Are you sure you want to delete this menu?")) return;
        try {
            await api.delete(`/api/menu/${id}`);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAiDetectDish = async (mealType, index) => {
        const dish = newMenu[mealType][index];
        if (!dish.name || dish.name.trim().length < 2) return;
        const key = `${mealType}-${index}`;
        setDetectingDish(key);
        try {
            const res = await api.post('/api/menu/ai-detect-dish', { dishName: dish.name });
            if (res.data && !res.data.unknown) {
                const updatedMeals = [...newMenu[mealType]];
                updatedMeals[index] = {
                    ...updatedMeals[index],
                    ingredients: res.data.ingredients.join(', '),
                    allergenTags: res.data.allergenTags || []
                };
                setNewMenu({ ...newMenu, [mealType]: updatedMeals });
            } else {
                setMsg('AI could not recognize this dish. Try a more specific name.');
                setTimeout(() => setMsg(''), 3000);
            }
        } catch (err) {
            console.error('AI dish detect error:', err);
            setMsg(`AI Error: ${err.response?.data?.error || err.message}`);
            setTimeout(() => setMsg(''), 3000);
        } finally {
            setDetectingDish(null);
        }
    };

    // UI Helper for rendering dishes inside the form
    const renderDishInputs = (mealType) => (
        <div className="mb-6 p-4 rounded-xl border border-slate-700 bg-slate-800/20">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">{mealType}</h4>
                <button type="button" onClick={() => handleAddDish(mealType)} className="text-xs bg-neo-primary/20 text-neo-primary px-3 py-1.5 rounded-full hover:bg-neo-primary hover:text-white transition-colors">
                    + Add Dish
                </button>
            </div>

            {newMenu[mealType].length === 0 && (
                <p className="text-xs text-slate-500 italic mb-2">No dishes added for {mealType}.</p>
            )}

            <div className="space-y-4">
                {newMenu[mealType].map((dish, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 relative">
                        <button type="button" onClick={() => handleRemoveDish(mealType, i)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400">
                            <Trash2 size={16} />
                        </button>
                        
                        <div className="mb-3 space-y-2">
                            <div className="flex gap-2">
                                <input 
                                    type="text" placeholder="Dish Name (e.g., Paneer Tikka)" className="flex-grow p-2.5 border border-slate-600 rounded-lg text-sm bg-slate-800 text-white focus:border-neo-primary outline-none"
                                    value={dish.name} onChange={(e) => handleDishChange(mealType, i, 'name', e.target.value)} required 
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAiDetectDish(mealType, i)}
                                    disabled={detectingDish === `${mealType}-${i}` || !dish.name || dish.name.trim().length < 2}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all disabled:opacity-40 bg-gradient-to-r from-purple-600 to-neo-accent text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] active:scale-95"
                                    title="AI auto-fill ingredients & allergens"
                                >
                                    {detectingDish === `${mealType}-${i}` ? (
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <Wand2 size={14} />
                                    )}
                                    AI Fill
                                </button>
                            </div>
                            <input 
                                type="text" placeholder="Ingredients (comma separated)" className="w-full p-2.5 border border-slate-600 rounded-lg text-sm bg-slate-800 text-white focus:border-neo-primary outline-none"
                                value={dish.ingredients} onChange={(e) => handleDishChange(mealType, i, 'ingredients', e.target.value)} 
                            />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-slate-400 mb-2">Allergens:</p>
                            <div className="flex flex-wrap gap-2">
                                {ALLERGY_OPTIONS.map(allergy => (
                                    <button
                                        type="button" key={allergy} onClick={() => handleDishAllergyToggle(mealType, i, allergy)}
                                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                                            dish.allergenTags.includes(allergy) ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 text-slate-400 border-slate-600 hover:text-white'
                                        }`}
                                    >
                                        {allergy}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDishesDisplay = (mealTitle, dishes) => (
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors h-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 border-b border-slate-700 pb-2">{mealTitle}</span>
            {dishes && dishes.length > 0 ? (
                <ul className="space-y-3">
                    {dishes.map((dish, i) => (
                        <li key={i}>
                            <div className="text-slate-200 font-medium text-sm">{dish.name}</div>
                            {dish.allergenTags && dish.allergenTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {dish.allergenTags.map((tag, idx) => (
                                        <span key={idx} className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <AlertTriangle size={8} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <span className="text-slate-500 text-xs italic">No dishes</span>
            )}
        </div>
    );

    return (
        <div className="min-h-screen text-slate-200 p-4 md:p-8 relative overflow-hidden flex flex-col">
            <header className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-2 font-bold text-xl text-white">
                    <Settings className="text-neo-accent animate-[spin_4s_linear_infinite]" size={24} />
                    <span className="text-glow">HostelFresh Admin</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/')} className="flex items-center gap-2 text-sm border-slate-700/50 hover:bg-slate-800/80 text-slate-300 bg-slate-900/40 backdrop-blur-sm" title="Go Home">
                        <HomeIcon size={16} />
                    </Button>
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-white">Administrator</p>
                    </div>
                    <Button variant="secondary" onClick={logout} className="flex items-center gap-2 text-sm border-slate-700/50 hover:bg-slate-800/80 text-slate-300 bg-slate-900/40 backdrop-blur-sm">
                        <LogOut size={16} />
                    </Button>
                </div>
            </header>

            <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => setView('menu')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'menu' ? 'bg-gradient-to-r from-neo-primary to-neo-accent text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-transparent scale-105' : 'glass-panel text-slate-300 hover:bg-slate-800/60'}`}>Manage Menus</button>
                <button onClick={() => setView('feedback')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'feedback' ? 'bg-gradient-to-r from-neo-primary to-neo-accent text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-transparent scale-105' : 'glass-panel text-slate-300 hover:bg-slate-800/60'}`}>View Feedback</button>
                <button onClick={() => navigate('/admin-dashboard/stats')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all glass-panel text-neo-accent hover:bg-slate-800/60 border-neo-accent/30`}>Allergy Risk Stats (PDF)</button>
                <Button
                    onClick={handleGenerateAiMenu}
                    disabled={aiMenuLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-neo-primary text-white font-bold text-sm ml-auto shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                    {aiMenuLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <Sparkles size={16} />
                    )}
                    {aiMenuLoading ? 'Generating...' : '✨ AI Generate 7-Day Menu'}
                </Button>
            </div>

            {view === 'menu' && aiGeneratedMenus && aiGeneratedMenus.length > 0 && (
                <div className="mb-8 animate-in">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.1)] mb-4">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-lg">
                                <Sparkles size={20} /> AI Generated 7-Day Menu
                            </h3>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleSaveAllAiMenus}
                                    className="bg-gradient-to-r from-emerald-600 to-neo-primary text-white font-bold text-sm"
                                >
                                    Save All 7 Days
                                </Button>
                                <button onClick={() => setAiGeneratedMenus(null)} className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">✕</button>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-5">Review each day below. Click <strong className="text-emerald-400">"Save Day"</strong> to add individual days, or <strong className="text-emerald-400">"Save All"</strong> to add the full week instantly.</p>
                        <div className="space-y-4">
                            {aiGeneratedMenus.map((dayMenu, idx) => (
                                <div key={idx} className="bg-slate-800/60 rounded-xl border border-slate-700/60 overflow-hidden">
                                    <div className="flex justify-between items-center px-5 py-3 border-b border-slate-700/50 bg-slate-800/80">
                                        <div>
                                            <span className="font-bold text-white">
                                                {new Date(dayMenu.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="ml-2 text-xs text-slate-400">{dayMenu.day}</span>
                                        </div>
                                        <button
                                            onClick={() => handleSaveAiDay(dayMenu, idx)}
                                            disabled={savingDayIdx === idx}
                                            className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                                        >
                                            {savingDayIdx === idx ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : null}
                                            Save Day
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-700/50">
                                        {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                                            <div key={meal} className="p-4">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{meal === 'snacks' ? '☕ Snacks' : meal === 'breakfast' ? '🌅 Breakfast' : meal === 'lunch' ? '☀️ Lunch' : '🌙 Dinner'}</p>
                                                <ul className="space-y-1">
                                                    {(dayMenu[meal] || []).map((dish, di) => (
                                                        <li key={di} className="text-xs text-slate-200 font-medium">{dish.name}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {view === 'menu' && (
                <div className="grid lg:grid-cols-12 gap-8 animate-in mt-4">
                    <div className="lg:col-span-4">
                        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                            <h3 className="text-xl font-bold mb-6 text-white border-b border-slate-700/50 pb-3 flex items-center gap-2">
                                <Plus size={20} className="text-neo-primary" /> {newMenu.id ? 'Update Menu' : 'Add New Menu'}
                            </h3>
                            
                            {msg && <div className="p-3 mb-4 text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">{msg}</div>}
                            {error && <div className="p-3 mb-4 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg text-sm">{error}</div>}

                            <form onSubmit={handleAddMenu} className="relative z-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                <div className="mb-6 sticky top-0 bg-slate-900/90 py-2 z-20 backdrop-blur-sm border-b border-slate-700/50">
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Date for Menu</label>
                                    <input
                                        type="date" className="w-full p-3 border border-slate-600 rounded-xl focus:border-neo-primary bg-slate-800 text-white"
                                        value={newMenu.day} onChange={(e) => setNewMenu({ ...newMenu, day: e.target.value })} required
                                    />
                                </div>
                                
                                {renderDishInputs('breakfast')}
                                {renderDishInputs('lunch')}
                                {renderDishInputs('snacks')}
                                {renderDishInputs('dinner')}

                                <div className="sticky bottom-0 bg-slate-900/90 py-4 z-20 backdrop-blur-sm border-t border-slate-700/50 mt-4">
                                    <button type="submit" className="w-full bg-gradient-to-r from-neo-primary to-blue-600 text-white py-3.5 rounded-xl hover:opacity-90 transition-all font-bold shadow-lg shadow-blue-500/20">
                                        Save Comprehensive Menu
                                    </button>
                                    {newMenu.id && (
                                        <button type="button" onClick={() => setNewMenu(initialMenuState)} className="w-full mt-2 text-slate-400 hover:text-white text-sm py-2">
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-8 grid gap-6 content-start">
                        {menus.map(menu => (
                            <div key={menu._id} className="glass-panel p-6 rounded-2xl relative group hover:border-slate-500 transition-all">
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleEditMenu(menu)} className="text-slate-500 hover:text-neo-primary hover:bg-neo-primary/10 p-2 rounded-lg" title="Edit Menu">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteMenu(menu._id)} className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg" title="Delete Menu">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-4">
                                    <span className="w-2 h-8 rounded-full bg-neo-accent"></span>
                                    <h3 className="font-bold text-xl text-white">
                                        {new Date(menu.day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                                    {renderDishesDisplay('Breakfast', menu.breakfast)}
                                    {renderDishesDisplay('Lunch', menu.lunch)}
                                    {renderDishesDisplay('Snacks', menu.snacks)}
                                    {renderDishesDisplay('Dinner', menu.dinner)}
                                </div>
                            </div>
                        ))}
                        {menus.length === 0 && !loading && (
                            <div className="text-center py-12 glass-panel rounded-2xl">
                                <p className="text-slate-400 text-lg">No menus found. Create one to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {view === 'feedback' && (
                <div className="space-y-6 animate-in mt-4 max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="bg-yellow-400 w-2 h-8 rounded-full"></span>
                            Student Feedback
                        </h2>
                        <div className="flex gap-2 items-center">
                            {feedbacks.length > 0 && (
                                <Button 
                                    onClick={handleGenerateAiSummary} 
                                    disabled={aiLoading}
                                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-neo-accent text-white font-bold text-sm"
                                >
                                    {aiLoading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                    Generate AI Summary
                                </Button>
                            )}
                            <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700 font-medium h-fit">
                                Total: {feedbacks.length}
                            </span>
                        </div>
                    </div>

                    {aiSummary && (
                        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                            <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                                <Sparkles size={18} /> AI Insight Summary
                            </h3>
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
                        </div>
                    )}

                    {feedbacks.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {feedbacks.map((fb, idx) => (
                                <div key={fb.id || idx} className="glass-panel p-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
                                    <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-3">
                                        <div>
                                            <p className="font-bold text-white mb-0.5">{fb.student_name}</p>
                                            <p className="text-xs text-slate-400">{new Date(fb.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 px-2.5 py-1 rounded text-neo-accent border border-slate-700">
                                            {fb.meal_type}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <svg key={s} className={`w-4 h-4 ${fb.rating >= s ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        ))}
                                    </div>
                                    {fb.comment ? (
                                        <p className="text-sm text-slate-300 italic">"{fb.comment}"</p>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">No comment provided.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel p-16 text-center rounded-2xl">
                            <span className="text-4xl block mb-4">💬</span>
                            <h3 className="text-xl font-bold text-white mb-2">No Feedback Yet</h3>
                            <p className="text-slate-400">Feedback submitted by students will appear here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
