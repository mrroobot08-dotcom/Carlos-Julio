// ─── MODELO ──────────────────────────────────────────────────────
class CuentaBancaria {
  constructor(titular, saldo) {
    this.titular  = titular;
    this.saldo    = saldo;
    this.historial = [];
  }

  ingresar(monto) {
    if (!validarMonto(monto)) return { ok: false, msg: "Monto inválido" };
    this.saldo += monto;
    this._guardar("deposito", `Depósito recibido`, monto, true);
    return { ok: true, msg: `+${fmt(monto)} depositados`, monto };
  }

  retirar(monto) {
    if (!validarMonto(monto)) return { ok: false, msg: "Monto inválido" };
    if (monto > this.saldo) return { ok: false, msg: `Saldo insuficiente. Tienes ${fmt(this.saldo)}` };
    this.saldo -= monto;
    this._guardar("retiro", `Retiro de cuenta`, monto, false);
    return { ok: true, msg: `-${fmt(monto)} retirados`, monto };
  }

  transferir(monto, destino) {
    if (!validarMonto(monto)) return { ok: false, msg: "Monto inválido" };
    if (monto > this.saldo) return { ok: false, msg: `Saldo insuficiente. Tienes ${fmt(this.saldo)}` };
    this.saldo -= monto;
    this._guardar("transferencia", `Transferencia a ${destino}`, monto, false);
    return { ok: true, msg: `Transferencia a ${destino} exitosa`, monto };
  }

  consultar() {
    this._guardar("consulta", "Consulta de saldo", this.saldo, null);
    return { ok: true, msg: `Saldo: ${fmt(this.saldo)}`, monto: this.saldo };
  }

  _guardar(tipo, desc, monto, positivo) {
    const d = new Date();
    const hora = d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    this.historial.unshift({ tipo, desc, monto, positivo, hora });
    if (this.historial.length > 30) this.historial.pop();
  }
}

function validarMonto(m) { return typeof m === "number" && m > 0 && isFinite(m); }
function fmt(v) {
  return "$" + Math.round(v).toLocaleString("es-CO");
}

// ─── CUENTAS ─────────────────────────────────────────────────────
const cuentas = [
  new CuentaBancaria("Ana García",    1_000_000),
  new CuentaBancaria("Luis Martínez",   500_000),
];

// ─── ESTADO UI ───────────────────────────────────────────────────
let cuentaActiva   = 0;
let saldoVisible   = true;
let operacionActual = null; // "deposito" | "retiro" | "transferencia"
let montoStr       = "0";

// ─── REFS DOM ────────────────────────────────────────────────────
const saldoNumEl     = document.getElementById("saldoNum");
const saldoMonto     = document.getElementById("saldo");
const saldoOculto    = document.getElementById("saldoOculto");
const navNameEl      = document.getElementById("navName");
const avatarEl       = document.getElementById("avatarCircle");
const cardTitularEl  = document.getElementById("cardTitular");
const clienteSelect  = document.getElementById("cliente");

const modalOverlay   = document.getElementById("modalOverlay");
const modalTitle     = document.getElementById("modalTitle");
const modalSub       = document.getElementById("modalSub");
const sheetIco       = document.getElementById("sheetIco");
const montoPantalla  = document.getElementById("montoPantalla");
const montoDigitosEl = document.getElementById("montoDigitos");
const btnConfirmar   = document.getElementById("btnConfirmar");
const btnCancelar    = document.getElementById("btnCancelar");

const listaMovEl     = document.getElementById("listaMovimientos");
const btnLimpiarEl   = document.getElementById("btnLimpiar");
const toastEl        = document.getElementById("toastFeedback");
const tfIconEl       = document.getElementById("tfIcon");
const tfTituloEl     = document.getElementById("tfTitulo");
const tfSubEl        = document.getElementById("tfSub");

