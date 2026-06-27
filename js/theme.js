// theme.js — Xử lý chuyển đổi chế độ sáng/tối (dark mode)
// Lưu lựa chọn của người dùng vào localStorage để nhớ cho lần sau.

(function () {
  "use strict";

  var STORAGE_KEY = "portfolio-theme";
  var root = document.documentElement; // thẻ <html>

  // Áp dụng theme bằng cách đặt thuộc tính data-theme trên thẻ <html>
  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  // Lấy theme đã lưu, nếu chưa có thì theo cài đặt hệ thống của người dùng
  function getInitialTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  // Khởi tạo theme ngay khi tải trang
  var currentTheme = getInitialTheme();
  applyTheme(currentTheme);

  // Gắn sự kiện cho nút toggle sau khi DOM sẵn sàng
  document.addEventListener("DOMContentLoaded", function () {
    var toggleButton = document.getElementById("themeToggle");
    if (!toggleButton) {
      return;
    }

    toggleButton.addEventListener("click", function () {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(currentTheme);
      localStorage.setItem(STORAGE_KEY, currentTheme);
    });
  });
})();
