/* =====================================================
   ✏️  AQUÍ EDITAS TODO EL CONTENIDO (no necesitas tocar
   nada más abajo de la línea "NO TOCAR")
   ===================================================== */
const CONFIG = {
  // Código del sobre (solo dígitos). Puede tener los que quieras.
  code: "2206",
  // Pista que aparece debajo del teclado (déjala "" si no quieres pista)
  hint: "♡",
  // Teclado: false = orden normal (1 al 9 y 0). true = números en desorden, se mezclan en cada intento
  shuffleKeys: false,

  // Carta
  letterTitle: "Hola corazón...",
  letter: [
    "No puedo terminar de expresar lo agradecido que estoy de tenerte en mi vida, de la tremenda suerte que tuve por coincidir contigo.",
    "Te has vuelto muy especial para mi por diversas razones entre ellas tu gentileza, tu forma de ser y agradezco que me hagas sentir querido.",
    "Así que quería hacer este pequeño detalle para recordartelas cosas que adoro de ti ♡",
  ],

  // Post-its: "front" es lo que se ve al inicio.
  // Al hacer clic se voltea y muestra la foto y el texto.
  // Las fotos van en la carpeta "photos".
  postits: [
    { front: "Tu esfuerzo", photo: "1.jpg", text: "Admiro que eres trabajadora e inteligente." },
    { front: "Tu convicción", photo: "2.jpg", text: "Defiendes tus ideales y no te dejas de nadie." },
    { front: "Tu corazón", photo: "3.jpg", text: "Eres sensible, amable y cariñosa" },
    { front: "Tu ♡", photo: "4.jpg", text: "No cabe todo pero espero recuerdes que te quiero mucho" },
  ],

  // Cassettes: cada uno reproduce una canción.
  // Los archivos van en la carpeta "songs".
  songs: [
    { title: "Floating", file: "songs/1.mp3" },
    { title: "Her", file: "songs/2.mp3" },
    { title: "MMOW", file: "songs/3.mp3" },
  ],
};

/* =====================================================
   NO TOCAR (a menos que quieras cambiar cómo funciona)
   ===================================================== */

const $ = (id) => document.getElementById(id);

function showScreen(id) {
  // Si salimos de los cassettes, la música se detiene
  if (id !== "screen-tapes" && typeof window.stopAllTapes === "function") window.stopAllTapes();
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

/* ---------- 1. Sobre + teclado ---------- */
(function setupLock() {
  const display = $("code-dots");
  const keypad = $("keypad");
  const code = CONFIG.code;
  let entered = "";
  let locked = false;

  $("lock-hint").textContent = CONFIG.hint;

  // Una casilla por cada dígito del código
  for (let i = 0; i < code.length; i++) {
    display.appendChild(document.createElement("span"));
  }

  function paint() {
    [...display.children].forEach((box, i) => {
      box.textContent = entered[i] || "";
      box.classList.toggle("filled", i < entered.length);
    });
  }

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function press(key) {
    if (locked) return;
    if (key === "clear") {
      entered = "";
    } else if (key === "back") {
      entered = entered.slice(0, -1);
    } else {
      if (entered.length >= code.length) return;
      entered += key;
    }
    paint();
    if (entered.length === code.length) check();
  }

  function check() {
    locked = true;
    if (entered === code) {
      setTimeout(() => {
        $("keypad-panel").classList.add("hide");
        $("envelope").classList.add("open");
        setTimeout(() => showScreen("screen-ask"), 900);
      }, 350);
    } else {
      display.classList.add("shake");
      setTimeout(() => {
        display.classList.remove("shake");
        entered = "";
        paint();
        buildKeypad(); // los números se vuelven a mezclar
        locked = false;
      }, 600);
    }
  }

  // Teclado con los dígitos en desorden: 9 arriba, y abajo Borrar - 1 dígito - Atrás
  function buildKeypad() {
    keypad.innerHTML = "";
    const base = "1234567890".split("");
    const digits = CONFIG.shuffleKeys ? shuffle(base) : base;
    const cells = [...digits.slice(0, 9), "clear", digits[9], "back"];
    cells.forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "key";
      if (k === "clear") {
        b.textContent = "Borrar";
        b.classList.add("key-action");
      } else if (k === "back") {
        b.textContent = "←";
        b.classList.add("key-action");
      } else {
        b.textContent = k;
      }
      b.addEventListener("click", () => press(k));
      keypad.appendChild(b);
    });
  }

  buildKeypad();
})();

