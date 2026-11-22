import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import ClubBadge from '../components/ClubBadge'
import ClubIcon from '../components/ClubIcon'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { getClub } from '../data/clubs'
import { MAX_POINTS, POINTS_PER_EVENT } from '../data/drlCriteria'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { getEventsByIds } from '../services/eventService'
import { getMembershipsByUser, leaveClub } from '../services/membershipService'
import { cancelRegistration, getRegistrationsByUser } from '../services/registrationService'
import type { Membership, Registration } from '../types/auth'
import type { ClubEvent } from '../types/event'
import { getErrorMessage } from '../utils/apiError'
import { formatDate, getToday } from '../utils/date'
import { countByItem, summarizeDrl } from '../utils/drl'

interface Loaded {
  registrations: Registration[]
  events: ClubEvent[]
  memberships: Membership[]
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | ({ status: 'success' } & Loaded)

/** Trang của sinh viên: sự kiện đã đăng ký và CLB đã tham gia */
export default function MyActivityPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState<string | null>(null)
  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    if (!user) return
    let ignore = false
    Promise.all([getRegistrationsByUser(user.id), getMembershipsByUser(user.id)])
      .then(async ([registrations, memberships]) => {
        const events = await getEventsByIds(registrations.map((item) => item.eventId))
        if (!ignore) setState({ status: 'success', registrations, events, memberships })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', message: getErrorMessage(error) })
      })
    return () => {
      ignore = true
    }
  }, [user, attempt])

  if (state.status === 'loading') return <Loading />
  if (state.status === 'error') return <ErrorMessage message={state.message} onRetry={reload} />

  const today = getToday()
  const rows = state.registrations
    .map((registration) => ({
      registration,
      event: state.events.find((event) => event.id === registration.eventId),
    }))
    .filter((row): row is { registration: Registration; event: ClubEvent } => row.event !== undefined)
    .sort((a, b) => a.event.date.localeCompare(b.event.date))
  const upcoming = rows.filter((row) => row.event.date >= today)
  const past = rows.filter((row) => row.event.date < today).reverse()
  const summary = summarizeDrl(countByItem(past.map((row) => row.event)))
  const run = async (key: string, action: () => Promise<void>, message: string) => {
    if (busy) return
    setBusy(key)
    try {
      await action()
      showToast(message)
      reload()
    } catch (error: unknown) {
      showToast(getErrorMessage(error), 'error')
    } finally {
      setBusy(null)
    }
  }

  const renderRows = (items: typeof rows, canCancel: boolean) =>
    items.length === 0 ? (
      <EmptyState message={canCancel ? 'Bạn chưa đăng ký sự kiện sắp diễn ra nào.' : 'Chưa có sự kiện đã tham dự.'} />
    ) : (
      <ul className="space-y-3">
        {items.map(({ registration, event }) => (
          <li key={registration.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div>
              <Link to={`/su-kien/${event.id}`} className="font-semibold text-slate-900 hover:text-ftu">
                {event.name}
              </Link>
              <p className="mt-0.5 text-sm text-slate-600">
                {formatDate(event.date)} · {event.startTime} - {event.endTime}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ClubBadge clubId={event.club} />
                {!canCancel && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    +{POINTS_PER_EVENT} ĐRL
                  </span>
                )}
              </div>
            </div>
            {canCancel && (
              <Button
                size="sm"
                variant="danger"
                loading={busy === registration.id}
                loadingText="Đang hủy..."
                onClick={() => run(registration.id, () => cancelRegistration(registration.id), 'Đã hủy đăng ký.')}
              >
                Hủy đăng ký
              </Button>
            )}
          </li>
        ))}
      </ul>
    )

  return (
    <>
      <h1 className="text-2xl font-bold text-ftu">Hoạt động của tôi</h1>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs" aria-label="Điểm rèn luyện">
        <p className="text-sm font-medium text-slate-500">Điểm rèn luyện</p>
        <p className="text-3xl font-bold text-ftu">
          {summary.total}
          <span className="text-base font-medium text-slate-500">/{MAX_POINTS}</span>
        </p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-ftu" style={{ width: `${summary.total}%` }} />
        </div>

        <div className="mt-4 space-y-3">
          {summary.groups.map((result) => (
            <div key={result.group.id} className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-start justify-between gap-3 bg-red-50 px-3 py-2 font-semibold text-ftu">
                <span>
                  {result.group.id}. {result.group.title}
                </span>
                <span className="shrink-0 whitespace-nowrap">
                  {result.points}/{result.group.max}
                </span>
              </div>
              <ul className="divide-y divide-slate-100">
                {result.rows.map((row) => (
                  <li key={row.item.id} className="flex items-start gap-3 px-3 py-2.5">
                    <span className="w-8 shrink-0 pt-0.5 text-sm font-medium text-slate-500">{row.item.id}</span>
                    <p className="min-w-0 flex-1 text-sm text-slate-900">{row.item.title}</p>
                    <span
                      className={`shrink-0 whitespace-nowrap text-sm font-semibold ${
                        row.points === 0 ? 'text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {row.points}/{row.item.max}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <h2 className="mb-3 mt-6 border-l-4 border-ftu bg-slate-50 px-3 py-2 text-base font-semibold uppercase tracking-wide text-ftu">
        Sự kiện sắp tham gia ({upcoming.length})
      </h2>
      {renderRows(upcoming, true)}

      <h2 className="mb-3 mt-8 border-l-4 border-ftu bg-slate-50 px-3 py-2 text-base font-semibold uppercase tracking-wide text-ftu">
        Sự kiện đã tham gia ({past.length})
      </h2>
      {renderRows(past, false)}

      <h2 className="mb-3 mt-8 border-l-4 border-ftu bg-slate-50 px-3 py-2 text-base font-semibold uppercase tracking-wide text-ftu">
        Câu lạc bộ của tôi ({state.memberships.length})
      </h2>
      {state.memberships.length === 0 ? (
        <EmptyState message="Bạn chưa tham gia CLB nào. Vào mục Câu lạc bộ để tham gia." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {state.memberships.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <ClubIcon clubId={item.clubId} size={44} />
              <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
                {getClub(item.clubId)?.name ?? item.clubId}
              </span>
              <Button
                size="sm"
                variant="danger"
                loading={busy === item.id}
                loadingText="..."
                onClick={() => run(item.id, () => leaveClub(item.id), 'Đã rời câu lạc bộ.')}
              >
                Rời CLB
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
