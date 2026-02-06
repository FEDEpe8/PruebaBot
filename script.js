/* --- 1. CONFIGURACIÓN DE USUARIO Y ESTADO --- */
let userName = localStorage.getItem('muni_user_name') || "";
let userNeighborhood = localStorage.getItem('muni_user_neighborhood') || "";
let userAge = localStorage.getItem('muni_user_age') || "";

let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };

/* --- 2. ESTADÍSTICAS (Google Sheets) --- */
const STATS_URL = "https://script.google.com/macros/s/AKfycbyv6W175qMpbqVUsg0ETM2SOtkdUPsoAUHG3XnaiIjgMFmEnDr7FeVGcyr9dl9AfHB0/exec";

function registrarEvento(accion, detalle) {
    if (!STATS_URL || STATS_URL.includes("TUS_LETRAS_RARAS_AQUI")) return;

    // Objeto con el orden exacto para que la Google Sheet no se mezcle
    const datos = {
        fecha: new Date().toLocaleString(),
        usuario: userName || "Anónimo",
        barrio: userNeighborhood || "No especificado",
        edad: userAge || "No especificado",
        accion: accion,
        detalle: detalle
    };

    fetch(STATS_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    }).catch(err => console.error("Error stats:", err));
}

/* --- 3. BASE DE DATOS DE MENÚS (Tu estructura original) --- */  
const MENUS = {
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy Eva el asistente virtual de la Municipalidad de Chascomús. ¿En que pudedo ayudarte?<br><br>Podes usar el meno o escribrir palabras claves.<br>Aqui te dejo algunas: <b>agua, foodtruck, casa</b>; o escribe <b>menu</b> para ver todo.`, 
        options: [
            { id: 'politicas_gen', label: '💜 GÉNERO (Urgencias)', type: 'leaf', apiKey: 'politicas_gen' },
            { id: 'politicas_comu', label: '🛍️ Módulos (alimentos)', type: 'leaf', apiKey: 'asistencia_social' },
            { id: 'desarrollo_menu', label: '🤝 Desarrollo Social' },
            { id: 'sibon', label: '📰 Boletin Oficial' },
            { id: 'ojos_en_alerta', label: '👁️ Ojos en Alerta (Seguridad)', type: 'leaf', apiKey: 'ojos_en_alerta' },
            { id: 'el_digital', label: '📰 Diario digital' },
            { id: 'turismo', label: '🏖️ Turismo' },
            { id: 'deportes', label: '⚽ Deportes' },
            { id: 'salud', label: '🏥 Salud' },
            { id: 'obras', label: '🚧 Reclamos 147' },
            { id: 'seguridad', label: '🛡️ Seguridad' },
            { id: 'produccion', label: '🏭 Producción y Empleo' },
            { id: 'hab_menu', label: '💰 Habilitaciones' },
            { id: 'omic', label: '🏦 Denuncias Omic' },
            { id: 'cultura', label: '🎭 Cultura y Agenda' },
            { id: 'habitat', label: '🏡 Reg demanda Habitacional', type: 'submenu' },
            { id: 'pago_deuda', label: '🅿️ago: Auto, Agua, Inmueble', type: 'submenu' },
            { id: 'contacto_op', label: '☎️ Hablar con Operador', type: 'leaf', apiKey: 'contacto_gral' }
        ]
    },

    ojos_en_alerta: {
        title: () => '👁️ Ojos en Alerta:',
        options: [ { id: 'oea_link', label: '🔗 Contacto WhatsApp', link: 'https://wa.me/5492241557444' } ]
    },

    cultura: {
        title: () => '🎭 Agenda Cultural:',
        options: [ { id: 'ag_actual', label: '📅 Agenda del Mes (FEBRERO)', type: 'leaf', apiKey: 'agenda_actual' } ]
    },

    el_digital: {
        title: () => '📰 Diario digital:',
        options: [ { id: 'digital_link', label: '🔗 Ir al Diario Digital', link: 'https://www.eldigitalchascomus.com.ar/' } ]
    },

    sibon: {
        title: () => '📰 Boletín Oficial de Chascomús:',
        options: [ { id: 'sibon_link', label: '🔗 Ir al Boletín Oficial', link: 'https://sibom.slyt.gba.gob.ar/cities/31' } ]
    },

    desarrollo_menu: {
        title: () => 'Desarrollo Social y Comunitaria:', 
        options: [
            { id: 'mediacion', label: '⚖️ Mediación Vecinal', type: 'leaf', apiKey: 'mediacion_info' },
            { id: 'uda', label: '📍 Puntos UDA', type: 'leaf', apiKey: 'uda_info' },
            { id: 'ninez', label: '👶 Niñez', type: 'leaf', apiKey: 'ninez' }
        ]
    },

    habitat: {
        title: () => 'Secretaría de Hábitat:',
        options: [
            { id: 'habitat_info', label: '📍 Dirección y Contacto', type: 'leaf', apiKey: 'habitat_info' },
            { id: 'hab_plan', label: '🏘️ Planes Habitacionales', type: 'leaf', apiKey: 'habitat_planes' }
        ]
    },

    salud: { 
        title: () => 'Gestión de Salud Pública:', 
        options: [
            { id: 'centros', label: '🏥 CAPS (Salitas)' }, 
            { id: 'hospital_menu', label: '🏥 Hospital' },
            { id: 'f_lista', label: '💊 Farmacias y Turnos', type: 'leaf', apiKey: 'farmacias_lista' },
            { id: 'zoonosis', label: '🐾 Zoonosis', type: 'leaf', apiKey: 'zoo_rabia' },
            { id: 'vac_hu', label: '💉 Vacunatorio', type: 'leaf', apiKey: 'vacunacion_info' }
        ]
    },

    hab_menu: {
        title: () => 'Gestión de Habilitaciones:',
        options: [
            { id: 'hab_video', label: '🎥 Ver Video Instructivo', type: 'leaf', apiKey: 'hab_video_info' },
            { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' },
            { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' },
            { id: 'hab_espacio', label: '🍔 Patios y Carros', type: 'leaf', apiKey: 'hab_espacio' },
            { id: 'hab_reba', label: '🍷 REBA (Alcohol)', type: 'leaf', apiKey: 'hab_reba' }
        ]
    },

    pago_deuda: {
        title: () => 'Pago de Deudas y Boletas:',
        options: [        
            { id: 'deuda', label: '🔍 Ver Deuda / Pagar', type: 'leaf', apiKey: 'deuda' },
            { id: 'agua', label: '💧 Agua', type: 'leaf', apiKey: 'agua' },
            { id: 'boleta', label: '📧 Boleta Digital', type: 'leaf', apiKey: 'boleta' }
        ]
    }
};

/* --- 4. RESPUESTAS (Base de Datos HTML) --- */
const RES = {
    'agenda_actual': `<div class="info-card"><strong>📅 AGENDA FEBRERO 2026</strong><br><i>¡Disfrutá el verano en Chascomús!</i><br><br>🌕 <b>Sáb 1 - Remada Luna Llena:</b> Kayak & Tablas.<br>🎉 <b>13-16 - CARNAVAL INFANTIL:</b> Corsódromo 20hs.<br><br>🔗 <a href="https://linktr.ee/visitasguiadas.turismoch" target="_blank">Ver Linktree</a></div>`,
    
    'hab_video_info': `<div class="info-card"><strong>🎥 Guía de Habilitaciones</strong><br><br><video width="100%" height="auto" controls poster="img/miniatura_video.jpg" style="border-radius: 8px;"><source src="videos/tutorial_habilitacion.mp4" type="video/mp4">Tu navegador no soporta el video.</video><p style="margin-top:10px;">Tutorial para trámite online.</p></div>`,

    'link_147': `<div class="info-card"><strong>📝 ATENCIÓN AL VECINO 147</strong><br>💻 Web Autogestión: <a href="https://147.chascomus.gob.ar" target="_blank">147.chascomus.gob.ar</a><br>📞 Teléfono: 147 (Lun a Vie 8 a 15hs).</div>`,

    'ojos_en_alerta': `<div class="info-card"><strong>👀 OJOS EN ALERTA</strong><br>Seguridad ciudadana 24hs.<br><a href="https://wa.me/5492241557444" class="wa-btn">📲 WhatsApp 2241-557444</a></div>`,

    'boleta': `<div class="info-card"><strong>📧 BOLETA DIGITAL</strong><br>📲 WA: <a href="https://wa.me/5492241557616">2241-557616</a><br>📧 ingresospublicos@chascomus.gob.ar</div>`,

    'agua': `<div class="info-card"><strong>💧 CONSUMO DE AGUA</strong><br>🔗 <a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">VER MI CONSUMO</a></div>`,

    'deuda': `<div class="info-card"><strong>🔍 CONSULTA DE DEUDA</strong><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">CONSULTAR AQUÍ</a></div>`,

    'politicas_gen': `<div class="info-card" style="border-left: 5px solid #9b59b6;"><strong style="color: #8e44ad;">💜 Género y Diversidad</strong><br>🚨 Guardia 24hs WhatsApp: <a href="https://wa.me/5492241559397">2241-559397</a></div>`,

    'asistencia_social': `<div class="info-card"><strong>🍎 Módulos Alimentarios</strong><br>📍 Depósito calle Juárez.<br>⏰ Lun-Vie 8 a 14hs.</div>`,

    'habitat_info': `<div class="info-card"><strong>📍 Hábitat y Tierras</strong><br>Dorrego y Bolivar (Ex IOMA).<br><a href="https://wa.me/5492241559412" target="_blank" class="wa-btn">💬 WhatsApp Hábitat</a></div>`
};

