import { getToday } from '../utils/date'
import { eventPointsOf, getDrlItemId } from '../utils/drl'
import type { DrlCounts } from '../types/drl'
import type { ClubEvent } from '../types/event'
import { http } from './http'
import { getAllRegistrations } from './registrationService'

/**
 * Điểm rèn luyện từ sự kiện CLB của từng sinh viên (userId -> điểm).
 * Quy ước: đã đăng ký và sự kiện đã diễn ra (ngày < hôm nay) thì được tính là đã tham dự.
 * Mỗi sự kiện +2 điểm vào mục của sự kiện (1.1, 3.1 hoặc 3.2), mỗi mục có điểm tối đa riêng.
 */
export async function getEventPointsByUser(): Promise<Map<string, number>> {
  const [registrations, events] = await Promise.all([
    getAllRegistrations(),
    http.get<ClubEvent[]>('/events').then((response) => response.data),
  ])
  const today = getToday()
  const pastEvents = new Map(events.filter((event) => event.date < today).map((event) => [event.id, event]))

  const countsByUser = new Map<string, DrlCounts>()
  for (const item of registrations) {
    const event = pastEvents.get(item.eventId)
    if (!event) continue
    const counts = countsByUser.get(item.userId) ?? {}
    const id = getDrlItemId(event)
    counts[id] = (counts[id] ?? 0) + 1
    countsByUser.set(item.userId, counts)
  }

  const points = new Map<string, number>()
  for (const [userId, counts] of countsByUser) {
    points.set(userId, eventPointsOf(counts))
  }
  return points
}
