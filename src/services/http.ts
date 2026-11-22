import seed from '../../server/db.json'
import { NotFoundError } from '../utils/apiError'


type Row = { id: string } & Record<string, unknown>
type Tables = Record<string, Row[]>

/** Tăng số này khi đổi dữ liệu mẫu để mọi trình duyệt nạp lại bản mới */
const DATA_VERSION = 1
const STORAGE_KEY = `ftu-club-events:db:v${DATA_VERSION}`

interface RequestConfig {
  params?: Record<string, string | number | boolean | undefined>
}

let cache: Tables | null = null

function load(): Tables {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      cache = JSON.parse(raw) as Tables
      return cache
    }
  } catch {

  }
  cache = structuredClone(seed) as unknown as Tables
  persist()
  return cache
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // Đầy bộ nhớ hoặc chế độ riêng tư: vẫn chạy bằng bộ nhớ tạm của trang
  }
}

/** Tách "/events/12" thành bảng "events" và id "12" (nếu có) */
function parse(url: string): { table: string; id?: string } {
  const [table, id] = url.replace(/^\//, '').split('/')
  if (!load()[table]) throw new NotFoundError()
  return { table, id }
}

function newId(rows: Row[]): string {
  let id: string
  do {
    id = Math.random().toString(36).slice(2, 6)
  } while (rows.some((row) => row.id === id))
  return id
}

function compare(a: unknown, b: unknown): number {
  return String(a ?? '').localeCompare(String(b ?? ''), 'vi', { numeric: true })
}

function query(rows: Row[], params: RequestConfig['params'] = {}): Row[] {
  let result = rows.filter((row) =>
    Object.entries(params).every(
      ([key, value]) => key.startsWith('_') || value === undefined || String(row[key]) === String(value),
    ),
  )
  const sort = params._sort
  if (typeof sort === 'string' && sort) {
    const keys = sort.split(',').map((key) => ({
      field: key.replace(/^-/, ''),
      sign: key.startsWith('-') ? -1 : 1,
    }))
    result = [...result].sort((a, b) => {
      for (const { field, sign } of keys) {
        const diff = compare(a[field], b[field])
        if (diff !== 0) return sign * diff
      }
      return 0
    })
  }
  return structuredClone(result)
}

export const http = {
  async get<T>(url: string, config: RequestConfig = {}): Promise<{ data: T }> {
    const { table, id } = parse(url)
    const rows = load()[table]
    if (id === undefined) return { data: query(rows, config.params) as unknown as T }
    const row = rows.find((item) => item.id === id)
    if (!row) throw new NotFoundError()
    return { data: structuredClone(row) as unknown as T }
  },

  async post<T>(url: string, body: object): Promise<{ data: T }> {
    const { table } = parse(url)
    const rows = load()[table]
    const row = { ...structuredClone(body), id: newId(rows) } as Row
    rows.push(row)
    persist()
    return { data: structuredClone(row) as unknown as T }
  },

  async put<T>(url: string, body: object): Promise<{ data: T }> {
    const { table, id } = parse(url)
    const rows = load()[table]
    const index = rows.findIndex((item) => item.id === id)
    if (index < 0) throw new NotFoundError()
    rows[index] = { ...structuredClone(body), id: rows[index].id } as Row
    persist()
    return { data: structuredClone(rows[index]) as unknown as T }
  },

  async delete(url: string): Promise<void> {
    const { table, id } = parse(url)
    const rows = load()[table]
    const index = rows.findIndex((item) => item.id === id)
    if (index < 0) throw new NotFoundError()
    rows.splice(index, 1)
    persist()
  },
}
