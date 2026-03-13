'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideCalendar, LucidePlus, LucideClock, LucideTrash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReminders } from '../providers/RemindersProvider';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

export function ReminderSidebar() {
    const { reminders, addReminder, deleteReminder } = useReminders();
    const [isAdding, setIsAdding] = useState(false);
    const [newReminder, setNewReminder] = useState('');
    const [newTime, setNewTime] = useState('');

    const currentDate = new Date();
    const calendarDays = eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) });

    const handleAddReminder = () => {
        if (!newReminder) return;
        let displayTime = newTime ? format(new Date(newTime), 'MMM d, h:mm a') : 'Not set';
        addReminder(newReminder, displayTime);
        setNewReminder(''); setNewTime(''); setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Daily Tasks</h2><button onClick={() => setIsAdding(true)} className="p-1.5 bg-violet-50 text-violet-600 rounded-full"><LucidePlus className="w-5 h-5" /></button></div>
            <AnimatePresence>{isAdding && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-white border border-violet-100 rounded-xl space-y-3"><input type="text" placeholder="Reminder..." className="w-full text-sm outline-none border-b" value={newReminder} onChange={(e) => setNewReminder(e.target.value)} /><input type="datetime-local" className="text-xs outline-none bg-transparent" value={newTime} onChange={(e) => setNewTime(e.target.value)} /><div className="flex justify-end gap-2 pt-2"><button onClick={() => setIsAdding(false)} className="text-xs text-gray-400">Cancel</button><button onClick={handleAddReminder} className="text-xs text-violet-600 font-bold">Add</button></div></motion.div>}</AnimatePresence>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {reminders.map((reminder) => (
                    <div key={reminder.id} className="group flex items-start gap-3 p-3 bg-white/40 hover:bg-white/80 border border-transparent hover:border-violet-100 rounded-xl transition-all"><div className="mt-1 w-2 h-2 rounded-full bg-violet-400" /><div className="flex-1"><p className="text-sm font-medium">{reminder.text}</p><div className="flex items-center gap-1 text-[10px] text-gray-400"><LucideClock className="w-3 h-3" />{reminder.time}</div></div><button onClick={() => deleteReminder(reminder.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><LucideTrash2 className="w-3.5 h-3.5" /></button></div>
                ))}
            </div>
            <div className="mt-8 p-4 bg-white/60 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-gray-500 uppercase">{format(currentDate, 'MMMM yyyy')}</span><LucideCalendar className="w-4 h-4 text-violet-500" /></div>
                <div className="grid grid-cols-7 gap-1">{calendarDays.map((day, i) => <div key={i} className={cn("aspect-square flex items-center justify-center text-[10px] rounded-lg", !isSameMonth(day, currentDate) ? "text-gray-300" : "text-gray-700", isSameDay(day, currentDate) ? "bg-violet-600 text-white font-bold" : "")}>{format(day, 'd')}</div>)}</div>
            </div>
        </div>
    );
}
