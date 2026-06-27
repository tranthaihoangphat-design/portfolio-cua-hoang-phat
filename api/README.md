# API gửi email cho form liên hệ

FastAPI nhận dữ liệu form liên hệ và gửi email qua [Resend](https://resend.com).

## Cài đặt

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Cấu hình

Sao chép `.env.example` thành `.env` và điền:

- `RESEND_API_KEY` — khóa API lấy tại https://resend.com/api-keys
- `TO_EMAIL` — email nhận tin nhắn
- `FROM_EMAIL` — email gửi đi (phải thuộc domain đã xác thực trên Resend; mặc định dùng `onboarding@resend.dev`)

## Chạy

```bash
uvicorn send_email:app --reload --port 8001
```

## Endpoint

`POST /send-email` — body JSON:

```json
{
  "name": "Nguyễn Văn A",
  "email": "a@example.com",
  "subject": "Hợp tác",
  "message": "Nội dung tin nhắn tối thiểu 10 ký tự"
}
```

Trả về JSON `{"success": true, "message": "...", "id": "..."}` khi thành công,
hoặc `{"success": false, "message": "..."}` khi lỗi.

`GET /health` — kiểm tra service.

## Kết nối từ form HTML

Trong `js/main.js`, thay phần thân hàm `sendMessage()` bằng lời gọi thật:

```js
function sendMessage(data) {
  return fetch("http://localhost:8001/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(function (res) {
    if (!res.ok) {
      throw new Error("Gửi thất bại");
    }
    return res.json();
  });
}
```
