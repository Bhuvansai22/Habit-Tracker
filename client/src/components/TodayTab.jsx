const SLOTS = {
    morning: { label: 'Morning', emoji: '🌅', color: '#FF9F43' },
    afternoon: { label: 'Afternoon', emoji: '☀️', color: '#F7C59F' },
    evening: { label: 'Evening', emoji: '🌆', color: '#A78BFA' },
    anytime: { label: 'Anytime', emoji: '🔄', color: '#4ECDC4' },
};

export default function TodayTab({ habits, logs, today, onToggle }) {
    const dayLog = logs[today] || {};
    const done = habits.filter((h) => dayLog[h._id]).length;
    const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const bySlot = habits.reduce((acc, h) => {
        if (!acc[h.timeSlot]) acc[h.timeSlot] = [];
        acc[h.timeSlot].push(h);
        return acc;
    }, {});

    return (
        <div className="tab-content">
            {/* Progress Hero */}
            <div className="today-hero">
                <div className="today-hero-text">
                    <h2>{greeting}! ☀️</h2>
                    <p>{done} of {habits.length} habits done today</p>
                </div>
                <div className="ring-wrap">
                    <svg viewBox="0 0 80 80" className="ring-svg">
                        <defs>
                            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7c6cf8" />
                                <stop offset="100%" stopColor="#2dd4bf" />
                            </linearGradient>
                        </defs>
                        <circle cx="40" cy="40" r="34" className="ring-bg" />
                        <circle
                            cx="40" cy="40" r="34"
                            className="ring-fill"
                            stroke="url(#ringGrad)"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                        />
                    </svg>
                    <span className="ring-pct">{pct}%</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* Empty state */}
            {habits.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No habits yet! Go to <strong>Manage</strong> to add your first habit.</p>
                </div>
            )}

            {/* Habits by slot */}
            {Object.entries(SLOTS).map(([slotKey, slot]) => {
                const slotHabits = bySlot[slotKey];
                if (!slotHabits?.length) return null;
                return (
                    <div key={slotKey} className="slot-section">
                        <div className="slot-header">
                            <span className="slot-emoji">{slot.emoji}</span>
                            <span className="slot-label">{slot.label}</span>
                        </div>
                        <div className="habit-cards">
                            {slotHabits.map((habit) => {
                                const isDone = !!dayLog[habit._id];
                                return (
                                    <button
                                        key={habit._id}
                                        className={`habit-card ${isDone ? 'done' : ''}`}
                                        style={{ '--slot-color': slot.color }}
                                        onClick={() => onToggle(habit._id, today)}
                                    >
                                        <div className="habit-check">{isDone ? '✓' : ''}</div>
                                        <div className="habit-info">
                                            <div className="habit-name">{habit.name}</div>
                                            <div className="habit-slot-badge">{slot.emoji} {slot.label}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
