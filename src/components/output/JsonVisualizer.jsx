import React, { useState, useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronRight, Search, ImageIcon, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
// LinkIcon, Download removed as unused? Check usage. 
// getJsonStats removed.

// --- Helpers ---
const getType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

const isColor = (str) => typeof str === 'string' && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(str);
const isImageUrl = (str) => typeof str === 'string' && /^https?:\/\/.*\.(jpeg|jpg|gif|png|webp|svg)$/i.test(str);
const isTimestamp = (val) => {
    if (typeof val === 'number' && val > 946684800000 && val < 4102444800000) return true; // Unix ms between 2000-2100 roughly
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) return !isNaN(Date.parse(val));
    return false;
};
const formatTimestamp = (val) => new Date(val).toLocaleString();

// --- Flattening Logic ---
// --- Flattening Logic ---
const checkMatch = (key, value, query) => {
    if (!query) return false;
    const q = query.toLowerCase();
    if (String(key).toLowerCase().includes(q)) return true;
    if (value !== null && typeof value !== 'object' && String(value).toLowerCase().includes(q)) return true;
    return false;
};

const hasDeepMatch = (data, query) => {
    if (!query) return false;
    // Check self
    // Note: In recursion, 'data' is the value. Keys are checked by parent loop or this helper needs partial redesign.
    // Standard approach: check value recursively.

    if (data !== null && typeof data === 'object') {
        return Object.entries(data).some(([k, v]) => {
            if (checkMatch(k, v, query)) return true;
            return hasDeepMatch(v, query);
        });
    }
    return false;
};

const flattenNode = (key, value, depth, path, expanded, result, searchQuery, filterMode) => {
    const type = getType(value);
    const isObject = type === 'object' || type === 'array';
    const isEmpty = isObject && Object.keys(value).length === 0;

    let isMatch = false;
    let containsMatch = false;

    if (searchQuery) {
        isMatch = checkMatch(key, value, searchQuery);
        if (isObject && !isEmpty) {
            containsMatch = hasDeepMatch(value, searchQuery);
        }
    }

    // Filter Logic:
    // If filterMode is ON, only show if:
    // 1. It matches itself
    // 2. It contains a match (so acts as a path)
    // 3. (Optional) If parent matched? No, we filter strictly.
    const shouldShow = !filterMode || !searchQuery || isMatch || containsMatch;

    if (!shouldShow) return;

    // Auto-expand if filtering and matches deep
    const isExpandedState = expanded.has(path);
    // If filtering, we generally want to see the results, so auto-expand path to matches
    const effectiveExpanded = isExpandedState || (filterMode && containsMatch);

    result.push({
        path,
        key,
        value,
        depth,
        type,
        isObject,
        isEmpty,
        isExpanded: effectiveExpanded,
        isMatch // Pass for highlighting
    });

    if (isObject && effectiveExpanded) {
        Object.entries(value).forEach(([k, v]) => {
            flattenNode(Array.isArray(value) ? Number(k) : k, v, depth + 1, `${path}.${k}`, expanded, result, searchQuery, filterMode);
        });
    }
};

const useFlattenedData = (data, expanded, searchQuery, filterMode) => {
    return useMemo(() => {
        if (!data) return [];
        const result = [];
        // Root always checks deep match if filtering
        const rootHasMatch = filterMode && searchQuery ? hasDeepMatch(data, searchQuery) : true;

        if (!filterMode || !searchQuery || rootHasMatch) {
            flattenNode('root', data, 0, 'root', expanded, result, searchQuery, filterMode);
        }
        return result;
    }, [data, expanded, searchQuery, filterMode]);
};