/* --- 5. LÓGICA DE INTERFAZ Y MENSAJERÍA --- */

function toggleInfo() { document.getElementById('infoModal').classList.toggle('show'); }

window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) modal.classList.remove('show');
}

function toggleInput(show) { 
    if(show) setTimeout(() => document.getElementById('userInput').focus(), 100);
}

function addMessage(text, side = 'bot', options = null) {
    const container = document.getElementById('chatMessages'); 
    if (!container) return;

    const row = document.createElement('div');
    row.style.width = '100%'; row.style.display = 'flex'; row.style.flexDirection = 'column';
    
    const div = document.createElement('div');
    div.className = `message ${side}`;
    div.innerHTML = text;
    row.appendChild(div);

    if (options) {
        const optDiv = document.createElement('div');
        optDiv.className = 'options-container';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = `option-button ${opt.id === 'back' ? 'back' : ''}`;
            btn.innerText = opt.label;
            btn.onclick = () => handleAction(opt);
            optDiv.appendChild(btn);
        });
        row.appendChild(optDiv);
    }
    
    container.appendChild(row);
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
}

const FRASES_RESPUESTA = ["¡Qué gran elección! 🎯", "¡Perfecto! Vamos con eso 👍", "¡Genial! Te ayudo con eso 😊", "¡Buena opción! 🔍"];

