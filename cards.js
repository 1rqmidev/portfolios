// 1. Define swiper without event handlers

// Initialize all inner image swipers

// 2. Attach event handlers after initialization

// 3. Define the helper function
function updateAdjacentSlides(swiperInstance) {
  const slides = document.querySelectorAll(".swiper-slide");
  slides.forEach((slide) => slide.classList.remove("prev-slide", "next-slide"));

  const activeIndex = swiperInstance.activeIndex;

  if (slides[activeIndex - 1]) {
    slides[activeIndex - 1].classList.add("prev-slide");
  }

  if (slides[activeIndex + 1]) {
    slides[activeIndex + 1].classList.add("next-slide");
  }
}
