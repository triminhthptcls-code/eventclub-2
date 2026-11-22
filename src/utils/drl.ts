import { DEFAULT_DRL_ITEM, DRL_GROUPS, DRL_ITEMS, MAX_POINTS, POINTS_PER_EVENT } from '../data/drlCriteria'
import type { ClubEvent } from '../types/event'
import type { DrlCounts, DrlEventItemId, DrlGroupResult, DrlRow, DrlSummary } from '../types/drl'

/** Mục ĐRL của một sự kiện; sự kiện cũ chưa có thì tính vào mục mặc định */
export function getDrlItemId(event: Pick<ClubEvent, 'drlItem'>): DrlEventItemId {
  return event.drlItem ?? DEFAULT_DRL_ITEM
}

/** Đếm số sự kiện theo từng mục ĐRL */
export function countByItem(events: Pick<ClubEvent, 'drlItem'>[]): DrlCounts {
  const counts: DrlCounts = {}
  for (const event of events) {
    const id = getDrlItemId(event)
    counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
}

/** Điểm của một mục: mặc định đủ điểm, từ sự kiện thì 2 điểm/lần (không vượt tối đa), còn lại là 0 */
function scoreRow(id: string, counts: DrlCounts): DrlRow {
  const item = DRL_ITEMS.find((candidate) => candidate.id === id)
  if (!item) throw new Error(`Không có mục ĐRL ${id}`)
  if (item.source === 'base') return { item, count: 0, points: item.max }
  if (item.source === 'manual') return { item, count: 0, points: 0 }
  const count = counts[id as DrlEventItemId] ?? 0
  return { item, count, points: Math.min(item.max, count * POINTS_PER_EVENT) }
}

/** Tính điểm rèn luyện theo từng mục, từng nhóm (có áp dụng điểm tối đa của nhóm) */
export function summarizeDrl(counts: DrlCounts): DrlSummary {
  const groups: DrlGroupResult[] = DRL_GROUPS.map((group) => {
    const rows = DRL_ITEMS.filter((item) => item.group === group.id).map((item) =>
      scoreRow(item.id, counts),
    )
    const sum = rows.reduce((total, row) => total + row.points, 0)
    return { group, rows, points: Math.min(group.max, sum) }
  })
  const total = groups.reduce((sum, result) => sum + result.points, 0)
  return { groups, total: Math.min(MAX_POINTS, total) }
}

/** Điểm chỉ tính từ sự kiện CLB (các mục 1.1, 3.1, 3.2), đã áp dụng điểm tối đa từng mục */
export function eventPointsOf(counts: DrlCounts): number {
  return DRL_ITEMS.filter((item) => item.source === 'event').reduce(
    (sum, item) => sum + scoreRow(item.id, counts).points,
    0,
  )
}
