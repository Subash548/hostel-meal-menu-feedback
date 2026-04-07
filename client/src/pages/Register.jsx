import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Utensils } from 'lucide-react';

const ALLERGY_OPTIONS = ['Nuts', 'Gluten', 'Dairy', 'Egg', 'Soy', 'Seafood', 'Spices', 'Sulfites'];

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        hostel_id: '',
        roomNumber: '',
        phone: '',
        allergies: [],
        customAllergiesStr: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAllergyToggle = (allergy) => {
        setFormData(prev => ({
            ...prev,
            allergies: prev.allergies.includes(allergy) 
                ? prev.allergies.filter(a => a !== allergy)
                : [...prev.allergies, allergy]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const customAllergies = formData.customAllergiesStr
                .split(',')
                .map(a => a.trim())
                .filter(a => a.length > 0);

            const payload = {
                ...formData,
                customAllergies
            };

            await axios.post('/api/auth/register', payload);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex flex-col p-4 relative overflow-y-auto py-12">
            <div className="w-full max-w-2xl mx-auto my-auto">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white group">
                        <Utensils className="text-neo-accent group-hover:-rotate-12 transition-transform" size={32} />
                        <span className="text-glow">HostelFresh</span>
                    </Link>
                </div>

                <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-700/50 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neo-accent/10 blur-[40px] rounded-full pointer-events-none"></div>

                    <div className="text-center mb-6 relative z-10">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
                        <p className="text-slate-400">Join HostelFresh for smart meal reminders & allergy alerts.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 backdrop-blur-md relative z-10">
                            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
                                <input type="text" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                                <input type="email" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@example.com" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Password</label>
                                <input type="password" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Strong password" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Phone Number</label>
                                <input type="tel" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="For SMS alerts" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Hostel Ref ID / Block</label>
                                <input type="text" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.hostel_id} onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })} placeholder="e.g. Block A" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Room Number</label>
                                <input type="text" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} placeholder="e.g. 101" required />
                            </div>
                        </div>

                        {/* Allergies Section */}
                        <div className="pt-4 border-t border-slate-700/50 mt-4">
                            <label className="block text-sm font-bold text-white mb-2 tracking-wider">Allergies & Dietary Restrictions</label>
                            <p className="text-xs text-slate-400 mb-4">Select any standard allergens you are sensitive to, to receive smart alerts.</p>
                            
                            <div className="flex flex-wrap gap-3 mb-4">
                                {ALLERGY_OPTIONS.map(allergy => (
                                    <button
                                        type="button"
                                        key={allergy}
                                        onClick={() => handleAllergyToggle(allergy)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                                            formData.allergies.includes(allergy) 
                                                ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                                                : 'bg-slate-800/40 text-slate-300 border-slate-600 hover:border-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                    >
                                        {allergy}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Custom Allergies (Comma separated)</label>
                                <input type="text" className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500" value={formData.customAllergiesStr} onChange={(e) => setFormData({ ...formData, customAllergiesStr: e.target.value })} placeholder="e.g. Mushroom, Tomato" />
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-8 bg-gradient-to-r from-neo-primary to-neo-accent text-white font-bold py-4 rounded-xl hover:opacity-90 box-glow transition-all text-lg shadow-lg shadow-neo-accent/20">
                            Complete Registration
                        </button>
                    </form>

                    <div className="mt-6 text-center text-slate-400 relative z-10">
                        Already have an account? <Link to="/login" className="text-neo-accent font-bold hover:text-white transition-colors ml-1">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
