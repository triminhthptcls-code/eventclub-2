import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getClub } from '../data/clubs'
import { DRL_EVENT_ITEMS, POINTS_PER_EVENT } from '../data/drlCriteria'
import ClubBadge from '../components/ClubBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorMessage from '../components/ErrorMessage'
import EventCover from '../components/EventCover'
import Loading from '../components/Loading'
import ModeBadge from '../components/ModeBadge'
import NotFoundMessage from '../components/NotFoundMessage'
import Button from '../components/Button'
import EventRegistrationSection from '../components/EventRegistrationSection'
import { useAuth } from '../hooks/useAuth'
import { useDeleteEvent } from '../hooks/useDeleteEvent'
import { useEvent } from '../hooks/useEvent'
import { formatDate, getToday } from '../utils/date'
import { getDrlItemId } from '../utils/drl'
import { buttonClasses } from '../utils/ui'

interface InfoRowProps {
  label: string
  children: ReactNode
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-900 sm:col-span-2">{children}</dd>
    </div>
  )
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { state, reload } = useEvent(id)
  const remove = useDeleteEvent(() => navigate('/su-kien'))

  if (state.status === 'loading') return <Loading />
  if (state.status === 'error') {
    return <ErrorMessage message={state.message} onRetry={reload} />
  }
  if (state.status === 'notfound') {
    return (
      <NotFoundMessage
        title="Không tìm thấy sự kiện"
        message="Sự kiện này không tồn tại hoặc đã bị xóa."
      />
    )
  }

  const { event } = state
  const isPast = event.date < getToday()
  const canManage = user?.role === 'club' && user.clubId === event.club

  return (
    <>
      <Link to="/su-kien" className="text-sm text-ftu hover:underline">
        ← Quay lại danh sách
      </Link>

      <article className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <EventCover event={event} className="h-56 sm:h-72" />
        <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ClubBadge clubId={event.club} />
          <ModeBadge mode={event.mode} />
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isPast ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isPast ? 'Đã diễn ra' : 'Sắp diễn ra'}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">{event.name}</h1>

        <dl className="mt-4 divide-y divide-slate-100">
          <InfoRow label="Câu lạc bộ">{getClub(event.club)?.name ?? 'Chưa xác định'}</InfoRow>
          <InfoRow label="Ngày tổ chức">{formatDate(event.date)}</InfoRow>
          <InfoRow label="Thời gian">
            {event.startTime} - {event.endTime}
          </InfoRow>
          <InfoRow label="Hình thức">
            {event.mode === 'offline' ? 'Trực tiếp' : 'Trực tuyến'}
          </InfoRow>
          {event.mode === 'offline' ? (
            <InfoRow label="Địa điểm">{event.location}</InfoRow>
          ) : (
            <InfoRow label="Đường dẫn tham gia">
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-ftu hover:underline"
              >
                {event.link}
              </a>
            </InfoRow>
          )}
          <InfoRow label="Số chỗ tối đa">{event.maxSeats}</InfoRow>
          <InfoRow label="Điểm rèn luyện">
            +{POINTS_PER_EVENT} điểm ·{' '}
            {DRL_EVENT_ITEMS.find((item) => item.id === getDrlItemId(event))?.label}
          </InfoRow>
        </dl>

        <EventRegistrationSection event={event} />

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/su-kien/${event.id}/sua`} className={buttonClasses('primary')}>
              Chỉnh sửa
            </Link>
            <Button variant="danger" onClick={() => remove.request(event)}>
              Xóa
            </Button>
          </div>
        )}
        </div>
      </article>

      {remove.target && (
        <ConfirmDialog
          title="Xóa sự kiện"
          message={
            <>
              Bạn có chắc muốn xóa sự kiện <strong>"{remove.target.name}"</strong>? Hành
              động này không thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={remove.deleting}
          onConfirm={remove.confirm}
          onCancel={remove.cancel}
        />
      )}
    </>
  )
}
