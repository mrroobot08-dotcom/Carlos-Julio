class Libro {
  constructor(titulo, autor, genero = "General") {
    this.id         = Date.now() + Math.random();
    this.titulo     = titulo;
    this.autor      = autor;
    this.genero     = genero;
    this.disponible = true;
    this.prestadoA  = null;
    this.emoji      = elegirEmoji(genero);
  }

  prestar(nombre) {
    if (!this.disponible) return false;
    this.disponible = false;
    this.prestadoA  = nombre || "Lector";
    return true;
  }

  devolver() {
    if (this.disponible) return false;
    this.disponible = true;
    this.prestadoA  = null;
    return true;
  }
}

function elegirEmoji(genero) {
  const map = {
    "novela": "📖", "ciencia": "🔬", "historia": "🏛️",
    "fantasia": "🧙", "poesia": "✍️", "tecnologia": "💻",
    "arte": "🎨", "filosofia": "🤔", "biologia": "🌿",
    "general": "📕"
  };
  const key = Object.keys(map).find(k => genero.toLowerCase().includes(k)) ?? "general";
  return map[key];
}

let libros = [
  new Libro("Cien años de soledad", "Gabriel García Márquez", "Novela"),
  new Libro("Don Quijote de la Mancha", "Miguel de Cervantes", "Novela"),
  new Libro("El principito", "Antoine de Saint-Exupéry", "Fantasía"),
  new Libro("Sapiens", "Yuval Noah Harari", "Historia"),
  new Libro("El código da Vinci", "Dan Brown", "Novela"),
];

let filtroActivo = "todos";
let busqueda = "";

// ─── PRESTAR / DEVOLVER ───────────────────────────────────────────
function prestar(id) {
  const libro = libros.find(l => String(l.id) === String(id));
  if (!libro) return;
  const nombre = prompt(`¿A quién se presta "${libro.titulo}"?`, "");
  if (nombre === null) return;
  if (libro.prestar(nombre.trim() || "Lector")) {
    toast(`📤 "${libro.titulo}" prestado a ${libro.prestadoA}`);
    render();
  }
}

function devolver(id) {
  const libro = libros.find(l => String(l.id) === String(id));
  if (!libro) return;
  if (libro.devolver()) {
    toast(`📥 "${libro.titulo}" devuelto correctamente`);
    render();
  }
}

// ─── ELIMINAR ─────────────────────────────────────────────────────
function eliminar(id) {
  const libro = libros.find(l => String(l.id) === String(id));
  if (!libro) return;
  if (!confirm(`¿Eliminar "${libro.titulo}" del sistema?`)) return;
  libros = libros.filter(l => String(l.id) !== String(id));
  toast(`🗑️ "${libro.titulo}" eliminado`);
  render();
}

// ─── RENDER ───────────────────────────────────────────────────────
function render() {
  const lista = document.getElementById("listaLibros");

  let visibles = libros.filter(l => {
    if (filtroActivo === "disponibles") return l.disponible;
    if (filtroActivo === "prestados")   return !l.disponible;
    return true;
  });

  if (busqueda) {
    const q = busqueda.toLowerCase();
    visibles = visibles.filter(l =>
      l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q)
    );
  }

  lista.innerHTML = "";

  if (visibles.length === 0) {
    lista.innerHTML = `
      <div class="vacio">
        <span class="vacio-icon">📭</span>
        <p>No se encontraron libros${busqueda ? ' para "' + busqueda + '"' : ''}.</p>
      </div>`;
  } else {
    visibles.forEach((l, i) => {
      const div = document.createElement("div");
      div.className = `libro-card ${l.disponible ? 'disponible' : 'prestado'}`;
      div.style.animationDelay = `${i * 0.05}s`;

      div.innerHTML = `
        <div class="libro-portada">${l.emoji}</div>
        <div class="libro-cuerpo">
          <div class="libro-genero">${l.genero}</div>
          <div class="libro-titulo">${l.titulo}</div>
          <div class="libro-autor">${l.autor}</div>
          <span class="libro-estado ${l.disponible ? 'estado-disp' : 'estado-prest'}">
            ${l.disponible ? '✅ Disponible' : '🔖 Prestado'}
          </span>
          ${!l.disponible ? `<div class="libro-prestado-a">👤 Prestado a: <strong>${l.prestadoA}</strong></div>` : ''}
          <div class="libro-btns">
            ${l.disponible
              ? `<button class="btn-prestar"  onclick="prestar('${l.id}')">📤 Prestar</button>`
              : `<button class="btn-devolver" onclick="devolver('${l.id}')">📥 Devolver</button>`
            }
            <button class="btn-del" onclick="eliminar('${l.id}')" title="Eliminar">🗑️</button>
          </div>
        </div>
      `;
      lista.appendChild(div);
    });
  }

  actualizarStats();
}

function actualizarStats() {
  const disponibles = libros.filter(l => l.disponible).length;
  document.getElementById("stTotal").textContent       = libros.length;
  document.getElementById("stDisponibles").textContent = disponibles;
  document.getElementById("stPrestados").textContent   = libros.length - disponibles;
}

// ─── AGREGAR LIBRO ────────────────────────────────────────────────
document.getElementById("btnAgregar").addEventListener("click", () => {
  const titulo  = document.getElementById("inTitulo").value.trim();
  const autor   = document.getElementById("inAutor").value.trim();
  const genero  = document.getElementById("inGenero").value.trim() || "General";
  const msgEl   = document.getElementById("msgAdd");

  if (!titulo) return showMsg("⚠ Escribe el título del libro.", true);
  if (!autor)  return showMsg("⚠ Escribe el nombre del autor.", true);

  // Verificar duplicado
  if (libros.find(l => l.titulo.toLowerCase() === titulo.toLowerCase())) {
    return showMsg("⚠ Este libro ya está registrado.", true);
  }

  libros.push(new Libro(titulo, autor, genero));
  document.getElementById("inTitulo").value  = "";
  document.getElementById("inAutor").value   = "";
  document.getElementById("inGenero").value  = "";
  showMsg(`✓ "${titulo}" agregado correctamente.`, false);
  render();
});

function showMsg(texto, esError) {
  const el = document.getElementById("msgAdd");
  el.textContent = texto;
  el.className   = "msg-add" + (esError ? " err" : "");
  setTimeout(() => { el.textContent = ""; el.className = "msg-add"; }, 3000);
}

// ─── FILTROS ──────────────────────────────────────────────────────
document.querySelectorAll(".filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    filtroActivo = btn.dataset.f;
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    render();
  });
});

// ─── BÚSQUEDA ─────────────────────────────────────────────────────
document.getElementById("buscar").addEventListener("input", function() {
  busqueda = this.value;
  render();
});

// ─── ENTER EN FORMULARIO ──────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id !== "buscar") {
    document.getElementById("btnAgregar").click();
  }
});

// ─── TOAST ────────────────────────────────────────────────────────
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

render();
