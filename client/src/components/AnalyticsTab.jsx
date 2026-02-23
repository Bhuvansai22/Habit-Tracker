import { useState } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import WeeklyGrid from './WeeklyGrid';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler, ChartDataLabels
);

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function AnalyticsTab({ habits, logs, getLast, onToggle }) {
    const [view, setView] = useState('monthly');
    const days = getLast(view === 'monthly' ? 30 : 7);
    const today = todayStr();

    // Stats
    const scores = habits.map((h) => {
        const habitDays = days.filter((d) => d >= h.createdAt.slice(0, 10));
        const done = habitDays.filter((d) => logs[d]?.[h._id]).length;
        return { ...h, pct: habitDays.length > 0 ? Math.round((done / habitDays.length) * 100) : 0 };
    });
    scores.sort((a, b) => b.pct - a.pct);
    const bestHabit = scores[0];
    const worstHabit = scores[scores.length - 1];

    let days100 = 0, days50 = 0, days0 = 0;
    days.forEach((d) => {
        const active = habits.filter((h) => h.createdAt.slice(0, 10) <= d);
        if (!active.length) return;
        const done = active.filter((h) => logs[d]?.[h._id]).length;
        const pct = done / active.length;
        if (pct === 1) days100++;
        else if (pct >= 0.5) days50++;
        else if (pct === 0) days0++;
    });

    // Chart Data
    const labels = days.map((d) => new Date(d + 'T00:00:00').getDate());

    // Daily Completion %
    const dailyPoints = days.map((d) => {
        const active = habits.filter((h) => h.createdAt.slice(0, 10) <= d);
        if (!active.length) return 0;
        const done = active.filter((h) => logs[d]?.[h._id]).length;
        return Math.round((done / active.length) * 100);
    });

    // Weekly/Rolling Avg Completion %
    const weeklyPoints = dailyPoints.map((_, i, arr) => {
        const slice = arr.slice(Math.max(0, i - 6), i + 1);
        const sum = slice.reduce((a, b) => a + b, 0);
        return Math.round(sum / slice.length);
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Daily Completion',
                data: dailyPoints,
                borderColor: '#2dd4bf',
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
                pointStyle: 'rectRot', // Diamond
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#2dd4bf',
                borderWidth: 2,
                tension: 0.3,
                datalabels: {
                    align: 'top',
                    offset: 8,
                    color: '#2dd4bf',
                    font: { weight: 'bold', size: 10 },
                    formatter: (v) => v > 0 ? `${v}%` : ''
                }
            },
            {
                label: 'Weekly Average',
                data: weeklyPoints,
                borderColor: '#7c6cf8',
                backgroundColor: 'rgba(124, 108, 248, 0.1)',
                pointStyle: 'circle', // Circle
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#7c6cf8',
                borderWidth: 2,
                tension: 0.3,
                datalabels: {
                    align: 'bottom',
                    offset: 8,
                    color: '#7c6cf8',
                    font: { weight: 'bold', size: 10 },
                    formatter: (v) => v > 0 ? `${v}%` : ''
                }
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: 30, right: 30, bottom: 10, left: 10 }
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
                labels: {
                    color: '#b0aecb',
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: '#1e1c30',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                titleColor: '#b0aecb',
                bodyColor: '#ffffff',
                padding: 12,
                cornerRadius: 10
            },
            datalabels: {
                display: (context) => {
                    // Only show data labels for weekly view or every 3rd day for monthly to avoid clutter
                    if (view === 'weekly') return true;
                    return context.dataIndex % 3 === 0;
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                ticks: { color: '#6e6c8a', font: { size: 10 }, maxTicksLimit: 15 },
                border: { display: false },
                title: { display: true, text: 'Day of Month', color: '#6e6c8a', font: { size: 11, weight: '700' } }
            },
            y: {
                min: 0, max: 110, // Extra space for labels
                grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                ticks: {
                    color: '#6e6c8a', font: { size: 10 },
                    callback: (v) => v <= 100 && v % 25 === 0 ? `${v}%` : '',
                },
                border: { display: false },
                title: { display: true, text: 'Completion %', color: '#6e6c8a', font: { size: 11, weight: '700' } }
            },
        },
    };

    const firstHabitDate = habits.length
        ? habits.reduce((a, b) => (a.createdAt < b.createdAt ? a : b)).createdAt.slice(0, 10)
        : today;

    return (
        <div className="tab-content">
            <div className="view-toggle">
                <button className={`view-btn ${view === 'monthly' ? 'active' : ''}`} onClick={() => setView('monthly')}>30 Days</button>
                <button className={`view-btn ${view === 'weekly' ? 'active' : ''}`} onClick={() => setView('weekly')}>7 Days</button>
            </div>

            <div className="stat-panels">
                <div className="stat-panel">
                    <div className="stat-row"><span className="stat-lbl">📅 Since</span><span className="stat-val">{firstHabitDate}</span></div>
                    <div className="stat-row"><span className="stat-lbl">🏆 Best</span><span className="stat-val best">{bestHabit?.name || '—'}</span></div>
                    <div className="stat-row"><span className="stat-lbl">📉 Needs work</span><span className="stat-val worst">{worstHabit?.name || '—'}</span></div>
                </div>
                <div className="stat-panel">
                    <div className="stat-row"><span className="stat-lbl stat-green">✅ Perfect days</span><span className="stat-val">{days100}</span></div>
                    <div className="stat-row"><span className="stat-lbl stat-yellow">⚡ 50%+ days</span><span className="stat-val">{days50}</span></div>
                    <div className="stat-row"><span className="stat-lbl stat-red">❌ Zero days</span><span className="stat-val">{days0}</span></div>
                </div>
            </div>

            <div className="card chart-card">
                <div className="chart-header">
                    <h3 className="card-title" style={{ marginBottom: 0 }}>Progress Overview</h3>
                </div>
                <div className="chart-wrap" style={{ marginTop: '16px', height: '300px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Habit Breakdown</h3>
                {habits.length === 0
                    ? <p className="empty-text">No habits yet.</p>
                    : scores.map((h) => (
                        <div key={h._id} className="breakdown-row">
                            <div className="breakdown-icon">●</div>
                            <div className="breakdown-info"><div className="breakdown-name">{h.name}</div></div>
                            <div className="breakdown-bar-wrap"><div className="breakdown-bar" style={{ width: `${h.pct}%` }} /></div>
                            <div className="breakdown-pct">{h.pct}%</div>
                        </div>
                    ))
                }
            </div>

            <div className="card">
                <h3 className="card-title">🔥 Current Streaks</h3>
                <div className="streak-grid">
                    {habits.map((h) => {
                        let streak = 0;
                        const d = new Date();
                        while (true) {
                            const s = d.toISOString().slice(0, 10);
                            if (logs[s]?.[h._id]) { streak++; d.setDate(d.getDate() - 1); }
                            else break;
                        }
                        return (
                            <div key={h._id} className="streak-card">
                                <div className="streak-emoji">🔥</div>
                                <div className="streak-name">{h.name}</div>
                                <div className="streak-num">{streak}</div>
                                <div className="streak-sub">day streak</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <WeeklyGrid habits={habits} logs={logs} onToggle={onToggle} />
        </div>
    );
}
