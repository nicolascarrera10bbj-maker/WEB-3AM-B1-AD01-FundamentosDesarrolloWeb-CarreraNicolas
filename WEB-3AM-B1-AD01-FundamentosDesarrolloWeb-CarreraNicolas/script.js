
// Control de Temporizador en pantalla (Cuenta regresiva)
function verificarBloqueoEnVivo() {
    let desbloqueo = parseInt(localStorage.getItem("tiempoDesbloqueo")) || 0;
    let ahora = new Date().getTime();
    let divTemp = document.getElementById("divTemporizador");
    let spanContador = document.getElementById("contadorRegresivo");
    let btnIngresar = document.getElementById("btnIngresar");
    let usuarioInput = document.getElementById("usuario");
    let passInput = document.getElementById("password");

    if (ahora < desbloqueo) {
        let segundosRestantes = Math.ceil((desbloqueo - ahora) / 1000);
        if (divTemp) divTemp.classList.remove("d-none");
        if (spanContador) spanContador.textContent = segundosRestantes;
        if (btnIngresar) btnIngresar.disabled = true;
        if (usuarioInput) usuarioInput.disabled = true;
        if (passInput) passInput.disabled = true;
        return true;
    } else {
        if (divTemp) divTemp.classList.add("d-none");
        if (btnIngresar) btnIngresar.disabled = false;
        if (usuarioInput) usuarioInput.disabled = false;
        if (passInput) passInput.disabled = false;
        return false;
    }
}

// Ejecutar cada segundo la cuenta regresiva
setInterval(verificarBloqueoEnVivo, 1000);

const formulario = document.getElementById("loginForm");

if (formulario) {
    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();

        if (verificarBloqueoEnVivo()) return;

        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value.trim();

        // Lista de usuarios almacenados
        let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosTaller")) || [];

        // Buscar usuario en los registrados
        let userEncontrado = usuariosRegistrados.find(u => u.usuario === usuario && u.password === password);

        // 1. Acceso Administrador por defecto
        if (usuario === "admin" && password === "123") {
            localStorage.setItem("intentosFallidos", 0);
            localStorage.setItem("nivelBloqueo", 0);
            localStorage.setItem("tiempoDesbloqueo", 0);
            localStorage.setItem("sesion", JSON.stringify({ usuario: "admin", rol: "admin" }));
            window.location.href = "admin.html";

        // 2. Acceso Usuario Registrado validado por el Admin
        } else if (userEncontrado) {
            if (userEncontrado.estado !== "Aprobado") {
                mostrarAviso('warning', 'Cuenta Pendiente', 'Tu cuenta aún no ha sido validada y aprobada por el administrador.');
                return;
            }

            localStorage.setItem("intentosFallidos", 0);
            localStorage.setItem("nivelBloqueo", 0);
            localStorage.setItem("tiempoDesbloqueo", 0);
            localStorage.setItem("sesion", JSON.stringify(userEncontrado));

            // Redirigir según el rol asignado
            if (userEncontrado.rol === "admin") {
                window.location.href = "admin.html";
            } else if (userEncontrado.rol === "proveedor") {
                window.location.href = "proveedor.html"; // o cliente.html según prefieras
            } else {
                window.location.href = "cliente.html";
            }

        } else {
            // 3. Intentos fallidos y Bloqueo Progresivo (3s, 1m, 4m...)
            let intentos = (parseInt(localStorage.getItem("intentosFallidos")) || 0) + 1;
            let nivel = parseInt(localStorage.getItem("nivelBloqueo")) || 0;
            const tiempos = [3000, 60000, 240000]; // 3 segundos, 1 minuto, 4 minutos

            if (intentos >= 3) {
                let espera = tiempos[nivel] || 600000;
                let textoTiempo = espera < 60000 ? `${espera / 1000} segundos` : `${espera / 60000} minuto(s)`;

                localStorage.setItem("tiempoDesbloqueo", new Date().getTime() + espera);
                localStorage.setItem("intentosFallidos", 0);
                localStorage.setItem("nivelBloqueo", Math.min(nivel + 1, tiempos.length - 1));
                
                mostrarAviso('error', 'Cuenta Bloqueada', `Has superado los 3 intentos. El sistema se ha bloqueado por ${textoTiempo}.`);
            } else {
                localStorage.setItem("intentosFallidos", intentos);
                mostrarAviso('error', 'Credenciales Incorrectas', `Usuario o contraseña incorrectos. Te quedan ${3 - intentos} intento(s).`);
            }
        }
    });
}

// Abrir Modal Recuperar
document.getElementById("btnRecuperar")?.addEventListener("click", (e) => {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById("modalRecuperar")).show();
});

document.getElementById("formRecuperarModal")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let u = document.getElementById("inputUserRecuperar").value.trim();
    bootstrap.Modal.getInstance(document.getElementById("modalRecuperar")).hide();
    
    if (u === "admin") {
        mostrarAviso('info', 'Contraseña', 'La clave del administrador es: 123');
    } else {
        let reg = JSON.parse(localStorage.getItem("usuariosTaller")) || [];
        let enc = reg.find(x => x.usuario === u);
        if (enc) {
            mostrarAviso('info', 'Contraseña Encontrada', `Tu contraseña es: ${enc.password}`);
        } else {
            mostrarAviso('error', 'No encontrado', 'El usuario no está registrado.');
        }
    }
    document.getElementById("formRecuperarModal").reset();
});

// Abrir Modal Crear Cuenta con Nombre Completo
document.getElementById("btnCrearCuenta")?.addEventListener("click", (e) => {
    e.preventDefault();
    new bootstrap.Modal(document.getElementById("modalCrear")).show();
});

document.getElementById("formCrearModal")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let nombre = document.getElementById("inputNombreCompleto").value.trim();
    let usuario = document.getElementById("inputNuevoUser").value.trim();
    let pass = document.getElementById("inputNuevaPass").value.trim();

    if (!nombre || !usuario || !pass) return;

    let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosTaller")) || [];
    
    if (usuariosRegistrados.some(u => u.usuario === usuario)) {
        mostrarAviso('warning', 'Usuario existente', 'Ese nombre de usuario ya está registrado.');
        return;
    }

    // Guardar con estado "Pendiente" y sin rol asignado todavía
    usuariosRegistrados.push({
        nombre: nombre,
        usuario: usuario,
        password: pass,
        rol: "pendiente",
        estado: "Pendiente"
    });

    localStorage.setItem("usuariosTaller", JSON.stringify(usuariosRegistrados));
    bootstrap.Modal.getInstance(document.getElementById("modalCrear")).hide();
    document.getElementById("formCrearModal").reset();

    mostrarAviso('success', '¡Registro Exitoso!', 'Tu cuenta ha sido creada y está pendiente de validación por el administrador.');
});