const firebaseConfig = {
  apiKey: "AIzaSyBaWzgDT01temNKWI4L8yGIVZxQ4jDHYrc",
  authDomain: "my-project-datas-ef021.firebaseapp.com",
  projectId: "my-project-datas-ef021",
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

function getCurrentPortfolioName() {
  const pathParts = window.location.pathname.split("/").filter(Boolean); // removes empty strings
  console.log(pathParts);
  // Look for 'portfolios' in the path and get the part after it
  const portfolioIndex = pathParts.indexOf("portfolios");
  if (portfolioIndex !== -1 && pathParts.length > portfolioIndex + 1) {
    return pathParts[portfolioIndex + 1].toLowerCase();
  }

  return null; // not found
}

function formatRelativeTime(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit[0]} ago`;
    }
  }

  return "just now";
}

function isRecentlyUpdated(editDate) {
  const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
  return new Date() - editDate < fiveDaysInMs;
}

function formatDateForAttribute(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

async function loadPortfolio() {
  try {
    let currentPage = getCurrentPortfolioName();
    // Remove this line as it overrides the detected portfolio name
    // currentPage = "mc-build-portfolio";
    const loading = document.createElement("div");
    loading.className = "loading-indicator";
    loading.innerHTML = `<div class="spinner"></div><p>Loading portfolio...</p>`;
    document.body.appendChild(loading);
    if (!currentPage) {
      console.warn("No portfolio name found in URL path");
      loading.remove();
      return;
    }

    console.log("Loading portfolio:", currentPage);

    const doc = await firebase
      .firestore()
      .collection("portfolios")
      .doc(currentPage)
      .get();

    if (!doc.exists) {
      console.warn(`Portfolio not found: ${currentPage}`);
      return;
    }

    const portfolioData = doc.data();
    const section = document.createElement("div");
    section.className = "section-gallery";

    // Portfolio title
    const heading = document.querySelector(".portfolio-name");
    heading.textContent =
      portfolioData.displayName
        ?.split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") ||
      currentPage
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    // Last updated time (relative)
    if (portfolioData.lastEdited) {
      const lastUpdated = document.createElement("p");
      lastUpdated.className = "last-updated";
      lastUpdated.textContent = `Updated ${formatRelativeTime(
        portfolioData.lastEdited.toDate()
      )}`;
      section.appendChild(lastUpdated);
    }

    // Process images
    const categories = {};
    Object.entries(portfolioData).forEach(([key, value]) => {
      if (["displayName", "createdAt", "lastEdited"].includes(key)) return;

      if (typeof value === "object" && value?.url) {
        const category = value.category || "Uncategorized";
        categories[category] = categories[category] || [];

        const editDate =
          value.lastEdited?.toDate() ||
          new Date(value.uploadedAt || Date.now());

        categories[category].push({
          url: value.url,
          title:
            value.title ||
            key
              .replace(/image/i, "")
              .replace(/([A-Z])/g, " $1")
              .trim(),
          isNew: isRecentlyUpdated(editDate),
          date: formatDateForAttribute(editDate),
          fullDate: editDate.toLocaleDateString(), // For tooltip display
        });
      }
    });

    // Build gallery
    for (const [category, images] of Object.entries(categories)) {
      const categoryHeading = document.createElement("h2");
      categoryHeading.textContent = category;
      categoryHeading.classList.add("heading-category");
      section.appendChild(categoryHeading);

      const galleryWrapper = document.createElement("div");
      galleryWrapper.className = "gallery-wrapper";

      const galleryLeft = document.createElement("div");
      galleryLeft.className = "gallery gallery-left";

      const galleryRight = document.createElement("div");
      galleryRight.className = "gallery gallery-right";

      function createImageItem(image) {
        const item = document.createElement("div");
        item.className = "image";
        item.setAttribute("data-date", image.date);

        const newBadge = image.isNew
          ? `<span class="new-badge" data-tooltip="Added: ${image.fullDate}">NEW</span>`
          : "";

        item.innerHTML = `
    ${newBadge}
    <h3>${image.title}</h3>
    <img  src="${image.url}" alt="${image.title}" />
  `;

        return item;
      }

      const imageItems = [];
      for (const image of images) {
        await new Promise((resolve) => {
          const tempImg = new Image();
          tempImg.onload = () => {
            imageItems.push({
              image,
              width: tempImg.naturalWidth,
              height: tempImg.naturalHeight,
            });
            resolve();
          };
          tempImg.onerror = () => {
            imageItems.push({
              image,
              width: 800, // fallback dimensions
              height: 600,
            });
            resolve();
          };
          tempImg.src = image.url;
        });
      }

      // Calculate column width (48% of gallery-wrapper's 90% width)
      const columnWidth = window.innerWidth * 0.9 * 0.48;

      // Calculate total height for each item (image + title + badge + margin)
      const itemHeights = imageItems.map((item) => {
        // Calculate rendered image height based on column width
        const renderedHeight = (item.height * columnWidth) / item.width;
        // Add 20px margin for each item
        return renderedHeight + 20;
      });

      // Sort by descending height for better distribution
      const sortedItems = imageItems
        .map((item, index) => ({ item, height: itemHeights[index] }))
        .sort((a, b) => b.height - a.height);

      let leftHeight = 0;
      let rightHeight = 0;

      for (const { item, height } of sortedItems) {
        if (leftHeight <= rightHeight) {
          galleryLeft.appendChild(createImageItem(item.image));
          leftHeight += height;
        } else {
          galleryRight.appendChild(createImageItem(item.image));
          rightHeight += height;
        }
      }

      galleryWrapper.appendChild(galleryLeft);
      galleryWrapper.appendChild(galleryRight);
      section.appendChild(galleryWrapper);
    }

    // Insert before footer or at end of body
    const footer = document.querySelector("footer");
    (footer?.parentNode || document.body).insertBefore(section, footer || null);
    loading.remove();
  } catch (error) {
    loading.remove();
    console.error("Error loading portfolio:", error);
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Failed to load portfolio. Please try again later.";
    document.body.appendChild(errorDiv);
  }
}

// Fix: Pass the function reference, don't call it immediately
document.addEventListener("DOMContentLoaded", loadPortfolio);
