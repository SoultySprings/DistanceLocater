import React from 'react';
import { Plus, Trash2, MapPin, Loader2 } from 'lucide-react';
import type { LocationPoint } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface InputSectionProps {
    title: string;
    points: LocationPoint[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, value: string) => void;
    onBlur: (id: string) => void;
    placeholder: string;
    iconColor: string;
}

const InputSection: React.FC<InputSectionProps> = ({ title, points, onAdd, onRemove, onUpdate, onBlur, placeholder, iconColor }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md group/panel">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{title}</h3>
            <button
                onClick={onAdd}
                className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm"
                title="Add location"
            >
                <Plus size={14} />
            </button>
        </div>
        <div className="p-3 space-y-2">
            <AnimatePresence mode='popLayout'>
                {points.map((point) => (
                    <motion.div
                        key={point.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className="group flex items-center gap-3 bg-zinc-50/50 dark:bg-black/20 hover:bg-white dark:hover:bg-zinc-800/50 p-2.5 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-indigo-500/30 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all duration-200"
                    >
                        <MapPin size={16} className={`${iconColor} shrink-0 opacity-70 group-focus-within:opacity-100 transition-opacity`} />
                        <div className="flex-1 min-w-0">
                            <input
                                className="bg-transparent border-none outline-none text-sm text-zinc-800 dark:text-zinc-200 w-full placeholder:text-zinc-400 dark:placeholder:text-zinc-600 font-medium tracking-tight transition-colors"
                                placeholder={placeholder}
                                value={point.address}
                                onChange={(e) => onUpdate(point.id, e.target.value)}
                                onBlur={() => onBlur(point.id)}
                            />
                        </div>

                        {point.loading && <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />}

                        {!point.loading && (
                            <button
                                onClick={() => onRemove(point.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    </div>
);

interface InputPanelProps {
    origins: LocationPoint[];
    destinations: LocationPoint[];
    setOrigins: React.Dispatch<React.SetStateAction<LocationPoint[]>>;
    setDestinations: React.Dispatch<React.SetStateAction<LocationPoint[]>>;
    handleAddressChange: (id: string, value: string, type: 'origin' | 'destination') => void;
    handleAddressBlur: (id: string, type: 'origin' | 'destination') => void;
    addPoint: (type: 'origin' | 'destination') => void;
    removePoint: (id: string, type: 'origin' | 'destination') => void;
    mode: 'one-to-many' | 'many-to-many';
    setMode: (mode: 'one-to-many' | 'many-to-many') => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
    origins, destinations, handleAddressChange, handleAddressBlur, addPoint, removePoint, mode, setMode
}) => {
    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar px-1">

            {/* Mode Toggle */}
            <div className="p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 gap-1 relative transition-colors duration-300">
                <button
                    onClick={() => setMode('one-to-many')}
                    className={`relative z-10 py-2.5 px-4 text-xs font-bold tracking-wide rounded-lg transition-all duration-300 ${mode === 'one-to-many' ? 'text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-md ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                >
                    One to Many
                </button>
                <button
                    onClick={() => setMode('many-to-many')}
                    className={`relative z-10 py-2.5 px-4 text-xs font-bold tracking-wide rounded-lg transition-all duration-300 ${mode === 'many-to-many' ? 'text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-md ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                >
                    Many to Many
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <InputSection
                    title="Origins"
                    points={origins}
                    onAdd={() => addPoint('origin')}
                    onRemove={(id) => removePoint(id, 'origin')}
                    onUpdate={(id, val) => handleAddressChange(id, val, 'origin')}
                    onBlur={(id) => handleAddressBlur(id, 'origin')}
                    placeholder="E.g. New York, NY"
                    iconColor="text-emerald-500"
                />

                <div className="relative py-2 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200 dark:border-zinc-800 border-dashed"></div>
                    </div>
                </div>

                <InputSection
                    title="Destinations"
                    points={destinations}
                    onAdd={() => addPoint('destination')}
                    onRemove={(id) => removePoint(id, 'destination')}
                    onUpdate={(id, val) => handleAddressChange(id, val, 'destination')}
                    onBlur={(id) => handleAddressBlur(id, 'destination')}
                    placeholder="E.g. Los Angeles, CA"
                    iconColor="text-rose-500"
                />
            </div>
        </div>
    );
};

export default InputPanel;