// ─── RENDER CUENTA ───────────────────────────────────────────────
function renderCuenta() {
  const c = cuentas[cuentaActiva];
  navNameEl.textContent    = c.titular;
  avatarEl.textContent     = c.titular.charAt(0);
  cardTitularEl.textContent = c.titular.toUpperCase();

  if (saldoVisible) {
    saldoMonto.style.display    = "";
    saldoOculto.style.display   = "none";
    saldoNumEl.textContent = Math.round(c.saldo).toLocaleString("es-CO");
  } else {
    saldoMonto.style.display    = "none";
    saldoOculto.style.display   = "flex";
  }

  renderMovimientos();
}

// ─── RENDER MOVIMIENTOS ──────────────────────────────────────────
function renderMovimientos() {
  const c = cuentas[cuentaActiva];
  listaMovEl.innerHTML = "";

  if (c.historial.length === 0) {
    listaMovEl.innerHTML = `
      <div class="mov-vacio">
        <span class="vacio-icon">💜</span>
        <p>Aún no tienes movimientos</p>
      </div>`;
    return;
  }

  c.historial.forEach((m, i) => {
    const iconos = {
      deposito:      { ico: "💰", cls: "ico-dep" },
      retiro:        { ico: "💸", cls: "ico-ret" },
      transferencia: { ico: "🔄", cls: "ico-tra" },
      consulta:      { ico: "🔍", cls: "ico-con" },
    };
    const { ico, cls } = iconos[m.tipo] || { ico: "💜", cls: "ico-con" };

    let valorHtml;
    if (m.positivo === true)  valorHtml = `<span class="mov-valor positivo">+${fmt(m.monto)}</span>`;
    else if (m.positivo === false) valorHtml = `<span class="mov-valor negativo">-${fmt(m.monto)}</span>`;
    else valorHtml = `<span class="mov-valor neutro">${fmt(m.monto)}</span>`;

    const div = document.createElement("div");
    div.className = "mov-item";
    div.style.animationDelay = `${i * 0.04}s`;
    div.innerHTML = `
      <div class="mov-ico ${cls}">${ico}</div>
      <div class="mov-info">
        <div class="mov-desc">${m.desc}</div>
        <div class="mov-hora">Hoy · ${m.hora}</div>
      </div>
      ${valorHtml}
    `;
    listaMovEl.appendChild(div);
  });
}

// ─── OJO (MOSTRAR/OCULTAR) ───────────────────────────────────────
document.getElementById("btnOjo").addEventListener("click", () => {
  saldoVisible = !saldoVisible;
  renderCuenta();
});

// ─── CAMBIO CUENTA ───────────────────────────────────────────────
clienteSelect.addEventListener("change", () => {
  cuentaActiva = parseInt(clienteSelect.value);
  renderCuenta();
  mostrarToast("inf", "Cuenta cambiada", cuentas[cuentaActiva].titular, "💜");
});

// ─── ABRIR MODAL ─────────────────────────────────────────────────
const configs = {
  deposito:      { title: "Depositar",    sub: "¿Cuánto deseas depositar?",    ico: "💰" },
  retiro:        { title: "Retirar",      sub: "¿Cuánto deseas retirar?",      ico: "💸" },
  transferencia: { title: "Transferir",   sub: "¿Cuánto deseas transferir?",   ico: "🔄" },
  consulta:      { title: "Consultar",    sub: "Tu saldo actualizado",         ico: "🔍" },
};

function abrirModal(tipo) {
  operacionActual = tipo;
  const cfg = configs[tipo];
  modalTitle.textContent = cfg.title;
  modalSub.textContent   = cfg.sub;
  sheetIco.textContent   = cfg.ico;
  montoStr = "0";
  actualizarPantalla();
  modalOverlay.classList.add("open");
}

