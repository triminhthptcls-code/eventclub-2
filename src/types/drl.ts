/** Mục điểm rèn luyện (ĐRL) mà một sự kiện CLB có thể được tính vào (2 điểm/lần) */
export type DrlEventItemId = '1.1' | '3.1' | '3.2'

/** Nguồn của điểm trong một mục */
export type DrlSource =
  /** Mặc định: sinh viên chấp hành đầy đủ, học tập tốt thì được đủ điểm */
  | 'base'
  /** Tự cộng từ các sự kiện CLB đã tham dự */
  | 'event'
  /** Do Nhà trường, Đoàn, Hội chấm; web không tính (hiển thị 0) */
  | 'manual'

/** Một nhóm lớn (1 đến 5) trong bảng điểm rèn luyện của Nhà trường */
export interface DrlGroup {
  id: number
  title: string
  /** Điểm tối đa của cả nhóm */
  max: number
}

/** Một mục nhỏ (ví dụ 3.1) trong bảng điểm rèn luyện */
export interface DrlItem {
  id: string
  group: number
  title: string
  /** Điểm tối đa của mục */
  max: number
  source: DrlSource
}

/** Điểm của một mục sau khi tính */
export interface DrlRow {
  item: DrlItem
  /** Số sự kiện được tính vào mục (chỉ có ý nghĩa với source = 'event') */
  count: number
  points: number
}

/** Điểm của một nhóm sau khi tính (đã áp dụng điểm tối đa của nhóm) */
export interface DrlGroupResult {
  group: DrlGroup
  rows: DrlRow[]
  points: number
}

/** Kết quả tính điểm rèn luyện */
export interface DrlSummary {
  groups: DrlGroupResult[]
  total: number
}

/** Số sự kiện đã tham dự theo từng mục */
export type DrlCounts = Partial<Record<DrlEventItemId, number>>
