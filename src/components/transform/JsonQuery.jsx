import React, { useState, useEffect } from 'react';
import { runJsQuery, getJsonStats } from '../../utils/jsonUtils';
import { Play, AlertTriangle } from 'lucide-react';
import { JsonVisualizer } from '../output/JsonVisualizer';

export function JsonQuery({ data }) {
    const [query, setQuery] = useState('data');
    const [result, setResult] = useState(data);
    const [error, setError] = useState(null);

    const handleRun = () => {
        const { valid, result: res, error: err } = runJsQuery(data, query);
        if (valid) {
            setResult(res);
            setError(null);
        } else {
            setError(err);
        }
    };

    // Auto-run on mount or if needed? No, explicit run is safer/less spammy.
    // Actually user expects live feedback?
    // Let's do live feedback with debounce, or just run on Enter.

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Query Input Bar */}
            <div className="flex items-start gap-2 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                <div className="flex-1">
                    <label className="block text-xs font-mono text-slate-400 mb-1 ml-1">
                        JavaScript Query (variable: <code>data</code>)
                    </label>
                    <div className="relative group">
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    handleRun();
                                }
                            }}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none h-20"
                            placeholder="e.g. data.items.filter(i => i.id > 1)"
                        />
                        <button
                            onClick={handleRun}
                            className="absolute right-2 bottom-2 p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg shadow-lg transition-all active:scale-95"
                            title="Run Query (Ctrl+Enter)"
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>
                    {error && (
                        <div className="mt-2 flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                            <AlertTriangle size={12} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Output Area (Visualizer) */}
            <div className="flex-1 min-h-0">
                <JsonVisualizer data={result} />
            </div>
        </div>
    );
}
