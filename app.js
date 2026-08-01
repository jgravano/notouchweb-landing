const brewSteps = [
  { kicker: "01 / 04 · V60", title: "Bloom", copy: "Pour slowly to 50g.", time: "00:30", weight: "50g" },
  { kicker: "02 / 04 · V60", title: "Second pour", copy: "Continue in gentle circles to 150g.", time: "01:12", weight: "150g" },
  { kicker: "03 / 04 · V60", title: "Final pour", copy: "Finish the brew at 250g.", time: "01:55", weight: "250g" },
  { kicker: "04 / 04 · V60", title: "Draw down", copy: "Remove the dripper around 02:45.", time: "02:45", weight: "ready" },
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const track = document.querySelector("[data-brew-track]");
const monitorDots = [...document.querySelectorAll("[data-brew-dot]")];
let heroStep = 0;
let heroTimer = null;

function renderHeroStep(index) {
  heroStep = (index + brewSteps.length) % brewSteps.length;
  if (track) track.style.transform = `translateY(-${heroStep * 25}%)`;
  monitorDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === heroStep));
}

function startHeroCycle() {
  if (prefersReducedMotion || !track) return;
  clearInterval(heroTimer);
  heroTimer = setInterval(() => renderHeroStep(heroStep + 1), 4600);
}

monitorDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    renderHeroStep(Number(dot.dataset.brewDot));
    startHeroCycle();
  });
});

renderHeroStep(0);
startHeroCycle();

const header = document.querySelector("[data-header]");
let lastScrollY = -1;
function updateHeader() {
  if (window.scrollY === lastScrollY) return;
  lastScrollY = window.scrollY;
  header?.classList.toggle("is-scrolled", window.scrollY > 60);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
navToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(Boolean(open)));
});
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
}));

const dialog = document.querySelector("[data-demo-dialog]");
const demoStage = document.querySelector("[data-demo-stage]");
const video = document.querySelector("[data-camera-video]");
const canvas = document.querySelector("[data-camera-canvas]");
const status = document.querySelector("[data-camera-status]");
const startCameraButton = document.querySelector("[data-start-camera]");
const toast = document.querySelector("[data-toast]");
let stream = null;
let cameraLoopId = null;
let demoStep = 0;
let previousFrame = null;
let motionArmed = true;
let lastMotionAt = 0;
let dragStartX = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openDialog() {
  if (!dialog) return;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  requestAnimationFrame(() => demoStage?.focus());
}

function stopCamera() {
  cancelAnimationFrame(cameraLoopId);
  cameraLoopId = null;
  previousFrame = null;
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  if (video) {
    video.srcObject = null;
    video.classList.remove("active");
    video.closest(".video-shell")?.classList.remove("has-video");
  }
  status?.classList.remove("active");
  if (status) status.lastChild.textContent = "Camera is off";
  if (startCameraButton) startCameraButton.textContent = "Enable camera";
}

function closeDialog() {
  stopCamera();
  dialog?.close();
}

document.querySelectorAll("[data-open-demo]").forEach((button) => button.addEventListener("click", openDialog));
document.querySelector("[data-close-demo]")?.addEventListener("click", closeDialog);
dialog?.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) closeDialog();
});
dialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog();
});

const demoEls = {
  brew: document.querySelector("[data-demo-brew]"),
  kicker: document.querySelector("[data-demo-kicker]"),
  title: document.querySelector("[data-demo-title]"),
  copy: document.querySelector("[data-demo-copy]"),
  time: document.querySelector("[data-demo-time]"),
  weight: document.querySelector("[data-demo-weight]"),
  count: document.querySelector("[data-demo-count]"),
  progress: document.querySelector("[data-demo-progress]"),
};

