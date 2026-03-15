// ============================================================
//  DOM LAB — scrip.js
//  Todos los ejercicios + lógica de navegación sidebar
//  Requiere: index.html + styles.css en la misma carpeta
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════════════════════
  //  SIDEBAR — Abrir / cerrar menú hamburguesa
  // ══════════════════════════════════════════════════════════

  const sidebar      = document.getElementById('sidebar');
  const overlay      = document.getElementById('overlay');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarClose = document.getElementById('sidebarClose');

  const openSidebar = () => {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    hamburgerBtn.classList.add('active');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    hamburgerBtn.classList.remove('active');
  };

  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  sidebarClose.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Clic en un link del menú → scroll suave + cerrar sidebar
  document.getElementById('navList').addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    e.preventDefault();

    // Marcar link activo
    document.querySelectorAll('#navList a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // Scroll hasta la sección
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    closeSidebar();
  });

  // Resaltar el link activo según qué card está en pantalla
  const cards = document.querySelectorAll('.card[id]');
  const names = {
    ej1: 'Mensaje',      ej2: 'Suma',
    ej3: 'Color',        ej4: 'Contador',
    ej5: 'Tareas',       ej6: 'Formulario',
    ej7: 'Calculadora',  ej8: 'Temporizador',
    ej9: 'Próximamente'
  };
  const breadcrumbEl = document.getElementById('breadcrumbText');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      // Actualizar breadcrumb
      breadcrumbEl.textContent = names[id] || '9 ejercicios';

      // Actualizar link activo en sidebar
      document.querySelectorAll('#navList a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  cards.forEach(card => observer.observe(card));


  // ══════════════════════════════════════════════════════════
  //  UTILIDADES COMUNES
  // ══════════════════════════════════════════════════════════

  // Shortcut para getElementById
  const $ = id => document.getElementById(id);

  // Actualiza un .output-box con texto y estado visual
  const setOutput = (el, texto, tipo = '') => {
    if (!el) return;
    el.textContent = texto;
    el.className = 'output-box' + (tipo ? ` ${tipo}` : '');
  };


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 1 — Mostrar mensaje
  //  Concepto: textContent para escribir en el DOM
  // ══════════════════════════════════════════════════════════

  $('btnMensaje').addEventListener('click', () => {
    setOutput($('resultadoMensaje'), '¡Hola mundo desde JavaScript! 👋🎉', 'info');
  });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 2 — Sumar dos números
  //  Concepto: leer valores de inputs y mostrar resultado
  // ══════════════════════════════════════════════════════════

  $('btnSumar').addEventListener('click', () => {
    const v1 = $('numero1').value;
    const v2 = $('numero2').value;

    if (v1 === '' || v2 === '') {
      return setOutput($('resultadoSuma'), '⚠ Ingresa ambos números.', 'err');
    }

    const a = Number(v1);
    const b = Number(v2);
    setOutput($('resultadoSuma'), `${a} + ${b} = ${a + b}`, 'ok');
  });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 3 — Cambiar color de fondo
  //  Concepto: document.body.style.background
  // ══════════════════════════════════════════════════════════

  const colores = {
    btnRojo:     '#fca5a5',
    btnVerde:    '#86efac',
    btnAzul:     '#93c5fd',
    btnAmarillo: '#fde68a',
    btnMorado:   '#c4b5fd',
    btnReset:    null
  };

  Object.entries(colores).forEach(([id, color]) => {
    $(id)?.addEventListener('click', () => {
      document.body.style.background = color
        ? `linear-gradient(135deg, ${color}55 0%, #f0f2f8 60%)`
        : '';
    });
  });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 4 — Contador de clics
  //  Concepto: variables + actualizar textContent
  // ══════════════════════════════════════════════════════════

  let count = 0;
  const countEl = $('contadorValor');

  const actualizarContador = () => {
    countEl.textContent = count;
    countEl.style.color = count > 0
      ? 'var(--accent)'
      : count < 0
      ? '#ef4444'
      : 'var(--text-3)';

    // Animación de rebote
    countEl.classList.add('bump');
    setTimeout(() => countEl.classList.remove('bump'), 130);
  };

  $('btnContador').addEventListener('click',       () => { count++;  actualizarContador(); });
  $('btnRestarContador').addEventListener('click', () => { count--;  actualizarContador(); });
  $('btnResetContador').addEventListener('click',  () => { count = 0; actualizarContador(); });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 5 — Lista de tareas
  //  Concepto: createElement, appendChild, removeChild
  // ══════════════════════════════════════════════════════════

  const taskList   = $('listaTareas');
  const tareaInput = $('tareaInput');
  const emptyMsg   = $('tareaVacia');

  // Muestra u oculta el mensaje "lista vacía"
  const actualizarVacio = () => {
    const hayTareas = taskList.querySelectorAll('li:not(#tareaVacia)').length > 0;
    if (emptyMsg) emptyMsg.style.display = hayTareas ? 'none' : 'block';
  };

  const agregarTarea = () => {
    const texto = tareaInput.value.trim();
    if (!texto) return;

    // Crear elementos del DOM
    const li    = document.createElement('li');
    li.className = 'task-item';

    const check = document.createElement('div');
    check.className = 'task-check';
    check.addEventListener('click', () => li.classList.toggle('done'));

    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = texto;

    const btnDel = document.createElement('button');
    btnDel.className = 'task-del';
    btnDel.innerHTML  = '×';
    btnDel.addEventListener('click', () => {
      // Animación de salida antes de eliminar
      li.style.opacity    = '0';
      li.style.transform  = 'translateX(16px)';
      li.style.transition = 'all 0.2s';
      setTimeout(() => { li.remove(); actualizarVacio(); }, 200);
    });

    li.appendChild(check);
    li.appendChild(span);
    li.appendChild(btnDel);
    taskList.appendChild(li);

    tareaInput.value = '';
    tareaInput.focus();
    actualizarVacio();
  };

  $('btnAgregar').addEventListener('click', agregarTarea);
  tareaInput.addEventListener('keydown', e => { if (e.key === 'Enter') agregarTarea(); });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 6 — Validación de formulario
  //  Concepto: event.preventDefault, classList, regex
  // ══════════════════════════════════════════════════════════

  // Muestra u oculta el error visual de un campo
  const mostrarError = (inputId, errId, mostrar) => {
    const inp = $(inputId);
    const err = $(errId);
    if (!inp || !err) return;

    inp.classList.toggle('invalid', mostrar);
    inp.classList.toggle('valid',  !mostrar);
    err.style.display = mostrar ? 'block' : 'none';
  };

  $('formulario').addEventListener('submit', e => {
    e.preventDefault();

    const nombre = $('nombre').value.trim();
    const correo = $('correo').value.trim();
    const edad   = Number($('edad').value);
    let todoOk   = true;

    // Validar nombre
    if (!nombre) {
      mostrarError('nombre', 'errNombre', true);
      todoOk = false;
    } else {
      mostrarError('nombre', 'errNombre', false);
    }

    // Validar correo con regex básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      mostrarError('correo', 'errCorreo', true);
      todoOk = false;
    } else {
      mostrarError('correo', 'errCorreo', false);
    }

    // Validar edad (1–120)
    if (!$('edad').value || edad < 1 || edad > 120) {
      mostrarError('edad', 'errEdad', true);
      todoOk = false;
    } else {
      mostrarError('edad', 'errEdad', false);
    }

    if (todoOk) {
      setOutput($('mensajeForm'), `✓ ¡Bienvenido/a, ${nombre}! Formulario enviado con éxito.`, 'ok');
      $('formulario').reset();
      ['nombre', 'correo', 'edad'].forEach(id => {
        $(id).classList.remove('valid', 'invalid');
      });
    } else {
      setOutput($('mensajeForm'), '✗ Corrige los campos marcados en rojo.', 'err');
    }
  });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 7 — Calculadora
  //  Concepto: select, switch, operaciones aritméticas
  // ══════════════════════════════════════════════════════════

  $('btnCalcular').addEventListener('click', () => {
    const v1 = $('calcNum1').value;
    const v2 = $('calcNum2').value;
    const op = $('operacion').value;

    const resEl  = $('resultadoCalc');
    const exprEl = $('resultadoExpr');

    if (v1 === '' || v2 === '') {
      resEl.textContent  = '!';
      exprEl.textContent = 'Ingresa ambos números';
      resEl.style.color  = '#ef4444';
      return;
    }

    const a = Number(v1);
    const b = Number(v2);
    const etiquetas = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    let resultado;

    switch (op) {
      case '+': resultado = a + b; break;
      case '-': resultado = a - b; break;
      case '*': resultado = a * b; break;
      case '/':
        if (b === 0) {
          resEl.textContent  = '∞';
          exprEl.textContent = 'No se puede dividir entre 0';
          resEl.style.color  = '#ef4444';
          return;
        }
        resultado = a / b;
        break;
    }

    const formateado = Number.isInteger(resultado)
      ? resultado
      : parseFloat(resultado.toFixed(6));

    resEl.textContent  = formateado;
    exprEl.textContent = `${a} ${etiquetas[op]} ${b} = ${formateado}`;
    resEl.style.color  = 'var(--accent)';

    // Animación pop al mostrar resultado
    resEl.style.transform = 'scale(0.8)';
    resEl.style.opacity   = '0';
    setTimeout(() => {
      resEl.style.transition = 'transform 0.25s, opacity 0.25s';
      resEl.style.transform  = 'scale(1)';
      resEl.style.opacity    = '1';
    }, 10);
  });


  // ══════════════════════════════════════════════════════════
  //  EJERCICIO 8 — Cronómetro
  //  Concepto: setInterval, clearInterval, formateo de tiempo
  // ══════════════════════════════════════════════════════════

  let segundos  = 0;
  let intervalo = null;

  // Rellena con cero a la izquierda si es necesario
  const pad = n => String(n).padStart(2, '0');

  const renderizarTiempo = () => {
    const horas   = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs    = segundos % 60;
    $('tiempo').textContent = `${pad(horas)}:${pad(minutos)}:${pad(segs)}`;
  };

  const setEstadoTimer = estado => {
    const displayEl = $('tiempo');
    const statusEl  = $('timerStatus');

    displayEl.className = 'timer-display ' +
      (estado === 'running' ? 'running' : estado === 'paused' ? 'paused' : '');

    const textos = {
      running: '⏱ Corriendo…',
      paused:  '⏸ Pausado',
      idle:    'Listo'
    };
    statusEl.textContent = textos[estado] || '';
  };

  $('btnIniciar').addEventListener('click', () => {
    if (intervalo) return; // Ya está corriendo
    setEstadoTimer('running');
    intervalo = setInterval(() => {
      segundos++;
      renderizarTiempo();
    }, 1000);
  });

  $('btnDetener').addEventListener('click', () => {
    if (!intervalo) return; // Ya está pausado
    clearInterval(intervalo);
    intervalo = null;
    setEstadoTimer('paused');
  });

  $('btnReiniciar').addEventListener('click', () => {
    clearInterval(intervalo);
    intervalo = null;
    segundos  = 0;
    renderizarTiempo();
    setEstadoTimer('idle');
  });

  // Mostrar 00:00:00 al cargar
  renderizarTiempo();

}); // fin DOMContentLoaded
