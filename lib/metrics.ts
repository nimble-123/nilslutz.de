export type Metric = { value: string | null; label: string }

const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&nbsp;': ' ' }

export function decodeEntities(input: string) {
  return input.replace(/&(lt|gt|amp|nbsp);/g, (m) => ENTITIES[m] ?? m)
}

/**
 * Splits a frontmatter metric like "-40% TCO" or "&lt; 200ms API Latency" into a big display
 * value and its caption, so posters can set the number huge. Metrics without a leading figure
 * ("Global Rollout (20+ countries)") return value null and are shown as text.
 */
export function parseMetric(raw: string): Metric {
  const text = decodeEntities(raw).trim()
  const match = text.match(/^([<>~≈+-]?\s?\d[\d.,]*\s?(?:%|ms|sec|s|x|k)?)\s+(.+)$/)
  if (!match) return { value: null, label: text }
  return { value: match[1].replace(/\s+/g, ' ').trim(), label: match[2].trim() }
}