function handleAction(opt) {
    // Manejo de Edad (Onboarding)
    if (opt.type === 'age_select') {
        userAge = opt.label;
        localStorage.setItem('muni_user_age', userAge);
        registrarEvento("Registro", "Perfil Completo");
        addMessage(`¡Perfecto! Ya te conozco mejor. ¿Cómo puedo ayudarte?`, 'bot');
        setTimeout(() => resetToMain(), 800);
        return;
    }

    registrarEvento("Botón", opt.label || opt.id);

    if (opt.id === 'nav_home' || opt.id === 'back') return resetToMain();
    if (opt.link) return window.open(opt.link, '_blank');

    addMessage(opt.label, 'user');

    if (opt.id === 'obras') return startReclamoForm();

    if (opt.apiKey) {
        const frase = FRASES_RESPUESTA[Math.floor(Math.random() * FRASES_RESPUESTA.length)];
        setTimeout(() => {
            addMessage(frase, 'bot');
            setTimeout(() => {
                addMessage(RES[opt.apiKey] || "Info no disponible.", 'bot');
                showNavControls(); 
            }, 600);
        }, 400);
    } else if (MENUS[opt.id]) {
        currentPath.push(opt.id);
        showMenu(opt.id);
    }
}

function showMenu(key) {
    const menu = MENUS[key];
    const title = typeof menu.title === 'function' ? menu.title(userName) : menu.title;
    let opts = [...menu.options];
    if (currentPath.length > 1) opts.push({ id: 'back', label: '⬅️ Volver' });
    setTimeout(() => addMessage(title, 'bot', opts), 400);
}

function resetToMain() { currentPath = ['main']; showMenu('main'); }

