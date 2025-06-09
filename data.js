// Firebase config & initialization
const firebaseConfig = {
  apiKey: "AIzaSyBaWzgDT01temNKWI4L8yGIVZxQ4jDHYrc",
  authDomain: "my-project-datas-ef021.firebaseapp.com",
  projectId: "my-project-datas-ef021",
  storageBucket: "my-project-datas-ef021.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Fetch product data
async function fetchSlideData() {
  try {
    const snapshot = await db
      .collection("products")
      .where("status", "==", true)
      .limit(10)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const images = (data.images || "")
        .trim()
        .split(/\s+/)
        .filter((url) => url.startsWith("http"))
        .slice(0, 5);

      return {
        id: doc.id,
        anchor: data.link || "#",
        images,
        gamemode: data.gameType || "Minecraft Map",
        price: `$${parseFloat(data.price || 0).toFixed(2)}`,
        preview: data.previewType || "Preview Available",
        views: data.views ? `${formatNumber(data.views)}+ Views` : "No Views",
        purchases: data.purchases
          ? `${formatNumber(data.purchases)}+ Purchases`
          : "No Purchases",
        title: data.title || "Untitled Map",
        subtitle: data.description || "No description available",
        status: data.status || false,
        timestamp: data.timestamp || new Date(),
      };
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    return [];
  }
}

// Create a slide element
function createSlideElement(slide) {
  const anchor = document.createElement("a");
  anchor.href = slide.anchor;
  anchor.className = "swiper-slide";
  anchor.target = "_blank";

  const card = document.createElement("div");
  card.className = "card";

  const imageSwiper = document.createElement("div");
  imageSwiper.className = "image-swiper swiper";

  let imageSlidesHTML = "";
  if (slide.images.length > 0) {
    imageSlidesHTML = slide.images
      .map(
        (src) => `
        <div class="image-slide swiper-slide">
          <img src="${src}" alt="${slide.title}" />
        </div>
      `
      )
      .join("");
  } else {
    imageSlidesHTML = `
      <div class="image-slide swiper-slide">
        <div class="no-image">No Image Available</div>
      </div>
    `;
  }

  imageSwiper.innerHTML = `
    <div class="swiper-wrapper">
      ${imageSlidesHTML}
    </div>
  `;
  card.appendChild(imageSwiper);

  card.insertAdjacentHTML(
    "beforeend",
    `
    <div class="background">
      <div class="features">
        <div class="content">
          <span class="gamemode">${slide.gamemode}</span>
          <span class="money">${slide.price}</span>
          <span class="preview">${slide.preview}</span>
        </div>
        <div class="content">
          <span class="views">${slide.views}</span>
          <span class="purchases">${slide.purchases}</span>
        </div>
      </div>
      <div class="container">
        <div class="title">
          <span>${slide.title}</span>
          <div class="image-pagination swiper-pagination"></div>
        </div>
        <div class="sub-title">${slide.subtitle}</div>
      </div>
    </div>
  `
  );

  anchor.appendChild(card);
  return anchor;
}

// Initialize the sliders
async function initializeSwipers() {
  const slides = await fetchSlideData();
  const wrapper = document.querySelector(".mySwiper .swiper-wrapper");

  if (!wrapper) {
    console.error("Swiper wrapper not found");
    return;
  }

  wrapper.innerHTML = "";

  slides.forEach((slide) => {
    if (slide.status) {
      const element = createSlideElement(slide);
      wrapper.appendChild(element);
    }
  });

  if (slides.length > 0) {
    new Swiper(".mySwiper", {
      slidesPerView: 1.5,
      centeredSlides: true,
      spaceBetween: 20,
      pagination: {
        el: ".cards-pagination",
        clickable: true,
      },
      breakpoints: {
        1024: { slidesPerView: 1.5, spaceBetween: 20 },
        768: { slidesPerView: 1.3, spaceBetween: 15 },
        500: { slidesPerView: 1, spaceBetween: 10 },
        0: { slidesPerView: 1, spaceBetween: 10 },
      },
    });

    document.querySelectorAll(".image-swiper").forEach((el) => {
      new Swiper(el, {
        slidesPerView: 1,
        loop: true,
        spaceBetween: 0,
        effect: "fade",
        fadeEffect: { crossFade: true },
        autoplay: {
          delay: 3000,
        },
        pagination: {
          el: el.closest(".card").querySelector(".image-pagination"),
          clickable: true,
        },
      });
    });
  } else {
    wrapper.innerHTML = '<div class="no-slides">No products available</div>';
  }
}

// Load Swiper if not loaded
document.addEventListener("DOMContentLoaded", function () {
  if (!window.Swiper) {
    const swiperJS = document.createElement("script");
    swiperJS.src = "https://unpkg.com/swiper@8/swiper-bundle.min.js";
    document.head.appendChild(swiperJS);

    const swiperCSS = document.createElement("link");
    swiperCSS.rel = "stylesheet";
    swiperCSS.href = "https://unpkg.com/swiper@8/swiper-bundle.min.css";
    document.head.appendChild(swiperCSS);

    swiperJS.onload = initializeSwipers;
  } else {
    initializeSwipers();
  }
});

// Function to fetch and update profile data
function updateProfileData() {
  db.collection("settings")
    .doc("profile")
    .get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        document.querySelectorAll(".about .loading").forEach((e) => {
          e.classList.remove("loading");
        });
        // Update all fields with the data from Firebase
        if (data.avatar)
          document.querySelector(".profile-avatar").src = data.avatar;
        if (data.description)
          document.querySelector(".profile-description").textContent =
            data.description;
        if (data.age)
          document.querySelector(".profile-age").textContent = data.age;
        if (data.located)
          document.querySelector(".profile-located").textContent = data.located;
        if (data.hobbies)
          document.querySelector(".profile-hobbies").textContent = data.hobbies;
        if (data.status)
          document.querySelector(".profile-status").textContent = data.status;
        if (data.studying)
          document.querySelector(".profile-studying").textContent =
            data.studying;
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", updateProfileData);

// Assuming you already have the Firebase initialization code you provided
// Function to fetch and display social links
async function loadSocialLinks() {
  try {
    const socialContainer = document.querySelector(".social-icons");
    if (!socialContainer) return;

    // Clear existing content
    socialContainer.innerHTML = "";

    // Get the social document
    const docSnapshot = await db.collection("settings").doc("social").get();

    if (!docSnapshot.exists) {
      console.log("No social links found");
      return;
    }

    // Get all social links from the document data
    const socialData = docSnapshot.data();

    // Process each social link in the map
    Object.keys(socialData).forEach((key) => {
      // Skip if the key doesn't start with 'link-' (in case there are other fields)
      if (!key.startsWith("link-")) return;

      const linkData = socialData[key];
      if (!linkData.platform || !linkData.url) return;

      const socialElement = document.createElement("span");
      socialElement.setAttribute("platform-name", linkData.platform);

      const imgElement = document.createElement("img");
      imgElement.src = linkData.iconUrl || "";
      imgElement.alt = `${linkData.platform} icon`;
      imgElement.loading = "lazy"; // Add lazy loading for better performance

      // Make the icon clickable
      const linkElement = document.createElement("a");
      linkElement.href = linkData.url;
      linkElement.target = "_blank";
      linkElement.rel = "noopener noreferrer";
      linkElement.appendChild(imgElement);
      socialElement.appendChild(linkElement);

      socialContainer.appendChild(socialElement);
    });
  } catch (error) {
    console.error("Error loading social links:", error);
    // Optional: Show error message to user
    socialContainer.innerHTML =
      '<span class="error">Failed to load social links</span>';
  }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", loadSocialLinks);
