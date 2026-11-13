// 1. Cerrar Sesión del Cliente
const btnSalir = document.getElementById("btnSalirCliente");
if (btnSalir) {
    btnSalir.addEventListener("click", function() {
        localStorage.removeItem("sesion");
        window.location.href = "login.html";
    });
}

// 2. Registrar nueva solicitud desde el portal del cliente
const formCliente = document.getElementById("formSolicitudCliente");
if (formCliente) {
    formCliente.addEventListener("submit", function(e) {
        e.preventDefault();

        let nuevaSolicitud = {
            cliente: document.getElementById("cliNombre").value.trim(),
            telefono: document.getElementById("cliTelefono").value.trim(),
            vehiculo: document.getElementById("cliVehiculo").value.trim(),
            placa: document.getElementById("cliPlaca").value.trim(),
            kilometraje: document.getElementById("cliKm").value.trim(),
            problema: document.getElementById("cliProblema").value.trim(),
            estado: "Pendiente",
            detallesReparacion: ""
        };

        let solicitudes = JSON.parse(localStorage.getItem("solicitudesTaller")) || [];
        solicitudes.push(nuevaSolicitud);
        localStorage.setItem("solicitudesTaller", JSON.stringify(solicitudes));

        alert("¡Tu solicitud fue registrada exitosamente en el taller!");
        formCliente.reset();
        abrirHistorialCliente();
    });
}

// 3. Abrir el Modal del Historial (Conectado directamente al botón de arriba)
function abrirHistorialCliente() {
    cargarTablaCliente();
    const modalEl = document.getElementById("modalHistorialCliente");
    if (modalEl) {
        let modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// 4. Renderizar la Tabla del Historial del Cliente
function cargarTablaCliente() {
    const tbody = document.getElementById("tablaClienteSolicitudes");
    if (!tbody) return;

    let solicitudes = JSON.parse(localStorage.getItem("solicitudesTaller")) || [];
    tbody.innerHTML = "";

    if (solicitudes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No tienes solicitudes registradas en el taller.</td></tr>`;
        return;
    }

    solicitudes.forEach(function(item, indice) {
        const fila = document.createElement("tr");

        const badgeEstado = item.estado === "Solucionado" 
            ? `<span class="badge bg-success">Solucionado</span>` 
            : `<span class="badge bg-warning text-dark">Pendiente</span>`;

        // Botón "Vista" si ya está solucionado
        const btnVista = item.estado === "Solucionado"
            ? `<button class="btn btn-info btn-sm fw-bold text-dark" onclick="verTarjetaDetalle(${indice})" title="Ver informe del mecánico">👁️ Vista</button>`
            : `<button class="btn btn-outline-secondary btn-sm" disabled title="Esperando revisión del mecánico">En espera</button>`;

        fila.innerHTML = `
            <td class="fw-semibold">${item.vehiculo || "N/A"}</td>
            <td>${item.placa || "N/A"}</td>
            <td>${item.telefono || "N/A"}</td>
            <td>${item.kilometraje || "0"} km</td>
            <td>${item.problema || "N/A"}</td>
            <td>${badgeEstado}</td>
            <td class="text-center">${btnVista}</td>
        `;

        tbody.appendChild(fila);
    });
}

// 5. Mostrar Tarjeta de Vista / Reporte Mecánico (Tarjeta blanca y letras oscuras)
function verTarjetaDetalle(indice) {
    let solicitudes = JSON.parse(localStorage.getItem("solicitudesTaller")) || [];
    let item = solicitudes[indice];

    let contenedor = document.getElementById("contenidoTarjetaCliente");
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="card bg-white text-dark border-0 p-3 shadow-sm rounded-3">
                <h6 class="text-primary fw-bold mb-2">🚗 Información de la Unidad:</h6>
                <p class="mb-1 small"><strong>Vehículo:</strong> ${item.vehiculo} | <strong>Placa:</strong> ${item.placa}</p>
                <p class="mb-1 small"><strong>Propietario:</strong> ${item.cliente} | <strong>Teléfono:</strong> ${item.telefono}</p>
                <p class="mb-2 small"><strong>Falla / Servicio Inicial:</strong> ${item.problema}</p>
                
                <hr class="border-secondary-subtle my-2">

                <h6 class="text-info fw-bold mb-2 text-dark">🛠️ Reporte Mecánico Registrado:</h6>
                <div class="p-3 bg-light rounded border border-secondary-subtle small text-dark fw-bold" style="white-space: pre-line;">
                    ${item.detallesReparacion || "Sin observaciones adicionales registradas por el mecánico."}
                </div>
            </div>
        `;
    }

    // Ocultar modal de historial y abrir el de detalles
    let modalHistorialEl = document.getElementById("modalHistorialCliente");
    if (modalHistorialEl) {
        let modalHistorial = bootstrap.Modal.getInstance(modalHistorialEl);
        if (modalHistorial) modalHistorial.hide();
    }

    let modalDetallesEl = document.getElementById("modalDetallesCliente");
    if (modalDetallesEl) {
        let modalDetalles = new bootstrap.Modal(modalDetallesEl);
        modalDetalles.show();
    }
}