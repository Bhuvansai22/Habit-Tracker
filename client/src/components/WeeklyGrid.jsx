const todayStr = () => new Date().toISOString().slice(0, 10);
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDayNum(dateStr) { return new Date(dateStr + 'T00:00:00').getDate(); }

export default function WeeklyGrid({ habits, logs, onToggle }) {
    const today = todayStr();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Build all days from month start to today
    const allDays = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
        const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        allDays.push(str);
        if (str === today) break;
    }

    // Split into Mon-Sun aligned weeks
    const firstDay = new Date(year, month, 1);
    const dow = firstDay.getDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    const firstMon = new Date(firstDay);
    firstMon.setDate(firstDay.getDate() + offset);

    const weeks = [];
    const cursor = new Date(firstMon);
    while (true) {
        const week = [];
        for (let i = 0; i < 7; i++) {
            week.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
        if (week.includes(today) || new Date(week[6]) > now) break;
        if (weeks.length > 5) break;
    }

    return (
        <div className="card wg-card">
            <h3 className="card-title">📅 Weekly Habit Grid</h3>
            <div className="wg-scroll">
                <table className="wg-table">
                    <thead>
                        {/* Week header row */}
                        <tr className="wg-week-header">
                            <th className="wg-habit-col"></th>
                            {weeks.map((_, wi) => (
                                <th key={wi} colSpan={7} className="wg-week-span">Week {wi + 1}</th>
                            ))}
                            <th className="wg-total-col">Total</th>
                        </tr>
                        {/* Day name row */}
                        <tr className="wg-day-header">
                            <th className="wg-habit-col">Habit</th>
                            {weeks.map((_, wi) =>
                                DAY_NAMES.map((n, di) => <th key={`${wi}-${di}`}>{n}</th>)
                            )}
                            <th className="wg-total-col"></th>
                        </tr>
                        {/* Day number row */}
                        <tr className="wg-daynum-row">
                            <th className="wg-habit-col"></th>
                            {weeks.map((week) =>
                                week.map((d) => <th key={d}>{getDayNum(d)}</th>)
                            )}
                            <th className="wg-total-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {habits.map((habit) => {
                            const habitStart = habit.createdAt.slice(0, 10);
                            const validDays = allDays.filter((d) => d >= habitStart);
                            const completedCount = validDays.filter((d) => logs[d]?.[habit._id]).length;
                            const pct = validDays.length > 0 ? Math.round((completedCount / validDays.length) * 100) : 0;

                            return (
                                <tr key={habit._id} className="wg-habit-row">
                                    <td className="wg-habit-col">{habit.name}</td>
                                    {weeks.map((week) =>
                                        week.map((dateStr) => {
                                            const isFuture = dateStr > today;
                                            const isBeforeStart = dateStr < habitStart;
                                            if (isFuture || isBeforeStart) {
                                                return <td key={dateStr} className="wg-future">·</td>;
                                            }
                                            const isDone = !!logs[dateStr]?.[habit._id];
                                            return (
                                                <td
                                                    key={dateStr}
                                                    className={isDone ? 'wg-cell-done' : 'wg-cell-blank'}
                                                    title={isDone ? 'Click to unmark' : 'Click to mark done'}
                                                    onClick={() => onToggle && onToggle(habit._id, dateStr)}
                                                >
                                                    {isDone
                                                        ? <span className="wg-true">✓</span>
                                                        : <span className="wg-blank">—</span>
                                                    }
                                                </td>
                                            );
                                        })
                                    )}
                                    <td className="wg-total-col">
                                        <div className="wg-total-inner">
                                            <div className="wg-total-bar-wrap">
                                                <div className="wg-total-bar" style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="wg-total-num">{completedCount}</div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Dots row */}
                        <tr className="wg-dots-row">
                            <td className="wg-habit-col"></td>
                            {weeks.map((week) =>
                                week.map((dateStr) => {
                                    if (dateStr > today) return <td key={dateStr}><span className="wg-dot"></span></td>;
                                    const done = habits.filter((h) => logs[dateStr]?.[h._id]).length;
                                    const ratio = habits.length > 0 ? done / habits.length : 0;
                                    let cls = 'wg-dot';
                                    if (ratio === 0) cls += ' none';
                                    else if (ratio < 1) cls += ' partial has-data';
                                    else cls += ' has-data';
                                    return <td key={dateStr}><span className={cls}></span></td>;
                                })
                            )}
                            <td className="wg-total-col"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
