const firebaseConfig = {
  apiKey: "AIzaSyBaWzgDT01temNKWI4L8yGIVZxQ4jDHYrc",
  authDomain: "my-project-datas-ef021.firebaseapp.com",
  projectId: "my-project-datas-ef021",
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

function getCurrentPortfolioName() {
  console.log("Starts + " + window.location.pathname);
  const pathParts = window.location.pathname
    .split("/")
    .filter((part) => part.length > 0);

  return pathParts[pathParts.length - 1].toLowerCase();
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
    const currentPage = getCurrentPortfolioName();
    console.log(currentPage + "Currpage");
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
        .split("-")
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

      const gallery = document.createElement("div");
      gallery.className = "gallery";

      images.forEach((image) => {
        const item = document.createElement("div");
        item.className = "image";
        item.setAttribute("data-date", image.date);

        const newBadge = image.isNew
          ? `<span class="new-badge" data-tooltip="Added: ${image.fullDate}">NEW</span>`
          : "";

        item.innerHTML = `
        ${newBadge}
          <h3>${image.title}</h3>
          <img loading="lazy" src="${image.url}" alt="${image.title}" />
        `;
        gallery.appendChild(item);
      });

      section.appendChild(gallery);
    }

    // Insert before footer or at end of body
    const footer = document.querySelector("footer");
    (footer?.parentNode || document.body).insertBefore(section, footer || null);
  } catch (error) {
    console.error("Error loading portfolio:", error);
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Failed to load portfolio. Please try again later.";
    document.body.appendChild(errorDiv);
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolio);
