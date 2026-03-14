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
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const handleAddReminder = () => {
        if (!newReminder) return;

        let displayTime = 'Not set';
        if (newTime) {
            const dateObj = new Date(newTime);
            if (!isNaN(dateObj.getTime())) {
                displayTime = format(dateObj, 'MMM d, h:mm a');
            } else {
                displayTime = newTime;
            }
        }

        addReminder(newReminder, displayTime);
        setNewReminder('');
        setNewTime('');
        setIsAdding(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Daily Task Reminder</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-1.5 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-colors"
                >
                    <LucidePlus className="w-5 h-5" />
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-white border border-violet-100 rounded-xl shadow-sm space-y-3"
                    >
                        <input
                            type="text"
                            placeholder="What needs a reminder?"
                            className="w-full text-sm focus:outline-none border-b border-gray-100 pb-2"
                            value={newReminder}
                            onChange={(e) => setNewReminder(e.target.value)}
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="datetime-local"
                                className="text-xs text-gray-500 focus:outline-none bg-transparent"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsAdding(false)} className="text-xs text-gray-400 font-medium">Cancel</button>
                            <button onClick={handleAddReminder} className="text-xs text-violet-600 font-bold">Add</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {reminders.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-400">
                        No reminders set.
                    </div>
                ) : (
                    reminders.map((reminder) => (
                        <div
                            key={reminder.id}
                            className="group flex items-start gap-3 p-3 bg-white/40 hover:bg-white/80 border border-transparent hover:border-violet-100 rounded-xl transition-all"
                        >
                            <div className="mt-1 w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 font-medium leading-tight">{reminder.text}</p>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    <LucideClock className="w-3 h-3" />
                                    {reminder.time}
                                </div>
                            </div>
                            <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all shrink-0"
                            >
                                <LucideTrash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 p-4 bg-white/60 rounded-2xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => {
                        const isToday = isSameDay(day, currentDate);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "aspect-square flex items-center justify-center text-[10px] rounded-lg transition-colors cursor-pointer",
                                    !isCurrentMonth ? "text-gray-300" : "text-gray-700 hover:bg-violet-50",
                                    isToday ? "bg-violet-600 text-white font-bold hover:bg-violet-700" : ""
                                )}
                            >
                                {format(day, 'd')}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
