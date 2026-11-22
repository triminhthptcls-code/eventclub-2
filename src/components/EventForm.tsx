import { useState } from 'react'
import type { FormEvent } from 'react'
import type { EventFormValues, EventPayload } from '../types/event'
import { CLUBS, CLUB_GROUPS } from '../data/clubs'
import { DRL_EVENT_ITEMS, POINTS_PER_EVENT } from '../data/drlCriteria'
import { MODE_OPTIONS } from '../utils/constants'
import { toPayload } from '../utils/eventForm'
import { NAME_MAX, SEATS_MAX, SEATS_MIN, validateEvent } from '../utils/validateEvent'
import Button from './Button'
import ImageField from './ImageField'
import RadioGroup from './RadioGroup'
import TextField from './TextField'

interface EventFormProps {
  initialValues: EventFormValues
  /** true: đang chỉnh sửa (bỏ luật ngày không ở quá khứ) */
  isEdit: boolean
  /** true: khóa ô CLB (tài khoản CLB chỉ đăng cho CLB của mình) */
  lockClub?: boolean
  /** Số người đã đăng ký; số chỗ tối đa không được thấp hơn giá trị này */
  registeredCount?: number
  submitting: boolean
  submitLabel: string
  submitError: string | null
  onSubmit: (payload: EventPayload) => void
  onCancel: () => void
}

type TextFieldName = Exclude<keyof EventFormValues, 'mode' | 'club' | 'drlItem'>
type TouchedMap = Partial<Record<keyof EventFormValues, boolean>>

/** Thứ tự các ô trên form, dùng để đưa con trỏ về ô lỗi đầu tiên khi gửi */
const FIELD_ORDER: (keyof EventFormValues)[] = [
  'name',
  'club',
  'drlItem',
  'date',
  'startTime',
  'endTime',
  'mode',
  'location',
  'link',
  'maxSeats',
  'image',
]

/** Form dùng chung cho thêm mới và chỉnh sửa */
export default function EventForm({
  initialValues,
  isEdit,
  lockClub = false,
  registeredCount = 0,
  submitting,
  submitLabel,
  submitError,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(initialValues)
  const [touched, setTouched] = useState<TouchedMap>({})
  const [submitted, setSubmitted] = useState(false)

  // Lỗi luôn được tính lại từ giá trị hiện tại; chỉ hiện khi ô đã bị rời đi hoặc đã bấm gửi
  const errors = validateEvent(values, { isEdit, registeredCount })

  const visibleError = (field: keyof EventFormValues): string | undefined =>
    touched[field] || submitted ? errors[field] : undefined

  const textFieldProps = (field: TextFieldName) => ({
    name: field,
    value: values[field],
    error: visibleError(field),
    disabled: submitting,
    onChange: (value: string) =>
      setValues((current) => ({ ...current, [field]: value })),
    onBlur: () => setTouched((current) => ({ ...current, [field]: true })),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setSubmitted(true)

    const firstInvalid = FIELD_ORDER.find((field) => errors[field])
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus()
      return
    }

    onSubmit(toPayload(values))
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
    >
      <TextField
        {...textFieldProps('name')}
        label="Tên sự kiện"
        required
        placeholder="Ví dụ: Workshop Thiết kế poster"
        hint={`Từ 5 đến ${NAME_MAX} ký tự.`}
      />

      <div>
        <label htmlFor="field-club" className="mb-1 block text-sm font-medium text-slate-700">
          Câu lạc bộ tổ chức<span className="ml-0.5 text-rose-600">*</span>
        </label>
        <select
          id="field-club"
          name="club"
          value={values.club}
          disabled={submitting || lockClub}
          onChange={(event) =>
            setValues((current) => ({ ...current, club: event.target.value }))
          }
          onBlur={() => setTouched((current) => ({ ...current, club: true }))}
          aria-invalid={visibleError('club') ? true : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            visibleError('club')
              ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 focus:border-ftu focus:ring-red-200'
          }`}
        >
          <option value="">-- Chọn câu lạc bộ --</option>
          {CLUB_GROUPS.map((group) => (
            <optgroup key={group.id} label={group.label}>
              {CLUBS.filter((club) => club.group === group.id).map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {visibleError('club') && (
          <p role="alert" className="mt-1 text-sm text-rose-600">
            {visibleError('club')}
          </p>
        )}
      </div>

      <div>
        <RadioGroup
          legend="Mục điểm rèn luyện"
          name="drlItem"
          value={values.drlItem}
          options={DRL_EVENT_ITEMS.map((item) => ({ value: item.id, label: item.label }))}
          disabled={submitting}
          onChange={(drlItem) => setValues((current) => ({ ...current, drlItem }))}
        />
        <p className="mt-1 text-xs text-slate-500">
          Sinh viên đã tham dự được +{POINTS_PER_EVENT} điểm vào mục này.{' '}
          {DRL_EVENT_ITEMS.find((item) => item.id === values.drlItem)?.hint}
        </p>
        {visibleError('drlItem') && (
          <p role="alert" className="mt-1 text-sm text-rose-600">
            {visibleError('drlItem')}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField {...textFieldProps('date')} label="Ngày tổ chức" type="date" required />
        <TextField
          {...textFieldProps('startTime')}
          label="Giờ bắt đầu"
          type="time"
          required
        />
        <TextField
          {...textFieldProps('endTime')}
          label="Giờ kết thúc"
          type="time"
          required
        />
      </div>

      <RadioGroup
        legend="Hình thức"
        name="mode"
        value={values.mode}
        options={MODE_OPTIONS}
        disabled={submitting}
        onChange={(mode) => setValues((current) => ({ ...current, mode }))}
      />

      {values.mode === 'offline' ? (
        <TextField
          {...textFieldProps('location')}
          label="Địa điểm"
          required
          placeholder="Ví dụ: Phòng B2-301, Nhà B2"
        />
      ) : (
        <TextField
          {...textFieldProps('link')}
          label="Đường dẫn tham gia"
          type="url"
          required
          placeholder="https://meet.google.com/abc-defg-hij"
        />
      )}

      <TextField
        {...textFieldProps('maxSeats')}
        label="Số chỗ tối đa"
        type="number"
        required
        min={SEATS_MIN}
        max={SEATS_MAX}
        step={1}
        placeholder="Ví dụ: 50"
        hint={`Số nguyên từ ${SEATS_MIN} đến ${SEATS_MAX}.`}
      />

      <ImageField
        value={values.image}
        error={visibleError('image')}
        disabled={submitting}
        onChange={(image) => setValues((current) => ({ ...current, image }))}
        onBlur={() => setTouched((current) => ({ ...current, image: true }))}
      />

      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {submitError}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" loading={submitting} loadingText="Đang lưu...">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
