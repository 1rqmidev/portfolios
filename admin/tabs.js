// Tab switching functionality
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
  const tabContents = document.querySelectorAll(".tab-content");

  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all menu items
      menuItems.forEach((menu) => menu.classList.remove("active"));

      // Add active class to clicked menu item
      this.classList.add("active");

      // Hide all tab contents
      tabContents.forEach((content) => content.classList.remove("active"));

      // Show the selected tab content
      const tabId = this.dataset.tab + "-tab";
      document.getElementById(tabId).classList.add("active");

      // Close sidebar on mobile
      if (window.innerWidth <= 991) {
        document.querySelector(".sidebar").classList.remove("active");
        document.querySelector(".main").classList.remove("expanded");
        document.querySelector(".sidebar-overlay").classList.remove("active");
      }
    });
  });
});
