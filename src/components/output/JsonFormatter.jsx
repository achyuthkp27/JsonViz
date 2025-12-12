import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

export function JsonFormatter({ data, isMinified }) {
    const [copied, setCopied] = useState(false);
    const formatted = React.useMemo(() => {
        if (!data) return '';
        return isMinified ? JSON.stringify(data) : JSON.stringify(data, null, 2);
    }, [data, isMinified]);

    const highlight = (json) => {
        if (!json) return '';

        const COLORS = [
            'text-indigo-500 dark:text-indigo-400',
            'text-emerald-500 dark:text-emerald-400',
            'text-amber-500 dark:text-amber-400',
            'text-rose-500 dark:text-rose-400',
            'text-cyan-500 dark:text-cyan-400'
        ];

        // Track bracket depth for rainbow coloring
        let depth = 0;

        // Expanded regex to capture brackets separately
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[\[\]\{\}])/g, (match) => {
            // Check for brackets
            if (/^[\[\{]$/.test(match)) {
                const col = COLORS[depth % COLORS.length];
                depth++;
                return `<span class="${col} font-bold opacity-80">${match}</span>`;
            }
            if (/^[\]\}]$/.test(match)) {
                depth--; // Decrement before using color for closing
                const col = COLORS[Math.max(0, depth) % COLORS.length];
                return `<span class="${col} font-bold opacity-80">${match}</span>`;
            }

            let cls = 'text-amber-600 dark:text-amber-400'; // number
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'text-indigo-600 dark:text-indigo-400 font-semibold'; // key
                } else {
                    cls = 'text-emerald-600 dark:text-emerald-400'; // string
                }
            } else if (/true|false/.test(match)) {
                cls = 'text-rose-600 dark:text-rose-400 font-bold'; // boolean
            } else if (/null/.test(match)) {
                cls = 'text-slate-500 font-bold'; // null
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatted);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([formatted], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative h-full flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    title="Copy"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
                <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    title="Download .json"
                >
                    <Download className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6 text-sm font-mono leading-relaxed scrollbar-thin">
                <div className="table w-full">
                    {formatted.split('\n').map((line, i) => (
                        <div key={i} className="table-row">
                            <span className="table-cell text-right pr-4 text-slate-300 dark:text-slate-600 select-none w-8 opacity-50">
                                {i + 1}
                            </span>
                            <span
                                className="table-cell whitespace-pre"
                                dangerouslySetInnerHTML={{ __html: highlight(line) || ' ' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
