import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/layout/Header';
import { JsonEditor } from './components/editor/JsonEditor';
import { OutputPanel } from './components/output/OutputPanel';
import { ControlPanel } from './components/layout/ControlPanel';
import { parseJson, sortKeys, getErrorSuggestion } from './utils/jsonUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle, GripVertical, AlertTriangle } from 'lucide-react';
import { GlobalSparkles } from './components/effects/GlobalSparkles';
import { TiltCard } from './components/effects/TiltCard';
import { SuccessOverlay } from './components/effects/SuccessOverlay';
import { GlitchOverlay } from './components/effects/GlitchOverlay';
import { BubbleParticles } from './components/effects/BubbleParticles';

const SAMPLES = {
  simple: JSON.stringify({ name: "John", type: "Tool", awesome: true }, null, 2),
  nested: JSON.stringify({ user: { id: 1, profile: { name: "Alice", roles: ["admin", "dev"] } }, settings: { dark: true } }, null, 2),
  array: JSON.stringify([{ id: 1, name: "Item 1" }, { id: 2, name: "Item 2" }], null, 2),
  complex: JSON.stringify({
    project: "JsonViz",
    version: 1.0,
    features: ["Format", "Visualize", "Animations"],
    contributors: [{ name: "You", commits: 100 }, { name: "Me", commits: 1 }],
    meta: { created: "2025", active: true, nothing: null }
  }, null, 2)
};

