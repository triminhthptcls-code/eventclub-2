import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import {
  cancelRegistration,
  getRegistrationsByEvent,
  registerForEvent,
} from '../services/registrationService'
import type { Registration } from '../types/auth'
import type { ClubEvent } from '../types/event'
import { getErrorMessage } from '../utils/apiError'
import { POINTS_PER_EVENT } from '../data/drlCriteria'
import { getDrlItemId } from '../utils/drl'
import { getToday } from '../utils/date'
import { buttonClasses } from '../utils/ui'
import Button from './Button'
import EmptyState from './EmptyState'
import ErrorMessage from './ErrorMessage'
import Loading from './Loading'
import SeatBadge from './SeatBadge'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; registrations: Registration[] }

/**
 * Khu đăng ký trên trang chi tiết sự kiện:
 * - sinh viên: số chỗ còn lại + nút đăng ký / hủy đăng ký
 * - CLB tổ chức sự kiện: danh sách họ tên người đã đăng ký
 */
export default function EventRegistrationSection({ event }: { event: ClubEvent }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    let ignore = false
    getRegistrationsByEvent(event.id)
      .then((registrations) => {
        if (!ignore) setState({ status: 'success', registrations })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', message: getErrorMessage(error) })
      })
    return () => {
      ignore = true
    }
  }, [event.id, attempt])

  if (state.status === 'loading') return <Loading />
  if (state.status === 'error') return <ErrorMessage message={state.message} onRetry={reload} />

  const { registrations } = state
  const mine = registrations.find((item) => item.userId === user?.id)
  const isPast = event.date < getToday()
  const isFull = registrations.length >= event.maxSeats
  const isOwner = user?.role === 'club' && user.clubId === event.club

  const act = async (action: () => Promise<unknown>, message: string) => {
    if (busy) return
    setBusy(true)
    try {
      await action()
      showToast(message)
      reload()
    } catch (error: unknown) {
      showToast(getErrorMessage(error), 'error')
      reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-6 border-t border-slate-100 pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Đăng ký tham gia</h2>
        <SeatBadge registered={registrations.length} maxSeats={event.maxSeats} />
        <span className="text-sm text-slate-500">
          {registrations.length}/{event.maxSeats} người đã đăng ký
        </span>
      </div>

      {user?.role === 'student' && (
        <div className="mt-3">
          {mine ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                Bạn đã đăng ký sự kiện này
              </span>
              {!isPast && (
                <Button
                  variant="danger"
                  loading={busy}
                  loadingText="Đang hủy..."
                  onClick={() => act(() => cancelRegistration(mine.id), 'Đã hủy đăng ký.')}
                >
                  Hủy đăng ký
                </Button>
              )}
            </div>
          ) : isPast ? (
            <p className="text-sm text-slate-600">Sự kiện đã diễn ra, không thể đăng ký.</p>
          ) : isFull ? (
            <p className="text-sm font-medium text-slate-600">Sự kiện đã hết chỗ.</p>
          ) : (
            <Button
              loading={busy}
              loadingText="Đang đăng ký..."
              onClick={() => act(() => registerForEvent(event, user), 'Đăng ký tham gia thành công.')}
            >
              Đăng ký tham gia
            </Button>
          )}
        </div>
      )}

      {!user && (
        <p className="mt-3 text-sm text-slate-600">
          <Link to="/dang-nhap" state={{ from: `/su-kien/${event.id}` }} className={buttonClasses('primary', 'sm')}>
            Đăng nhập để đăng ký
          </Link>
        </p>
      )}

      {user?.role === 'club' && !isOwner && (
        <p className="mt-3 text-sm text-slate-500">Tài khoản CLB không đăng ký sự kiện.</p>
      )}

      {isOwner && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ftu">
            Danh sách người đăng ký ({registrations.length})
          </h3>
          {registrations.length === 0 ? (
            <EmptyState message="Chưa có sinh viên nào đăng ký." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Họ và tên</th>
                    <th className="px-3 py-2">Mã sinh viên</th>
                    <th className="px-3 py-2">Gmail</th>
                    <th className="px-3 py-2">ĐRL</th>
                    <th className="px-3 py-2">Thời gian đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">{item.fullName}</td>
                      <td className="px-3 py-2 text-slate-600">{item.studentId}</td>
                      <td className="px-3 py-2 text-slate-600">{item.email}</td>
                      <td className="px-3 py-2 text-slate-600">{isPast ? `+${POINTS_PER_EVENT} (mục ${getDrlItemId(event)})` : '—'}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
