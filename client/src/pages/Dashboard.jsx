import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import TodayTab from '../components/TodayTab';
import ManageTab from '../components/ManageTab';
import AnalyticsTab from '../components/AnalyticsTab';

const todayStr = () => new Date().toISOString().slice(0, 10);

const getLast = (n) => {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    return days;
};

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('today');
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchHabits = useCallback(async () => {
        const { data } = await api.get('/habits');
        setHabits(data);
    }, []);

    const fetchLogs = useCallback(async () => {
        const days = getLast(35);
        const { data } = await api.get(`/logs?from=${days[0]}&to=${todayStr()}`);
        setLogs(data);
    }, []);

    useEffect(() => {
        const init = async () => {
            await Promise.all([fetchHabits(), fetchLogs()]);
            setLoading(false);
        };
        init();
    }, [fetchHabits, fetchLogs]);

    const toggleHabit = async (habitId, date) => {
        await api.post('/logs/toggle', { habitId, date });
        await fetchLogs();
    };

    const addHabit = async (name, timeSlot) => {
        await api.post('/habits', { name, timeSlot });
        await fetchHabits();
    };

    const updateHabit = async (id, name, timeSlot) => {
        await api.put(`/habits/${id}`, { name, timeSlot });
        await fetchHabits();
    };

    const deleteHabit = async (id) => {
        await api.delete(`/habits/${id}`);
        await fetchHabits();
        await fetchLogs();
    };

    // Current date header
    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <span className="header-logo">🔥</span>
                    <div>
                        <h1 className="header-title">HabitFlow</h1>
                        <span className="header-date">{dateLabel}</span>
                    </div>
                </div>
                <div className="header-right">
                    <span className="header-user">👤 {user?.name}</span>
                    <button className="btn-logout" onClick={logout}>Sign Out</button>
                </div>
            </header>

            {/* Tabs */}
            <nav className="tab-nav">
                {['today', 'manage', 'analytics'].map((t) => (
                    <button
                        key={t}
                        className={`tab-btn ${tab === t ? 'active' : ''}`}
                        onClick={() => setTab(t)}
                    >
                        {t === 'today' ? '☀️ Today' : t === 'manage' ? '📋 Manage' : '📊 Analytics'}
                    </button>
                ))}
            </nav>

            {/* Tab content */}
            <main className="main-content">
                {loading ? (
                    <div className="loading-screen">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        {tab === 'today' && (
                            <TodayTab habits={habits} logs={logs} today={todayStr()} onToggle={toggleHabit} />
                        )}
                        {tab === 'manage' && (
                            <ManageTab
                                habits={habits}
                                onAdd={addHabit}
                                onUpdate={updateHabit}
                                onDelete={deleteHabit}
                            />
                        )}
                        {tab === 'analytics' && (
                            <AnalyticsTab habits={habits} logs={logs} getLast={getLast} onToggle={toggleHabit} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
