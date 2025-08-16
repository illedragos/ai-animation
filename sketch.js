let particles = [];
let numParticles = 100;
let noiseScale = 0.01;
let palette = [];
let paletteDark = [];
let paletteLight = [];
let bgColor;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-container");
  pixelDensity(1);
  console.log("p5 setup — canvas created", width, height);

  // color palettes for dark and light themes
  paletteDark = [
    color("#ff6b6b"),
    color("#ffd93d"),
    color("#6bcB77"),
    color("#4d96ff"),
    color("#a66dff"),
  ];

  // darker/muted palette for light background (more contrast on light)
  paletteLight = [
    color("#a83232"),
    color("#b8860b"),
    color("#2f7f4f"),
    color("#245caa"),
    color("#6b3fa0"),
  ];

  // choose initial theme from body class
  const initialIsLight = document.body.classList.contains("theme-light");
  palette = initialIsLight ? paletteLight : paletteDark;
  bgColor = initialIsLight ? color(245) : color(12);

  // scale particle count based on screen area (clamped)
  numParticles = constrain(Math.floor((width * height) / 15000), 80, 800);
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }

  // Ensure the container fills the viewport so the canvas parent stays full-screen
  const container = document.getElementById("canvas-container");
  if (container) {
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.zIndex = "0";
  }

  // Hook up theme toggle button
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    // set correct initial label/aria state
    btn.textContent = initialIsLight ? "Dark Mode" : "Light Mode";
    btn.setAttribute("aria-pressed", initialIsLight ? "true" : "false");

    btn.addEventListener("click", () => {
      const isNowLight = document.body.classList.toggle("theme-light");
      if (isNowLight) document.body.classList.remove("theme-dark");
      else document.body.classList.add("theme-dark");

      // update button label/state
      btn.textContent = isNowLight ? "Dark Mode" : "Light Mode";
      btn.setAttribute("aria-pressed", isNowLight ? "true" : "false");

      // apply theme changes to canvas and particles
      applyTheme(isNowLight);
    });
  }
}

function applyTheme(isLight) {
  palette = isLight ? paletteLight : paletteDark;
  bgColor = isLight ? color(245) : color(12);
  // recolor existing particles for immediate visual feedback
  for (let p of particles) {
    p.col = palette[floor(random(palette.length))];
  }
}

function draw() {
  // background uses the theme-aware color
  background(bgColor);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].show();
  }
}

function windowResized() {
  // resize to match the new window size and adapt particle count
  resizeCanvas(windowWidth, windowHeight);
  const newNum = constrain(Math.floor((width * height) / 15000), 80, 1200);

  if (newNum > particles.length) {
    // add more particles
    const add = newNum - particles.length;
    for (let i = 0; i < add; i++) particles.push(new Particle());
  } else if (newNum < particles.length) {
    // remove excess particles
    particles.splice(newNum);
  }

  // make sure existing particles are inside bounds
  for (let p of particles) {
    p.pos.x = constrain(p.pos.x, 0, width);
    p.pos.y = constrain(p.pos.y, 0, height);
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = random(1, 3);
    this.col = palette[floor(random(palette.length))];
    this.size = random(1, 3);
  }

  update() {
    const angle =
      noise(this.pos.x * noiseScale, this.pos.y * noiseScale) * TWO_PI * 4;
    this.acc.x = cos(angle);
    this.acc.y = sin(angle);
    this.acc.mult(0.1);

    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);

    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    // use the particle's color with alpha
    const r = red(this.col);
    const g = green(this.col);
    const b = blue(this.col);
    stroke(r, g, b, 220);
    strokeWeight(this.size);
    point(this.pos.x, this.pos.y);
  }
}
