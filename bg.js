document.addEventListener("DOMContentLoaded", (e) => {
  const teleportDiv = document.getElementById("teleport-div");
  const listItems = document.querySelectorAll("nav li");

  let lastRect = null;

  const burger = document.querySelector(".burger");
  const container = document.querySelector("body > .content");

  burger.addEventListener("click", () => {
    container.style.setProperty("--top", window.scrollY + "px");
    container.classList.toggle("swiped");
  });

  let move = function (li, i) {
    const rect = li.getBoundingClientRect();
    lastRect = rect;

    teleportDiv.style.width = rect.width + "px";
    teleportDiv.style.height = rect.height + "px";
    teleportDiv.style.opacity = "1";
    teleportDiv.setAttribute("selected", i);
    teleportDiv.style.top = window.screenTop + rect.top + "px";
    teleportDiv.style.left = window.screenTop + rect.left + "px";
  };
  listItems.forEach((li, i) => {
    li.addEventListener("mouseenter", () => {
      move(li, i);
    });

    li.addEventListener("mouseleave", () => {
      if (!lastRect) return;

      const centerX = lastRect.left + lastRect.width / 2;
      const centerY = lastRect.top + lastRect.height / 2;
      teleportDiv.style.opacity = "0";
      teleportDiv.style.width = "0px";
      teleportDiv.style.height = "0px";
      teleportDiv.removeAttribute("selected");
      teleportDiv.style.left = window.screenTop + centerX + "px";
      teleportDiv.style.top = window.screenTop + centerY + "px";
    });
  });
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener("load", () => {
    const hash = window.location.hash;

    if (hash) {
      // Try scrolling to the element with the ID in the hash
      const target = document.querySelector(hash);
      setTimeout(function () {
        if (target) {
          target.scrollIntoView({ behavior: "smooth" }); // Optional smooth scroll
        }
      }, 300);
    } else {
      // No hash, scroll to top
      window.scrollTo(0, 0);
    }
  });

  const nav = document.querySelector("nav");
  document.querySelectorAll("nav ul li").forEach((e) => {
    e.addEventListener("click", () => {
      console.log("WTF? clickedddd");
      if (e.classList.contains("portfolio-link")) {
        scrollCount = 1;
        document.querySelector(
          ".scroll-sections"
        ).style.transform = `translateY(-${scrollCount * 100}vh)`;
        window.scrollTo(0, 0);
        window.addEventListener("wheel", handleCustomScroll, {
          passive: false,
        });
        window.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        window.addEventListener("touchend", handleTouchEnd, { passive: false });
        document.querySelectorAll(".section").forEach((e) => {
          e.classList.remove("fade-out");
          e.style.removeProperty("display");
        });

        document.body.style.overflow = "hidden";
      }
      if (window.innerWidth <= 500) {
        const content = document.querySelector("body > .content");
        if (content) {
          content.classList.toggle("swiped");
        }
      }
    });
  });
  // Add "moved" on first mouse move
  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      if (nav.classList.contains("moved")) return;
      let num = document
        .querySelector("#teleport-div")
        .getAttribute("selected");
      if (num) {
        let lis = document.querySelectorAll(`nav li`);

        let li = lis[num];
        setTimeout(function () {
          let num = document
            .querySelector("#teleport-div")
            .getAttribute("selected");
          if (num) {
            move(li, num);
          }
        }, 300);
      }
      nav.classList.add("moved");
    } else {
      if (nav.classList.contains("moved")) {
        nav.classList.remove("moved");
        let num = document
          .querySelector("#teleport-div")
          .getAttribute("selected");
        console.log(num);
        if (num) {
          let lis = document.querySelectorAll(`nav li`);

          let li = lis[num];
          console.log(li);
          setTimeout(function () {
            let num = document
              .querySelector("#teleport-div")
              .getAttribute("selected");
            if (num) move(li, num);
          }, 300);
        }
      }
    }
  });
});
