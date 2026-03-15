class Producto {
  constructor(nombre, precio, emoji, stock) {
    this.nombre  = nombre;
    this.precio  = precio;
    this.emoji   = emoji;
    this.stock   = stock;
    this.stockInicial = stock;
  }
}

const productosDisponibles = [
  new Producto("Laptop Pro",     2500, "💻", 3),
  new Producto("Mouse Inalámbrico", 80, "🖱️", 10),
  new Producto("Teclado Mecánico", 150, "⌨️", 5),
  new Producto("Monitor 24\"",    450, "🖥️", 4),
  new Producto("Audífonos BT",   120, "🎧", 8),
  new Producto("Webcam HD",       90, "📷", 6),
];

// carrito: { producto, cantidad }
const carrito = [];

function fmt(val) {
  return val.toLocaleString('es-CO');
}

// ─── AGREGAR ─────────────────────────────────────────────
function agregarProducto(indice) {
  const prod = productosDisponibles[indice];
  if (prod.stock <= 0) return;

  const existente = carrito.find(i => i.producto === prod);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ producto: prod, cantidad: 1 });
  }
  prod.stock--;
  render();
  mostrarToast(`${prod.emoji} ${prod.nombre} agregado`);
  animarBadge();
}

// ─── QUITAR ──────────────────────────────────────────────
function quitarProducto(indice) {
  const item = carrito[indice];
  item.producto.stock++;
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.splice(indice, 1);
  }
  render();
}

// ─── VACIAR ──────────────────────────────────────────────
function vaciarCarrito() {
  carrito.forEach(i => { i.producto.stock += i.cantidad; });
  carrito.length = 0;
  render();
}

// ─── CALCULAR ────────────────────────────────────────────
function calcularTotales() {
  const subtotal = carrito.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  const hayDescuento = totalItems >= 3;
  const descuento = hayDescuento ? subtotal * 0.10 : 0;
  const total = subtotal - descuento;
  return { subtotal, descuento, total, totalItems, hayDescuento };
}

// ─── RENDER PRODUCTOS ────────────────────────────────────
function renderProductos() {
  const el = document.getElementById("listaProductos");
  el.innerHTML = "";
  productosDisponibles.forEach((prod, i) => {
    const agotado  = prod.stock === 0;
    const bajStock = prod.stock <= 2 && prod.stock > 0;
    const stockClass = agotado ? 'agotado' : bajStock ? 'bajo' : '';
    const stockLabel = agotado
      ? '✗ Agotado'
      : bajStock
      ? `⚠ Solo ${prod.stock} disponible${prod.stock > 1 ? 's' : ''}`
      : `✓ ${prod.stock} disponibles`;

    const div = document.createElement("div");
    div.className = "tarjeta-prod";
    div.style.animationDelay = `${i * 0.06}s`;
    div.innerHTML = `
      <span class="prod-emoji">${prod.emoji}</span>
      <div class="prod-nombre">${prod.nombre}</div>
      <div class="prod-precio">$${fmt(prod.precio)}</div>
      <div class="prod-stock ${stockClass}">${stockLabel}</div>
      <button class="btn-agregar" onclick="agregarProducto(${i})" ${agotado ? 'disabled' : ''}>
        ${agotado ? 'Sin stock' : '+ Agregar'}
      </button>
    `;
    el.appendChild(div);
  });
}

// ─── RENDER CARRITO ──────────────────────────────────────
function renderCarrito() {
  const el = document.getElementById("listaCarrito");
  el.innerHTML = "";

  if (carrito.length === 0) {
    el.innerHTML = `
      <div class="vacio-carrito">
        <span class="vacio-icon">🛒</span>
        Tu carrito está vacío
      </div>`;
    return;
  }

  carrito.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `
      <div class="item-info">
        <div class="item-nombre">${item.producto.emoji} ${item.producto.nombre}</div>
        <div class="item-precio">$${fmt(item.producto.precio)} c/u</div>
      </div>
      <div class="item-acciones">
        <button class="btn-cantidad" onclick="quitarProducto(${i})">−</button>
        <span class="item-qty">${item.cantidad}</span>
        <button class="btn-cantidad" onclick="agregarProducto(${productosDisponibles.indexOf(item.producto)})"
          ${item.producto.stock <= 0 ? 'disabled' : ''}>+</button>
      </div>
    `;
    el.appendChild(div);
  });
}

// ─── RENDER RESUMEN ──────────────────────────────────────
function renderResumen() {
  const { subtotal, descuento, total, totalItems, hayDescuento } = calcularTotales();

  document.getElementById("badgeCount").textContent  = totalItems;
  document.getElementById("contItems").textContent   = totalItems;
  document.getElementById("subtotal").textContent    = "$" + fmt(subtotal);
  document.getElementById("total").textContent       = "$" + fmt(total);

  const filaDesc = document.getElementById("filaDescuento");
  filaDesc.style.display = hayDescuento ? "flex" : "none";
  document.getElementById("descuento").textContent = "-$" + fmt(descuento);

  const btnComprar = document.getElementById("btnComprar");
  btnComprar.disabled = carrito.length === 0;
  btnComprar.textContent = carrito.length === 0 ? "Carrito vacío" : `Finalizar compra → $${fmt(total)}`;
}

// ─── RENDER GENERAL ──────────────────────────────────────
function render() {
  renderProductos();
  renderCarrito();
  renderResumen();
}

// ─── TOAST ───────────────────────────────────────────────
let toastTimer;
function mostrarToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

function animarBadge() {
  const b = document.getElementById("badgeCount");
  b.classList.remove("bounce");
  requestAnimationFrame(() => b.classList.add("bounce"));
}

// ─── VACIAR BOTÓN ────────────────────────────────────────
document.getElementById("btnVaciar").addEventListener("click", () => {
  vaciarCarrito();
  mostrarToast("Carrito vaciado");
});

// ─── COMPRAR ─────────────────────────────────────────────
document.getElementById("btnComprar").addEventListener("click", () => {
  const { total } = calcularTotales();
  mostrarToast(`¡Compra realizada! Total: $${fmt(total)} 🎉`);
  setTimeout(() => vaciarCarrito(), 1500);
});

render();