function Toast({ message, suggestion, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // 4s for errors/suggestions
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`px-6 py-4 rounded-xl shadow-2xl flex items-start gap-4 border border-white/20 backdrop-blur-2xl max-w-md ${type === 'error'
        ? 'bg-red-500/10 text-red-100 border-red-500/30 shadow-[0_8px_32px_rgba(239,68,68,0.2)]'
        : 'bg-emerald-500/10 text-emerald-100 border-emerald-500/30 shadow-[0_8px_32px_rgba(16,185,129,0.2)]'
        }`}
    >
      <div className="mt-1 shrink-0">
        {type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold text-sm">{message}</span>
        {suggestion && (
          <div className="flex items-start gap-1.5 mt-1 text-xs font-medium opacity-90 bg-black/5 dark:bg-white/5 p-2 rounded-lg">
            <AlertTriangle size={12} className="mt-0.5" />
            <span>{suggestion}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // -- Core State --
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [outputMode, setOutputMode] = useState('format');
  const [isMinified, setIsMinified] = useState(false);
  const [validation, setValidation] = useState({ valid: true, error: null, errorLoc: null });

  // -- Unified Feedback State --
  // status: 'idle' | 'success' | 'error'
  // message: string | null
  // suggestion: string | null
  const [feedback, setFeedback] = useState({ status: 'idle', message: null, suggestion: null });

  // -- Refs for Timers --
  const feedbackTimer = useRef(null);

  // -- Mouse / Bubble Logic --
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const mouseTimeout = useRef(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseMoving(true);
      if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
      mouseTimeout.current = setTimeout(() => setIsMouseMoving(false), 300);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
    }
  }, []);

  // -- Resizer Logic --
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback((e) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // -- Helper: Visual Triggers --
  const triggerSuccess = useCallback((msg) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    setFeedback({ status: 'success', message: msg, suggestion: null });

    feedbackTimer.current = setTimeout(() => {
      setFeedback(prev => prev.status === 'success' ? { ...prev, status: 'idle' } : prev);
    }, 1500);
  }, []);

  const triggerError = useCallback((msg, suggestion = null) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);

    setFeedback({ status: 'error', message: msg, suggestion });

    feedbackTimer.current = setTimeout(() => {
      setFeedback(prev => prev.status === 'error' ? { ...prev, status: 'idle' } : prev);
    }, 2500); // 2.5s for error reading
  }, []);

  const clearFeedback = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ status: 'idle', message: null, suggestion: null });
  }, []);

  // -- Handlers --
  const handleInputChange = useCallback((val) => {
    setInput(val);

    // Reset View State immediately on edit
    if (parsedData) setParsedData(null);
    setIsMinified(false);
    setOutputMode('format');
    clearFeedback();
  }, [parsedData, clearFeedback]);

  // Debounced Validation
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = parseJson(input);
      setValidation(result);
    }, 400); // 400ms delay

    return () => clearTimeout(timer);
  }, [input]);


  const handleValidation = useCallback((mode) => {
    if (!input.trim()) return;

    if (validation.valid) { // Use cached result
      setParsedData(validation.data);
      setOutputMode(mode);
      setIsMinified(false);
      triggerSuccess('Valid JSON!');
    } else {
      triggerError(validation.error, getErrorSuggestion(validation.error));
    }
  }, [input, validation, triggerSuccess, triggerError]);

  const handleSort = useCallback((direction = 'asc') => {
    if (!input.trim()) return;
    if (validation.valid) {
      const sorted = sortKeys(validation.data, direction);
      setParsedData(sorted);
      setIsMinified(false);
      setOutputMode('format');
      triggerSuccess(`Keys Sorted (${direction === 'asc' ? 'A-Z' : 'Z-A'})!`);
    } else {
      triggerError("Cannot Sort: Invalid JSON", "Fix the syntax errors before sorting.");
    }
  }, [input, validation, triggerSuccess, triggerError]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    if (validation.valid) {
      setParsedData(validation.data);
      setIsMinified(true);
      setOutputMode('format');
      triggerSuccess('Minified View!');
    } else {
      triggerError("Cannot Minify: Invalid JSON", "Fix the syntax errors before minifying.");
    }
  }, [input, validation, triggerSuccess, triggerError]);

  // On Mount: Load from URL
  useEffect(() => {
    if (window.location.hash.length > 1) {
      try {
        // Basic Base64 decode
        const decoded = atob(decodeURIComponent(window.location.hash.slice(1)));
        setInput(decoded);
        // We need to parse it to update state fully
        const result = parseJson(decoded);
        setValidation(result);
        if (result.valid) {
          setParsedData(result.data);
          setOutputMode('visualize');
        } else {
          console.warn("Loaded invalid JSON from URL");
        }
        triggerSuccess('Loaded from URL');
        // Clear hash to allow fresh state if needed? Or keep it? Keep it.
      } catch (e) {
        console.error("Hash decode failed", e);
        triggerError('Link Error', 'Failed to load JSON from URL');
      }
    }
  }, []); // Run once

  const handleShare = useCallback(() => {
    if (!input.trim()) return;
    try {
      const hash = encodeURIComponent(btoa(input));
      if (hash.length > 5000) {
        triggerError("Too Large", "JSON is too big to share via URL.");
        return;
      }
      const url = `${window.location.origin}${window.location.pathname}#${hash}`;
      navigator.clipboard.writeText(url);
      window.history.pushState(null, '', `#${hash}`);
      triggerSuccess('Link Copied!', 'Share this URL with others.');
    } catch (e) {
      triggerError('Share Failed', 'Could not generate link.');
    }
  }, [input, triggerSuccess, triggerError]);

  const handleAutoFix = useCallback(() => {
    if (!input.trim()) return;

    // Attempt repair
    const fixed = repairJson(input);

    // Validate result
    const result = parseJson(fixed);
    setValidation(result);

    if (result.valid) {
      setInput(JSON.stringify(result.data, null, 2));
      setParsedData(result.data);
      setOutputMode('format');
      setIsMinified(false);
      triggerSuccess('Auto-Fixed JSON!');
    } else {
      setInput(fixed);
      triggerError('Repair Failed', 'We fixed some issues, but manual correction is still needed.');
    }
  }, [input, triggerSuccess, triggerError]);

  const handleExportJson = useCallback(() => {
    if (!validation.valid) return triggerError("Invalid JSON", "Fix errors before exporting.");
    downloadFile(JSON.stringify(validation.data, null, 2), 'data.json', 'application/json');
    triggerSuccess('Downloaded JSON!');
  }, [validation, triggerSuccess, triggerError]);

  const handleExportCsv = useCallback(() => {
    if (!validation.valid) return triggerError("Invalid JSON", "Fix errors before exporting.");
    const csv = jsonToCsv(validation.data);
    downloadFile(csv, 'data.csv', 'text/csv');
    triggerSuccess('Downloaded CSV!');
  }, [validation, triggerSuccess, triggerError]);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleValidation('format');
    if (e.altKey && e.key === 'Enter') handleValidation('visualize');
  }, [handleValidation]);

  // Derived Values
  const isSuccess = feedback.status === 'success';
  const isError = feedback.status === 'error'; // Keep global error flash on manual action
  const hasSyntaxError = !validation.valid && input.trim().length > 0; // Local editor error state

  return (
    <div className={`
      relative min-h-screen transition-colors duration-700 overflow-hidden font-sans
      ${isSuccess ? 'bg-emerald-900/10' : ''}
      ${isError ? 'bg-red-900/10' : ''}
      ${isResizing ? 'cursor-col-resize select-none' : ''}
    `}>
      <GlobalSparkles />
      <BubbleParticles isPaused={isMouseMoving} />

      <SuccessOverlay show={isSuccess} />
      <GlitchOverlay show={isError} />

      <AnimatePresence>
        {feedback.message && feedback.status !== 'idle' && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] pointer-events-none w-full max-w-lg flex justify-center px-4">
            <Toast
              message={feedback.message}
              suggestion={feedback.suggestion}
              type={feedback.status}
              onClose={() => setFeedback(prev => ({ ...prev, message: null }))}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Background Flash Overlay */}
      <div
        className={`fixed inset-0 pointer-events-none transition-colors duration-500 z-0
          ${isSuccess ? 'bg-emerald-500/10' : 'bg-transparent'}
          ${isError ? 'bg-red-500/10' : 'bg-transparent'}
        `}
      />

      <Header theme={theme} toggleTheme={toggleTheme} onLoadSample={(key) => handleInputChange(SAMPLES[key])} />

      <main className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-screen pb-8 transition-all flex flex-col">
        <div
          ref={containerRef}
          className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-0 min-h-0"
          style={{ '--left-width': `${leftPanelWidth}%` }}
        >

          {/* Input Panel (Left on Desktop) */}
          <TiltCard className="relative h-[50vh] lg:h-full flex flex-col shrink-0 w-full lg:w-[var(--left-width)] z-10">
            <motion.div
              className="flex flex-col h-full"
              animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <JsonEditor
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                isError={hasSyntaxError || isError}
                errorLoc={validation.errorLoc}
              />

              <div className="flex-none pt-2">
                <ControlPanel
                  mode={outputMode}
                  onModeChange={handleValidation}
                  onSortAsc={() => handleSort('asc')}
                  onSortDesc={() => handleSort('desc')}
                  onMinify={handleMinify}
                  onAutoFix={handleAutoFix}
                  onExportJson={handleExportJson}
                  onExportCsv={handleExportCsv}
                  onShare={handleShare}
                  disabled={!input.trim()}
                />
              </div>
            </motion.div>
          </TiltCard>

          {/* Resizer Handle (Desktop Only) */}
          <div
            className="hidden lg:flex items-center justify-center w-4 -ml-2 z-20 cursor-col-resize group order-2 relative"
            onMouseDown={startResizing}
          >
            <div className="w-1 h-12 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 transition-colors flex items-center justify-center">
              <GripVertical size={10} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Output Panel (Right on Desktop) */}
          <div className="flex-1 min-w-0 h-full hidden lg:block order-3 relative z-0">
            <TiltCard>
              <OutputPanel data={parsedData} mode={outputMode} isMinified={isMinified} />
            </TiltCard>
          </div>

          {/* Mobile Output: Stacked below input */}
          <div className="lg:hidden h-[50vh] shrink-0 mt-4 order-3">
            <TiltCard>
              <OutputPanel data={parsedData} mode={outputMode} isMinified={isMinified} />
            </TiltCard>
          </div>

        </div>
      </main>
    </div>
  );
}
