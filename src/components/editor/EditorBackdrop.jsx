import React from 'react';

/**
 * EditorBackdrop
 * Renders the "underneath" layer of the editor.
 * Responsible for displaying:
 * - Line numbers (Gutter)
 * - Error Highlights (Red underline)
 * - Tooltips
 * 
 * Must match the Textarea's font, size, and line-height EXACTLY.
 */
export function EditorBackdrop({ value, errorLoc, scrollRef }) {
    const lines = value.split('\n');

    // We only render the text up to the error point to position the highlight?
    // No, we render the full text as a "phantom" pre block.
    // Ideally we use a library for tokenization but for just "Red Underline Error" we can do this:
    // Render the text in a <pre>. Use a specific specific span for the error char.

    return (
        <div className="absolute inset-0 pointer-events-none flex font-mono text-sm leading-relaxed" aria-hidden="true">
            {/* Gutter (Line Numbers) */}
            <div className="w-10 pt-6 px-1 text-right text-slate-400 dark:text-slate-600 bg-white/5 dark:bg-black/10 select-none border-r border-white/10 dark:border-white/5 flex flex-col shrink-0">
                {lines.map((_, i) => (
                    <div key={i} className="h-[1.625rem] flex items-center justify-end pr-2 relative">
                        {/* 1.625rem (26px) must match leading-relaxed of textarea */}
                        <span className={errorLoc?.line === i + 1 ? 'text-red-500 font-bold' : ''}>{i + 1}</span>
                        {errorLoc?.line === i + 1 && (
                            <div className="absolute right-full mr-1 text-red-500">
                                •
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Code Layer (Mirror of Textarea) */}
            <div className="flex-1 relative overflow-hidden">
                <pre
                    ref={scrollRef}
                    className="absolute inset-0 p-6 m-0 overflow-y-scroll scrollbar-thin whitespace-pre-wrap break-words bg-transparent text-slate-800 dark:text-slate-200"
                >
                    {renderHighlightedText(value, errorLoc)}
                </pre>
            </div>
        </div>
    );
}

function renderHighlightedText(text, errorLoc) {
    if (!errorLoc) return text;

    const { index } = errorLoc;
    const before = text.substring(0, index);
    const errorChar = text.substring(index, index + 1) || ' '; // Handle EOF
    const after = text.substring(index + 1);

    return (
        <>
            {before}
            <span className="relative inline-block">
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-500/50 animate-pulse rounded-full" />
                <span className="relative z-10 decoration-wavy decoration-red-500 decoration-2 underline">{errorChar}</span>
                {/* Tooltip */}
                <span className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-100 z-50">
                    Expected {errorChar === '}' ? 'EOF' : 'token'}
                </span>
            </span>
            {after}
        </>
    );
}

// NOTE: leading-relaxed in Tailwind is 1.625.
// Textarea padding is p-6 (1.5rem = 24px).
// We need to match scroll positions perfectly.
