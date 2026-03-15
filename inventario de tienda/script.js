class Producto {
  constructor(nombre, precio, cantidad) {
    this.id       = Date.now() + Math.random();
    this.nombre   = nombre;
    this.precio   = precio;
    this.cantidad = cantidad;
  }
  get valor() { return this.precio * this.cantidad; }
  get estado() {
    if (this.cantidad === 0) return { label: "Agotado", cls: "agotado" };
    if (this.cantidad <= 3)  return { label: "Stock bajo", cls: "bajo" };
    return { label: "En stock", cls: "ok" };
  }
}

let productos = [
  new Producto("Laptop Pro",    2500, 5),
  new Producto("Mouse inalámbrico", 80, 10),
  new Producto("Teclado mecánico", 150, 7),
  new Producto("Monitor 24\"",  450, 3),
  new Producto("Audífonos BT",  120, 2),
];

function fmt(v) { return v.toLocaleString('es-CO'); }

// ─── RENDER TABLA ─────────────────────────────────────────
function renderTabla(filtro = "") {
  const tbody = document.getElementById("tbodyInventario");
  tbody.innerHTML = "";

  const filtrados = filtro
    ? productos.filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
    : productos;

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="vacio-tabla">No se encontraron productos.</td></tr>`;
  } else {
    filtrados.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.className = "row-new";
      tr.dataset.id = p.id;
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td><strong>${p.nombre}</strong></td>
        <td class="td-precio">$${fmt(p.precio)}</td>
        <td><strong>${p.cantidad}</strong></td>
        <td class="td-valor">$${fmt(p.valor)}</td>
        <td><span class="badge badge-${p.estado.cls}">${p.estado.label}</span></td>
        <td>
          <button class="btn-restock" onclick="restock('${p.id}')">+5</button>
          <button class="btn-edit"    onclick="editarPrecio('${p.id}')">Precio</button>
          <button class="btn-del"     onclick="eliminar('${p.id}')">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderResumen();
}

// ─── RESUMEN ──────────────────────────────────────────────
function renderResumen() {
  const total = productos.reduce((s, p) => s + p.valor, 0);
  const costoso = productos.reduce((max, p) => p.precio > (max?.precio ?? 0) ? p : max, null);
  const escaso  = productos.filter(p => p.cantidad > 0).reduce((min, p) => p.cantidad < (min?.cantidad ?? Infinity) ? p : min, null);
  const totalItems = productos.reduce((s, p) => s + p.cantidad, 0);

  document.getElementById("valorTotal").textContent     = "$" + fmt(total);
  document.getElementById("masCostoso").textContent     = costoso  ? costoso.nombre  : "—";
  document.getElementById("masEscaso").textContent      = escaso   ? `${escaso.nombre} (${escaso.cantidad})` : "—";
  document.getElementById("totalProductos").textContent = productos.length;
  document.getElementById("totalItems").textContent     = totalItems;
}

// ─── AGREGAR ──────────────────────────────────────────────
document.getElementById("btnAgregar").addEventListener("click", () => {
  const nombre   = document.getElementById("inNombre").value.trim();
  const precio   = parseFloat(document.getElementById("inPrecio").value);
  const cantidad = parseInt(document.getElementById("inCantidad").value);
  const msgEl    = document.getElementById("msgForm");

  if (!nombre) {
    return showMsg("⚠ Escribe el nombre del producto.", true);
  }
  if (isNaN(precio) || precio <= 0) {
    return showMsg("⚠ El precio debe ser mayor que 0.", true);
  }
  if (isNaN(cantidad) || cantidad <= 0) {
    return showMsg("⚠ La cantidad debe ser mayor que 0.", true);
  }

  // Si ya existe, sumar cantidad
  const existente = productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
  if (existente) {
    existente.cantidad += cantidad;
    showMsg(`✓ Se añadieron ${cantidad} unidades a ${existente.nombre}.`, false);
  } else {
    productos.push(new Producto(nombre, precio, cantidad));
    showMsg(`✓ ${nombre} agregado al inventario.`, false);
  }

  document.getElementById("inNombre").value   = "";
  document.getElementById("inPrecio").value   = "";
  document.getElementById("inCantidad").value = "";
  renderTabla();
});

function showMsg(texto, esError) {
  const el = document.getElementById("msgForm");
  el.textContent = texto;
  el.className   = "msg-form" + (esError ? " err" : "");
  setTimeout(() => { el.textContent = ""; el.className = "msg-form"; }, 3000);
}

// ─── ACCIONES ─────────────────────────────────────────────
function eliminar(id) {
  const idx = productos.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return;
  if (!confirm(`¿Eliminar "${productos[idx].nombre}" del inventario?`)) return;
  productos.splice(idx, 1);
  renderTabla();
}

function restock(id) {
  const p = productos.find(p => String(p.id) === String(id));
  if (!p) return;
  p.cantidad += 5;
  renderTabla();
}

function editarPrecio(id) {
  const p = productos.find(p => String(p.id) === String(id));
  if (!p) return;
  const nuevo = parseFloat(prompt(`Nuevo precio para "${p.nombre}" (actual: $${p.precio}):`));
  if (isNaN(nuevo) || nuevo <= 0) { alert("Precio inválido."); return; }
  p.precio = nuevo;
  renderTabla();
}

// ─── BÚSQUEDA ─────────────────────────────────────────────
document.getElementById("buscar").addEventListener("input", function() {
  renderTabla(this.value);
});

// Permitir Enter en formulario
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.id !== "buscar") {
    document.getElementById("btnAgregar").click();
  }
});

renderTabla();
