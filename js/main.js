// main.js — Validate và xử lý gửi form liên hệ
// Quy tắc:
// - Họ tên: bắt buộc
// - Email: bắt buộc + đúng định dạng email
// - Chủ đề: bắt buộc chọn
// - Tin nhắn: tối thiểu 10 ký tự
// Khi gửi: hiện loading spinner; thành công -> thông báo xanh, lỗi -> thông báo đỏ.

(function () {
  "use strict";

  var MIN_MESSAGE_LENGTH = 10;
  // Biểu thức kiểm tra định dạng email cơ bản
  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Địa chỉ API gửi email (FastAPI). Đổi tại đây nếu API chạy ở cổng khác.
  var API_URL = "http://localhost:8000/send-email";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contactForm");
    if (!form) {
      return;
    }

    var submitButton = document.getElementById("submitButton");
    var statusBox = document.getElementById("formStatus");

    // Hiển thị lỗi cho một trường cụ thể
    function setFieldError(field, message) {
      field.classList.add("has-error");
      var errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
      if (errorEl) {
        errorEl.textContent = message;
      }
    }

    // Xóa lỗi của một trường
    function clearFieldError(field) {
      field.classList.remove("has-error");
      var errorEl = form.querySelector('[data-error-for="' + field.id + '"]');
      if (errorEl) {
        errorEl.textContent = "";
      }
    }

    // Hiển thị thông báo chung (success | error)
    function showStatus(type, message) {
      statusBox.textContent = message;
      statusBox.classList.remove("is-success", "is-error");
      statusBox.classList.add(type === "success" ? "is-success" : "is-error");
    }

    // Ẩn thông báo chung
    function hideStatus() {
      statusBox.textContent = "";
      statusBox.classList.remove("is-success", "is-error");
    }

    // Kiểm tra toàn bộ form, trả về true nếu hợp lệ
    function validateForm() {
      var fullName = form.fullName;
      var email = form.email;
      var subject = form.subject;
      var message = form.message;
      var isValid = true;

      // Họ tên
      if (fullName.value.trim() === "") {
        setFieldError(fullName, "Vui lòng nhập họ tên.");
        isValid = false;
      } else {
        clearFieldError(fullName);
      }

      // Email
      if (email.value.trim() === "") {
        setFieldError(email, "Vui lòng nhập email.");
        isValid = false;
      } else if (!EMAIL_REGEX.test(email.value.trim())) {
        setFieldError(email, "Email không đúng định dạng.");
        isValid = false;
      } else {
        clearFieldError(email);
      }

      // Chủ đề
      if (subject.value === "") {
        setFieldError(subject, "Vui lòng chọn chủ đề.");
        isValid = false;
      } else {
        clearFieldError(subject);
      }

      // Tin nhắn
      if (message.value.trim().length < MIN_MESSAGE_LENGTH) {
        setFieldError(
          message,
          "Tin nhắn cần tối thiểu " + MIN_MESSAGE_LENGTH + " ký tự."
        );
        isValid = false;
      } else {
        clearFieldError(message);
      }

      return isValid;
    }

    // Gửi dữ liệu form lên API bằng POST (JSON).
    // Trả về Promise: resolve nếu gửi thành công, reject nếu lỗi.
    function sendMessage(data) {
      return fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(function (response) {
        return response
          .json()
          .catch(function () {
            // Phản hồi không phải JSON
            return {};
          })
          .then(function (result) {
            // Coi là thành công khi HTTP ok và cờ success = true
            if (response.ok && result.success) {
              return result;
            }
            var message =
              (result && result.message) || "Gửi email thất bại.";
            throw new Error(message);
          });
      });
    }

    // Bật/tắt trạng thái đang gửi của nút
    function setLoading(loading) {
      if (loading) {
        submitButton.classList.add("is-loading");
        submitButton.disabled = true;
      } else {
        submitButton.classList.remove("is-loading");
        submitButton.disabled = false;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideStatus();

      if (!validateForm()) {
        showStatus("error", "Vui lòng kiểm tra lại các trường được tô đỏ.");
        return;
      }

      // Lấy dữ liệu từ các trường form (khớp với key API mong đợi)
      var data = {
        name: form.fullName.value.trim(),
        email: form.email.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim(),
      };

      setLoading(true);

      sendMessage(data)
        .then(function () {
          showStatus("success", "Đã gửi! Tôi sẽ phản hồi trong 24 giờ");
          form.reset();
        })
        .catch(function () {
          showStatus("error", "Có lỗi xảy ra. Vui lòng thử lại sau.");
        })
        .finally(function () {
          setLoading(false);
        });
    });
  });
})();
