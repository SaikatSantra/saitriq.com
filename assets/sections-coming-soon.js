(function() {
  const canvas = document.getElementById('fluidCanvas');
  const wrapper = document.getElementById('saitriqEngine');
  if (!canvas || !wrapper) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let particles = [];
  const mouse = { x: width / 2, y: height / 2, px: width / 2, py: height / 2, vx: 0, vy: 0, active: false };
  const viscousFluidDrag = 0.96;

  // Global particle color references mapped to dynamically track active DOM swatches
  let currentAccent1 = "#2563eb";
  let currentAccent2 = "#ff6a00";

  class DustParticle {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2 - 0.05;
      this.alpha = Math.random() * 0.3 + 0.15;
      this.colorSelector = Math.random() > 0.5;
    }

    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radiusForceThreshold = 130;

      if (distance < radiusForceThreshold) {
        const power = (radiusForceThreshold - distance) / radiusForceThreshold;
        this.vx += mouse.vx * power * 0.12;
        this.vy += mouse.vy * power * 0.12;
      }

      this.vx *= viscousFluidDrag;
      this.vy *= viscousFluidDrag;

      this.x += this.vx + (Math.sin(Date.now() * 0.001 + this.radius) * 0.02);
      this.y += this.vy;

      if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
        this.reset();
        this.y = height + 5;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      
      // Hex to RGB parser tool to ensure opacity rules applied cleanly over canvas frame refreshes
      const hex = this.colorSelector ? currentAccent1 : currentAccent2;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
      ctx.shadowColor = hex;
      ctx.shadowBlur = this.radius * 3;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const dustDensity = Math.min(Math.floor((width * height) / 2200), 550); 
    for (let i = 0; i < dustDensity; i++) {
      particles.push(new DustParticle());
    }
  }

  function animate() {
    // Collect computed background values to match trailing canvas metrics to active theme selections
    const bgStyle = window.getComputedStyle(wrapper).backgroundColor;
    ctx.fillStyle = bgStyle.replace('rgb', 'rgba').replace(')', ', 0.2)');
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillRect(0, 0, width, height);

    if (mouse.active) {
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  // --- Swatch Interactions Event Controller ---
  const swatches = document.querySelectorAll('.swatch-btn');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      
      const targetTheme = swatch.getAttribute('data-theme');
      wrapper.setAttribute('data-active-theme', targetTheme);

      // Extract colors to feed directly into the particle vector layers
      setTimeout(() => {
        const computedStyle = window.getComputedStyle(wrapper);
        currentAccent1 = computedStyle.getPropertyValue('--accent-1').trim();
        currentAccent2 = computedStyle.getPropertyValue('--accent-2').trim();
      }, 50);
    });
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!mouse.active) {
      mouse.px = e.clientX - rect.left;
      mouse.py = e.clientY - rect.top;
      mouse.active = true;
    }
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.vx = 0; mouse.vy = 0;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init();
  });

  init();
  animate();
})();