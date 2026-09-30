import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Content files open with their title as a Markdown `# heading`; the page already
 * renders that title as its <h1>, so drop the duplicate leading line.
 */
export function stripLeadingTitle(source: string) {
  return source.replace(/^\s*#\s[^\n]*\n?/, '')
}
