/**
 * DevEvents Academy - Sistema Web de Gestión de Eventos
 * Almacenamiento en LocalStorage
 */

// --- CONFIGURACIÓN DE DATOS SEMILLA (Si está vacío) ---
const SEED_DATA = [
  {
    code: "DEV-001",
    name: "Congreso Internacional de Inteligencia Artificial",
    location: "Centro de Convenciones & Online",
    date: "2026-10-15",
    time: "09:00",
    category: "Inteligencia Artificial",
    slots: 150,
    description: "Un espacio único para explorar el avance de las redes neuronales y el despliegue de modelos masivos en producción."
  },
  {
    code: "DEV-002",
    name: "Cumbre de Seguridad Informática en la Nube",
    location: "Zoom Premium",
    date: "2026-11-05",
    time: "14:00",
    category: "Ciberseguridad",
    slots: 80,
    description: "Aprende prácticas reales de hacking ético y mitigación de intrusiones en infraestructuras AWS y GCP."
  },
  {
    code: "DEV-003",
    name: "Taller Avanzado de CSS Moderno y Componentes",
    location: "Aulas DevAcademy",
    date: "2026-09-20",
    time: "16:00",
    category: "Desarrollo Web",
    slots: 40,
    description: "Aprende Flexbox, CSS Grid, animaciones complejas y diseño arquitectónico utilizando metodologías escalables."
  }
];

// --- ESTADO DE LA APLICACIÓN ---
let events = [];
let currentView = 'cards'; // 'cards' o 'table'
let currentPage = 1;
const itemsPerPage = 6;

// --- INSTANCIAS DE BOOTSTRAP ---
let eventModalInstance;
let statsOffcanvasInstance;
let toastInstance;

// --- ELEMENTOS DOM ---
const eventForm = document.getElementById('eventForm');
const eventCodeInput = document.getElementById('eventCode');
const eventDateInput = document.getElementById('eventDate');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const cardsContainer = document.getElementById('cardsContainer');
const tableContainer = document.getElementById('tableContainer');
const tableBody = document.getElementById('tableBody');
const noResults = document.getElementById('noResults');
const paginationList = document.getElementById('paginationList');
const paginationNav = document.getElementById('paginationNav');
const modalTitle = document.getElementById('eventModalLabel');
const btnSaveEvent = document.getElementById('btnSaveEvent');
const btnNewEvent = document.getElementById('btnNewEvent');

// Elementos de Estadísticas
const statTotalEvents = document.getElementById('statTotalEvents');
const statTotalSlots = document.getElementById('statTotalSlots');
const categoryStatsList = document.getElementById('categoryStatsList');

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Componentes de Bootstrap
  eventModalInstance = new bootstrap.Modal(document.getElementById('eventModal'));
  statsOffcanvasInstance = new bootstrap.Offcanvas(document.getElementById('statsOffcanvas'));
  toastInstance = new bootstrap.Toast(document.getElementById('systemToast'));

  // Cargar datos
  loadEvents();

  // Escuchar Eventos
  eventForm.addEventListener('submit', handleFormSubmit);
  btnNewEvent.addEventListener('click', prepareCreateForm);
  
  // Escuchar Filtros, Búsqueda y Ordenamiento
  searchInput.addEventListener('input', () => { currentPage = 1; render(); });
  filterCategory.addEventListener('change', () => { currentPage = 1; render(); });
  sortBy.addEventListener('change', () => { render(); });

  // Toggle de Vistas
  document.getElementById('viewCardsBtn').addEventListener('click', function() {
    setView('cards');
  });
  document.getElementById('viewTableBtn').addEventListener('click', function() {
    setView('table');
  });

  // Listener para el Offcanvas de Estadísticas
  document.getElementById('statsOffcanvas').addEventListener('show.bs.offcanvas', renderStats);

  // Validaciones en tiempo real para la fecha
  setMinDateRestriction();
});

// --- RESTRICTOR DE FECHA ---
function setMinDateRestriction() {
  const today = new Date().toISOString().split('T')[0];
  eventDateInput.setAttribute('min', today);
}