function showNavControls() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'nav-controls';
    div.innerHTML = `<button class="nav-btn btn-home" onclick="resetToMain()">🏠 Inicio</button>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

/* --- 6. FORMULARIO 147 (4 PASOS) --- */
function startReclamoForm() {
    isAwaitingForm = true; currentFormStep = 1;
    setTimeout(() => addMessage("📝 <b>Paso 1/4:</b> ¿Qué tipo de problema es? (Ej: Luz, Basura)", 'bot'), 500);
}

function processFormStep(text) {
    if (currentFormStep === 1) { formData.tipo = text; currentFormStep = 2; setTimeout(() => addMessage("📍 <b>Paso 2/4:</b> ¿Cuál es la dirección exacta?", 'bot'), 500); }
    else if (currentFormStep === 2) { formData.ubicacion = text; currentFormStep = 3; setTimeout(() => addMessage("🖊️ <b>Paso 3/4:</b> Breve descripción del problema.", 'bot'), 500); }
    else if (currentFormStep === 3) { formData.descripcion = text; currentFormStep = 4; setTimeout(() => addMessage("📸 <b>Paso 4/4:</b> Escribí 'ok' para finalizar y enviar por WhatsApp.", 'bot'), 500); }
    else if (currentFormStep === 4) { finalizeForm(); }
}

function finalizeForm() {
    isAwaitingForm = false;
    const tel147 = "5492241514700"; 
    const msg = `RECLAMO 147\nVecino: ${userName}\nBarrio: ${userNeighborhood}\nTipo: ${formData.tipo}\nLugar: ${formData.ubicacion}\nDesc: ${formData.descripcion}`;
    const url = `https://wa.me/${tel147}?text=${encodeURIComponent(msg)}`;
    addMessage(`<div class="info-card">✅ <b>Listo</b><br><a href="${url}" target="_blank" class="wa-btn">📲 ENVIAR RECLAMO</a></div>`, 'bot');
    showNavControls();
}

/* --- 7. PROCESAR ENTRADA DE TEXTO --- */
function processInput() {
    const input = document.getElementById('userInput');
    const val = input.value.trim();
    if(!val) return;
    const texto = val.toLowerCase();

    if (isAwaitingForm) { addMessage(val, 'user'); input.value = ""; processFormStep(val); return; }

    /* --- FLUJO DE ONBOARDING --- */
    if (!userName) {
        userName = val; localStorage.setItem('muni_user_name', val);
        addMessage(val, 'user'); input.value = "";
        setTimeout(() => addMessage(`¡Mucho gusto <b>${userName}</b>! ¿De qué <b>barrio</b> sos?`, 'bot'), 600);
        return;
    }
    if (!userNeighborhood) {
        userNeighborhood = val; localStorage.setItem('muni_user_neighborhood', val);
        addMessage(val, 'user'); input.value = "";
        const ages = [{label:'Menos de 20', type:'age_select'}, {label:'20 a 40', type:'age_select'}, {label:'40 a 60', type:'age_select'}, {label:'Más de 60', type:'age_select'}];
        setTimeout(() => addMessage("¡Genial! Por último, ¿en qué rango de edad estás?", 'bot', ages), 600);
        return;
    }

    addMessage(val, 'user');
    registrarEvento("Escribió", val);
    input.value = "";

    const dic = { 
        'agua': {apiKey:'agua', label:'Agua'}, 
        'boleta': {apiKey:'boleta', label:'Boleta'}, 
        'deuda': {apiKey:'deuda', label:'Deuda'}, 
        'casa': {id:'habitat', label:'Hábitat'},
        'menu': {id:'main', label:'Menú'} 
    };

    for (let p in dic) { if (texto.includes(p)) return handleAction(dic[p]); }
    setTimeout(() => addMessage("No entendí. Usá el menú o escribí 'Menú'. 🤔", 'bot'), 600);
}

/* --- 8. INICIO --- */
document.getElementById('sendButton').onclick = processInput;
document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') processInput(); };

window.onload = () => {
    if (!userName) { addMessage("👋 ¡Hola! Soy Eva. Para empezar, por favor **ingresá tu nombre**:", 'bot'); } 
    else if (!userNeighborhood) { addMessage(`¡Hola ${userName}! ¿De qué barrio sos?`, 'bot'); }
    else { showMenu('main'); }
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');

/* --- 9. SEGURIDAD --- */
(function() {
    const _0x1 = "Q3JlYWRvIHBvcjogPGI+RmVkZXJpY28gZGUgU2lzdGVtYXM8L2I+PGJyPnBhcmEgbGEgTXVuaWNpcGFsaWRhZCBkZSBDaGFzY29tw7pz";
    function _secure() {
        const _el = document.getElementById('authorCredit');
        if (_el) { if(_el.innerHTML !== atob(_0x1)) _el.innerHTML = atob(_0x1); }
    }
    window.addEventListener('load', _secure);
    setInterval(_secure, 3000);
})();
