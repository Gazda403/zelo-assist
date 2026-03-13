"use client";
import React from 'react';
export default function EmailSidebar({ emails, selectedEmailId, onSelectEmail }: any) {
    return (
        <div className="h-full w-full bg-white/60 border-r overflow-y-auto">
            {emails.map((e: any) => (
                <div key={e.id} onClick={() => onSelectEmail(e.id)} className={`p-4 border-b cursor-pointer ${selectedEmailId === e.id ? 'bg-white' : ''}`}>
                    <h3 className="font-bold text-sm truncate">{e.sender.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{e.subject}</p>
                </div>
            ))}
        </div>
    );
}
