import type { DrlEventItemId } from './drl'

/** Hình thức tổ chức: trực tiếp hoặc trực tuyến */
export type EventMode = 'offline' | 'online'

/** Sự kiện đúng như được lưu trong server/db.json */
export interface ClubEvent {
  id: string
  name: string
  /** Mã CLB tổ chức (xem src/data/clubs.ts), vd. "ibc" */
  club: string
  /** Định dạng YYYY-MM-DD */
  date: string
  /** Định dạng HH:mm */
  startTime: string
  /** Định dạng HH:mm */
  endTime: string
  mode: EventMode
  /** Chỉ dùng khi mode = 'offline', ngược lại là chuỗi rỗng */
  location: string
  /** Chỉ dùng khi mode = 'online', ngược lại là chuỗi rỗng */
  link: string
  maxSeats: number
  /** Đường dẫn ảnh bìa (tùy chọn), vd. "/images/events/1.jpg" */
  image?: string
  /** Mục điểm rèn luyện của sự kiện (mỗi lần tham dự +2 điểm); không có thì tính là mục 3.1 */
  drlItem?: DrlEventItemId
}

/** Sự kiện kèm số người đã đăng ký (tính từ bảng registrations) */
export interface EventWithSeats extends ClubEvent {
  registered: number
}

/** Dữ liệu gửi lên API khi thêm/sửa (chưa có id) */
export type EventPayload = Omit<ClubEvent, 'id'>

/** Giá trị các ô trong form: ô nhập luôn là chuỗi, kể cả ô số */
export interface EventFormValues {
  name: string
  club: string
  date: string
  startTime: string
  endTime: string
  mode: EventMode
  location: string
  link: string
  maxSeats: string
  /** Đường dẫn ảnh hoặc data URL; chuỗi rỗng nếu không có */
  image: string
  drlItem: DrlEventItemId
}

/** Object lỗi của form: mỗi ô có thể có một thông báo lỗi */
export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>

/** Nhóm hiển thị trong danh sách */
export type EventStatus = 'upcoming' | 'past'

/** Tham số truy vấn danh sách gửi lên API */
export interface EventQuery {
  status: EventStatus
  page: number
  perPage: number
  search: string
  /** Các mã CLB cần lọc; rỗng = tất cả CLB */
  clubs: string[]
  /** true: chỉ lấy sự kiện còn chỗ */
  onlyAvailable: boolean
}

/** Kết quả danh sách có phân trang */
export interface PagedResult<T> {
  items: T[]
  total: number
  pages: number
}
