import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
    return (
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white/80 dark:bg-black/50 relative overflow-hidden backdrop-blur-md transition-colors duration-300">
            <div className="flex items-center gap-4 relative z-10">
                {/* Subtle glow effect behind logo */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none rounded-full -translate-x-10 -translate-y-10"></div>

                <div className="relative z-10 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(79,70,229,0.15)] backdrop-blur-sm">
                    <Logo size={28} />
                </div>

                <div className="flex flex-col relative z-10">
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-indigo-800 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-indigo-200">
                        Odyssey
                    </h1>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium tracking-widest uppercase ml-0.5">
                        Distance Locator
                    </span>
                </div>
            </div>

            <div className="relative z-10">
                <ThemeToggle />
            </div>
        </div>
    );
};