function renderDemoStep(index, announce = false) {
  demoStep = (index + brewSteps.length) % brewSteps.length;
  const step = brewSteps[demoStep];
  demoEls.brew?.classList.add("is-changing");
  setTimeout(() => {
    if (demoEls.kicker) demoEls.kicker.textContent = step.kicker;
    if (demoEls.title) demoEls.title.textContent = step.title;
    if (demoEls.copy) demoEls.copy.textContent = step.copy;
    if (demoEls.time) demoEls.time.textContent = step.time;
    if (demoEls.weight) demoEls.weight.textContent = step.weight;
    if (demoEls.count) demoEls.count.textContent = `${demoStep + 1} / ${brewSteps.length}`;
    if (demoEls.progress) demoEls.progress.style.width = `${((demoStep + 1) / brewSteps.length) * 100}%`;
    demoEls.brew?.classList.remove("is-changing");
  }, 150);
  renderHeroStep(demoStep);
  if (announce) showToast(`${step.title} — ${step.weight}`);
}

document.querySelector("[data-demo-prev]")?.addEventListener("click", () => renderDemoStep(demoStep - 1, true));
document.querySelector("[data-demo-next]")?.addEventListener("click", () => renderDemoStep(demoStep + 1, true));

demoStage?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    renderDemoStep(demoStep + 1, true);
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    renderDemoStep(demoStep - 1, true);
  }
});

demoStage?.addEventListener("pointerdown", (event) => {
  dragStartX = event.clientX;
  demoStage.setPointerCapture?.(event.pointerId);
});
demoStage?.addEventListener("pointerup", (event) => {
  if (dragStartX == null) return;
  const delta = event.clientX - dragStartX;
  dragStartX = null;
  if (Math.abs(delta) > 42) renderDemoStep(demoStep + (delta < 0 ? 1 : -1), true);
});

function analyzeMotion() {
  if (!stream || !video || !canvas || video.readyState < 2) {
    cameraLoopId = requestAnimationFrame(analyzeMotion);
    return;
  }

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.save();
  context.scale(-1, 1);
  context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
  context.restore();
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const current = new Uint8Array(canvas.width * canvas.height);
  let changed = 0;

  for (let pixel = 0, index = 0; pixel < pixels.length; pixel += 4, index += 1) {
    const gray = (pixels[pixel] * 0.299 + pixels[pixel + 1] * 0.587 + pixels[pixel + 2] * 0.114) | 0;
    current[index] = gray;
    if (previousFrame && Math.abs(gray - previousFrame[index]) > 26) changed += 1;
  }

  if (previousFrame) {
    const ratio = changed / current.length;
    const now = performance.now();
    if (ratio > 0.095 && motionArmed && now - lastMotionAt > 1150) {
      motionArmed = false;
      lastMotionAt = now;
      renderDemoStep(demoStep + 1, true);
      if (status) status.lastChild.textContent = "Gesture detected";
    }
    if (ratio < 0.035) {
      motionArmed = true;
      if (status) status.lastChild.textContent = "Camera active · wave to advance";
    }
  }

  previousFrame = current;
  cameraLoopId = requestAnimationFrame(analyzeMotion);
}

async function startCamera() {
  if (stream) {
    stopCamera();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera access requires localhost or HTTPS. Drag the demo instead.");
    return;
  }

  try {
    if (startCameraButton) startCameraButton.textContent = "Starting…";
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();
    video.classList.add("active");
    video.closest(".video-shell")?.classList.add("has-video");
    status?.classList.add("active");
    if (status) status.lastChild.textContent = "Camera active · wave to advance";
    if (startCameraButton) startCameraButton.textContent = "Turn camera off";
    analyzeMotion();
  } catch (error) {
    stream = null;
    if (startCameraButton) startCameraButton.textContent = "Enable camera";
    showToast("Camera wasn’t available. You can still drag or use arrow keys.");
  }
}

startCameraButton?.addEventListener("click", startCamera);
renderDemoStep(0);

document.querySelectorAll(".install-button").forEach((button) => {
  button.addEventListener("dblclick", () => showToast("Chrome extension link will live here."));
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
