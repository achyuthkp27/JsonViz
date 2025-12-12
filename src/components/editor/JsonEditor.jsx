import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { EditorBackdrop } from './EditorBackdrop';

export function JsonEditor({ value, onChange, onKeyDown, isError, errorLoc }) {
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef(null);
    const backdropRef = useRef(null);
    const charCount = value.length;
    const sizeKB = (new TextEncoder().encode(value).length / 1024).toFixed(2);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Sync scroll
    const handleScroll = (e) => {
        if (backdropRef.current) {
            backdropRef.current.scrollTop = e.target.scrollTop;
            backdropRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    const handleInternalKeyDown = (e) => {
        if (['{', '[', '"'].includes(e.key)) {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const char = e.key;
            const pair = char === '{' ? '}' : char === '[' ? ']' : '"';

            const newValue = value.substring(0, start) + char + pair + value.substring(end);
            onChange(newValue);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
                }
            }, 0);
        }
        onKeyDown?.(e);
    };

    // ... drop handlers ...
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => onChange(event.target.result);
            reader.readAsText(file);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative flex flex-col h-full bg-white/5 dark:bg-black/20 
                backdrop-blur-xl rounded-2xl border transition-all duration-300
                ${isError
                    ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] bg-red-500/5'
                    : isDragging
                        ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-[1.01] bg-indigo-500/10'
                        : 'border-white/20 dark:border-white/10 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:bg-white/10 dark:hover:bg-black/30'
                }
            `}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl animate-in fade-in duration-200">
                    <Upload className="w-16 h-16 text-indigo-500 mb-4 animate-bounce" />
                    <p className="text-xl font-bold text-slate-700 dark:text-slate-200">Drop JSON file here</p>
                </div>
            )}

            <div className="flex-1 relative overflow-hidden rounded-t-2xl flex group">
                <EditorBackdrop value={value} errorLoc={errorLoc} scrollRef={backdropRef} />

                {/* Placed ON TOP of backdrop. Text transparent. Caret visible. */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleInternalKeyDown}
                    onScroll={handleScroll}
                    spellCheck={false}
                    placeholder="// Paste your JSON here... or Drop a file"
                    className="absolute inset-0 w-full h-full p-6 pl-16 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed text-transparent caret-indigo-500 selection:bg-indigo-500/30 z-10 overflow-y-scroll scrollbar-thin"
                />
            </div>

            <div className="h-10 px-6 flex items-center justify-between border-t border-white/10 dark:border-white/5 text-xs font-mono text-slate-400 bg-white/5">
                <div className="flex gap-4">
                    <span>{charCount} chars</span>
                    <span>{sizeKB} KB</span>
                    {errorLoc && <span className="text-red-400">Error at Ln {errorLoc.line}, Col {errorLoc.column}</span>}
                </div>
                <div className="hidden sm:block opacity-60">
                    Tip: Ctrl+Enter to Format
                </div>
            </div>
        </div>
    );
}
