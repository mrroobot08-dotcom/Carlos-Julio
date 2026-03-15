class CuentaBancaria {
  constructor(titular, saldoInicial) {
    this.titular = titular;
    this.saldo = saldoInicial;
    this.historial = [];
  }

  guardarMovimiento(texto, tipo) {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    this.historial.unshift({ texto, tipo, hora });
  }

  ingresar(monto) {
    if (isNaN(monto) || monto <= 0) {
      return { tipo: "error", texto: "⚠ Ingresa un monto válido mayor que 0." };
    }
    this.saldo += monto;
    const msg = `↑ Ingresaste $${fmt(monto)}`;
    this.guardarMovimiento(msg, 'ingreso');
    return { tipo: "exito", texto: `${msg} — Saldo: $${fmt(this.saldo)}` };
  }

  retirar(monto) {
    if (isNaN(monto) || monto <= 0) {
      return { tipo: "error", texto: "⚠ Ingresa un monto válido mayor que 0." };
    }
    if (monto > this.saldo) {
      return { tipo: "error", texto: `⚠ Fondos insuficientes. Saldo disponible: $${fmt(this.saldo)}` };
    }
    this.saldo -= monto;
    const msg = `↓ Retiraste $${fmt(monto)}`;
    this.guardarMovimiento(msg, 'retiro');
    return { tipo: "exito", texto: `${msg} — Saldo: $${fmt(this.saldo)}` };
  }

  consultarSaldo() {
    const msg = `◎ Saldo consultado: $${fmt(this.saldo)}`;
    this.guardarMovimiento(msg, 'consulta');
    return { tipo: "exito", texto: `Saldo actual de ${this.titular}: $${fmt(this.saldo)}` };
  }
}

function fmt(val) {
  return val.toLocaleString('es-CO');
}

const cuentas = [
  new CuentaBancaria("Ana García", 1000),
  new CuentaBancaria("Luis Martínez", 500)
];

const clienteSelect  = document.getElementById("cliente");
const montoInput     = document.getElementById("monto");
const saldoTexto     = document.getElementById("saldo");
const nombreCliente  = document.getElementById("nombreCliente");
const mensajeEl      = document.getElementById("mensaje");
const historialEl    = document.getElementById("historial");
const btnIngresar    = document.getElementById("btnIngresar");
const btnRetirar     = document.getElementById("btnRetirar");
const btnConsultar   = document.getElementById("btnConsultar");
const btnLimpiar     = document.getElementById("btnLimpiar");

function obtenerCuenta() { return cuentas[clienteSelect.value]; }

function mostrarMensaje(texto, tipo) {
  mensajeEl.textContent = texto;
  mensajeEl.className = "mensaje " + (tipo === "exito" ? "exito" : "error");
}

function actualizarVista() {
  const c = obtenerCuenta();
  saldoTexto.textContent = "$" + fmt(c.saldo);
  nombreCliente.textContent = c.titular;

  historialEl.innerHTML = "";
  if (c.historial.length === 0) {
    historialEl.innerHTML = '<li class="vacio-hist">No hay movimientos aún.</li>';
    return;
  }
  c.historial.forEach(mov => {
    const li = document.createElement("li");
    li.className = `mov-${mov.tipo}`;
    li.innerHTML = `<span>${mov.texto}</span><span style="float:right;color:#475569;font-size:10px">${mov.hora}</span>`;
    historialEl.appendChild(li);
  });
}

btnIngresar.addEventListener("click", () => {
  const monto = parseFloat(montoInput.value);
  const r = obtenerCuenta().ingresar(monto);
  mostrarMensaje(r.texto, r.tipo);
  actualizarVista();
  montoInput.value = "";
  montoInput.focus();
});

btnRetirar.addEventListener("click", () => {
  const monto = parseFloat(montoInput.value);
  const r = obtenerCuenta().retirar(monto);
  mostrarMensaje(r.texto, r.tipo);
  actualizarVista();
  montoInput.value = "";
  montoInput.focus();
});

btnConsultar.addEventListener("click", () => {
  const r = obtenerCuenta().consultarSaldo();
  mostrarMensaje(r.texto, r.tipo);
  actualizarVista();
});

btnLimpiar.addEventListener("click", () => {
  obtenerCuenta().historial = [];
  actualizarVista();
  mostrarMensaje("Historial borrado.", "exito");
});

clienteSelect.addEventListener("change", () => {
  actualizarVista();
  mostrarMensaje(`Cuenta de ${obtenerCuenta().titular} activa.`, "exito");
  montoInput.value = "";
});

montoInput.addEventListener("keydown", e => {
  if (e.key === "Enter") btnIngresar.click();
});

actualizarVista();
