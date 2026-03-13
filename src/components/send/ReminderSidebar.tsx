'use client';
import { useState } from 'react';
import { LucideCalendar, LucidePlus, LucideClock, LucideTrash2 } from 'lucide-react';
import { useReminders } from '../providers/RemindersProvider';

export function ReminderSidebar() {
    const { reminders, addReminder, deleteReminder } = useReminders();
    const [isAdding, setIsAdding] = useState(false);
    const [newReminder, setNewReminder] = useState('');

    const handleAdd = () => {
        if (!newReminder) return;
        addReminder(newReminder, "Today");
        setNewReminder('');
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Reminders</h2>
                <button onClick={() => setIsAdding(true)} className="p-1.5 bg-violet-50 text-violet-600 rounded-full"><LucidePlus/></button>
            </div>
            {isAdding && (
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                    <input value={newReminder} onChange={(e) => setNewReminder(e.target.value)} placeholder="New task..." className="w-full text-sm focus:outline-none border-b mb-2" />
                    <button onClick={handleAdd} className="text-xs font-bold text-violet-600">Add</button>
                </div>
            )}
            <div className="space-y-3">
                {reminders.map((r: any) => (
                    <div key={r.id} className="p-3 bg-white/40 rounded-xl border flex items-center justify-between">
                        <span className="text-sm font-medium">{r.text}</span>
                        <button onClick={() => deleteReminder(r.id)}><LucideTrash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-500"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
