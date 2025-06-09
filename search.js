document.addEventListener("DOMContentLoaded", () => {
  function initializeSearch() {
    const globalSearch = document.getElementById("globalSearch");
    const clearSearch = document.getElementById("clearSearch");

    if (!globalSearch) return;

    function performSearch() {
      const searchTerm = globalSearch.value.toLowerCase().trim();
      const currentTab = document.querySelector(".tab-content.active");

      if (!currentTab) return;

      let searchableElements = [];
      const tabId = currentTab.id;

      if (tabId === "reviews-tab") {
        searchableElements = currentTab.querySelectorAll("tr, .review-card");
      } else if (tabId === "products-tab") {
        searchableElements = currentTab.querySelectorAll("tr");
      } else if (tabId === "images-tab") {
        searchableElements = currentTab.querySelectorAll(".image-item");
      } else {
        searchableElements = currentTab.querySelectorAll(
          "*:not(script, style)"
        );
      }

      searchableElements.forEach((element) => {
        const text = element.textContent.toLowerCase();
        const matches = text.includes(searchTerm);

        // If no search term, show everything
        if (searchTerm === "") {
          element.style.display = "";
        } else {
          // Only show matching elements
          if (
            element.tagName === "TR" ||
            element.classList.contains("review-card") ||
            element.classList.contains("image-item")
          ) {
            element.style.display = matches ? "" : "none";
          }
        }
      });
    }

    function clearSearchResults() {
      globalSearch.value = "";
      performSearch(); // Will reset everything to visible
    }

    globalSearch.addEventListener("input", performSearch);
    clearSearch?.addEventListener("click", clearSearchResults);

    document.querySelectorAll(".menu-item").forEach((item) => {
      item.addEventListener("click", () => {
        setTimeout(clearSearchResults, 100);
      });
    });
  }

  initializeSearch();
});
