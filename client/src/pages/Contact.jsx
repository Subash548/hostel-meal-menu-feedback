import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Mail, User, MessageSquare, Send, ArrowLeft, Building2 } from 'lucide-react';
import Button from '../components/ui/Button';

const Contact = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            await api.post('/api/contact', formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' }); // Reset form
        } catch (err) {
            setStatus('error');
            setErrorMessage(err.response?.data?.error || 'Failed to send message. Please try again.');
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0F1C]">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neo-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neo-accent/20 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="w-full max-w-md relative z-10 animate-in">
                <button 
                    onClick={() => navigate(-1)} 
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="glass-panel p-8 rounded-2xl relative shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-neo-primary to-neo-accent rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-neo-accent/20">
                            <Building2 className="text-white" size={28} />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Contact Administration</h2>
                        <p className="text-slate-400 mt-2 text-sm">Send a message directly to the hostel management.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-xl text-center space-y-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <Send size={24} className="text-green-500" />
                            </div>
                            <h3 className="font-bold text-lg text-white">Message Sent!</h3>
                            <p className="text-sm">Thank you for reaching out. A confirmation email has been sent to your inbox.</p>
                            <Button className="w-full mt-4" onClick={() => setStatus('idle')}>
                                Send Another Message
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {status === 'error' && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
                                    {errorMessage}
                                </div>
                            )}
                            
                            <div className="space-y-1.5 focus-within-glow p-1 rounded-xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="text-slate-500" size={18} />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-neo-accent focus:border-neo-accent text-white transition-all placeholder:text-slate-600"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5 focus-within-glow p-1 rounded-xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="text-slate-500" size={18} />
                                    </div>
                                    <input 
                                        type="email" 
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-neo-accent focus:border-neo-accent text-white transition-all placeholder:text-slate-600"
                                        placeholder="johndoe@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within-glow p-1 rounded-xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Message</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                                        <MessageSquare className="text-slate-500" size={18} />
                                    </div>
                                    <textarea 
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-neo-accent focus:border-neo-accent text-white transition-all placeholder:text-slate-600 resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full flex justify-center items-center gap-2 py-4 text-[15px]" 
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <Send size={18} /> Send Message
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
