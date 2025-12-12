import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JsonFormatter } from './JsonFormatter';
import { JsonVisualizer } from './JsonVisualizer';
import { JsonGraph } from './JsonGraph';
import { JsonQuery } from '../transform/JsonQuery';
import { Box } from 'lucide-react';

export function OutputPanel({ data, mode, isMinified }) {
    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                <Box className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Ready for Input</p>
                <p className="text-sm opacity-70 mt-2 text-center max-w-xs">
                    Enter your JSON on the left and press Format or Visualize.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full relative">
            {mode === 'visualize' ? (
                <JsonVisualizer data={data} key="vis" />
            ) : mode === 'transform' ? (
                <JsonQuery data={data} key="query" />
            ) : mode === 'flow' ? (
                <JsonGraph data={data} key="flow" />
            ) : (
                <JsonFormatter data={data} isMinified={isMinified} key="fmt" />
            )}
        </div>
    );
}
