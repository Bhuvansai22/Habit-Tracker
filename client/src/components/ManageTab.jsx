import { useState } from 'react';

const SLOTS = ['morning', 'afternoon', 'evening', 'anytime'];
const SLOT_LABELS = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌆 Evening', anytime: '🔄 Anytime' };

export default function ManageTab({ habits, onAdd, onUpdate, onDelete }) {
    const [form, setForm] = useState({ name: '', timeSlot: 'morning' });
    const [editId, setEditId] = useState(null);
    const [toast, setToast] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        if (editId) {
            await onUpdate(editId, form.name.trim(), form.timeSlot);
            showToast('✏️ Habit updated!');
            setEditId(null);
        } else {
            await onAdd(form.name.trim(), form.timeSlot);
            showToast('✅ Habit added!');
        }
        setForm({ name: '', timeSlot: 'morning' });
    };

    const startEdit = (habit) => {
        setEditId(habit._id);
        setForm({ name: habit.name, timeSlot: habit.timeSlot });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditId(null);
        setForm({ name: '', timeSlot: 'morning' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this habit and all its data?')) return;
        await onDelete(id);
        showToast('🗑️ Habit deleted');
    };

    return (
        <div className="tab-content">
            {toast && <div className="toast show">{toast}</div>}

            {/* Form */}
            <div className="card form-card">
                <h3 className="card-title">{editId ? '✏️ Edit Habit' : '➕ Add New Habit'}</h3>
                <form onSubmit={handleSubmit} className="habit-form">
                    <div className="form-group">
                        <label>Habit Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Morning Run"
                            value={form.name}
                            maxLength={60}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Time Slot</label>
                        <div className="slot-select">
                            {SLOTS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`slot-opt ${form.timeSlot === s ? 'active' : ''}`}
                                    onClick={() => setForm({ ...form, timeSlot: s })}
                                >
                                    {SLOT_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {editId ? 'Save Changes' : 'Add Habit'}
                        </button>
                        {editId && (
                            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Habits list */}
            <div className="card">
                <h3 className="card-title">Your Habits ({habits.length})</h3>
                {habits.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🌱</div>
                        <p>No habits yet. Add your first one above!</p>
                    </div>
                ) : (
                    <div className="habits-list">
                        {habits.map((habit) => {
                            const slotLabel = SLOT_LABELS[habit.timeSlot] || habit.timeSlot;
                            const since = new Date(habit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                                <div key={habit._id} className="habit-list-item">
                                    <div className="list-info">
                                        <div className="list-name">{habit.name}</div>
                                        <div className="list-slot">{slotLabel} · Since {since}</div>
                                    </div>
                                    <div className="list-actions">
                                        <button className="icon-btn edit" onClick={() => startEdit(habit)} title="Edit">✏️</button>
                                        <button className="icon-btn del" onClick={() => handleDelete(habit._id)} title="Delete">🗑️</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
