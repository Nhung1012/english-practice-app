# Bật đăng nhập Google — cấu hình dashboard

> ✅ **ĐÃ LÀM XONG NGÀY 2026-08-04.** File này giữ lại để tra khi cần dựng lại từ đầu,
> hoặc khi đổi tên miền. Giá trị bên dưới là giá trị thật đang chạy.
>
> Google Cloud project: **`english-practice-app`** (id `acquired-goods-504508-r6`)
> OAuth client: **`web`** · Publishing status: **In production**

## Hai giá trị cần dán, chuẩn bị sẵn

| Tên | Giá trị |
|---|---|
| **Callback URL của Supabase** | `https://jlczlapfhqvfiktcpdwf.supabase.co/auth/v1/callback` |
| **Địa chỉ site** | `https://english-practice-nd.vercel.app` — domain Production trên Vercel, **không có dấu `/` ở cuối** |

⚠️ Nhầm hai giá trị này cho nhau là lỗi phổ biến nhất. Callback URL trỏ về **Supabase**, không phải về site của bạn. Google gửi người dùng về Supabase trước, Supabase mới trả họ về site.

---

## Phần 1 — Google Cloud (khoảng 15 phút)

### 1.1 Tạo project

Vào <https://console.cloud.google.com/> → menu chọn project ở góc trên → **New Project** → đặt tên (ví dụ `english-practice-app`) → **Create**.

Nếu đã có project rồi thì dùng lại, không cần tạo mới.

### 1.2 Khai báo ứng dụng (Audience)

Vào <https://console.cloud.google.com/auth/audience>.

- **User type**: chọn **External** (cho phép mọi tài khoản Google đăng nhập, không chỉ trong tổ chức của bạn)
- Điền tên ứng dụng, email hỗ trợ, email liên hệ nhà phát triển

**Chú ý mục Publishing status:**

| Trạng thái | Nghĩa là |
|---|---|
| **Testing** | Chỉ những email bạn tự thêm vào danh sách **Test users** mới đăng nhập được. Tối đa 100 người. |
| **In production** | Ai cũng đăng nhập được. |

Đã bấm **Publish app** ngày 2026-08-04 → trạng thái hiện tại là **In production**, ai có tài khoản Google cũng đăng nhập được.

👉 App này chỉ xin `email` và `profile` — thuộc nhóm **không nhạy cảm**, nên bấm Publish là dùng được ngay, **không phải chờ Google duyệt**. (Nếu sau này thêm quyền đọc Gmail/Drive thì mới phải qua quy trình xét duyệt kéo dài.)

### 1.3 Kiểm tra phạm vi quyền (Scopes)

Vào <https://console.cloud.google.com/auth/scopes>. Cần đúng ba mục:

- `openid` — **thường phải tự thêm**
- `.../auth/userinfo.email` — có sẵn
- `.../auth/userinfo.profile` — có sẵn

**Đừng thêm gì khác.** Mỗi quyền nhạy cảm thêm vào là một vòng xét duyệt của Google.

### 1.4 Tạo OAuth client

Vào <https://console.cloud.google.com/auth/clients/create>.

- **Application type**: **Web application**
- **Name**: đặt gì cũng được, ví dụ `web`

**Authorized JavaScript origins**:

```
https://english-practice-nd.vercel.app
```

**Authorized redirect URIs** — thêm 1 dòng, **đây là địa chỉ Supabase**:

```
https://jlczlapfhqvfiktcpdwf.supabase.co/auth/v1/callback
```

Bấm **Create**. Hiện ra **Client ID** và **Client Secret** — copy cả hai, để nguyên cửa sổ đó.

> Muốn chạy thử trên máy thì thêm `http://localhost:<cổng>` vào **cả hai** danh sách (Google origins và Supabase Redirect URLs). Hiện chưa thêm vì bạn deploy thẳng qua GitHub.

---

## Phần 2 — Supabase (khoảng 5 phút)

### 2.1 Bật provider Google

Vào <https://supabase.com/dashboard/project/jlczlapfhqvfiktcpdwf/auth/providers?provider=Google>

- Bật **Enable Sign in with Google**
- Dán **Client ID** và **Client Secret** vừa lấy
- **Save**

Trang này cũng hiện sẵn Callback URL — đối chiếu lại xem có khớp với dòng bạn đã dán vào Google không.

### 2.2 Khai báo địa chỉ được phép quay về

Vào <https://supabase.com/dashboard/project/jlczlapfhqvfiktcpdwf/auth/url-configuration>

- **Site URL**: `https://english-practice-nd.vercel.app`
- **Redirect URLs**:

```
https://english-practice-nd.vercel.app
```

⚠️ **Thiếu bước này là hỏng.** Code gọi `redirectTo: window.location.origin`. Địa chỉ nào không nằm trong danh sách này thì Supabase **từ chối trả người dùng về**, họ sẽ bị đá về Site URL hoặc thấy lỗi `redirect_to not allowed`.

Nếu bạn dùng cả bản preview của Vercel (`*-git-*.vercel.app`) thì thêm dòng `https://*.vercel.app` — Supabase cho dùng dấu `*`.

---

## Phần 3 — Thử

1. Mở site, bấm nút **Đăng nhập** ở góc trên phải
2. Chọn tài khoản Google → quay về site
3. Nút góc trên phải phải đổi thành **tên của bạn** kèm ảnh đại diện

Kiểm tra bằng Console (F12) nếu muốn chắc:

```js
(await supabaseClient.auth.getSession()).data.session?.user?.email
```

Ra email của bạn là xong.

### Kiểm tra hồ sơ đã được tạo

Vào Supabase → **Table Editor** → bảng `profiles`. Phải có đúng **một dòng** mang email của bạn.

Không có dòng nào thì gần như chắc chắn là thiếu policy — nhắn tôi, đừng tự sửa RLS.

---

## Gặp lỗi thì tra ở đây

| Hiện tượng | Nguyên nhân hay gặp nhất |
|---|---|
| `redirect_uri_mismatch` (màn hình lỗi của Google) | Dòng trong **Authorized redirect URIs** không khớp **từng ký tự** với callback URL của Supabase. Kiểm tra thừa/thiếu dấu `/` ở cuối, và `http` với `https`. |
| `redirect_to not allowed` / bị đá về trang chủ | Chưa thêm địa chỉ site vào **Redirect URLs** ở Supabase (bước 2.2). |
| `Access blocked: app not verified` hoặc `This app isn't verified` | App đang ở **Testing** mà email đăng nhập chưa nằm trong Test users. Thêm email vào, hoặc bấm **Publish app**. |
| Đăng nhập xong nút vẫn ghi "Đăng nhập" | Mở Console xem có lỗi đỏ không. Thường là chưa deploy bản `supabase.js` mới. |
| `provider is not enabled` | Chưa bật ở bước 2.1, hoặc bấm Save chưa ăn. |

---

## Những gì việc đăng nhập **chưa** làm

Ở bản này, đăng nhập mới chỉ tạo tài khoản và một dòng trong `profiles`.

- Sổ từ và lịch sử vẫn nằm **trên máy này**, chưa đẩy lên tài khoản
- Đăng nhập trên điện thoại sẽ **không thấy** sổ từ của máy tính
- Đăng xuất **không mất gì**

Phần đồng bộ làm ở tuần 16–17. Đây là chủ ý, không phải lỗi — tuần 16 là tuần nguy hiểm nhất của lộ trình (gộp dữ liệu localStorage lên tài khoản) nên tách riêng ra làm cho kỹ.
