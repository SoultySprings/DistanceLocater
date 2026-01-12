import React from 'react';
import type { DistanceResult } from '../types';
import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';

interface ResultsPanelProps {
    results: DistanceResult[];
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
    if (results.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 transition-colors">
                <Navigation size={48} className="mb-4 opacity-50" />
                <p className="font-medium">Enter locations to calculate distances</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 overflow-y-auto h-full pr-2 custom-scrollbar">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-4 sticky top-0 bg-white/80 dark:bg-[#0F172A] py-2 z-10 backdrop-blur-md transition-colors duration-300">
                Results ({results.length})
            </h3>
            {results.map((result, idx) => (
                <motion.div
                    key={`${result.origin.id}-${result.destination.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors shadow-sm dark:shadow-none"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-zinc-500 dark:text-dark-muted">#{idx + 1}</span>
                        <span className="text-lg font-bold text-zinc-900 dark:text-white max-w-[200px] truncate text-right">
                            {result.distance.toLocaleString()} <span className="text-sm font-normal text-zinc-500 dark:text-dark-muted">km</span>
                        </span>
                    </div>

                    <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm">
                        <div className="truncate text-emerald-600 dark:text-emerald-400/90" title={result.origin.address || "Origin"}>
                            {result.origin.address || "Origin"}
                        </div>
                        <div className="text-zinc-400 dark:text-dark-muted px-2">→</div>
                        <div className="truncate text-right text-rose-600 dark:text-rose-400/90" title={result.destination.address || "Destination"}>
                            {result.destination.address || "Destination"}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ResultsPanel;
