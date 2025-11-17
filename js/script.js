document.addEventListener("DOMContentLoaded", () => {
  // NAVBAR
  const navToggle = document.getElementById("nav-toggle");
  const navList = document.querySelector("nav ul");

  navToggle.addEventListener("click", () => {
    navList.classList.toggle("open");
    navToggle.classList.toggle("rotated");
  });

  // Închide meniul când se apasă un link (mobil)
  navList.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navList.classList.remove("open");
      navToggle.classList.remove("rotated");
    });
  });

  // BUTON MERGI SUS
  const topBtn = document.getElementById("top-btn");

  window.addEventListener("scroll", () => {
    topBtn.style.display = window.scrollY > 400 ? "block" : "none";
  });
});
