class Vehiculo {
  constructor(nombre, tipo, emoji, velocidad, max) {
    this.nombre    = nombre;
    this.tipo      = tipo;
    this.emoji     = emoji;
    this.velocidad = velocidad;
    this.max       = max;
  }

  acelerar(cantidad) {
    this.velocidad = Math.min(this.velocidad + cantidad, this.max);
  }

  frenar(cantidad) {
    this.velocidad = Math.max(this.velocidad - cantidad, 0);
  }

  detener() {
    this.velocidad = 0;
  }

  getEstado() {
    const p = this.velocidad / this.max;
    if (p === 0)    return { label: "Detenido",  cls: "detenido", color: "#404040" };
    if (p < 0.30)   return { label: "Lento",     cls: "lento",    color: "#4ade80" };
    if (p < 0.60)   return { label: "Normal",    cls: "normal",   color: "#facc15" };
    if (p < 0.85)   return { label: "Rápido",    cls: "rapido",   color: "#fb923c" };
    return           { label: "Límite",    cls: "limite",   color: "#f87171" };
  }

  getPorcentaje() {
    return Math.round((this.velocidad / this.max) * 100);
  }
}

const vehiculos = [
  new Vehiculo("Bus 1",    "Bus urbano",     "🚌", 60, 120),
  new Vehiculo("Camión 1", "Camión de carga","🚛", 40, 100),
  new Vehiculo("Taxi 1",   "Taxi sedán",     "🚕", 50, 140),
  new Vehiculo("Moto 1",   "Motocicleta",    "🏍️", 70, 180),
  new Vehiculo("Patrulla", "Policía",        "🚔", 80, 200),
  new Vehiculo("Ambulancia","Emergencias",   "🚑", 90, 180),
];

function renderVehiculos() {
  const lista = document.getElementById("listaVehiculos");
  lista.innerHTML = "";

  vehiculos.forEach((v, i) => {
    const estado = v.getEstado();
    const pct    = v.getPorcentaje();
    const delay  = i * 0.08;

    const card = document.createElement("div");
    card.className = "tarjeta";
    card.style.animationDelay = `${delay}s`;
    card.style.setProperty('--estado-color', estado.color);
    card.id = `vehiculo-${i}`;

    card.innerHTML = `
      <div class="tarjeta-header">
        <div class="vehiculo-info">
          <span class="vehiculo-emoji">${v.emoji}</span>
          <div class="vehiculo-nombre">${v.nombre}</div>
          <div class="vehiculo-tipo">${v.tipo}</div>
        </div>
        <span class="estado-badge estado-${estado.cls}">${estado.label}</span>
      </div>

      <div class="velocimetro-wrap">
        <div class="velocimetro-num" style="color:${estado.color}">
          ${v.velocidad}
          <span class="velocimetro-unit">km/h</span>
        </div>
        <div class="barra-wrap">
          <div class="barra-fill" style="width:${pct}%; background:${estado.color}"></div>
        </div>
        <div class="barra-labels">
          <span>0</span>
          <span>${v.max/2}</span>
          <span>${v.max} máx</span>
        </div>
      </div>

      <div class="botones">
        <button class="btn btn-acelerar" onclick="acelerarVehiculo(${i})">▲ +10</button>
        <button class="btn btn-frenar"   onclick="frenarVehiculo(${i})">▼ -10</button>
        <button class="btn btn-detener"  onclick="detenerVehiculo(${i})">■ Stop</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

function updateVehiculo(i) {
  const v     = vehiculos[i];
  const card  = document.getElementById(`vehiculo-${i}`);
  if (!card) return;

  const estado = v.getEstado();
  const pct    = v.getPorcentaje();

  card.style.setProperty('--estado-color', estado.color);
  card.querySelector('.velocimetro-num').innerHTML =
    `${v.velocidad}<span class="velocimetro-unit">km/h</span>`;
  card.querySelector('.velocimetro-num').style.color = estado.color;
  card.querySelector('.barra-fill').style.width      = `${pct}%`;
  card.querySelector('.barra-fill').style.background = estado.color;
  card.querySelector('.estado-badge').textContent    = estado.label;
  card.querySelector('.estado-badge').className      = `estado-badge estado-${estado.cls}`;
}

function acelerarVehiculo(i) {
  vehiculos[i].acelerar(10);
  updateVehiculo(i);
}

function frenarVehiculo(i) {
  vehiculos[i].frenar(10);
  updateVehiculo(i);
}

function detenerVehiculo(i) {
  vehiculos[i].detener();
  updateVehiculo(i);
}

renderVehiculos();
