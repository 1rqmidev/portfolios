document.addEventListener("DOMContentLoaded", async () => {
  const swiperContainer = document.querySelector(
    ".review-small .swiper .swiper-wrapper"
  );

  try {
    const querySnapshot = await db.collection("reviews").get();
    const reviews = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.timestamp?.toDate
        ? data.timestamp.toDate()
        : new Date(data.date);

      reviews.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        pfp:
          data.image ||
          "https://cdn.builtbybit.com/avatars/m/306/306104.jpg?1747860989",
        stars: data.stars || 5,
        date: date,
        service: data.service || "map",
      });
    });

    reviews.forEach((review) => {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");
      slide.innerHTML = `
        <div class="review-card">
          <img src="${review.pfp}" alt="${review.name}" class="pfp" />
          <div class="info">
            <h4>${review.name}</h4>
             <p class="service">Date <span>${review.date.toLocaleDateString()}</span></p>
            <p class="service">Service <span>${review.service}</span></p>
          </div>
        </div>
        <p class="desc">${review.description}</p>
        <p class="stars">${"⭐".repeat(review.stars)}</p>
      `;
      swiperContainer.appendChild(slide);
    });

    let swiperInstance;

    function initSwiper() {
      const direction = window.innerWidth >= 1024 ? "vertical" : "horizontal";

      if (swiperInstance) swiperInstance.destroy(true, true);

      swiperInstance = new Swiper(".review-small .swiper", {
        slidesPerView:
          window.innerWidth >= 1024 ? 2 : window.innerWidth >= 600 ? 2 : 1,
        spaceBetween:
          window.innerWidth >= 1024
            ? 30
            : window.innerWidth >= 1000
            ? 20
            : window.innerWidth >= 500
            ? 10
            : 5,
        loop: true,
        direction: direction,
        pagination: {
          el: document.querySelector(".review-small .pagination"),
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
      });
    }

    initSwiper();

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initSwiper();
      }, 200);
    });

    new Swiper(".review-big .swiper", {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    swiperContainer.innerHTML =
      '<div class="error-message">Failed to load reviews. Please try again later.</div>';
  }
});