// --- LOCAL STORAGE ---
function loadEvents() {
  const localData = localStorage.getItem('tech_events');
  if (localData) {
    events = JSON.parse(localData);
  } else {
    events = [...SEED_DATA];
    saveToLocalStorage();
  }
  render();
}

function saveToLocalStorage() {
  localStorage.setItem('tech_events', JSON.stringify(events));
}

// --- NOTIFICACIONES TOAST ---
function showNotification(message, type = 'success') {
  const toastEl = document.getElementById('systemToast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  toastMessage.textContent = message;

  // Limpiar clases anteriores
  toastEl.className = 'toast align-items-center text-white border-0 shadow-lg';
  toastIcon.className = 'bi fs-5';

  if (type === 'success') {
    toastEl.classList.add('bg-success');
    toastIcon.classList.add('bi-check-circle-fill');
  } else if (type === 'error') {
    toastEl.classList.add('bg-danger');
    toastIcon.classList.add('bi-exclamation-triangle-fill');
  } else if (type === 'warning') {
    toastEl.classList.add('bg-warning', 'text-dark');
    toastIcon.classList.add('bi-exclamation-circle-fill');
    toastEl.classList.remove('text-white');
  }

  toastInstance.show();
}

// --- CONTROL DE VISTAS ---
function setView(view) {
  currentView = view;
  document.getElementById('viewCardsBtn').classList.toggle('active', view === 'cards');
  document.getElementById('viewTableBtn').classList.toggle('active', view === 'table');
  
  if (view === 'cards') {
    cardsContainer.classList.remove('d-none');
    tableContainer.classList.add('d-none');
  } else {
    cardsContainer.classList.add('d-none');
    tableContainer.classList.remove('d-none');
  }
  render();
}

// --- LOGICA DE REGISTRO / EDICIÓN (CRUD) ---
function prepareCreateForm() {
  eventForm.reset();
  eventForm.classList.remove('was-validated');
  document.getElementById('formAction').value = 'create';
  eventCodeInput.removeAttribute('readonly');
  modalTitle.innerHTML = '<i class="bi bi-plus-circle text-info"></i> Registrar Evento Tecnológico';
  btnSaveEvent.textContent = 'Registrar Evento';
}

function prepareEditForm(code) {
  const event = events.find(e => e.code === code);
  if (!event) return;

  eventForm.classList.remove('was-validated');
  document.getElementById('formAction').value = 'update';
  
  eventCodeInput.value = event.code;
  eventCodeInput.setAttribute('readonly', true); // No se permite editar el código primario
  document.getElementById('eventName').value = event.name;
  document.getElementById('eventLocation').value = event.location;
  document.getElementById('eventDate').value = event.date;
  document.getElementById('eventTime').value = event.time;
  document.getElementById('eventCategory').value = event.category;
  document.getElementById('eventSlots').value = event.slots;
  document.getElementById('eventDescription').value = event.description;

  modalTitle.innerHTML = '<i class="bi bi-pencil-square text-info"></i> Editar Evento';
  btnSaveEvent.textContent = 'Guardar Cambios';
  
  eventModalInstance.show();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const action = document.getElementById('formAction').value;
  const code = eventCodeInput.value.trim().toUpperCase();
  const name = document.getElementById('eventName').value.trim();
  const location = document.getElementById('eventLocation').value.trim();
  const date = eventDateInput.value;
  const time = document.getElementById('eventTime').value;
  const category = document.getElementById('eventCategory').value;
  const slots = parseInt(document.getElementById('eventSlots').value);
  const description = document.getElementById('eventDescription').value.trim();

  // Validación nativa de formulario Bootstrap
  if (!eventForm.checkValidity()) {
    e.stopPropagation();
    eventForm.classList.add('was-validated');
    return;
  }

  // Validación personalizada: Fecha no puede ser pasada
  const selectedDate = new Date(`${date}T${time}`);
  const now = new Date();
  if (selectedDate < now) {
    showNotification("La fecha y hora del evento no pueden estar en el pasado.", "error");
    eventDateInput.classList.add('is-invalid');
    return;
  }

  if (action === 'create') {
    // Validar duplicidad de código
    const exists = events.some(e => e.code === code);
    if (exists) {
      showNotification(`El código "${code}" ya se encuentra registrado.`, "error");
      eventCodeInput.classList.add('is-invalid');
      return;
    }

    const newEvent = { code, name, location, date, time, category, slots, description };
    events.push(newEvent);
    showNotification("Evento registrado exitosamente.");
  } else {
    // Actualización de registro
    const index = events.findIndex(e => e.code === code);
    if (index !== -1) {
      events[index] = { code, name, location, date, time, category, slots, description };
      showNotification("Evento actualizado correctamente.");
    }
  }

  saveToLocalStorage();
  eventModalInstance.hide();
  render();
}

function deleteEvent(code) {
  if (confirm(`¿Está seguro de que desea eliminar el evento "${code}"?`)) {
    events = events.filter(e => e.code !== code);
    saveToLocalStorage();
    showNotification("Evento eliminado con éxito.", "warning");
    render();
  }
}

// --- FILTRO, BÚSQUEDA Y ORDENAMIENTO ---
function getProcessedEvents() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const categorySelected = filterCategory.value;
  const sorting = sortBy.value;

  // 1. Filtrar
  let processed = events.filter(e => {
    const matchesSearch = e.code.toLowerCase().includes(searchTerm) || 
                          e.name.toLowerCase().includes(searchTerm) || 
                          e.location.toLowerCase().includes(searchTerm);
    const matchesCategory = categorySelected === 'all' || e.category === categorySelected;
    
    return matchesSearch && matchesCategory;
  });

  // 2. Ordenar
  processed.sort((a, b) => {
    if (sorting === 'date-asc') {
      return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
    } else if (sorting === 'date-desc') {
      return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
    } else if (sorting === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sorting === 'slots-desc') {
      return b.slots - a.slots;
    }
    return 0;
  });

  return processed;
}

