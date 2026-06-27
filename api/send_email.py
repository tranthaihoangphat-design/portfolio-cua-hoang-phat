"""API gửi email cho form liên hệ của Portfolio.

Sử dụng FastAPI để nhận dữ liệu form từ trang HTML và gửi email qua Resend API.
Chạy server:
    uvicorn send_email:app --reload --port 8001
"""

import os

import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

# Nạp biến môi trường từ file .env (nếu có)
load_dotenv()

# Địa chỉ endpoint của Resend (dùng HTTPS)
RESEND_API_URL = "https://api.resend.com/emails"

app = FastAPI(title="Portfolio Contact API")

# Cho phép trang HTML (chạy ở origin khác) gọi tới API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class ContactForm(BaseModel):
    """Dữ liệu form liên hệ gửi lên từ trang HTML."""

    name: str = Field(..., min_length=1, description="Họ tên người gửi")
    email: EmailStr = Field(..., description="Email người gửi")
    subject: str = Field(..., min_length=1, description="Chủ đề")
    message: str = Field(..., min_length=10, description="Nội dung tin nhắn")


def build_email_html(form: ContactForm) -> str:
    """Tạo nội dung email dạng HTML hiển thị đầy đủ thông tin người gửi."""
    return f"""\
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #1f2430;">
  <h2 style="color: #4f6df5;">Tin nhắn mới từ Portfolio</h2>
  <table cellpadding="8" style="border-collapse: collapse;">
    <tr>
      <td style="font-weight: bold;">Họ tên</td>
      <td>{form.name}</td>
    </tr>
    <tr>
      <td style="font-weight: bold;">Email</td>
      <td>{form.email}</td>
    </tr>
    <tr>
      <td style="font-weight: bold;">Chủ đề</td>
      <td>{form.subject}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; vertical-align: top;">Tin nhắn</td>
      <td>{form.message}</td>
    </tr>
  </table>
</body>
</html>"""


@app.post("/send-email")
def send_email(form: ContactForm) -> JSONResponse:
    """Nhận dữ liệu form và gửi email qua Resend API."""
    api_key = os.getenv("RESEND_API_KEY")
    to_email = os.getenv("TO_EMAIL")
    # Resend yêu cầu 'from' thuộc domain đã xác thực; mặc định dùng domain test.
    from_email = os.getenv("FROM_EMAIL", "Portfolio <onboarding@resend.dev>")

    # Kiểm tra cấu hình bắt buộc
    if not api_key:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Thiếu biến môi trường RESEND_API_KEY."},
        )
    if not to_email:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": "Thiếu biến môi trường TO_EMAIL."},
        )

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": f"[Portfolio] {form.subject} - {form.name}",
        "html": build_email_html(form),
        "reply_to": form.email,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            RESEND_API_URL, json=payload, headers=headers, timeout=10
        )
    except requests.RequestException as error:
        return JSONResponse(
            status_code=502,
            content={"success": False, "message": f"Không gọi được Resend API: {error}"},
        )

    # Resend trả về 200/201 khi gửi thành công
    if response.status_code in (200, 201):
        data = response.json()
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Đã gửi email thành công.",
                "id": data.get("id"),
            },
        )

    # Trường hợp lỗi từ phía Resend
    return JSONResponse(
        status_code=response.status_code,
        content={
            "success": False,
            "message": "Gửi email thất bại.",
            "detail": response.text,
        },
    )


@app.get("/health")
def health() -> dict[str, str]:
    """Endpoint kiểm tra sức khỏe của service."""
    return {"status": "ok"}
