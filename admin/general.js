// Helper function for notifications
function showNotification(message, type = "info") {
  // Implement your notification system here (e.g., using a toast library or custom UI)
  console.log(`${type.toUpperCase()}: ${message}`);
  alert(`${type.toUpperCase()}: ${message}`); // Fallback to alert for demonstration
}

// Function to handle showing/hiding the main content (webpage div)
function toggleWebpageVisibility(visible) {
  const loginSection = document.querySelector(".login");
  const webpageSection = document.querySelector(".webpage");
  const logoutButton = document.getElementById("logoutBtn"); // Login page logout button

  if (visible) {
    loginSection.style.display = "none";
    webpageSection.style.display = "flex";
    logoutButton.style.display = "block"; // Show logout button on login page
  } else {
    loginSection.style.display = "flex";
    webpageSection.style.display = "none";
    logoutButton.style.display = "none"; // Hide logout button on login page
  }
}

// Global search functionality
document.addEventListener("DOMContentLoaded", () => {
  const globalSearchInput = document.getElementById("globalSearch");
  const clearSearchBtn = document.getElementById("clearSearch");
  let highlightElements = [];

  function clearHighlights() {
    highlightElements.forEach((el) => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
    });
    highlightElements = [];
  }

  function applySearchHighlight(query) {
    clearHighlights();
    if (!query) return;

    const contentDiv = document.querySelector(".content");
    const walker = document.createTreeWalker(
      contentDiv,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    const regex = new RegExp(`(${query})`, "gi");

    while ((node = walker.nextNode())) {
      if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.includes(query)
      ) {
        const span = document.createElement("span");
        span.innerHTML = node.textContent.replace(
          regex,
          '<span class="search-highlight">$&</span>'
        );
        node.parentNode.replaceChild(span, node);
        highlightElements.push(...span.querySelectorAll(".search-highlight"));
      }
    }
  }

  globalSearchInput.addEventListener("input", (e) => {
    applySearchHighlight(e.target.value);
  });

  clearSearchBtn.addEventListener("click", () => {
    globalSearchInput.value = "";
    clearHighlights();
  });
});
