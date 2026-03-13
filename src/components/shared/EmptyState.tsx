'use client';
import { motion } from 'framer-motion';

export function EmptyState({ icon: Icon, title, description }: any) {
    return (
        <div className="flex flex-col items-center py-12">
            <Icon className="w-12 h-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );
}
