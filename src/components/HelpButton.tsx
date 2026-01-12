import React, { useState } from 'react';
import { HelpCircle, X, MapPin, Calculator, Navigation } from 'lucide-react';

const HelpButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[900] p-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-all hover:scale-110 active:scale-95 group"
                aria-label="Help Guide"
            >
                <HelpCircle size={24} className="group-hover:rotate-12 transition-transform" />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up duration-300">
                    <div
                        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-fade-in-up delay-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <HelpCircle size={20} className="text-indigo-500" />
                                    How it Works
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                    Quick guide to using Odyssey
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                            <div className="opacity-0 animate-fade-in-up delay-100">
                                <Step
                                    icon={MapPin}
                                    title="1. Add Locations"
                                    description="Enter starting points (Origins) and destinations. You can type addresses or click directly on the map."
                                    color="indigo"
                                />
                            </div>

                            <div className="opacity-0 animate-fade-in-up delay-200">
                                <Step
                                    icon={Navigation}
                                    title="2. Choose Mode"
                                    description="Switch between 'One-to-Many' (one origin to multiple destinations) or 'Many-to-Many' (all origins to all destinations)."
                                    color="purple"
                                />
                            </div>

                            <div className="opacity-0 animate-fade-in-up delay-300">
                                <Step
                                    icon={Calculator}
                                    title="3. Calculate"
                                    description="Distances and routes are calculated automatically as you add valid locations. View results in the sidebar."
                                    color="emerald"
                                />
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity opacity-0 animate-fade-in-up delay-400"
                            >
                                Got it
                            </button>
                        </div>
                    </div>

                    {/* Click outside to close */}
                    <div className="absolute inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
};

const Step = ({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) => {
    // Map simplified color names to tailwind classes
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
        purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
        emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
    };

    return (
        <div className="flex gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};

export default HelpButton;
