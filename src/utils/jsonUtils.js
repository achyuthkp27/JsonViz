export function parseJson(input) {
    try {
        const data = JSON.parse(input);
        return { valid: true, data, error: null, errorLoc: null };
    } catch (e) {
        let errorLoc = null;
        const msg = e.message;
        // V8/Chrome Error Format: "Unexpected token X in JSON at position Y"
        const match = msg.match(/at position (\d+)/);
        if (match) {
            const index = parseInt(match[1], 10);
            const lines = input.substring(0, index).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            errorLoc = { index, line, column };
        }
        return { valid: false, data: null, error: e.message, errorLoc };
    }
}


export function runJsQuery(data, query) {
    try {
        if (!query.trim()) return { valid: true, result: data };
        // Allow user to write just "data.filter..." or chaining
        // We'll wrap in a Function.
        // Safety Warning: This allows executing arbitrary Code derived from text.
        // Since it's client-side only (no server), XSS risk is self-inflicted but we should warn.
        const func = new Function('data', `return ${query}`);
        const res = func(data);
        return { valid: true, result: res };
    } catch (e) {
        return { valid: false, error: e.message };
    }
}

export function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function jsonToCsv(json) {
    const items = Array.isArray(json) ? json : [json];
    if (items.length === 0) return '';

    // Helper to flatten a single object
    const flatten = (obj, prefix = '', res = {}) => {
        if (obj === null || typeof obj !== 'object') {
            res[prefix] = obj;
            return res;
        }
        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
            const val = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                flatten(val, newKey, res);
            } else {
                res[newKey] = val;
            }
        }
        return res;
    };

    const flattenedItems = items.map(item => flatten(item));
    const keys = Array.from(new Set(flattenedItems.flatMap(Object.keys))).sort();

    const header = keys.join(',');
    const rows = flattenedItems.map(item => {
        return keys.map(key => {
            const val = item[key];
            if (val === null || val === undefined) return '';

            let str;
            if (typeof val === 'object') {
                str = JSON.stringify(val);
            } else {
                str = String(val);
            }
            return `"${str.replace(/"/g, '""')}"`;
        }).join(',');
    });

    return [header, ...rows].join('\n');
}


export function getJsonStats(data) {
    let keys = 0;
    let arrays = 0;
    let objects = 0;
    let maxDepth = 0;

    function traverse(obj, depth) {
        if (depth > maxDepth) maxDepth = depth;

        if (Array.isArray(obj)) {
            arrays++;
            obj.forEach(item => traverse(item, depth + 1));
        } else if (obj !== null && typeof obj === 'object') {
            objects++;
            keys += Object.keys(obj).length;
            Object.VALUES?.(obj).forEach(val => traverse(val, depth + 1));
            // Safe fallback if Object.values not supported (unlikely in modern envs) but let's just use loop
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    traverse(obj[key], depth + 1);
                }
            }
        }
    }

    traverse(data, 1);
    return { keys, arrays, objects, maxDepth };
}

export function sortKeys(obj, direction = 'asc') {
    if (Array.isArray(obj)) {
        return obj.map(item => sortKeys(item, direction));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj)
            .sort((a, b) => {
                if (direction === 'desc') {
                    return b.localeCompare(a);
                }
                return a.localeCompare(b);
            })
            .reduce((acc, key) => {
                acc[key] = sortKeys(obj[key], direction);
                return acc;
            }, {});
    }
    return obj;
}
export function getErrorSuggestion(errorMsg) {
    if (!errorMsg) return "Unknown error.";

    const lower = errorMsg.toLowerCase();

    if (lower.includes("unexpected token }")) return "Extra comma at end of list? or Mismatched braces?";
    if (lower.includes("unexpected token ]")) return "Extra comma? or Mismatched brackets?";
    if (lower.includes("unexpected token ,")) return "Double comma? or missing value?";
    if (lower.includes("unexpected token")) return "Check for missing quotes around keys, or missing commas.";
    if (lower.includes("end of json input")) return "Incomplete JSON. Did you close all { } and [ ]?";
    if (lower.includes("expected property name")) return "Keys must be in double quotes.";
    if (lower.includes("unexpected number")) return "Numbers shouldn't be keys or unquoted values in specific spots.";

    return "Check your syntax for common JSON issues like missing quotes or commas.";
}
