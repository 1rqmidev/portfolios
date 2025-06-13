const firebaseConfig = {
  apiKey: "AIzaSyBaWzgDT01temNKWI4L8yGIVZxQ4jDHYrc",
  authDomain: "my-project-datas-ef021.firebaseapp.com",
  projectId: "my-project-datas-ef021",
};

// Initialize Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

function getCurrentPortfolioName() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  console.log(pathParts);
  const portfolioIndex = pathParts.indexOf("portfolios");
  if (portfolioIndex !== -1 && pathParts.length > portfolioIndex + 1) {
    return pathParts[portfolioIndex + 1].toLowerCase();
  }
  return null;
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
  return date.toISOString().split("T")[0];
}

async function loadPortfolio() {
  let loading;
  try {
    const currentPage = getCurrentPortfolioName();

    loading = document.createElement("div");
    loading.className = "loading-indicator";
    loading.innerHTML = `<div class="spinner"></div><p>Loading portfolio...</p>`;
    document.body.appendChild(loading);

    if (!currentPage) {
      console.warn("No portfolio name found in URL path");
      loading.remove();
      return;
    }

    console.log("Loading portfolio:", currentPage);

    // Get portfolio document
    const portfolioDoc = await firebase
      .firestore()
      .collection("portfolios")
      .doc(currentPage)
      .get();

    if (!portfolioDoc.exists) {
      console.warn(`Portfolio not found: ${currentPage}`);
      loading.remove();
      return;
    }

    const portfolioData = portfolioDoc.data();
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
    if (portfolioData.createdAt) {
      const lastUpdated = document.createElement("p");
      lastUpdated.className = "last-updated";
      lastUpdated.textContent = `Created ${formatRelativeTime(
        portfolioData.createdAt.toDate()
      )}`;
      section.appendChild(lastUpdated);
    }

    // Get all images from the subcollection
    const imagesSnapshot = await firebase
      .firestore()
      .collection("portfolios")
      .doc(currentPage)
      .collection("images")
      .get();

    // Process images into categories
    const categories = {};
    imagesSnapshot.forEach((doc) => {
      const imageData = doc.data();
      const category = imageData.category || "Uncategorized";
      categories[category] = categories[category] || [];

      const editDate =
        imageData.updatedAt?.toDate() ||
        imageData.timestamp?.toDate() ||
        new Date();

      categories[category].push({
        url: imageData.imageUrl,
        title: imageData.title || "Untitled",
        description: imageData.description || "",
        isNew: isRecentlyUpdated(editDate),
        date: formatDateForAttribute(editDate),
        fullDate: editDate.toLocaleDateString(),
      });
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

        const description = image.description
          ? `<p class="image-description">${image.description}</p>`
          : "";

        item.innerHTML = `
          ${newBadge}
          <h3>${image.title}</h3>
          <img src="${image.url}" alt="${image.title}" />
          ${description}
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
              width: 800,
              height: 600,
            });
            resolve();
          };
          tempImg.src = image.url;
        });
      }

      const columnWidth = window.innerWidth * 0.9 * 0.48;
      const itemHeights = imageItems.map((item) => {
        const renderedHeight = (item.height * columnWidth) / item.width;
        return renderedHeight + (item.image.description ? 60 : 40); // Extra space for description
      });

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

    const footer = document.querySelector("footer");
    (footer?.parentNode || document.body).insertBefore(section, footer || null);
    loading.remove();
  } catch (error) {
    console.error("Error loading portfolio:", error);
    if (loading) loading.remove();
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = "Failed to load portfolio. Please try again later.";
    document.body.appendChild(errorDiv);
  }
}

document.addEventListener("DOMContentLoaded", loadPortfolio);
