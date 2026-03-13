'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Reminder {
    id: string;
    text: string;
    time: string;
    completed: boolean;
}

interface RemindersContextType {
    reminders: Reminder[];
    addReminder: (text: string, time: string) => void;
    deleteReminder: (id: string) => void;
    toggleReminder: (id: string) => void;
    uncompletedCount: number;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export function RemindersProvider({ children }: { children: ReactNode }) {
    const [reminders, setReminders] = useState<Reminder[]>([
        { id: '1', text: 'Email to boss about our x y z', time: 'Tomorrow, 10:00 AM', completed: false },
        { id: '2', text: 'Follow up with design team', time: 'Friday, 2:00 PM', completed: false }
    ]);

    const addReminder = (text: string, time: string) => {
        if (!text) return;
        const newReminder: Reminder = {
            id: Math.random().toString(36).substr(2, 9),
            text,
            time: time || 'Not set',
            completed: false
        };
        setReminders([newReminder, ...reminders]);
    };

    const deleteReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const toggleReminder = (id: string) => {
        setReminders(reminders.map(r =>
            r.id === id ? { ...r, completed: !r.completed } : r
        ));
    };

    const uncompletedCount = reminders.filter(r => !r.completed).length;

    return (
        <RemindersContext.Provider value={{ reminders, addReminder, deleteReminder, toggleReminder, uncompletedCount }}>
            {children}
        </RemindersContext.Provider>
    );
}

export function useReminders() {
    const context = useContext(RemindersContext);
    if (context === undefined) {
        throw new Error('useReminders must be used within a RemindersProvider');
    }
    return context;
}
