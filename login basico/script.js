// ─── MODELO: clase Usuario ────────────────────────────────────────────────────
// Encapsula los datos y la lógica de validación de un usuario

class Usuario {
  #nombre;
  #email;
  #password;

  constructor(nombre, email, password) {
    this.#nombre   = nombre;
    this.#email    = email;
    this.#password = password;
  }

  // ── Getters (solo lectura desde fuera) ──
  get nombre()   { return this.#nombre; }
  get email()    { return this.#email; }

  // ── Métodos de validación (lógica encapsulada) ──
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  }

  static validarPassword(password) {
    return password.trim().length >= 6;
  }

  static validarNombre(nombre) {
    return nombre.trim().length >= 2;
  }
}


// ─── MODELO: clase Autenticador ───────────────────────────────────────────────
// Responsable de gestionar usuarios registrados y autenticar sesiones

class Autenticador {
  #usuarios = [];
  #sesionActiva = null;

  registrar(nombre, email, password) {
    if (!Usuario.validarNombre(nombre)) {
      return { ok: false, msg: "El nombre debe tener al menos 2 caracteres." };
    }
    if (!Usuario.validarEmail(email)) {
      return { ok: false, msg: "El correo electrónico no es válido." };
    }
    if (!Usuario.validarPassword(password)) {
      return { ok: false, msg: "La contraseña debe tener al menos 6 caracteres." };
    }
    if (this.#buscarPorEmail(email)) {
      return { ok: false, msg: "Este correo ya está registrado." };
    }

    const usuario = new Usuario(nombre, email, password);
    this.#usuarios.push({ usuario, password: password.trim() });
    return { ok: true, msg: `¡Bienvenido, ${usuario.nombre}!` };
  }

  iniciarSesion(email, password) {
    if (!Usuario.validarEmail(email)) {
      return { ok: false, msg: "El correo electrónico no es válido." };
    }
    if (!password.trim()) {
      return { ok: false, msg: "Escribe tu contraseña." };
    }

    const registro = this.#buscarPorEmail(email);
    if (!registro) {
      return { ok: false, msg: "No existe una cuenta con ese correo." };
    }
    if (registro.password !== password.trim()) {
      return { ok: false, msg: "Contraseña incorrecta." };
    }

    this.#sesionActiva = registro.usuario;
    return { ok: true, msg: `Sesión iniciada como ${registro.usuario.nombre}.` };
  }

  cerrarSesion() {
    this.#sesionActiva = null;
  }

  get usuarioActivo() {
    return this.#sesionActiva;
  }

  // ── Método privado de búsqueda ──
  #buscarPorEmail(email) {
    return this.#usuarios.find(
      r => r.usuario.email.toLowerCase() === email.trim().toLowerCase()
    ) || null;
  }
}


// ─── MÓDULO: Formulario ───────────────────────────────────────────────────────
// Encapsula la lectura y limpieza de campos de un formulario

class Formulario {
  #contenedor;

  constructor(idContenedor) {
    this.#contenedor = document.getElementById(idContenedor);
  }

  leer(campo) {
    const el = this.#contenedor.querySelector(`[data-campo="${campo}"]`);
    return el ? el.value : "";
  }

  limpiar() {
    this.#contenedor.querySelectorAll("input").forEach(i => (i.value = ""));
  }

  mostrarError(campo, mensaje) {
    const hint = this.#contenedor.querySelector(`[data-hint="${campo}"]`);
    if (hint) {
      hint.textContent = mensaje;
      hint.style.opacity = "1";
      setTimeout(() => { hint.style.opacity = "0"; }, 3000);
    }
  }
}


// ─── MÓDULO: PanelUI ──────────────────────────────────────────────────────────
// Controla la transición visual entre login y registro

class PanelUI {
  #contenedor;
  #panelActivo = "login"; // "login" | "registro"

  constructor(idContenedor) {
    this.#contenedor = document.getElementById(idContenedor);
  }

  mostrarRegistro() {
    this.#panelActivo = "registro";
    this.#contenedor.classList.add("right-panel-active");
  }

  mostrarLogin() {
    this.#panelActivo = "login";
    this.#contenedor.classList.remove("right-panel-active");
  }

  get panelActivo() {
    return this.#panelActivo;
  }
}


// ─── MÓDULO: Toast ────────────────────────────────────────────────────────────
// Muestra mensajes de feedback al usuario (presentación pura)

class Toast {
  #elemento;
  #timer = null;

  constructor(idElemento) {
    this.#elemento = document.getElementById(idElemento);
  }

  mostrar(mensaje, tipo = "info") {
    this.#elemento.textContent = mensaje;
    this.#elemento.className   = `toast toast-${tipo} show`;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.#elemento.classList.remove("show");
    }, 3200);
  }
}


// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────
// Instancias de cada módulo — separación clara de responsabilidades

const autenticador = new Autenticador();
const panelUI      = new PanelUI("container");
const toast        = new Toast("toast");
const formLogin    = new Formulario("form-login");
const formRegistro = new Formulario("form-registro");


// ─── CONTROLADORES DE EVENTOS ─────────────────────────────────────────────────
// Solo conectan la UI con la lógica — no contienen lógica de negocio

function manejarLogin() {
  const email    = formLogin.leer("email");
  const password = formLogin.leer("password");
  const resultado = autenticador.iniciarSesion(email, password);

  if (resultado.ok) {
    toast.mostrar(resultado.msg, "exito");
    formLogin.limpiar();
  } else {
    toast.mostrar(resultado.msg, "error");
  }
}

function manejarRegistro() {
  const nombre   = formRegistro.leer("nombre");
  const email    = formRegistro.leer("email");
  const password = formRegistro.leer("password");
  const resultado = autenticador.registrar(nombre, email, password);

  if (resultado.ok) {
    toast.mostrar(resultado.msg, "exito");
    formRegistro.limpiar();
    setTimeout(() => panelUI.mostrarLogin(), 1500);
  } else {
    toast.mostrar(resultado.msg, "error");
  }
}


// ─── EVENTOS: botones de panel ────────────────────────────────────────────────

document.getElementById("signUp").addEventListener("click", () => {
  panelUI.mostrarRegistro();
});

document.getElementById("signIn").addEventListener("click", () => {
  panelUI.mostrarLogin();
});


// ─── EVENTOS: formularios ─────────────────────────────────────────────────────

document.getElementById("btn-login").addEventListener("click", manejarLogin);
document.getElementById("btn-registro").addEventListener("click", manejarRegistro);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (panelUI.panelActivo === "login") manejarLogin();
  else manejarRegistro();
});