// --- RENDERIZADO PRINCIPAL ---
function render() {
  const processedEvents = getProcessedEvents();
  const totalItems = processedEvents.length;
  
  if (totalItems === 0) {
    cardsContainer.innerHTML = '';
    tableBody.innerHTML = '';
    noResults.classList.remove('d-none');
    paginationNav.classList.add('d-none');
    return;
  }
  noResults.classList.add('d-none');
  paginationNav.classList.remove('d-none');

  // Paginación Simulada
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = processedEvents.slice(startIndex, startIndex + itemsPerPage);

  // Renderizar de acuerdo al tipo de vista
  if (currentView === 'cards') {
    renderCards(paginatedEvents);
  } else {
    renderTable(paginatedEvents);
  }

  renderPagination(totalPages);
}

// Renderización en formato Cards
function renderCards(data) {
  cardsContainer.innerHTML = '';
  data.forEach(event => {
    const cardHtml = `
      <div class="col">
        <div class="card h-100 shadow-sm event-card">
          <div class="card-header bg-gradient-tech text-white py-3">
            <div class="d-flex justify-content-between align-items-center">
              <span class="badge bg-info text-dark fw-bold">${event.code}</span>
              <span class="badge bg-light text-dark text-uppercase font-monospace">${event.category}</span>
            </div>
            <h5 class="card-title mt-3 mb-0 text-truncate" title="${event.name}">${event.name}</h5>
          </div>
          <div class="card-body">
            <p class="text-muted mb-2 small"><i class="bi bi-geo-alt-fill text-danger"></i> ${event.location}</p>
            <div class="row g-2 mb-3">
              <div class="col-6">
                <div class="bg-light p-2 rounded text-center">
                  <span class="d-block small text-muted">Fecha</span>
                  <span class="fw-semibold">${formatDate(event.date)}</span>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-light p-2 rounded text-center">
                  <span class="d-block small text-muted">Hora</span>
                  <span class="fw-semibold"><i class="bi bi-clock"></i> ${event.time}</span>
                </div>
              </div>
            </div>

            <!-- COLLAPSE: Descripción del Evento -->
            <div class="mb-3">
              <button class="btn btn-link p-0 text-decoration-none collapse-btn w-100 text-start text-info" 
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target="#desc-${event.code}">
                <i class="bi bi-info-circle-fill"></i> Ver descripción detallada
              </button>
              <div class="collapse mt-2" id="desc-${event.code}">
                <div class="card card-body bg-light border-0 p-2 text-muted small">
                  ${event.description}
                </div>
              </div>
            </div>

            <!-- Cupos disponibles -->
            <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded">
              <span class="text-secondary small fw-bold">Cupos Libres:</span>
              <span class="badge bg-secondary fs-6 rounded-pill">${event.slots}</span>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0 d-flex justify-content-end gap-2 pb-3">
            <button class="btn btn-outline-primary btn-sm" onclick="prepareEditForm('${event.code}')">
              <i class="bi bi-pencil-fill"></i> Editar
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteEvent('${event.code}')">
              <i class="bi bi-trash3-fill"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    `;
    cardsContainer.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// Renderización en formato Tabla Responsive
function renderTable(data) {
  tableBody.innerHTML = '';
  data.forEach(event => {
    const tableRow = `
      <tr>
        <td><span class="badge bg-info text-dark font-monospace fw-bold">${event.code}</span></td>
        <td>
          <div class="fw-bold text-dark">${event.name}</div>
          <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">${event.description}</small>
        </td>
        <td><span class="badge bg-secondary">${event.category}</span></td>
        <td>
          <div class="small"><i class="bi bi-geo-alt-fill text-danger"></i> ${event.location}</div>
          <div class="small text-muted font-monospace"><i class="bi bi-calendar3"></i> ${formatDate(event.date)} - ${event.time}</div>
        </td>
        <td>
          <span class="badge bg-dark rounded-pill">${event.slots}</span>
        </td>
        <td class="text-end">
          <div class="btn-group" role="group">
            <button class="btn btn-outline-primary btn-sm" onclick="prepareEditForm('${event.code}')" title="Editar">
              <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteEvent('${event.code}')" title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', tableRow);
  });
}

// --- PAGINACIÓN SIMULADA ---
function renderPagination(totalPages) {
  paginationList.innerHTML = '';
  
  // Botón Anterior
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  let paginationHtml = `
    <li class="page-item ${prevDisabled}">
      <button class="page-link" onclick="changePage(${currentPage - 1})">Anterior</button>
    </li>
  `;

  // Páginas Intermedias
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = currentPage === i ? 'active' : '';
    paginationHtml += `
      <li class="page-item ${activeClass}">
        <button class="page-link" onclick="changePage(${i})">${i}</button>
      </li>
    `;
  }

  // Botón Siguiente
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  paginationHtml += `
    <li class="page-item ${nextDisabled}">
      <button class="page-link" onclick="changePage(${currentPage + 1})">Siguiente</button>
    </li>
  `;

  paginationList.innerHTML = paginationHtml;
}

function changePage(page) {
  currentPage = page;
  render();
}

// --- ESTADÍSTICAS DEL OFFCANVAS ---
function renderStats() {
  const totalEvents = events.length;
  const totalSlots = events.reduce((sum, e) => sum + parseInt(e.slots || 0), 0);

  statTotalEvents.textContent = totalEvents;
  statTotalSlots.textContent = totalSlots;

  // Estadísticas por Categoría
  const categoryCounts = {};
  events.forEach(e => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  categoryStatsList.innerHTML = '';
  const categories = ["Desarrollo Web", "Ciberseguridad", "Inteligencia Artificial", "Cloud Computing", "Diseño UI/UX"];

  categories.forEach(cat => {
    const count = categoryCounts[cat] || 0;
    const percentage = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;

    const statHtml = `
      <li class="list-group-item">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-semibold small">${cat}</span>
          <span class="badge bg-secondary rounded-pill">${count}</span>
        </div>
        <div class="progress" style="height: 6px;">
          <div class="progress-bar bg-info" role="progressbar" style="width: ${percentage}%" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </li>
    `;
    categoryStatsList.insertAdjacentHTML('beforeend', statHtml);
  });
}

// --- FUNCIONES AUXILIARES ---
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  // Ajuste de huso horario local para evitar desvío de un día
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-ES', options);
}