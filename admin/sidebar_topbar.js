// Sidebar toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main");
  const openSidebarBtn = document.querySelector(".open-sidebar");
  const closeSidebarBtn = document.querySelector(".close-sidebar");
  const sidebarOverlay = document.querySelector(".sidebar-overlay");

  function toggleSidebar() {
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("expanded");
    sidebarOverlay.classList.toggle("active");
  }

  openSidebarBtn.addEventListener("click", toggleSidebar);
  closeSidebarBtn.addEventListener("click", toggleSidebar);
  sidebarOverlay.addEventListener("click", toggleSidebar); // Close sidebar when overlay is clicked
});
