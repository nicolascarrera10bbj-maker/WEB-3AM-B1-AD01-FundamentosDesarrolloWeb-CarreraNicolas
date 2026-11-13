function obtenerDatos(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

// 1. RENDERIZAR SOLICITUDES Y BUSCADOR (LUPA)
function renderizarSolicitudes(filtro = "") {
    let tbody = document.getElementById("tablaAdminSolicitudes");
    if (!tbody) return;

    let solicitudes = obtenerDatos("solicitudesTaller");
    if (solicitudes.length === 0) {
        solicitudes = [
            { cliente: "Juan Pablo", telefono: "0998790780", vehiculo: "TOYOTA", placa: "PHB-789", km: "45.000 km", falla: "Ruido en el embrague", estado: "Pendiente" }
        ];
        guardarDatos("solicitudesTaller", solicitudes);
    }

    // Filtrar según el buscador
    let filtradas = solicitudes.filter(s => 
        s.cliente.toLowerCase().includes(filtro) || 
        s.vehiculo.toLowerCase().includes(filtro) || 
        s.placa.toLowerCase().includes(filtro)
    );

    tbody.innerHTML = "";
    filtradas.forEach((sol, i) => {
        let badge = sol.estado === "Solucionado" 
            ? `<span class="badge bg-success">Solucionado</span>` 
            : `<span class="badge bg-warning text-dark">Pendiente</span>`;

        tbody.innerHTML += `
            <tr>
                <td><b>${i + 1}</b></td>
                <td><b>${sol.cliente}</b></td>
                <td>${sol.telefono}</td>
                <td><b>${sol.vehiculo}</b> (${sol.placa})</td>
                <td>${sol.km}</td>
                <td>${sol.falla}</td>
                <td>${badge}</td>
                <td class="text-center">
                    <button class="btn btn-diagnostico btn-sm me-1" onclick="abrirDiagnostico(${i})">
                        <i class="fa-solid fa-stethoscope"></i> Diagnóstico
                    </button>
                    <div class="dropdown d-inline-block">
                        <button class="btn btn-acciones btn-sm dropdown-toggle" data-bs-toggle="dropdown">Acciones</button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                            <li><a class="dropdown-item fw-bold text-success" href="#" onclick="cambiarEstado(${i})">✔️ Cambiar Estado</a></li>
                            <li><a class="dropdown-item fw-bold text-danger" href="#" onclick="eliminarSolicitud(${i})">🗑️ Eliminar</a></li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;
    });
}

// Evento de búsqueda en vivo con la lupa/input
document.getElementById("inputBuscar")?.addEventListener("input", function(e) {
    let texto = e.target.value.toLowerCase().trim();
    renderizarSolicitudes(texto);
});

function abrirDiagnostico(index) {
    document.getElementById("diagIndex").value = index;
    new bootstrap.Modal(document.getElementById("modalDiagnostico")).show();
}

document.getElementById("formDiagnostico")?.addEventListener("submit", function(e) {
    e.preventDefault();
    let index = document.getElementById("diagIndex").value;
    let sistema = document.getElementById("selectSistemaReparar").value;
    let obs = document.getElementById("diagObservaciones").value;

    let solicitudes = obtenerDatos("solicitudesTaller");
    solicitudes[index].falla += ` | [Diag: ${sistema} - ${obs}]`;
    solicitudes[index].estado = "Solucionado";
    guardarDatos("solicitudesTaller", solicitudes);

    bootstrap.Modal.getInstance(document.getElementById("modalDiagnostico")).hide();
    this.reset();
    renderizarSolicitudes();
    Swal.fire({ icon: 'success', title: 'Diagnóstico Guardado', timer: 1200, showConfirmButton: false });
});

function cambiarEstado(i) {
    let sol = obtenerDatos("solicitudesTaller");
    sol[i].estado = sol[i].estado === "Solucionado" ? "Pendiente" : "Solucionado";
    guardarDatos("solicitudesTaller", sol);
    renderizarSolicitudes();
}

function eliminarSolicitud(i) {
    let sol = obtenerDatos("solicitudesTaller");
    sol.splice(i, 1);
    guardarDatos("solicitudesTaller", sol);
    renderizarSolicitudes();
}

// 2. VALIDACIÓN DE USUARIOS (Al aprobar, se elimina de pendientes y se guarda en aprobados)
function renderizarUsuarios() {
    let tbody = document.getElementById("tablaUsuariosPendientes");
    if (!tbody) return;

    let usuarios = obtenerDatos("usuariosTaller");
    tbody.innerHTML = "";

    if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hay cuentas pendientes de validación.</td></tr>`;
        return;
    }

    usuarios.forEach((u, i) => {
        tbody.innerHTML += `
            <tr>
                <td><b>${i + 1}</b></td>
                <td><b>${u.nombre || 'N/A'}</b></td>
                <td><b>${u.usuario}</b></td>
                <td>
                    <select class="form-select form-select-sm fw-bold" id="rol_${i}">
                        <option value="cliente" ${u.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                        <option value="proveedor" ${u.rol === 'proveedor' ? 'selected' : ''}>Proveedor</option>
                        <option value="admin" ${u.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                    </select>
                </td>
                <td><span class="badge bg-warning text-dark">Pendiente</span></td>
                <td class="text-center">
                    <button class="btn btn-primary btn-sm fw-bold px-3" onclick="aprobarYRemoverUsuario(${i})">✔️ Aprobar</button>
                </td>
            </tr>
        `;
    });
}

function aprobarYRemoverUsuario(i) {
    let usuarios = obtenerDatos("usuariosTaller");
    let aprobados = obtenerDatos("usuariosAprobados");

    // Asignar rol y cambiar estado
    usuarios[i].rol = document.getElementById(`rol_${i}`).value;
    usuarios[i].estado = "Aprobado";

    // Guardar en aprobados y eliminar de la lista pendiente actual
    aprobados.push(usuarios[i]);
    usuarios.splice(i, 1);

    guardarDatos("usuariosTaller", usuarios);
    guardarDatos("usuariosAprobados", aprobados);

    renderizarUsuarios();
    Swal.fire({ icon: 'success', title: '¡Usuario Aprobado!', text: 'Ya puede iniciar sesión con su rol asignado.', timer: 1500, showConfirmButton: false });
}

document.getElementById("formNuevaSolicitud")?.addEventListener("submit", function(e) {
    e.preventDefault();
    let sol = obtenerDatos("solicitudesTaller");
    sol.unshift({
        cliente: document.getElementById("solCliente").value,
        telefono: document.getElementById("solTelefono").value,
        vehiculo: document.getElementById("solVehiculo").value,
        placa: document.getElementById("solPlaca").value,
        km: document.getElementById("solKm").value,
        falla: document.getElementById("solFalla").value,
        estado: "Pendiente"
    });
    guardarDatos("solicitudesTaller", sol);
    bootstrap.Modal.getInstance(document.getElementById("modalNuevaSolicitud")).hide();
    this.reset();
    renderizarSolicitudes();
});

function cerrarSesion() {
    localStorage.removeItem("sesion");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    renderizarSolicitudes();
    renderizarUsuarios();
});