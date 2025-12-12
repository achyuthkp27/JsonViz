import React from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

export function Header({ theme, toggleTheme, onLoadSample }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-white/20 dark:border-slate-800/50 shadow-sm transition-colors duration-500">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-xl relative group">
                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
                        JSON Studio
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Premium JSON Tooling
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <select
                    onChange={(e) => {
                        if (e.target.value) {
                            onLoadSample(e.target.value);
                            e.target.value = ""; // Reset
                        }
                    }}
                    className="hidden md:block text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-600 dark:text-slate-300 transition-colors hover:border-indigo-400 cursor-pointer"
                    defaultValue=""
                >
                    <option value="" disabled>Load Sample</option>
                    <option value="simple">Simple Object</option>
                    <option value="nested">Nested Structure</option>
                    <option value="array">Array of Objects</option>
                    <option value="complex">Complex Data</option>
                </select>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative overflow-hidden group"
                    aria-label="Toggle Theme"
                >
                    <div className="relative z-10">
                        {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-slate-200 group-hover:text-white transition-colors" />
                        ) : (
                            <Sun className="w-5 h-5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-700/50 scale-0 group-hover:scale-100 transition-transform rounded-full" />
                </button>
            </div>
        </header>
    );
}