/* ---------- 2. Pregunta: SÍ y NO que escapa ---------- */
(function setupAsk() {
  const noBtn = $("no-btn");
  const yesBtn = $("yes-btn");
  let offX = 0;
  let offY = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function moveNo(kind) {
    const r = noBtn.getBoundingClientRect();
    const baseLeft = r.left - offX;
    const baseTop = r.top - offY;
    const m = 8;
    const maxX = window.innerWidth - r.width - m;
    const maxY = window.innerHeight - r.height - m;
    let nx = r.left;
    let ny = r.top;

    if (kind === "mouse") {
      // En PC: se escapa a cualquier lugar de la pantalla, lejos de donde estaba
      for (let i = 0; i < 12; i++) {
        nx = m + Math.random() * (maxX - m);
        ny = m + Math.random() * (maxY - m);
        if (Math.hypot(nx - r.left, ny - r.top) > 180) break;
      }
    } else {
      // En celular: salta poquito, siempre dentro de la pantalla
      const dist = 90 + Math.random() * 60;
      const angle = Math.random() * Math.PI * 2;
      nx = clamp(r.left + Math.cos(angle) * dist, m, maxX);
      ny = clamp(r.top + Math.sin(angle) * dist, m, maxY);
    }

    offX = nx - baseLeft;
    offY = ny - baseTop;
    noBtn.style.transform = `translate(${offX}px, ${offY}px)`;
  }

  noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") moveNo("mouse");
  });
  noBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    moveNo(e.pointerType === "mouse" ? "mouse" : "touch");
  });
  noBtn.addEventListener("click", (e) => e.preventDefault());

  window.addEventListener("resize", () => {
    offX = 0;
    offY = 0;
    noBtn.style.transform = "";
  });

  yesBtn.addEventListener("click", () => showScreen("screen-letter"));
})();

/* ---------- 3. Carta ---------- */
(function setupLetter() {
  $("letter-title").textContent = CONFIG.letterTitle;
  const box = $("letter-text");
  CONFIG.letter.forEach((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    box.appendChild(p);
  });
})();

/* ---------- 4. Post-its ---------- */
(function setupPostits() {
  const grid = $("postit-grid");
  const colors = ["#f9e4a8", "#f4c6d0", "#cfe3c4", "#d3dff0"];
  const tilts = [-3, 2, -2, 3];

  CONFIG.postits.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "postit";
    card.style.setProperty("--bg", colors[i % colors.length]);
    card.style.setProperty("--rot", tilts[i % tilts.length] + "deg");

    const inner = document.createElement("div");
    inner.className = "postit-inner";

    const front = document.createElement("div");
    front.className = "postit-face postit-front";
    front.textContent = p.front;

    const back = document.createElement("div");
    back.className = "postit-face postit-back";

    const box = document.createElement("div");
    box.className = "photo-box";
    const img = document.createElement("img");
    img.alt = "";
    img.src = p.photo;
    img.addEventListener("error", () => box.classList.add("no-photo"));
    box.appendChild(img);

    const txt = document.createElement("div");
    txt.textContent = p.text;

    back.append(box, txt);
    inner.append(front, back);
    card.appendChild(inner);
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    grid.appendChild(card);
  });
})();

/* ---------- 5. Cassettes ---------- */
(function setupTapes() {
  const grid = $("tape-grid");
  const status = $("tape-status");
  let current = null; // { audio, el }

  function stopCurrent() {
    if (!current) return;
    current.audio.pause();
    current.el.classList.remove("playing");
    current = null;
  }

  window.stopAllTapes = () => {
    stopCurrent();
    status.textContent = "";
  };

  CONFIG.songs.forEach((s) => {
    const tape = document.createElement("div");
    tape.className = "tape";
    tape.innerHTML =
      '<div class="tape-label"></div>' +
      '<div class="tape-window"><span class="reel"></span><span class="reel"></span></div>';
    tape.querySelector(".tape-label").textContent = s.title;

    const audio = new Audio(s.file);
    audio.preload = "none";
    audio.addEventListener("ended", () => {
      tape.classList.remove("playing");
      status.textContent = "";
      if (current && current.el === tape) current = null;
    });

    tape.addEventListener("click", () => {
      if (current && current.el === tape) {
        stopCurrent();
        status.textContent = "";
        return;
      }
      stopCurrent();
      audio
        .play()
        .then(() => {
          tape.classList.add("playing");
          current = { audio, el: tape };
          status.textContent = "♪ " + s.title;
        })
        .catch(() => {
          status.textContent = "No se encontró la canción (" + s.file + ")";
        });
    });

    grid.appendChild(tape);
  });
})();

/* ---------- Botones "Siguiente" y "Atrás" ---------- */
document.querySelectorAll("[data-go]").forEach((b) => {
  b.addEventListener("click", () => showScreen(b.dataset.go));
});