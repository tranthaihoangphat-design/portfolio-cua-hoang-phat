// animation.js — Hiệu ứng xuất hiện khi cuộn trang
// Các phần tử (card sở thích, card dự án, phần giới thiệu) sẽ hiện dần
// từ dưới lên với độ trong suốt tăng dần. Mỗi phần tử trong cùng một nhóm
// cách nhau 0.15 giây. Dùng Intersection Observer API thuần (không thư viện).
// Animation không chạy lại khi phần tử đã xuất hiện rồi.

(function () {
  "use strict";

  var STAGGER_SECONDS = 0.15; // khoảng cách thời gian giữa mỗi phần tử

  document.addEventListener("DOMContentLoaded", function () {
    var revealElements = document.querySelectorAll(".reveal");

    // Nếu trình duyệt không hỗ trợ Intersection Observer thì hiện luôn tất cả
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    // Gán độ trễ (transition-delay) cho từng phần tử dựa trên thứ tự
    // của nó trong cùng một nhóm cha, tạo hiệu ứng so le 0.15s.
    var groupCounters = new Map();
    revealElements.forEach(function (el) {
      var parent = el.parentElement;
      var index = groupCounters.get(parent) || 0;
      el.style.transitionDelay = index * STAGGER_SECONDS + "s";
      groupCounters.set(parent, index + 1);
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Cho phần tử xuất hiện
            entry.target.classList.add("is-visible");
            // Ngừng theo dõi để animation không chạy lại lần nữa
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15, // hiện khi 15% phần tử lọt vào khung nhìn
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  });
})();
