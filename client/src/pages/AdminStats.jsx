import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ArrowLeft, Download, PieChart as PieChartIcon, Activity, Users, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#64748b'];

const AdminStats = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch admin stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const generatePDF = () => {
        if (!stats) return;

        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(6, 182, 212); // neo-primary
        doc.text('HostelFresh Allergy Risk Report', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(`Generated on: ${dateStr}`, 14, 30);

        // Summary Statistics
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('Executive Summary', 14, 45);

        doc.setFontSize(11);
        doc.text(`Total Registered Students: ${stats.totalStudents}`, 14, 55);
        doc.text(`Students with Registered Allergies: ${stats.totalWithAllergies}`, 14, 62);
        doc.text(`Total Allergy Alerts Generated Today: ${stats.totalAlertsToday}`, 14, 69);

        // Meal Risk Summary Table
        let startY = 85;
        doc.setFontSize(14);
        doc.text('Critical Allergy Risks For Today', 14, startY);

        const tableColumn = ["Meal", "Student", "Dish", "Triggered Allergen"];
        const tableRows = [];

        ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(meal => {
            if (stats.riskSummary[meal] && stats.riskSummary[meal].length > 0) {
                stats.riskSummary[meal].forEach(risk => {
                    tableRows.push([
                        meal.charAt(0).toUpperCase() + meal.slice(1),
                        risk.studentName,
                        risk.dish,
                        risk.allergens?.join(', ') || 'Unknown'
                    ]);
                });
            }
        });

        if (tableRows.length > 0) {
            doc.autoTable({
                startY: startY + 5,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [6, 182, 212] }
            });
        } else {
            doc.setFontSize(11);
            doc.setTextColor(16, 185, 129); // green-500
            doc.text("No critical risks detected for today.", 14, startY + 10);
        }

        doc.save(`HostelFresh_Risk_Report_${dateStr.replace(/\//g, '-')}.pdf`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-neo-accent">Loading analytics...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!stats) return null;

    return (
        <div className="min-h-screen text-slate-200 p-4 md:p-8 relative overflow-y-auto w-full">
            <header className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-4">
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={() => navigate('/admin-dashboard')} className="p-2 mr-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <PieChartIcon className="text-neo-accent" size={24} />
                        <span className="text-glow">Risk Analytics</span>
                    </div>
                </div>
                <Button onClick={generatePDF} className="flex items-center gap-2 bg-gradient-to-r from-neo-primary to-neo-accent text-white font-bold tracking-wide">
                    <Download size={18} /> Export PDF Report
                </Button>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Total Students</h4>
                        <Users className="text-blue-500" size={20} />
                    </div>
                    <p className="text-4xl font-extrabold text-white">{stats.totalStudents}</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Students w/ Allergies</h4>
                        <ShieldAlert className="text-yellow-500" size={20} />
                    </div>
                    <p className="text-4xl font-extrabold text-white">{stats.totalWithAllergies}</p>
                    <p className="text-xs text-slate-500 mt-2">{Math.round((stats.totalWithAllergies / Math.max(stats.totalStudents, 1)) * 100)}% of user base</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-red-500 bg-red-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs">Alerts Issued Today</h4>
                        <AlertTriangle className="text-red-500 animate-pulse" size={20} />
                    </div>
                    <p className="text-4xl font-extrabold text-red-400">{stats.totalAlertsToday}</p>
                    <p className="text-xs text-slate-500 mt-2 text-glow-red">Across all meals</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Allergy Breakdown Chart */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-6 w-full border-b border-slate-700/50 pb-3">Allergy Type Breakdown</h3>
                    {stats.allergyBreakdown && stats.allergyBreakdown.length > 0 ? (
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.allergyBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="students">
                                        {stats.allergyBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-slate-500 my-auto">No allergy data recorded yet.</p>
                    )}
                </div>

                {/* Bar Chart representation */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-6 w-full border-b border-slate-700/50 pb-3">Allergen Frequency</h3>
                    {stats.allergyBreakdown && stats.allergyBreakdown.length > 0 ? (
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.allergyBreakdown} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} cursor={{fill: '#334155', opacity: 0.4}} />
                                    <Bar dataKey="students" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                                        {stats.allergyBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-slate-500 my-auto">No allergy data recorded yet.</p>
                    )}
                </div>
            </div>

            {/* Critical Risks Table */}
            <div className="glass-panel p-6 md:p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-3">
                    <Activity className="text-red-500" /> Today's Critical Risk Summary
                </h3>
                
                <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/40">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800/80 border-b border-slate-700/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Meal</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dish</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Triggered Allergen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['breakfast', 'lunch', 'snacks', 'dinner'].flatMap(meal => 
                                (stats.riskSummary[meal] || []).map((risk, idx) => (
                                    <tr key={`${meal}-${idx}`} className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors last:border-0">
                                        <td className="p-4">
                                            <span className="text-xs font-bold tracking-wide uppercase px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                                                {meal}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-white">{risk.studentName}</td>
                                        <td className="p-4 text-sm text-slate-300">{risk.dish}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-bold">
                                                {risk.allergens?.join(', ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            
                            {['breakfast', 'lunch', 'snacks', 'dinner'].every(meal => !stats.riskSummary[meal] || stats.riskSummary[meal].length === 0) && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400 italic">
                                        <ShieldAlert className="mx-auto mb-2 text-green-500 opacity-50" size={32}/>
                                        No critical risks detected in today's menu against student profiles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