document.getElementById("btnIngresar").addEventListener("click",   () => abrirModal("deposito"));
document.getElementById("btnRetirar").addEventListener("click",    () => abrirModal("retiro"));
document.getElementById("btnTransferir").addEventListener("click", () => abrirModal("transferencia"));
document.getElementById("btnConsultar").addEventListener("click",  () => {
  const c   = cuentas[cuentaActiva];
  const res = c.consultar();
  renderCuenta();
  mostrarToast("inf", "Saldo consultado", res.msg, "🔍");
});

// ─── CERRAR MODAL ────────────────────────────────────────────────
btnCancelar.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) cerrarModal(); });
function cerrarModal() {
  modalOverlay.classList.remove("open");
  operacionActual = null;
  montoStr = "0";
}

// ─── TECLADO NUMÉRICO ────────────────────────────────────────────
document.querySelectorAll(".tk").forEach(btn => {
  btn.addEventListener("click", () => {
    const v = btn.dataset.v;
    if (!v) return;
    if (v === "del") {
      montoStr = montoStr.length > 1 ? montoStr.slice(0, -1) : "0";
    } else {
      if (montoStr === "0" && v !== ".") montoStr = v;
      else if (montoStr.length < 12) montoStr += v;
    }
    actualizarPantalla();
  });
});

function actualizarPantalla() {
  const num = parseFloat(montoStr) || 0;
  const formateado = num === 0 ? "0" : Math.round(num).toLocaleString("es-CO");
  montoDigitosEl.textContent = formateado;

  const c = cuentas[cuentaActiva];
  if (operacionActual !== "deposito" && num > c.saldo) {
    montoPantalla.classList.add("invalid");
  } else {
    montoPantalla.classList.remove("invalid");
  }
}

// ─── MONTOS RÁPIDOS ──────────────────────────────────────────────
document.querySelectorAll(".mr-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    montoStr = btn.dataset.m;
    actualizarPantalla();
  });
});

// ─── CONFIRMAR ───────────────────────────────────────────────────
btnConfirmar.addEventListener("click", () => {
  const monto = parseFloat(montoStr) || 0;
  const c     = cuentas[cuentaActiva];
  let res;

  if (operacionActual === "deposito") {
    res = c.ingresar(monto);
    if (res.ok) mostrarToast("ok", "Depósito exitoso", `+${fmt(monto)} agregados`, "💰");
    else        mostrarToast("err", "Error", res.msg, "❌");

  } else if (operacionActual === "retiro") {
    res = c.retirar(monto);
    if (res.ok) mostrarToast("ok", "Retiro exitoso", `-${fmt(monto)} retirados`, "💸");
    else        mostrarToast("err", "Error", res.msg, "❌");

  } else if (operacionActual === "transferencia") {
    const destinoIdx = cuentaActiva === 0 ? 1 : 0;
    const destino    = cuentas[destinoIdx];
    res = c.transferir(monto, destino.titular);
    if (res.ok) {
      destino.ingresar(monto); // acreditar al destino
      // quitar el movimiento de ingreso del historial del destino para dejarlo limpio
      mostrarToast("ok", "Transferencia enviada", `${fmt(monto)} a ${destino.titular}`, "🔄");
    } else {
      mostrarToast("err", "Error", res.msg, "❌");
    }
  }

  cerrarModal();
  renderCuenta();
});

// ─── LIMPIAR HISTORIAL ───────────────────────────────────────────
btnLimpiarEl.addEventListener("click", () => {
  cuentas[cuentaActiva].historial = [];
  renderMovimientos();
  mostrarToast("inf", "Historial limpiado", "", "🗑️");
});

// ─── TOAST ───────────────────────────────────────────────────────
let toastTimer;
function mostrarToast(tipo, titulo, sub, ico) {
  tfIconEl.textContent   = ico;
  tfTituloEl.textContent = titulo;
  tfSubEl.textContent    = sub;
  tfIconEl.className = "tf-icon " + (tipo === "ok" ? "ok" : tipo === "err" ? "err" : "inf");
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
}

// ─── INIT ────────────────────────────────────────────────────────
renderCuenta();
