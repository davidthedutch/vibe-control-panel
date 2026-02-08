/**
 * Terminal output parser
 * Detects errors, warnings, and extracts useful information from terminal output
 */

export interface ParsedOutput {
  hasError: boolean;
  hasWarning: boolean;
  errorMessage?: string;
  warningMessage?: string;
  filesChanged?: string[];
  componentsCreated?: string[];
}

// Common error patterns
const ERROR_PATTERNS = [
  /error:/i,
  /failed:/i,
  /exception:/i,
  /fatal:/i,
  /cannot find/i,
  /no such file/i,
  /permission denied/i,
  /syntax error/i,
  /module not found/i,
  /ENOENT/i,
  /EACCES/i,
  /npm ERR!/i,
  /yarn error/i,
  /pnpm ERR!/i,
  /build failed/i,
  /compilation failed/i,
];

// Common warning patterns
const WARNING_PATTERNS = [
  /warning:/i,
  /warn:/i,
  /deprecated/i,
  /could not/i,
  /missing/i,
];

// File change patterns
const FILE_PATTERNS = [
  /created?\s+(?:file\s+)?(.+\.(?:tsx?|jsx?|css|json|md))/i,
  /modified?\s+(?:file\s+)?(.+\.(?:tsx?|jsx?|css|json|md))/i,
  /updated?\s+(?:file\s+)?(.+\.(?:tsx?|jsx?|css|json|md))/i,
  /\+\s+(.+\.(?:tsx?|jsx?|css|json|md))/,
  /→\s+(.+\.(?:tsx?|jsx?|css|json|md))/,
];

// Component creation patterns
const COMPONENT_PATTERNS = [
  /creating\s+(?:component\s+)?(\w+)/i,
  /created\s+(?:component\s+)?(\w+)/i,
  /generating\s+(?:component\s+)?(\w+)/i,
  /\+\s+src\/components\/.*\/(\w+)\.tsx/,
];

/**
 * Parse terminal output and extract meaningful information
 */
export function parseTerminalOutput(output: string): ParsedOutput {
  const result: ParsedOutput = {
    hasError: false,
    hasWarning: false,
    filesChanged: [],
    componentsCreated: [],
  };

  // Split into lines for analysis
  const lines = output.split('\n');

  for (const line of lines) {
    // Strip ANSI color codes for pattern matching
    const cleanLine = stripAnsiCodes(line);

    // Check for errors
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.test(cleanLine)) {
        result.hasError = true;
        if (!result.errorMessage) {
          result.errorMessage = extractErrorMessage(cleanLine);
        }
        break;
      }
    }

    // Check for warnings (only if no error found)
    if (!result.hasError) {
      for (const pattern of WARNING_PATTERNS) {
        if (pattern.test(cleanLine)) {
          result.hasWarning = true;
          if (!result.warningMessage) {
            result.warningMessage = extractWarningMessage(cleanLine);
          }
          break;
        }
      }
    }

    // Extract file changes
    for (const pattern of FILE_PATTERNS) {
      const match = cleanLine.match(pattern);
      if (match && match[1]) {
        const fileName = match[1].trim();
        if (!result.filesChanged!.includes(fileName)) {
          result.filesChanged!.push(fileName);
        }
      }
    }

    // Extract component creations
    for (const pattern of COMPONENT_PATTERNS) {
      const match = cleanLine.match(pattern);
      if (match && match[1]) {
        const componentName = match[1].trim();
        if (!result.componentsCreated!.includes(componentName)) {
          result.componentsCreated!.push(componentName);
        }
      }
    }
  }

  return result;
}

/**
 * Strip ANSI color codes from a string
 */
function stripAnsiCodes(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Extract a clean error message from a line
 */
function extractErrorMessage(line: string): string {
  const cleanLine = stripAnsiCodes(line).trim();

  // Try to extract the message after common error prefixes
  const patterns = [
    /error:\s*(.+)/i,
    /failed:\s*(.+)/i,
    /exception:\s*(.+)/i,
    /fatal:\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanLine.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Return the whole line if no pattern matched
  return cleanLine.substring(0, 100); // Limit length
}

/**
 * Extract a clean warning message from a line
 */
function extractWarningMessage(line: string): string {
  const cleanLine = stripAnsiCodes(line).trim();

  // Try to extract the message after common warning prefixes
  const patterns = [
    /warning:\s*(.+)/i,
    /warn:\s*(.+)/i,
    /deprecated:\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = cleanLine.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Return the whole line if no pattern matched
  return cleanLine.substring(0, 100); // Limit length
}

/**
 * Check if output indicates a successful operation
 */
export function isSuccessOutput(output: string): boolean {
  const successPatterns = [
    /✓|✔/,
    /success/i,
    /completed/i,
    /done/i,
    /built successfully/i,
    /compiled successfully/i,
  ];

  const cleanOutput = stripAnsiCodes(output);

  return successPatterns.some((pattern) => pattern.test(cleanOutput));
}

/**
 * Extract build/compile statistics from output
 */
export function extractBuildStats(output: string): {
  duration?: string;
  fileCount?: number;
  size?: string;
} {
  const stats: {
    duration?: string;
    fileCount?: number;
    size?: string;
  } = {};

  const cleanOutput = stripAnsiCodes(output);

  // Extract duration (e.g., "in 2.5s", "1.2s", "500ms")
  const durationMatch = cleanOutput.match(/(?:in\s+)?(\d+(?:\.\d+)?(?:s|ms))/);
  if (durationMatch) {
    stats.duration = durationMatch[1];
  }

  // Extract file count (e.g., "12 files", "compiled 45 modules")
  const fileCountMatch = cleanOutput.match(/(\d+)\s+(?:files?|modules?)/i);
  if (fileCountMatch) {
    stats.fileCount = parseInt(fileCountMatch[1], 10);
  }

  // Extract size (e.g., "125 KB", "2.5 MB")
  const sizeMatch = cleanOutput.match(/(\d+(?:\.\d+)?)\s*(?:KB|MB|GB)/i);
  if (sizeMatch) {
    stats.size = sizeMatch[0];
  }

  return stats;
}
