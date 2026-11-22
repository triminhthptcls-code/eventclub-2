import type { DrlEventItemId, DrlGroup, DrlItem } from '../types/drl'

/** Mỗi sự kiện đã tham dự được cộng bấy nhiêu điểm vào mục của sự kiện */
export const POINTS_PER_EVENT = 2

/** Điểm rèn luyện tối đa (thang 100) */
export const MAX_POINTS = 100

/** Mục mặc định của sự kiện CLB: tham dự hoạt động do CLB sinh viên tổ chức */
export const DEFAULT_DRL_ITEM: DrlEventItemId = '3.1'

/** Năm nhóm của bảng điểm rèn luyện (tổng 100 điểm) */
export const DRL_GROUPS: DrlGroup[] = [
  { id: 1, title: 'Ý thức tham gia học tập', max: 20 },
  { id: 2, title: 'Ý thức chấp hành nội quy, quy chế, quy định trong Nhà trường', max: 25 },
  {
    id: 3,
    title: 'Hoạt động chính trị, xã hội, văn hóa, văn nghệ, thể thao, phòng chống tệ nạn xã hội',
    max: 20,
  },
  { id: 4, title: 'Ý thức công dân', max: 25 },
  {
    id: 5,
    title: 'Công tác cán bộ lớp, đoàn thể, CLB hoặc thành tích đặc biệt',
    max: 10,
  },
]

/**
 * Các mục nhỏ của bảng điểm:
 * - base: tính đủ điểm khi sinh viên chấp hành nội quy, học tập tốt (tổng 55 điểm)
 * - event: cộng từ sự kiện CLB đã tham dự (2 điểm/lần, tối đa theo mục)
 * - manual: do Nhà trường, Đoàn, Hội chấm nên web không tính
 */
export const DRL_ITEMS: DrlItem[] = [
  {
    id: '1.1',
    group: 1,
    title: 'Hoạt động NCKH, học thuật, hội thảo, cuộc thi học thuật',
    max: 10,
    source: 'event',
  },
  {
    id: '1.2',
    group: 1,
    title: 'Vượt khó, phấn đấu vươn lên trong học tập',
    max: 2,
    source: 'manual',
  },
  {
    id: '1.3',
    group: 1,
    title: 'Kết quả học tập trong học kỳ',
    max: 10,
    source: 'base',
  },
  {
    id: '2.1',
    group: 2,
    title: 'Chấp hành văn bản chỉ đạo của Bộ GD&ĐT, các cấp (BHYT, học phí đúng hạn)',
    max: 10,
    source: 'base',
  },
  {
    id: '2.2',
    group: 2,
    title: 'Chấp hành nội quy, quy chế của Nhà trường',
    max: 15,
    source: 'base',
  },
  {
    id: '3.1',
    group: 3,
    title: 'Tham dự hoạt động do Trường, Đoàn, Hội SV, CLB sinh viên tổ chức',
    max: 10,
    source: 'event',
  },
  {
    id: '3.2',
    group: 3,
    title: 'Hoạt động công ích, tình nguyện, công tác xã hội',
    max: 5,
    source: 'event',
  },
  {
    id: '3.3',
    group: 3,
    title: 'Tuyên truyền, phòng chống tội phạm và tệ nạn xã hội',
    max: 5,
    source: 'base',
  },
  {
    id: '4.1',
    group: 4,
    title: 'Chấp hành, tuyên truyền chủ trương của Đảng, pháp luật; tuần sinh hoạt công dân',
    max: 15,
    source: 'base',
  },
  {
    id: '4.2',
    group: 4,
    title: 'Hoạt động xã hội có thành tích, quyên góp, hiến máu tình nguyện',
    max: 10,
    source: 'manual',
  },
  {
    id: '5.1',
    group: 5,
    title: 'Cán bộ lớp, đoàn thể, CLB (tính theo học kỳ)',
    max: 10,
    source: 'manual',
  },
  {
    id: '5.2',
    group: 5,
    title: 'Thành tích đặc biệt (giấy khen, bằng khen)',
    max: 10,
    source: 'manual',
  },
]

/** Ba mục mà một sự kiện CLB có thể thuộc về (mỗi lần tham dự +2 điểm) */
export const DRL_EVENT_ITEMS: { id: DrlEventItemId; label: string; hint: string }[] = [
  {
    id: '3.1',
    label: '3.1 - Hoạt động CLB, Đoàn, Hội',
    hint: 'Hoạt động phong trào, văn hóa, văn nghệ, thể thao (tối đa 10 điểm).',
  },
  {
    id: '1.1',
    label: '1.1 - Học thuật, NCKH',
    hint: 'Hội thảo, cuộc thi học thuật, hoạt động chuyên môn (tối đa 10 điểm).',
  },
  {
    id: '3.2',
    label: '3.2 - Tình nguyện, công ích',
    hint: 'Hoạt động công ích, tình nguyện, công tác xã hội (tối đa 5 điểm).',
  },
]

export const DRL_EVENT_ITEM_IDS: DrlEventItemId[] = DRL_EVENT_ITEMS.map((item) => item.id)
