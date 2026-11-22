# FTU Club Events

Web quản lý sự kiện câu lạc bộ của Trường Đại học Ngoại thương: sinh viên xem và đăng ký sự kiện, tham gia CLB, theo dõi điểm rèn luyện; các CLB (và Nhà trường) đăng và quản lý sự kiện của mình.

Bài tập lớn môn lập trình web (React).

## Tính năng

**Chung**
- Danh sách sự kiện chia hai nhóm "Sắp diễn ra" và "Đã diễn ra", có tìm kiếm theo tên, phân trang.
- Lọc theo đơn vị tổ chức: hàng icon CLB, chọn được nhiều CLB cùng lúc, có nút "Tất cả".
- Mỗi sự kiện hiển thị số chỗ còn lại ("Còn X/Y chỗ") và có bộ lọc "chỉ hiện sự kiện còn chỗ".
- Trang chi tiết sự kiện, trang danh sách CLB, trang thông báo, trang 404.

**Sinh viên**
- Đăng ký tài khoản, đăng nhập.
- Đăng ký hoặc hủy đăng ký sự kiện (kiểm tra sự kiện đã diễn ra, đăng ký trùng, hết chỗ).
- Tham gia hoặc rời CLB.
- Trang "Hoạt động của tôi": sự kiện sắp tham gia, sự kiện đã tham dự, CLB đã tham gia và điểm rèn luyện (ĐRL).

**CLB và Nhà trường**
- Thêm, sửa, xóa sự kiện, chỉ với sự kiện của chính đơn vị mình.
- Xem danh sách sinh viên đăng ký từng sự kiện (họ tên, MSSV, Gmail) và danh sách thành viên CLB.

**Điểm rèn luyện (ĐRL)**: mỗi sự kiện sinh viên đã đăng ký và đã diễn ra (ngày sự kiện trước hôm nay) được +2 điểm, tối đa 100 điểm. Điểm tính tự động, không cần CLB điểm danh.

## Công nghệ

Vite, React 19, TypeScript, Tailwind CSS v4, React Router (HashRouter).
Form và validate tự viết bằng `useState` (không dùng zod hay react-hook-form).

## Chạy trên máy

Cần Node.js 20 trở lên.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # kiểm tra kiểu và build ra thư mục dist
```

Không cần máy chủ riêng. Dữ liệu được lưu ở `localStorage` của trình duyệt, lần đầu nạp từ `server/db.json` (xem `src/services/http.ts`). Muốn quay về dữ liệu mẫu, xóa Local Storage của trang rồi tải lại.

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
| --- | --- | --- |
| Sinh viên | `sv01` đến `sv60` | `sv123456` |
| CLB | mã CLB, ví dụ `ibc`, `tec`, `ipc` | `club123` |
| Nhà trường | `truong` | `club123` |

> Đăng nhập chỉ là bản demo chạy ở trình duyệt (mật khẩu băm SHA-256, không có máy chủ xác thực). Không dùng mật khẩu thật.



## Cấu trúc thư mục

```
src/
  auth/         AuthProvider, RequireRole (phân quyền sinh viên / CLB)
  components/   EventForm, EventCard, EventCover, ClubFilter, ClubIcon, SeatBadge, toast, ...
  data/         clubs.ts (danh sách CLB, nhóm CLB, logo)
  hooks/        useAuth, useEvent, useDeleteEvent, useDebounce, useToast
  layouts/      MainLayout, Header, Sidebar, Footer
  pages/        EventListPage, EventDetailPage, ClubsPage, MyActivityPage, ManagePage, LoginPage, ...
  services/     http.ts (kho dữ liệu localStorage), event / registration / membership / auth / points
  types/        event.ts, auth.ts, news.ts
  utils/        validateEvent, eventForm, date, assetUrl, apiError, ...
public/images/  logo CLB và ảnh sự kiện
server/db.json  dữ liệu mẫu (34 sự kiện, 33 CLB cùng Nhà trường, tài khoản, đăng ký, thành viên)
```

## Ảnh chụp màn hình

>

| Trang danh sách | Hoạt động của tôi | Giao diện điện thoại |
| --- | --- | --- |
| ![Danh sách](screenshots/list.png) | ![Hoạt động](screenshots/activity.png) | ![Mobile](screenshots/mobile.png) |

## Video giới thiệu

> TODO: quay video 3 đến 5 phút, đưa lên Google Drive, mở quyền xem và dán đường dẫn vào đây.

Link video: <DÁN_LINK_GOOGLE_DRIVE_Ở_ĐÂY>

