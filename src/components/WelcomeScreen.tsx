import React from 'react';
import { Logo } from './Logo';
import { ArrowRight, Map, Share2, Layout } from 'lucide-react';

interface WelcomeScreenProps {
    onStart: () => void;
}


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-50/50 dark:bg-black/50 backdrop-blur-xl animate-fade-in-up delay-100">
            <div className="w-full max-w-md p-1 animate-fade-in-up delay-100">
                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 ring-1 ring-zinc-900/5 dark:ring-white/10">

                    {/* Background Gradient Decoration */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-700"></div>

                    <div className="relative p-8 flex flex-col items-center text-center">

                        <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 ring-1 ring-zinc-200 dark:ring-zinc-700/50 shadow-sm opacity-0 animate-fade-in-up delay-100">
                            <Logo size={48} />
                        </div>

                        <h1 className="text-3xl font-bold dark:!text-white mb-2 tracking-tight opacity-0 animate-fade-in-up delay-150">
                            Welcome to Odyssey
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-300 mb-8 text-base leading-relaxed opacity-0 animate-fade-in-up delay-200">
                            The ultimate tool for calculating distances between multiple locations with precision and style.
                        </p>

                        <div className="w-full space-y-3 mb-8">
                            <div className="opacity-0 animate-fade-in-up delay-300">
                                <FeatureRow icon={Map} text="Interactive map interface" />
                            </div>
                            <div className="opacity-0 animate-fade-in-up delay-400">
                                <FeatureRow icon={Share2} text="Multi-point routing" />
                            </div>
                            <div className="opacity-0 animate-fade-in-up delay-500">
                                <FeatureRow icon={Layout} text="Beautiful data visualization" />
                            </div>
                        </div>

                        <button
                            onClick={onStart}
                            className="group relative w-full flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-black px-6 py-3.5 rounded-xl font-medium overflow-hidden transition-shadow duration-200 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] opacity-0 animate-fade-in-up delay-700"
                        >
                            <div className="absolute inset-0 w-full h-full bg-emerald-500 origin-left transform transition-transform duration-300 ease-out -translate-x-full group-hover:translate-x-0" />
                            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-200">
                                Get Started
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const FeatureRow = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50">
        <Icon size={18} className="text-indigo-500 dark:text-indigo-400" />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-200">{text}</span>
    </div>
);

export default WelcomeScreen;
