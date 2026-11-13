function cerrarSesion() {
            localStorage.removeItem("sesion");
            window.location.href = "login.html";
        }

        // Cargar solicitudes de los clientes almacenadas
        function cargarSolicitudesAdmin() {
            let tbody = document.getElementById("tablaAdminSolicitudes");
            if (!tbody) return;

            // Busca las solicitudes guardadas en el sistema (puedes ajustar la clave si usas otra en cliente.js)
            let solicitudes = JSON.parse(localStorage.getItem("solicitudesTaller")) || [
                { cliente: "Nicolas Carrera", telefono: "0998796059", vehiculo: "CHEVROLET", placa: "PT-980", km: "90 km", falla: "Ruido en motor", estado: "Solucionado" }
            ];

            tbody.innerHTML = "";
            solicitudes.forEach((sol, index) => {
                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${sol.cliente || 'N/A'}</td>
                    <td>${sol.telefono || 'N/A'}</td>
                    <td>${sol.vehiculo || 'N/A'}</td>
                    <td>${sol.placa || 'N/A'}</td>
                    <td>${sol.km || '0'}</td>
                    <td>${sol.falla || 'N/A'}</td>
                    <td><span class="badge ${sol.estado === 'Solucionado' ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2">${sol.estado || 'Pendiente'}</span></td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm fw-bold px-2 py-1"><i class="fa-solid fa-stethoscope me-1"></i> Diagnóstico</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        }

        // Cargar usuarios pendientes de aprobación
        function cargarUsuariosPendientes() {
            let tbody = document.getElementById("tablaUsuariosPendientes");
            if (!tbody) return;

            let usuarios = JSON.parse(localStorage.getItem("usuariosTaller")) || [];
            tbody.innerHTML = "";

            if (usuarios.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No hay cuentas pendientes de validación.</td></tr>`;
                return;
            }

            usuarios.forEach((user, index) => {
                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${user.nombre || 'N/A'}</td>
                    <td><b>${user.usuario}</b></td>
                    <td>
                        <select class="form-select form-select-sm bg-dark text-white border-secondary" id="rol_${index}">
                            <option value="cliente" ${user.rol === 'cliente' ? 'selected' : ''}>Cliente</option>
                            <option value="proveedor" ${user.rol === 'proveedor' ? 'selected' : ''}>Proveedor</option>
                            <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </td>
                    <td>
                        <span class="badge ${user.estado === 'Aprobado' ? 'bg-success' : 'bg-warning text-dark'}">
                            ${user.estado || 'Pendiente'}
                        </span>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-primary btn-sm fw-bold px-3" onclick="validarUsuario(${index})">
                            ✔️ Aprobar
                        </button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        }

        function validarUsuario(index) {
            let usuarios = JSON.parse(localStorage.getItem("usuariosTaller")) || [];
            let rolSeleccionado = document.getElementById(`rol_${index}`).value;

            usuarios[index].rol = rolSeleccionado;
            usuarios[index].estado = "Aprobado";

            localStorage.setItem("usuariosTaller", JSON.stringify(usuarios));
            Swal.fire({
                icon: 'success',
                title: '¡Usuario Validado!',
                text: 'El rol ha sido asignado y ya puede iniciar sesión.',
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#2563eb'
            });
            cargarUsuariosPendientes();
        }

        document.addEventListener("DOMContentLoaded", () => {
            cargarSolicitudesAdmin();
            cargarUsuariosPendientes();
        });