// --- Row Component ---
const Row = ({ data, context }) => {
    const { toggle } = context;
    const { path, key, value, depth, type, isObject, isEmpty, isExpanded, isMatch } = data;

    // Match highlighting (calculated in flattenNode now, but we can double check or just use flag)
    // const isMatch = ... passed from data

    const handleToggle = (e) => {
        e.stopPropagation();
        toggle(path);
    };

    return (
        <div
            className="flex items-center text-sm font-mono leading-relaxed py-0.5 hover:bg-slate-100/10 dark:hover:bg-white/5 mx-2 rounded transition-colors cursor-default group"
            style={{ paddingLeft: depth * 20 }}
            onClick={isObject && !isEmpty ? handleToggle : undefined}
        >
            {/* Expander */}
            <div className="w-5 flex-shrink-0 flex justify-center">
                {isObject && !isEmpty && (
                    <motion.div
                        initial={false}
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        className="text-slate-400 hover:text-indigo-500 cursor-pointer"
                    >
                        <ChevronRight size={14} />
                    </motion.div>
                )}
            </div>

            {/* Key */}
            {key !== 'root' && (
                <span className={`mr-2 flex-shrink-0 ${isMatch ? 'bg-yellow-500/20 text-yellow-500 font-bold px-1 rounded' : 'text-indigo-600 dark:text-indigo-400 font-medium'}`}>
                    {key}:
                </span>
            )}

            {/* Value */}
            {isObject ? (
                <span className="text-slate-500 italic text-xs">
                    {type === 'array' ? `Array[${value.length}]` : `Object{${Object.keys(value).length}}`}
                    {isEmpty && ' (Empty)'}
                </span>
            ) : (
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`
                        truncate
                        ${type === 'string' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                        ${type === 'number' ? 'text-amber-600 dark:text-amber-400' : ''}
                        ${type === 'boolean' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}
                        ${type === 'null' ? 'text-slate-400 font-bold' : ''}
                    `}>
                        {type === 'string' ? `"${value}"` : String(value)}
                    </span>

                    {/* Rich Features */}
                    {isColor(value) && (
                        <div className="w-3 h-3 rounded-full border border-white/20 ml-1" style={{ background: value }} title="Color Preview" />
                    )}
                    {isImageUrl(value) && (
                        <ImageIcon size={14} className="text-slate-400 hover:text-indigo-500 cursor-help ml-1" />
                    )}
                    {isTimestamp(value) && (
                        <div className="group/time relative ml-1">
                            <Calendar size={14} className="text-slate-400 hover:text-indigo-500 cursor-help" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover/time:opacity-100 pointer-events-none z-50">
                                {formatTimestamp(value)}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export function JsonVisualizer({ data }) {
    const [query, setQuery] = useState('');
    const [filterMode, setFilterMode] = useState(false);
    const [expanded, setExpanded] = useState(new Set(['root']));

    // Flatten rows
    const rows = useFlattenedData(data, expanded, query, filterMode);

    const toggle = useCallback((path) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
                // Optional: Collapse all children too? No, keep state.
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const expandAll = () => {
        // Collect all paths
        const allPaths = new Set();
        const traverse = (node, path) => {
            allPaths.add(path);
            if (node && typeof node === 'object') {
                Object.entries(node).forEach(([k, v]) => traverse(v, `${path}.${k}`));
            }
        };
        traverse(data, 'root');
        setExpanded(allPaths);
    };

    const collapseAll = () => setExpanded(new Set(['root']));

    return (
        <div className="flex flex-col h-full bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden shadow-xl group/card">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 dark:border-white/5 flex flex-col gap-3 bg-white/5 relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        Tree Explorer <span className="text-xs font-normal text-slate-400">({rows.length} rows visible)</span>
                    </h3>

                    <div className="flex items-center gap-2">
                        <button onClick={expandAll} className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-400 hover:text-indigo-400 transition-colors">Expand All</button>
                        <button onClick={collapseAll} className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-400 hover:text-indigo-400 transition-colors">Collapse All</button>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search keys..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />

                    <button
                        onClick={() => setFilterMode(!filterMode)}
                        title={filterMode ? "Show All" : "Filter Matches"}
                        className={`absolute right-1.5 top-1.5 p-1 rounded transition-colors ${filterMode
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/10'
                            }`}
                    >
                        <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* Virtualized List */}
            <div className="flex-1 relative z-10">
                <Virtuoso
                    data={rows}
                    itemContent={(index, item) => <Row data={item} context={{ toggle }} />}
                    className="scrollbar-thin"
                />
            </div>
        </div>
    );
}
