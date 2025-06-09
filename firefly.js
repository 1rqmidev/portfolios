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
