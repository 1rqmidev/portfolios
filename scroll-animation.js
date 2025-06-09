function handleScrollAnimations() {
  const elements = document.querySelectorAll(".scroll-animation");

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight - rect.height / 2) {
      el.classList.add("show-transition");
    }
  });
}

window.addEventListener("scroll", handleScrollAnimations);
window.addEventListener("load", handleScrollAnimations);
