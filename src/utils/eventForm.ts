import { DEFAULT_DRL_ITEM } from '../data/drlCriteria'
import type {
  ClubEvent,
  EventFormValues,
  EventPayload,
} from '../types/event'

export const EMPTY_FORM_VALUES: EventFormValues = {
  name: '',
  club: '',
  date: '',
  startTime: '',
  endTime: '',
  mode: 'offline',
  location: '',
  link: '',
  maxSeats: '',
  image: '',
  drlItem: DEFAULT_DRL_ITEM,
}

/** Sự kiện lấy từ API -> giá trị ban đầu của form chỉnh sửa */
export function toFormValues(event: ClubEvent): EventFormValues {
  return {
    name: event.name,
    club: event.club ?? '',
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    mode: event.mode,
    location: event.location,
    link: event.link,
    maxSeats: String(event.maxSeats),
    image: event.image ?? '',
    drlItem: event.drlItem ?? DEFAULT_DRL_ITEM,
  }
}

/** Giá trị form đã hợp lệ -> dữ liệu gửi lên API. Ô không dùng tới được xóa trống. */
export function toPayload(values: EventFormValues): EventPayload {
  return {
    name: values.name.trim(),
    club: values.club,
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime,
    mode: values.mode,
    location: values.mode === 'offline' ? values.location.trim() : '',
    link: values.mode === 'online' ? values.link.trim() : '',
    maxSeats: Number(values.maxSeats),
    image: values.image.trim() || undefined,
    drlItem: values.drlItem,
  }
}
