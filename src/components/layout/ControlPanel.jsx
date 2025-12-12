import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wand2,
    AlignLeft,
    Network,
    Workflow,
    ArrowDownAZ,
    ArrowUpAZ,
    Minimize2,
    ListTree,
    SlidersHorizontal,
    ChevronDown,
    FileJson,
    FileSpreadsheet,
    Download,
    Filter,
    Link as LinkIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function ControlPanel({ mode, onModeChange, onSortAsc, onSortDesc, onMinify, onAutoFix, onExportJson, onExportCsv, onShare, disabled }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const tabs = [
        { id: 'format', label: 'Code', icon: AlignLeft },
        { id: 'visualize', label: 'Tree', icon: ListTree },
        { id: 'transform', label: 'Query', icon: Filter },
        { id: 'flow', label: 'Flow', icon: Workflow },
    ];

    const actions = [
        { label: 'Auto Fix', icon: Wand2, onClick: onAutoFix, desc: 'Fix Quotes & Commas' },
        { label: 'Sort A-Z', icon: ArrowDownAZ, onClick: onSortAsc, desc: 'Ascending Order' },
        { label: 'Sort Z-A', icon: ArrowUpAZ, onClick: onSortDesc, desc: 'Descending Order' },
        { label: 'Minify', icon: Minimize2, onClick: onMinify, desc: 'Compact Single Line' },
        { label: 'Export JSON', icon: FileJson, onClick: onExportJson, desc: 'Download .json file' },
        { label: 'Export CSV', icon: FileSpreadsheet, onClick: onExportCsv, desc: 'Download .csv file' },
        { label: 'Share Link', icon: LinkIcon, onClick: onShare, desc: 'Copy URL to clipboard' },
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-4 mt-6 items-center justify-between z-[100] relative">
            {/* Glass Container for Tabs */}
            <div className="flex p-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl relative w-full sm:w-auto shadow-lg">
                {tabs.map((tab) => {
                    const isActive = mode === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !disabled && onModeChange(tab.id)}
                            disabled={disabled}
                            className={cn(
                                "relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium transition-all z-10 rounded-xl outline-none focus-visible:ring-2",
                                isActive ? "text-indigo-600 dark:text-indigo-300 shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/10",
                                disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab"
                                    className="absolute inset-0 bg-white/80 dark:bg-white/10 shadow-sm rounded-xl backdrop-blur-md"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon size={16} />
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Glass Actions Dropdown */}
            <div className="relative w-full sm:w-auto" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={cn(
                        "w-full sm:w-auto flex items-center justify-between sm:justify-center gap-2 px-5 py-3 rounded-2xl font-medium text-sm transition-all outline-none focus-visible:ring-2",
                        "bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg",
                        "hover:bg-white/20 dark:hover:bg-white/5 hover:border-indigo-500/30",
                        "text-slate-700 dark:text-slate-200 cursor-pointer",
                        isMenuOpen && "ring-2 ring-indigo-500/30"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={16} />
                        <span>Actions</span>
                    </div>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", isMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 bottom-full mb-3 w-full sm:w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden z-50 origin-bottom-right p-2 ring-1 ring-black/5"
                        >
                            {actions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        if (disabled) return;
                                        action.onClick();
                                        setIsMenuOpen(false);
                                    }}
                                    disabled={disabled}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group",
                                        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                        disabled ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-white dark:bg-slate-800 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:shadow-md"
                                    )}>
                                        <action.icon size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            disabled ? "text-slate-400" : "text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
                                        )}>
                                            {action.label}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                            {action.desc}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
