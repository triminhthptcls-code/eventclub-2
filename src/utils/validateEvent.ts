import type { EventFormErrors, EventFormValues } from '../types/event'
import { getClub } from '../data/clubs'
import { DRL_EVENT_ITEM_IDS } from '../data/drlCriteria'
import { getToday } from './date'
import { IMAGE_MAX_CHARS } from './image'

export const NAME_MIN = 5
export const NAME_MAX = 100
export const SEATS_MIN = 1
export const SEATS_MAX = 500

interface ValidateOptions {
  /** true khi chỉnh sửa: bỏ luật "ngày không được ở quá khứ" */
  isEdit: boolean
  /** Số người đã đăng ký (khi sửa): số chỗ không được thấp hơn */
  registeredCount?: number
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Hàm validate duy nhất của form, dùng chung cho thêm mới và chỉnh sửa.
 * Nhận giá trị form, trả về object lỗi (rỗng nếu hợp lệ).
 */
export function validateEvent(
  values: EventFormValues,
  { isEdit, registeredCount = 0 }: ValidateOptions,
): EventFormErrors {
  const errors: EventFormErrors = {}

  // Tên sự kiện: bắt buộc, 5-100 ký tự
  const name = values.name.trim()
  if (!name) {
    errors.name = 'Vui lòng nhập tên sự kiện.'
  } else if (name.length < NAME_MIN) {
    errors.name = `Tên sự kiện phải có ít nhất ${NAME_MIN} ký tự.`
  } else if (name.length > NAME_MAX) {
    errors.name = `Tên sự kiện không được vượt quá ${NAME_MAX} ký tự.`
  }

  // CLB tổ chức: bắt buộc, phải nằm trong danh sách CLB
  if (!values.club) {
    errors.club = 'Vui lòng chọn câu lạc bộ tổ chức.'
  } else if (!getClub(values.club)) {
    errors.club = 'Câu lạc bộ không hợp lệ.'
  }

  // Mục điểm rèn luyện: bắt buộc, phải là một trong các mục sự kiện CLB được tính
  if (!DRL_EVENT_ITEM_IDS.includes(values.drlItem)) {
    errors.drlItem = 'Vui lòng chọn mục điểm rèn luyện.'
  }

  // Ngày tổ chức: bắt buộc; khi thêm mới không được ở quá khứ
  if (!values.date) {
    errors.date = 'Vui lòng chọn ngày tổ chức.'
  } else if (!isEdit && values.date < getToday()) {
    errors.date = 'Ngày tổ chức không được là ngày trong quá khứ.'
  }

  // Giờ bắt đầu / kết thúc: bắt buộc, kết thúc phải sau bắt đầu
  if (!values.startTime) {
    errors.startTime = 'Vui lòng chọn giờ bắt đầu.'
  }
  if (!values.endTime) {
    errors.endTime = 'Vui lòng chọn giờ kết thúc.'
  } else if (values.startTime && values.endTime <= values.startTime) {
    errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu.'
  }

  // Địa điểm / đường dẫn: phụ thuộc vào hình thức
  if (values.mode === 'offline') {
    if (!values.location.trim()) {
      errors.location = 'Vui lòng nhập địa điểm khi tổ chức trực tiếp.'
    }
  } else {
    const link = values.link.trim()
    if (!link) {
      errors.link = 'Vui lòng nhập đường dẫn tham gia khi tổ chức trực tuyến.'
    } else if (!isValidUrl(link)) {
      errors.link =
        'Đường dẫn không đúng định dạng, ví dụ: https://meet.google.com/abc-defg-hij.'
    }
  }

  // Số chỗ tối đa: số nguyên từ 1 đến 500
  const seats = values.maxSeats.trim()
  if (!seats) {
    errors.maxSeats = `Vui lòng nhập số chỗ tối đa (số nguyên từ ${SEATS_MIN} đến ${SEATS_MAX}).`
  } else if (!/^-?\d+$/.test(seats)) {
    errors.maxSeats = 'Số chỗ tối đa phải là một số nguyên.'
  } else {
    const number = Number(seats)
    if (number < SEATS_MIN || number > SEATS_MAX) {
      errors.maxSeats = `Số chỗ tối đa phải từ ${SEATS_MIN} đến ${SEATS_MAX}.`
    } else if (number < registeredCount) {
      errors.maxSeats = `Đã có ${registeredCount} người đăng ký, số chỗ không được thấp hơn.`
    }
  }

  // Ảnh bìa: không bắt buộc; là ảnh chọn từ máy, đường dẫn http(s) hoặc ảnh trong /images/
  const image = values.image.trim()
  if (image) {
    if (image.startsWith('data:image/')) {
      if (image.length > IMAGE_MAX_CHARS * 1.5) {
        errors.image = 'Ảnh quá lớn, vui lòng chọn ảnh khác.'
      }
    } else if (!isValidUrl(image) && !image.startsWith('/images/')) {
      errors.image =
        'Đường dẫn ảnh không đúng định dạng, ví dụ: https://example.com/anh.jpg.'
    }
  }

  return errors
}
