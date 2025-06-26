const quantity = 7;
const style = document.createElement("style");

for (let i = 1; i <= quantity; i++) {
  const firefly = document.createElement("div");
  firefly.className = "firefly";

  // Random motion steps and duration
  const steps = Math.floor(Math.random() * 12) + 50;
  const duration = Math.floor(Math.random() * 10) + 300; // 8s to 18s

  // Create move keyframes for each firefly
  let keyframes = `@keyframes move${i} {`;
  for (let step = 0; step <= steps; step++) {
    const percent = (step * (100 / steps)).toFixed(2);
    const tx = (Math.random() * 100 - 50).toFixed(2); // -50vw to 50vw
    const ty = (Math.random() * 100 - 50).toFixed(2); // -50vh to 50vh
    const scale = (Math.random() * 0.75 + 0.25).toFixed(2);
    keyframes += `
          ${percent}% {
            transform: translateX(${tx}vw) translateY(${ty}vh) scale(${scale});
          }
        `;
  }
  keyframes += `}`;
  style.innerHTML += keyframes;

  // Assign animation
  firefly.style.left = "50%";
  firefly.style.top = "50%";
  firefly.style.margin = `-${0.2}vw 0 0 ${(Math.random() * 20 - 10).toFixed(
    2
  )}vw`;
  firefly.style.animationName = `move${i}`;
  firefly.style.animationDuration = `${duration}s`;

  // Randomize inner pseudo-element animation durations using CSS vars
  const beforeDuration = `${duration}s`;
  const afterDuration = `${Math.floor(Math.random() * 6 + 5)}s`;
  const afterDelay = `${Math.floor(Math.random() * 8 + 0.5)}s`;

  firefly.style.setProperty("--before-duration", beforeDuration);
  firefly.style.setProperty("--after-duration", afterDuration);
  firefly.style.setProperty("--after-delay", afterDelay);

  document.body.appendChild(firefly);
}

document.head.appendChild(style);
window.addEventListener("load", () => {
  const container = document.getElementById("ellipse-background");

  // Set and update container height using body height
  const updateContainerHeight = () => {
    container.style.height = `${document.body.offsetHeight}px`;
  };

  // Initial set
  updateContainerHeight();

  // Observe changes to body height
  const resizeObserver = new ResizeObserver(updateContainerHeight);
  resizeObserver.observe(document.body);

  const numEllipses = Math.floor(Math.random() * 10) + 20;

  const color1 = [
    "#00aeff",
    "#63ceff",
    "#6663ff",
    "#a763ff",
    "#c663ff",
    "#156abf",
  ];
  const color2 = [
    "#5915bf",
    "#9a15bf",
    "#3715bf",
    "#624eb5",
    "#8675c7",
    "#a875c7",
  ];

  const positions = [];
  const isValidPosition = (newTop) =>
    positions.every((pos) => Math.abs(pos - newTop) >= 50);

  const getHorizontalPosition = (zone) => {
    switch (zone) {
      case "left":
        return `${Math.random() * 25}%`;
      case "center":
        return `${25 + Math.random() * 50}%`;
      case "right":
        return `${75 + Math.random() * 25}%`;
    }
  };

  const directions = ["left", "center", "right"];
  const vhBuckets = {};
  let created = 0,
    attempts = 0;

  const fullHeight = document.body.offsetHeight;

  while (created < numEllipses && attempts < 1000) {
    attempts++;

    const size = Math.random() * 300 + 100;
    const top = Math.random() * (fullHeight - size);
    const vhGroup = Math.floor(top / window.innerHeight);

    if (!vhBuckets[vhGroup]) vhBuckets[vhGroup] = [];

    if (vhBuckets[vhGroup].length >= 3) continue;

    const usedDirs = new Set(vhBuckets[vhGroup]);
    const availableDirs = directions.filter((d) => !usedDirs.has(d));
    if (availableDirs.length === 0) continue;

    if (!isValidPosition(top)) continue;

    const direction =
      availableDirs[Math.floor(Math.random() * availableDirs.length)];
    const left = getHorizontalPosition(direction);

    const el = document.createElement("div");
    el.className = "ellipse";
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.position = "absolute";
    el.style.top = `${top}px`;
    el.style.left = left;

    const c1 = color1[Math.floor(Math.random() * color1.length)];
    const c2 = color2[Math.floor(Math.random() * color2.length)];
    el.style.background = `radial-gradient(circle, ${c1}, ${c2})`;

    container.appendChild(el);
    positions.push(top);
    vhBuckets[vhGroup].push(direction);
    created++;
  }
});
