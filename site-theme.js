/* ═══════════════════════════════════════════════════
   site-theme.js
   ملف JavaScript مشترك لكل صفحات الموقع
   يُضاف في كل صفحة: <script src="site-theme.js"></script>
   يُضاف قبل أي script آخر في الـ <body>
═══════════════════════════════════════════════════ */

/* ─── DARK MODE — مشترك بين كل الصفحات ───
   المفتاح المشترك: localStorage key = "site_theme"
   يعمل بـ BroadcastChannel لتزامن فوري بين التبويبات
─────────────────────────────────────────── */
(function(){
  const KEY = "site_theme";

  /* تطبيق الثيم فوراً عند تحميل الصفحة */
  const saved = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
  const mode = saved || (prefersDark ? "dark" : "light");
  _applyTheme(mode, false);

  function _applyTheme(m, broadcast){
    document.body.classList.toggle("dark", m === "dark");
    localStorage.setItem(KEY, m);

    /* تحديث الـ particles بعد التبديل */
    if(typeof window._ptclNeedRefresh === "function") window._ptclNeedRefresh();

    /* بث التغيير للتبويبات/الصفحات الأخرى */
    if(broadcast && window._themeChannel){
      window._themeChannel.postMessage(m);
    }
  }

  /* BroadcastChannel — يستقبل التغيير من صفحة أخرى */
  if(typeof BroadcastChannel !== "undefined"){
    window._themeChannel = new BroadcastChannel("site_theme_sync");
    window._themeChannel.onmessage = function(e){
      _applyTheme(e.data, false);
    };
  }

  /* expose globally */
  window.applyTheme  = function(m){ _applyTheme(m, true); };
  window.toggleTheme = function(){
    const isDark = document.body.classList.contains("dark");
    _applyTheme(isDark ? "light" : "dark", true);
  };
  window.getCurrentTheme = function(){
    return document.body.classList.contains("dark") ? "dark" : "light";
  };
})();


/* ─── PARTICLES — نظام موحد ───────────────────── */
(function(){
  /* ننتظر DOM جاهز */
  function initParticles(){
    /* أنشئ canvas لو مش موجود */
    let canvas = document.getElementById("site-particles");
    if(!canvas){
      canvas = document.createElement("canvas");
      canvas.id = "site-particles";
      document.body.insertBefore(canvas, document.body.firstChild);
    }

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId;
    const COUNT = 90;

    function resize(){
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function ptclColor(){
      return document.body.classList.contains("dark")
        ? "rgba(167,139,250,.55)"   /* بنفسجي فاتح على الدارك */
        : "rgba(91,33,182,.35)";    /* بنفسجي داكن على الفاتح */
    }

    class Particle{
      constructor(){this.reset(true);}
      reset(rand){
        this.x  = Math.random() * canvas.width;
        this.y  = rand ? Math.random() * canvas.height : -4;
        this.r  = Math.random() * 2 + .8;
        this.vx = (Math.random() - .5) * .35;
        this.vy = (Math.random() - .5) * .35;
      }
      update(){
        this.x += this.vx;
        this.y += this.vy;
        if(this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if(this.y < 0 || this.y > canvas.height)  this.vy *= -1;
      }
      draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
        ctx.fillStyle = ptclColor();
        ctx.fill();
      }
    }

    function init(){
      particles = [];
      for(let i=0;i<COUNT;i++) particles.push(new Particle());
    }

    function drawConnections(){
      const maxDist = 120;
      const col = ptclColor();
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if(d < maxDist){
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = col.replace(/[\d.]+\)$/, `${.22*(1-d/maxDist)})`);
            ctx.lineWidth   = .6;
            ctx.stroke();
          }
        }
      }
    }

    function animate(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p=>{p.update();p.draw();});
      drawConnections();
      animId = requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    window.addEventListener("resize", ()=>{resize();init();});

    /* عند تبديل الثيم — الـ canvas يعيد رسم الألوان تلقائياً في الـ frame التالي */
    window._ptclNeedRefresh = function(){/* no-op — يعمل تلقائياً */};
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", initParticles);
  }else{
    initParticles();
  }
})();


/* ─── HELPER: زرار الثيم في أي صفحة ────────────
   ضع هذا HTML في أي هيدر:

   <div class="theme-toggle" onclick="toggleTheme()">
     <div class="toggle-track">
       <span class="t-icon t-sun">☀️</span>
       <span class="t-icon t-moon">🌙</span>
       <div class="toggle-thumb"></div>
     </div>
   </div>
────────────────────────────────────────────── */
