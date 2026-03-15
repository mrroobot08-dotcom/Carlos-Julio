class Estudiante {
  constructor(nombre, edad, programa, notaFinal) {
    this.id        = Date.now() + Math.random();
    this.nombre    = nombre;
    this.edad      = edad;
    this.programa  = programa;
    this.notaFinal = notaFinal;
  }
  aprobado() { return this.notaFinal >= 3.0; }
  estadoText() { return this.aprobado() ? "Aprobó" : "Reprobó"; }
}

let estudiantes = [
  new Estudiante("Laura Gómez",   18, "Programación", 4.2),
  new Estudiante("Carlos Pérez",  20, "Diseño Web",   2.8),
  new Estudiante("Sofía Ruiz",    19, "Sistemas",     3.7),
];

let filtroActivo = "todos";

// ─── REFS ────────────────────────────────────────────────────────
const nombreInput  = document.getElementById("nombre");
const edadInput    = document.getElementById("edad");
const programaInput= document.getElementById("programa");
const notaInput    = document.getElementById("nota");
const btnRegistrar = document.getElementById("btnRegistrar");
const mensajeEl    = document.getElementById("mensaje");
const listaEl      = document.getElementById("listaEstudiantes");
const notaPreview  = document.getElementById("notaPreview");

// ─── NOTA PREVIEW ────────────────────────────────────────────────
notaInput.addEventListener("input", () => {
  const val = parseFloat(notaInput.value);
  if (isNaN(val) || notaInput.value === "") {
    notaPreview.textContent = "—";
    notaPreview.className   = "nota-preview";
  } else if (val >= 3.0) {
    notaPreview.textContent = "✓ Aprueba";
    notaPreview.className   = "nota-preview aprobado";
  } else {
    notaPreview.textContent = "✗ Reprueba";
    notaPreview.className   = "nota-preview reprobado";
  }
});

// ─── RENDER ──────────────────────────────────────────────────────
function render() {
  // Filtrar
  const visibles = estudiantes.filter(e => {
    if (filtroActivo === "aprobados")  return e.aprobado();
    if (filtroActivo === "reprobados") return !e.aprobado();
    return true;
  });

  listaEl.innerHTML = "";

  if (visibles.length === 0) {
    listaEl.innerHTML = `
      <div class="vacio">
        <span class="vacio-icon">📋</span>
        No hay estudiantes${filtroActivo !== "todos" ? " con este filtro" : " registrados"}.
      </div>`;
  } else {
    visibles.forEach((e, idx) => {
      const aprobado = e.aprobado();
      const div = document.createElement("div");
      div.className = `tarjeta ${aprobado ? 'aprobado-card' : 'reprobado-card'}`;
      div.style.animationDelay = `${idx * 0.05}s`;
      div.innerHTML = `
        <div class="tarjeta-top">
          <h3>${e.nombre}</h3>
          <span class="tarjeta-orden">#${idx + 1}</span>
        </div>
        <p><strong>Edad:</strong> ${e.edad} años</p>
        <p><strong>Programa:</strong> ${e.programa}</p>
        <div class="nota-grande">${e.notaFinal.toFixed(1)}</div>
        <span class="estado-tag">${aprobado ? '✅' : '❌'} ${e.estadoText()}</span>
        <button class="btn-eliminar-card" onclick="eliminar('${e.id}')" title="Eliminar">✕</button>
      `;
      listaEl.appendChild(div);
    });
  }

  actualizarStats();
}

function actualizarStats() {
  const aprobados  = estudiantes.filter(e => e.aprobado()).length;
  const reprobados = estudiantes.length - aprobados;
  const promedio   = estudiantes.length
    ? (estudiantes.reduce((s, e) => s + e.notaFinal, 0) / estudiantes.length).toFixed(1)
    : "—";

  document.getElementById("totalEstudiantes").textContent = estudiantes.length;
  document.getElementById("totalAprobados").textContent   = aprobados;
  document.getElementById("totalReprobados").textContent  = reprobados;
  document.getElementById("promedioGen").textContent      = promedio;
}

// ─── REGISTRAR ───────────────────────────────────────────────────
btnRegistrar.addEventListener("click", () => {
  const nombre   = nombreInput.value.trim();
  const edad     = parseInt(edadInput.value);
  const programa = programaInput.value.trim();
  const nota     = parseFloat(notaInput.value);

  if (!nombre)                     return msg("⚠ Escribe el nombre.", "error");
  if (!programa)                   return msg("⚠ Escribe el programa.", "error");
  if (isNaN(edad) || edad <= 0)    return msg("⚠ La edad debe ser mayor que 0.", "error");
  if (isNaN(nota) || nota < 0 || nota > 5) return msg("⚠ La nota debe estar entre 0.0 y 5.0.", "error");

  const e = new Estudiante(nombre, edad, programa, nota);
  estudiantes.push(e);

  msg(`✓ ${nombre} registrado — ${e.estadoText()} (${nota})`, "exito");
  nombreInput.value = edadInput.value = programaInput.value = notaInput.value = "";
  notaPreview.textContent = "—";
  notaPreview.className   = "nota-preview";
  filtroActivo = "todos";
  document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
  document.querySelector('[data-filtro="todos"]').classList.add("activo");
  render();
  nombreInput.focus();
});

function msg(texto, tipo) {
  mensajeEl.textContent = texto;
  mensajeEl.className   = "mensaje " + tipo;
}

// ─── ELIMINAR ────────────────────────────────────────────────────
function eliminar(id) {
  const e = estudiantes.find(e => String(e.id) === String(id));
  if (!e) return;
  if (!confirm(`¿Eliminar a "${e.nombre}" del registro?`)) return;
  estudiantes = estudiantes.filter(e => String(e.id) !== String(id));
  msg(`✓ ${e.nombre} eliminado del registro.`, "exito");
  render();
}

// ─── FILTROS ─────────────────────────────────────────────────────
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    filtroActivo = btn.dataset.filtro;
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    render();
  });
});

// Enter en formulario
document.addEventListener("keydown", e => {
  if (e.key === "Enter") btnRegistrar.click();
});

render();
