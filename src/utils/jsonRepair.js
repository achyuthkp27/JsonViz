/**
 * Attempts to repair malformed JSON strings.
 * Handles:
 * - Trailing commas
 * - Single quotes
 * - Unquoted keys
 * - Missing closing braces/brackets
 */
export function repairJson(input) {
    if (!input || !input.trim()) return input;

    let fixed = input;

    // 1. Remove trailing commas before closing braces/brackets
    // matches: , } or , ] with optional whitespace
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');

    // 2. Fix single quotes to double quotes for keys and values
    // This is tricky as ' might be in a string. 
    // Simple heuristic: if it looks like 'key': or 'value', replace with "
    // We'll replace start/end quotes of likely strings.
    // Warning: This might break strings containing apostrophes. 
    // Safe approach: Replace ' that are around expected JSON tokens.

    // Replace 'key':
    fixed = fixed.replace(/'([^']+)':/g, '"$1":');
    // Replace :'value' (simple no-space)
    fixed = fixed.replace(/: '([^']+)'/g, ': "$1"');
    // Replace :'value' (with space)
    fixed = fixed.replace(/:\s*'([^']+)'/g, ': "$1"');

    // 3. Quote unquoted keys (e.g., key: "value" -> "key": "value")
    // Matches word followed by colon, not in quotes. 
    // Regex roughly: (start of line or punctuation) whitespace key whitespace :
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    // 4. Balance Braces/Brackets
    let openBraces = (fixed.match(/{/g) || []).length;
    let closeBraces = (fixed.match(/}/g) || []).length;
    let openBrackets = (fixed.match(/\[/g) || []).length;
    let closeBrackets = (fixed.match(/]/g) || []).length;

    while (openBraces > closeBraces) {
        fixed += '}';
        closeBraces++;
    }

    while (openBrackets > closeBrackets) {
        fixed += ']';
        closeBrackets++;
    }

    return fixed;
}
