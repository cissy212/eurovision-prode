import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Generate a short human-friendly invite code */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Scoring: +1 for top-10, +2 bonus for exact rank */
export function computeUserScore(
  predictions: { rank: number; contestant_id: string }[],
  results: { rank: number; contestant_id: string }[]
): { total_score: number; exact_matches: number; in_top10: number } {
  const resultMap = new Map(results.map((r) => [r.contestant_id, r.rank]))
  const resultContestants = new Set(results.map((r) => r.contestant_id))

  let in_top10 = 0
  let exact_matches = 0

  for (const pred of predictions) {
    if (resultContestants.has(pred.contestant_id)) {
      in_top10++
      if (resultMap.get(pred.contestant_id) === pred.rank) {
        exact_matches++
      }
    }
  }

  const total_score = in_top10 * 1 + exact_matches * 2
  return { total_score, exact_matches, in_top10 }
}
