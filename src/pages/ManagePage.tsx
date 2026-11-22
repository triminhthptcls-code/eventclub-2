import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ClubIcon from '../components/ClubIcon'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import SeatBadge from '../components/SeatBadge'
import { SCHOOL_ID, getClub } from '../data/clubs'
import { useAuth } from '../hooks/useAuth'
import { getEventsByClub } from '../services/eventService'
import { getMembershipsByClub } from '../services/membershipService'
import { getEventPointsByUser } from '../services/pointsService'
import type { Membership } from '../types/auth'
import type { EventWithSeats } from '../types/event'
import { getErrorMessage } from '../utils/apiError'
import { formatDate } from '../utils/date'
import { buttonClasses } from '../utils/ui'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success'
      events: EventWithSeats[]
      members: Membership[]
      attended: Map<string, number>
    }

/** Trang quản lý của tài khoản CLB: sự kiện của CLB và danh sách thành viên */
export default function ManagePage() {
  const { user } = useAuth()
  const clubId = user?.clubId ?? ''
  const club = getClub(clubId)
  const isSchool = clubId === SCHOOL_ID
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let ignore = false
    Promise.all([getEventsByClub(clubId), getMembershipsByClub(clubId), getEventPointsByUser()])
      .then(([events, members, attended]) => {
        if (!ignore) setState({ status: 'success', events, members, attended })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', message: getErrorMessage(error) })
      })
    return () => {
      ignore = true
    }
  }, [clubId, attempt])

  if (state.status === 'loading') return <Loading />
  if (state.status === 'error') return <ErrorMessage message={state.message} onRetry={reload} />

  const heading = 'mb-3 border-l-4 border-ftu bg-slate-50 px-3 py-2 text-base font-semibold uppercase tracking-wide text-ftu'

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClubIcon clubId={clubId} size={52} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">{club?.name ?? 'Câu lạc bộ'}</h1>
            <p className="text-sm text-slate-600">{isSchool ? 'Quản lý các sự kiện do Nhà trường tổ chức' : 'Quản lý sự kiện và thành viên của CLB'}</p>
          </div>
        </div>
        <Link to="/su-kien/them" className={buttonClasses('primary')}>Thêm sự kiện</Link>
      </div>

      <h2 className={`${heading} mt-6`}>Sự kiện của CLB ({state.events.length})</h2>
      {state.events.length === 0 ? (
        <EmptyState message="CLB chưa đăng sự kiện nào." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Sự kiện</th>
                <th className="px-3 py-2">Ngày</th>
                <th className="px-3 py-2">Đăng ký</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.events.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 py-2 font-medium text-slate-900">{event.name}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDate(event.date)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <SeatBadge registered={event.registered} maxSeats={event.maxSeats} />{' '}
                    <span className="text-xs text-slate-500">({event.registered} người)</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <Link to={`/su-kien/${event.id}`} className={buttonClasses('secondary', 'sm')}>
                      Danh sách đăng ký
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isSchool && (
        <>
      <h2 className={`${heading} mt-8`}>Thành viên CLB ({state.members.length})</h2>
      {state.members.length === 0 ? (
        <EmptyState message="Chưa có sinh viên nào tham gia CLB." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Họ và tên</th>
                <th className="px-3 py-2">Mã sinh viên</th>
                <th className="px-3 py-2">Gmail</th>
                <th className="px-3 py-2">ĐRL từ sự kiện</th>
                <th className="px-3 py-2">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.members.map((member, index) => (
                <tr key={member.id}>
                  <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{member.fullName}</td>
                  <td className="px-3 py-2 text-slate-600">{member.studentId}</td>
                  <td className="px-3 py-2 text-slate-600">{member.email}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{state.attended.get(member.userId) ?? 0}</td>
                  <td className="px-3 py-2 text-slate-600">{member.createdAt.slice(0, 10).split('-').reverse().join('/')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </>
  )
}
