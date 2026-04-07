import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Utensils } from 'lucide-react';

const Login = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialType = queryParams.get('type') === 'admin' ? 'admin' : 'student';

    const [loginType, setLoginType] = useState(initialType);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', { email, password });

            // Optional: verify if they selected the right type of login based on their role
            if (res.data.user.role !== loginType) {
                setError(`Account found, but it is not a ${loginType} account. Please use the correct login type.`);
                return;
            }

            login(res.data.token, res.data.user);
            navigate(res.data.user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Plain background */}

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white group">
                        <Utensils className="text-neo-accent group-hover:rotate-12 transition-transform" size={32} />
                        <span className="text-glow">HostelFresh</span>
                    </Link>
                </div>

                <div className="glass-panel p-8 md:p-10 rounded-2xl border border-slate-700/50 shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neo-primary/10 blur-[40px] rounded-full pointer-events-none"></div>

                    <div className="text-center mb-6 relative z-10">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                            {loginType === 'admin' ? 'Admin Login' : 'Student Login'}
                        </h2>
                        <p className="text-slate-400">Enter your credentials to access your account.</p>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex bg-slate-800/60 p-1 rounded-xl mb-8 relative z-10">
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${loginType === 'student'
                                    ? 'bg-neo-primary text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            onClick={() => {
                                setLoginType('student');
                                setError('');
                            }}
                        >
                            Student
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${loginType === 'admin'
                                    ? 'bg-neo-accent text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                            onClick={() => {
                                setLoginType('admin');
                                setError('');
                            }}
                        >
                            Admin
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-4 rounded-xl mb-6 text-sm flex items-center gap-3 backdrop-blur-md relative z-10">
                            <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={loginType === 'admin' ? "admin@hostel.com" : "student@example.com"}
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs text-neo-accent hover:text-neo-primary transition-colors">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                className="w-full p-3.5 border border-slate-600 rounded-xl focus:border-neo-primary focus:ring-1 focus:ring-neo-primary outline-none bg-slate-800/60 text-white transition-all placeholder-slate-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full text-white font-bold py-4 rounded-xl hover:opacity-90 box-glow transition-all text-lg shadow-lg mt-2 ${loginType === 'admin'
                                    ? 'bg-gradient-to-r from-neo-accent to-neo-primary shadow-neo-accent/20'
                                    : 'bg-gradient-to-r from-neo-primary to-neo-accent shadow-neo-primary/20'
                                }`}
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center text-slate-400 relative z-10">
                        Don't have an account? <Link to="/register" className="text-neo-accent font-bold hover:text-white transition-colors ml-1">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
