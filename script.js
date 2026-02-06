/* --- CONFIGURACIÓN DE USUARIO --- */
let userName = localStorage.getItem('muni_user_name') || "";
let userNeighborhood = localStorage.getItem('muni_user_neighborhood') || "";
let userAge = localStorage.getItem('muni_user_age') || "";

let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };

/* --- ESTADÍSTICAS (Google Sheets) --- */
const STATS_URL = "https://script.google.com/macros/s/AKfycbyv6W175qMpbqVUsg0ETM2SOtkdUPsoAUHG3XnaiIjgMFmEnDr7FeVGcyr9dl9AfHB0/exec";

function registrarEvento(accion, detalle) {
    if (!STATS_URL || STATS_URL.includes("TUS_LETRAS_RARAS_AQUI")) return;

    const datos = {
        usuario: userName || "Anónimo",
        barrio: userNeighborhood || "No especificado",
        edad: userAge || "No especificado",
        accion: accion,
        detalle: detalle,
        fecha: new Date().toLocaleString()
    };

    fetch(STATS_URL, {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    }).catch(err => console.error("Error stats:", err));
}

/* --- MENÚS --- */  
const MENUS = {
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy MuniBot. ¿Empecemos la recorrida?`, 
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
            { id: 'habilitaciones', label: '💰 Habilitaciones' },
            { id: 'omic', label: '🏦 Denuncias Omic' },
            { id: 'cultura', label: '🎭 Cultura y Agenda' },
            { id: 'habitat', label: '🏡 Reg demanda Habitacional', type: 'submenu' },
            { id: 'pago_deuda', label: '🅿️ago: Auto, Agua, Inmueble', type: 'submenu' },
            { id: 'contacto_op', label: '☎️ Hablar con Operador', type: 'leaf', apiKey: 'contacto_gral' }
        ]
    },

    ojos_en_alerta: {
        title: () => '👁️ Ojos en Alerta:',
        options: [
            { id: 'oea_link', label: '🔗 Contacto WhatsApp', link: 'https://wa.me/5492241557444' },
        ]
    },

    cultura: {
        title: () => '🎭 Agenda Cultural:',
        options: [
            { id: 'ag_actual', label: '📅 Agenda del Mes (FEBRERO)', type: 'leaf', apiKey: 'agenda_actual' },
        ]
    },

     el_digital: {
        title: () => '📰 Diario digital:',
        options: [
            { id: 'digital_link', label: '🔗 Ir al Diario Digital', link: 'https://www.eldigitalchascomus.com.ar/' }
        ]
    },

    sibon: {
        title: () => '📰 Boletín Oficial de Chascomús:',
        options: [
            { id: 'sibon_link', label: '🔗 Ir al Boletín Oficial', link: 'https://sibom.slyt.gba.gob.ar/cities/31' }
        ]
    },
    turismo: {
        title: () => 'Turismo y Cultura:',
        options: [
            { id: 't_info', label: 'ℹ️ Oficinas y Contacto', type: 'leaf', apiKey: 'turismo_info' },
            { id: 't_link', label: '🔗 Web de Turismo', link: 'https://linktr.ee/turismoch' }
        ]
    },
    deportes: {
        title: () => 'Deportes:',
        options: [
            { id: 'd_info', label: '📍 Dirección de Deportes', type: 'leaf', apiKey: 'deportes_info' },
            { id: 'd_calle', label: '🏃 Circuito de Calle', type: 'leaf', apiKey: 'deportes_circuito' }
        ]
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
            { id: 'habitat', label: '🔑 Info de Hábitat', type: 'leaf', apiKey: 'info_habitat' },
            { id: 'hab_info', label: '📍 Dirección y Contacto', type: 'leaf', apiKey: 'habitat_info' },
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
    centros: { 
        title: () => 'Centros de Atención Primaria (CAPS):',
        options: [
            { id: 'c_map', label: '📍 Ver Ubicaciones (Mapas)', type: 'leaf', apiKey: 'caps_mapas' },
            { id: 'c_wa', label: '📞 Números de WhatsApp', type: 'leaf', apiKey: 'caps_wa' }
        ]
    },
    hospital_menu: {
        title: () => 'Hospital Municipal:',
        options: [
            { id: 'h_tur', label: '📅 WhatsApp Turnos', type: 'leaf', apiKey: 'h_turnos' },
            { id: 'h_espec_menu', label: '🩺 Especialidades', type: 'submenu' },
            { id: 'h_guardia', label: '🚨 Guardia e Info', type: 'leaf', apiKey: 'h_info' }
        ]
    },
    h_espec_menu: {
        title: () => '🩺 Seleccioná la especialidad para ver los días:',
        options: [
            { id: 'esp_pediatria', label: '👶 Pediatría', type: 'leaf', apiKey: 'info_pediatria' },
            { id: 'esp_clinica', label: '🩺 Clínica Médica', type: 'leaf', apiKey: 'info_clinica' },
            { id: 'esp_gineco', label: '🤰 Ginecología / Obstetricia', type: 'leaf', apiKey: 'info_gineco' },
            { id: 'esp_cardio', label: '❤️ Cardiología', type: 'leaf', apiKey: 'info_cardio' },
            { id: 'esp_trauma', label: '🦴 Traumatología', type: 'leaf', apiKey: 'info_trauma' },
            { id: 'esp_oftalmo', label: '👁️ Oftalmología', type: 'leaf', apiKey: 'info_oftalmo' },
            { id: 'esp_nutri', label: '🍎 Nutrición', type: 'leaf', apiKey: 'info_nutri' },
            { id: 'esp_cirugia', label: '🔪 Cirugía', type: 'leaf', apiKey: 'info_cirugia' },
            { id: 'esp_neuro', label: '🧠 Neurología / Psiquiatría', type: 'leaf', apiKey: 'info_neuro_psiq' }
        ]
    },
    seguridad: { 
        title: () => 'Seguridad y Trámites:', 
        options: [
            { id: 'pamuv', label: '🆘 Asistencia Víctima (PAMUV)', type: 'leaf', apiKey: 'pamuv' },
            { id: 'apps_seg', label: '📲 Descargar Apps (Basapp y SEM)', type: 'leaf', apiKey: 'apps_seguridad' }, 
            { id: 'def_civil', label: '🌪️ Defensa Civil (103)', type: 'leaf', apiKey: 'defensa_civil' },
            { id: 'lic_tramite', label: '🪪 Licencia (Carnet)', type: 'leaf', apiKey: 'lic_turno' },
            { id: 'seg_academia', label: '🚗 Academia Conductores', type: 'leaf', apiKey: 'seg_academia' },
            { id: 'seg_infracciones', label: '⚖️ Mis Infracciones', type: 'leaf', apiKey: 'seg_infracciones' },
            { id: 'poli', label: '📞 Monitoreo y Comisaría', type: 'leaf', apiKey: 'poli' }
        ]
    },
    habilitaciones: {
        title: () => 'Gestión de Habilitaciones:',
        options: [
            { id: 'hab_video', label: '🎥 Ver Video Instructivo', type: 'leaf', apiKey: 'hab_video_info' },
            { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' },
            { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' },
            { id: 'hab_espacio', label: '🍔 Patios y Carros (Foodtruck)', type: 'leaf', apiKey: 'hab_espacio' },
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
    },
    omic: { 
        title: () => 'OMIC - Defensa del Consumidor:', 
        options: [
             { id: 'omic', label: '📢 OMIC (Defensa Consumidor)', type: 'leaf', apiKey: 'omic_info' },]
    },
    produccion: {
        title: () => '🏭 Producción y Empleo:',
        options: [
            { id: 'prod_eco_social', label: '🟢 Economía Social', type: 'submenu' },
            { id: 'prod_of_empleo', label: '🔵 Oficina de Empleo (Busco Trabajo)', type: 'submenu' },
            { id: 'prod_empresas', label: '🟠 Empresas y Emprendedores', type: 'submenu' },
            { id: 'prod_empleadores', label: '🟣 Empleadores (Busco Personal)', type: 'submenu' },
            { id: 'prod_manipulacion', label: '🔴 Carnet Manipulación Alimentos', type: 'leaf', apiKey: 'res_manipulacion' },
            { id: 'prod_contacto', label: '📍 Contacto y Dirección', type: 'leaf', apiKey: 'prod_contacto' }
        ]
    },
    prod_eco_social: {
        title: () => '🟢 Economía Social:',
        options: [
            { id: 'pe_compre', label: '🤝 Compre Chascomús', type: 'leaf', apiKey: 'res_compre_chascomus' },
            { id: 'pe_frescos', label: '🥦 Productores Alimentos Frescos', type: 'leaf', apiKey: 'res_prod_frescos' }
        ]
    },
    prod_of_empleo: {
        title: () => '🔵 Oficina de Empleo:',
        options: [
            { id: 'oe_inscripcion', label: '📝 Inscripción / Actualizar CV', type: 'leaf', apiKey: 'res_oe_inscripcion' },
            { id: 'oe_promover', label: '♿ Programa Promover (Discapacidad)', type: 'leaf', apiKey: 'res_oe_promover' },
            { id: 'oe_taller_cv', label: '📄 Taller Armado de CV', type: 'leaf', apiKey: 'res_oe_taller_cv' }
        ]
    },
    prod_empresas: {
        title: () => '🟠 Empresas y Emprendedores:',
        options: [
            { id: 'emp_chasco', label: '🚀 Chascomús Emprende', type: 'leaf', apiKey: 'res_emp_chasco' },
        ]
    },
    prod_empleadores: {
        title: () => '🟣 Empleadores:',
        options: [
            { id: 'empl_busqueda', label: '🔎 Publicar Búsqueda Laboral', type: 'leaf', apiKey: 'res_empl_busqueda' },
            { id: 'empl_madrinas', label: '🤝 Empresas Madrinas', type: 'leaf', apiKey: 'res_empl_madrinas' }
        ]
    },
    obras: { 
        title: () => 'Atención al Vecino 147:', 
        options: [
            { id: 'info_147', label: '📝 Iniciar Reclamo 147 (Chat), ℹ️ Info, Web y Teléfonos', type: 'leaf', apiKey: 'link_147' },
            { id: 'poda', label: '🌿 Poda', type: 'leaf', apiKey: 'poda' },
            { id: 'obras_basura', label: '♻️ Recolección', type: 'leaf', apiKey: 'obras_basura' }
        ]
    }
};

/* --- RESPUESTAS (Base de Datos HTML) --- */
const RES = {
    'agenda_actual': `<div class="info-card"><strong>📅 AGENDA FEBRERO 2026</strong><br><i>¡Disfrutá el verano en Chascomús!</i><br><br>🌕 <b>Sáb 1 - Remada Luna Llena:</b><br>Club de Pesca y Náutica.<br><br>🎭 <b>Sáb 7 - Teatro:</b><br>"Amores y Desamores".<br>Casa de Casco | 21hs.<br><br>🎉 <b>13, 14, 15 y 16 - CARNAVAL INFANTIL:</b><br>Corsódromo (Av. Alfonsín) | 20hs.<br><br>🔗 <a href="https://linktr.ee/visitasguiadas.turismoch" target="_blank">Ingresar al Linktree</a></div>`,
    
    'omic_info': `<div class="info-card"><strong>📢 OMIC (Defensa del Consumidor)</strong><br>📍 <b>Dirección:</b> Dorrego 229.<br>⏰ <b>Horario:</b> Lun a Vie de 8:00 a 13:00 hs.<br>📞 <b>Teléfonos:</b> 43-1287 / 42-5558</div>`,

    'caps_wa': `<div class="info-card"><strong>📞 WhatsApp de los CAPS:</strong><br><br>🟢 <b>30 de Mayo:</b> <a href="https://wa.me/5492241588248">2241-588248</a><br>🟢 <b>Barrio Jardín:</b> <a href="https://wa.me/5492241498087">2241-498087</a><br>🟢 <b>San Luis:</b> <a href="https://wa.me/5492241604874">2241-604874</a><br>🟢 <b>El Porteño:</b> <a href="https://wa.me/5492241409316">2241-409316</a></div>`,

    'link_147': `<div class="info-card"><strong>📝 ATENCIÓN AL VECINO 147</strong><br><br>💻 <b>Primera opción:</b> Web Autogestión (24/7): <a href="https://147.chascomus.gob.ar" target="_blank">147.chascomus.gob.ar</a><br>📞 <b>Teléfono:</b> 147 (8 a 15hs).</div>`,

    'caps_mapas': `<div class="info-card"><strong>📍 Ubicaciones CAPS:</strong><br>• <a href="https://www.google.com/maps/search/?api=1&query=CIC+30+de+Mayo+Chascomus" target="_blank">CIC 30 de Mayo</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=Barrio+Jardin+Chascomus" target="_blank">Barrio Jardín</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Luis+Chascomus" target="_blank">San Luis</a></div>`,

    'farmacias_lista': `<div class="info-card"><strong>📍 Farmacias en Chascomús:</strong><br>💊 <a href="https://www.turnofarma.com/turnos/ar/ba/chascomus" target="_blank" class="wa-btn" style="background:#2ecc71 !important;">VER FARMACIAS DE TURNO</a></div>`,

    'zoo_rabia': `<div class="info-card" style="border-left: 5px solid #f1c40f;"><strong style="color:#d35400;">🐾 Zoonosis</strong><br>📍 Mendoza 95.<br>📅 <b>Castración:</b> Con turno previo.<br>💉 <b>Vacunación:</b> Lun a Vie 8 a 13hs.</div>`,

    'vacunacion_info': `<div class="info-card"><strong>💉 Vacunación</strong><br>🏥 Hospital San Vicente de Paul.<br>🏠 Puntos Barriales (CAPS).<br>📋 Llevar DNI y Libreta.</div>`,

    'info_habitat': `
    <div class="info-card">
        <strong>🔑 Info de Hábitat</strong><br>
        • Registro de Demanda (Mayores de 18).<br>
        • Bien de Familia (Protección jurídica).<br>
        • Gestión de Tierras y Catastro.<br><br>
        👇 <b>Seleccioná una opción:</b>
    </div>`,

    'hab_video_info': `
    <div class="info-card">
        <strong>🎥 Guía de Habilitaciones</strong><br><br>
        <video width="100%" height="auto" controls style="border-radius: 8px; border: 1px solid #ddd;">
            <source src="videos/tutorial_habilitacion.mp4" type="video/mp4">
            Tu navegador no soporta el video.
        </video>
        <br><br>
        <p style="font-size: 0.85rem; color: #555;">
            Mirá este breve tutorial sobre cómo iniciar tu trámite de habilitación comercial 100% online.
        </p>
    </div>`,
    
    'habitat_info': `<div class="info-card"><strong>📍 Hábitat:</strong> Dorrego y Bolivar (Ex IOMA).<br><a href="https://wa.me/5492241559412" target="_blank" class="wa-btn">💬 Consultas WhatsApp</a></div>`,
       
    'habitat_planes': `<div class="info-card"><strong>🏘️ Planes Habitacionales</strong><br><a href="https://apps.chascomus.gob.ar/vivienda/" target="_blank" class="wa-btn">🔗 Planes Habitacionales</a></div>`,

    'ojos_en_alerta': `<div class="info-card"><strong>👀 OJOS EN ALERTA</strong><br>Seguridad ciudadana.<br>📍 Arenales y Julian Quintana.<br>⏰ 24hs.<br><a href="https://wa.me/5492241557444" class="wa-btn">📲 WhatsApp 2241-557444</a></div>`,
   
    'pamuv': `<div class="info-card" style="border-left: 5px solid #c0392b;"><strong style="color: #c0392b;">🆘 PAMUV</strong><br>Asistencia a la Víctima.<br>🚨 <b>ATENCIÓN 24 HS:</b><br><a href="https://wa.me/5492241514881" class="wa-btn" style="background-color: #c0392b !important;">📞 2241-514881 (WhatsApp)</a></div>`,

    'defensa_civil': `<div class="info-card" style="border-left: 5px solid #c0392b;"><strong style="color: #c0392b;">🌪️ Defensa Civil</strong><br>🚨 <b>LÍNEA DE EMERGENCIA:</b><br>📞 <a href="tel:103" class="wa-btn" style="background-color: #c0392b !important;">LLAMAR AL 103</a></div>`,

    'apps_seguridad': `<div class="info-card"><strong>📲 Apps Seguridad</strong><br>🔔 <b>BASAPP:</b> Alerta Vecinal.<br>🅿️ <b>SEM:</b> Estacionamiento Medido.</div>`,

    'turismo_info': `<div class="info-card"><strong>🏖️ Turismo</strong><br>📍 Av. Costanera España 25<br>📞 02241 61-5542</div>`,

    'deportes_info': `<div class="info-card"><strong>⚽ Deportes</strong><br>📍 Av. Costanera España y Av. Lastra<br>📞 (02241) 42 4649</div>`,

    'deportes_circuito': `<div class="info-card"><strong>🏃 Circuito de Calle</strong><br><a href="https://apps.chascomus.gob.ar/deportes/circuitodecalle/" target="_blank">IR A LA WEB</a></div>`,

    'seg_academia': `<div class="info-card"><strong>🚗 Academia de Conductores</strong><br><a href="https://apps.chascomus.gob.ar/academia/" target="_blank">INGRESAR A LA WEB</a></div>`,

    'seg_medido': `<div class="info-card"><strong>🅿️ Estacionamiento Medido</strong><br><a href="https://chascomus.gob.ar/estacionamientomedido/" target="_blank">Gestión vía Web</a></div>`,

    'lic_turno': `<b>📅 Turno Licencia:</b><br><a href="https://apps.chascomus.gob.ar/academia/">SOLICITAR TURNO</a>`, 

    'seg_infracciones': `<b>⚖️ Infracciones:</b><br><a href="https://chascomus.gob.ar/municipio/estaticas/consultaInfracciones">VER MIS MULTAS</a>`, 

    'poli': `<div class="info-card"><strong>🎥 Monitoreo:</strong> 43-1333.<br>🚔 <b>Policía:</b> 42-2222.</div>`,

    'politicas_gen': `<div class="info-card" style="border-left: 5px solid #9b59b6;"><strong style="color: #8e44ad;">💜 Género y Diversidad</strong><br>📍 Moreno 259.<br><a href="https://wa.me/5492241559397" target="_blank" class="wa-btn" style="background-color: #8e44ad !important;">🚨 GUARDIA 24HS</a></div>`,
    
    'asistencia_social': `<div class="info-card" style="border-left: 5px solid #e67e22;"><strong style="color: #d35400;">🍎 Módulos Alimentarios (CAM)</strong><br>📍 Depósito calle Juárez.<br>⏰ Lun-Vie 8 a 14hs.<br><a href="https://wa.me/5492241530478" target="_blank" class="wa-btn" style="background-color: #d35400 !important;">📲 Consultar Cronograma</a></div>`,
    
    'ninez': `<div class="info-card"><strong>👶 Niñez:</strong> Mendoza Nº 95. 📞 43-1146.</div>`,
    'mediacion_info': `<div class="info-card"><strong>⚖️ Mediación Comunitaria</strong><br>📍 Moreno 259.</div>`,
    'uda_info': `<div class="info-card"><strong>📍 Puntos UDA</strong><br>Atención en barrios. Consultá en tu CAPS más cercano.</div>`,
    'poda': `<div class="info-card"><strong>🌿 Poda:</strong> <a href="https://apps.chascomus.gob.ar/podaresponsable/solicitud.php">Solicitud Online</a></div>`,
    'obras_basura': `<div class="info-card"><strong>♻️ Recolección:</strong><br>Lun a Sáb 20hs (Húmedos)<br>Jueves 14hs (Reciclables)</div>`,
    'hac_tomasa': `<div class="info-card"><strong>🌾 TOMASA:</strong> <a href="https://tomasa.chascomus.gob.ar/">INGRESAR</a></div>`,
    'boleta': `<div class="info-card"><strong>📧 BOLETA DIGITAL</strong><br>📲 <a href="https://wa.me/5492241557616">2241-557616</a></div>`,
    'agua': `<div class="info-card"><strong>💧 CONSUMO AGUA</strong><br><a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">VER MI CONSUMO</a></div>`, 
    'deuda': `<div class="info-card"><strong>🔍 DEUDA:</strong> <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">CONSULTAR AQUÍ</a></div>`,
    'hab_gral': `<div class="info-card"><strong>🏢 Habilitación Comercial:</strong> <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionComercial.php" target="_blank" class="wa-btn">INICIAR ONLINE</a></div>`,
    'hab_eventos': `<div class="info-card"><strong>🎉 Eventos:</strong> <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionEventoPrivado2.0.php" target="_blank">IR AL FORMULARIO</a></div>`,
    'hab_espacio': `<div class="info-card"><strong>🍔 Espacio Público:</strong> <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionCarro.php" target="_blank">SOLICITAR PERMISO</a></div>`,
    'hab_reba': `<div class="info-card"><strong>🍷 REBA:</strong> <a href="https://wa.me/5492241559389" class="wa-btn" style="background-color:#25D366 !important;">💬 WhatsApp</a></div>`,
    'h_turnos': `<div class="info-card"><strong>📅 Turnos Hospital:</strong> <a href="https://wa.me/5492241466977">📲 2241-466977</a></div>`,
    'h_info': `<div class="info-card"><strong>📍 Hospital:</strong> Av. Alfonsín e Yrigoyen.<br>🚨 Guardia 24 hs.</div>`,
    'info_pediatria': `<b>👶 Pediatría:</b> Lun, Mar, Jue.`,
    'info_clinica': `<b>🩺 Clínica:</b> Lun, Mié, Vie.`,
    'info_gineco': `<b>🤰 Ginecología:</b> Lun. <b>Obstetricia:</b> Mié.`,
    'info_cardio': `<b>❤️ Cardiología:</b> Martes.`,
    'info_trauma': `<b>🦴 Traumatología:</b> Martes.`,
    'info_oftalmo': `<b>👁️ Oftalmología:</b> Miércoles.`,
    'info_nutri': `<b>🍎 Nutrición:</b> Jueves.`,
    'info_cirugia': `<b>🔪 Cirugía:</b> Jueves.`,
    'info_neuro_psiq': `<b>🧠 Salud Mental:</b> Viernes.`,
    
    'res_compre_chascomus': `<div class="info-card"><strong>🤝 Compre Chascomús:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSfa4LPccR6dYwkQFWhG31HELnaKMCSgUF7Jqy1xfiSNR_fA_g/viewform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'res_prod_frescos': `<div class="info-card"><strong>🥦 Productores:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSeMzImHt14uXF4ZSk3wiJEqfxK4U2Tw9bSJrJXaKGLv5kLGew/closedform" target="_blank" class="wa-btn">📝 FORMULARIO</a></div>`,
    'res_oe_inscripcion': `<div class="info-card"><strong>📝 Empleo:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSfl7uzaIU0u8G-S3uTjtddZl7y4o5jajZUzNuftZEyfqPdDKg/viewform" target="_blank" class="wa-btn">📝 CARGAR CV</a></div>`,
    'res_oe_promover': `<div class="info-card"><strong>♿ Programa Promover:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdGoPi4Xmg0zD2VtBzTr1sFol1QtLAM5G0oDA6vExM_cvIYbQ/viewform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'res_oe_taller_cv': `<div class="info-card"><strong>📄 Taller CV:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdQkEPZZx7gXZXO9vAb7u3Klxj8g5cwSe1fXqz6Zmo4jjMNBg/viewform" target="_blank" class="wa-btn">📝 INSCRIBIRSE</a></div>`,
    'res_emp_chasco': `<div class="info-card"><strong>🚀 Emprendedores:</strong> <a href="https://uploads.chascomus.gob.ar/produccion/PROGRAMA%20CHASCOMUS%20EMPRENDE.pdf" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'res_empl_busqueda': `<div class="info-card"><strong>🔎 Búsqueda Personal:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSdOeVRsshYtc8JF-sTXyEqQgJl2hyTbxyfDPb0G7SsiGBMj_g/viewform" target="_blank" class="wa-btn">📝 PUBLICAR</a></div>`,
    'res_empl_madrinas': `<div class="info-card"><strong>🤝 Empresas Madrinas:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSe7SA_eKKQw-EDuFU9pDBIE_nUjzLOX6AZrHI_KfO3bwufVSA/viewform" target="_blank" class="wa-btn">📝 SUMARSE</a></div>`,
    'res_manipulacion': `<div class="info-card"><strong>🔴 Carnet Manipulación:</strong> <a href="https://docs.google.com/forms/d/e/1FAIpQLSctX7eGQxBNei5howcIjXhIzlBTKQQb_RIBImnKXjVPvIVrvw/closedform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'prod_contacto': `<div class="info-card"><strong>📍 Producción:</strong> Maipú 415. 📞 43-6365.</div>`,
    'contacto_gral': `<div class="info-card"><strong>🏛️ Contacto:</strong> 43-1341 (7:30 a 13:30 hs).</div>`
};

/* --- LÓGICA DE INTERFAZ Y NAVEGACIÓN --- */

function toggleInfo() {
    const modal = document.getElementById('infoModal');
    modal.classList.toggle('show');
}

window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        modal.classList.remove('show');
    }
}

function toggleInput(show) { 
    const inputBar = document.getElementById('inputBar');
    if (inputBar) {
        inputBar.classList.toggle('hidden', !show);
        if(show) setTimeout(() => document.getElementById('userInput').focus(), 100);
    }
}

function addMessage(text, side = 'bot', options = null) {
    const container = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.style.width = '100%';
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    
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

function handleAction(opt) {
    // Si el usuario elige un rango de edad (Onboarding paso 3)
    if (opt.type === 'age_select') {
        userAge = opt.label;
        localStorage.setItem('muni_user_age', userAge);
        // Enviamos los datos completos al Google Sheet
        registrarEvento("Onboarding Completado", "Nuevo usuario registrado");
        
        addMessage(`¡Gracias ${userName}! Ya guardé tus preferencias.`, 'bot');
        setTimeout(() => {
            addMessage(`¿En qué te puedo ayudar hoy?`, 'bot');
            resetToMain();
        }, 800);
        return;
    }

    // Registro normal de eventos
    registrarEvento("Click Botón", opt.label || opt.id);

    if (opt.id === 'nav_home') return resetToMain();
    
    if (opt.id === 'nav_back') {
        if (currentPath.length > 1) {
            currentPath.pop();
            showMenu(currentPath[currentPath.length - 1]);
        } else {
            showMenu('main');
        }
        return;
    }

    if (opt.id === 'back') {
        if (currentPath.length > 1) {
            currentPath.pop();
            showMenu(currentPath[currentPath.length - 1]);
        } else {
            showMenu('main');
        }
        return;
    }

    if (opt.link) {
        window.open(opt.link, '_blank');
        return;
    }

    addMessage(opt.label, 'user');

    if (opt.type === 'form_147') {
        startReclamoForm();
        return;
    }

    if (opt.type === 'leaf' || opt.apiKey) {
        const content = RES[opt.apiKey] || "Información no disponible.";
        setTimeout(() => {
            addMessage(content, 'bot');
            showNavControls(); 
        }, 500);
        return;
    }

    if (MENUS[opt.id]) {
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

function showNavControls() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'nav-controls';
    
    div.innerHTML = `
        <button class="nav-btn btn-back" onclick="handleAction({id:'nav_back'})">⬅ Volver</button>
        <button class="nav-btn btn-home" onclick="handleAction({id:'nav_home'})">🏠 Inicio</button>
    `;
    container.appendChild(div);
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
}

/* --- FORMULARIO 147 --- */
function startReclamoForm() {
    isAwaitingForm = true;
    currentFormStep = 1;
    toggleInput(true); 
    setTimeout(() => addMessage("📝 <b>Paso 1/4:</b> ¿Qué tipo de problema es? (Ej: Luminaria, Basura)", 'bot'), 500);
}

function processFormStep(text) {
    if (currentFormStep === 1) {
        formData.tipo = text;
        currentFormStep = 2;
        setTimeout(() => addMessage("📍 <b>Paso 2/4:</b> ¿Cuál es la dirección exacta?", 'bot'), 500);
    } else if (currentFormStep === 2) {
        formData.ubicacion = text;
        currentFormStep = 3;
        setTimeout(() => addMessage("🖊️ <b>Paso 3/4:</b> Breve descripción del problema.", 'bot'), 500);
    } else if (currentFormStep === 3) {
        formData.descripcion = text; // Guardamos descripción
        currentFormStep = 4;
        setTimeout(() => addMessage("📸 <b>Paso 4/4:</b> Si puede, envíe una foto por el chat oficial de WhatsApp al finalizar. Escriba 'ok' para terminar.", 'bot'), 500);
    } else if (currentFormStep === 4) {
        finalizeForm();
    }
}

function finalizeForm() {
    isAwaitingForm = false;
    toggleInput(false);
    const tel147 = "5492241514700"; 
    
    const msg = `🏛️ *RECLAMO 147* 🏛️\n👤 *Vecino:* ${userName}\n📍 *Barrio:* ${userNeighborhood}\n🏷️ *Tipo:* ${formData.tipo}\n📍 *Ubicación:* ${formData.ubicacion}\n📝 *Desc:* ${formData.descripcion}`;
    const url = `https://wa.me/${tel147}?text=${encodeURIComponent(msg)}`;
    
    const cardHtml = `
        <div class="info-card">
            ✅ <strong>Datos Listos</strong><br>
            Presioná abajo para enviar el reporte oficial.
            <a href="${url}" target="_blank" class="wa-btn">📲 ENVIAR RECLAMO</a>
        </div>`;
        
    addMessage(cardHtml, 'bot');
    showNavControls();
}

/* --- LÓGICA DE INICIO Y ONBOARDING --- */
function processInput() {
    const input = document.getElementById('userInput');
    const val = input.value.trim();
    if(!val) return;

    // 1. RECLAMO 147 EN CURSO
    if (isAwaitingForm) {
        addMessage(val, 'user');
        input.value = "";
        processFormStep(val);
        return;
    }

    // 2. ONBOARDING: NOMBRE
    if (!userName) {
        addMessage(val, 'user');
        userName = val;
        localStorage.setItem('muni_user_name', val);
        input.value = "";
        
        setTimeout(() => {
            addMessage(`¡Mucho gusto, <b>${userName}</b>! 👋 Para poder brindarte mejor información, ¿de qué <b>barrio</b> sos? (Ej: Centro, Iporá, San Luis)`, 'bot');
        }, 600);
        return;
    }

    // 3. ONBOARDING: BARRIO
    if (!userNeighborhood) {
        addMessage(val, 'user');
        userNeighborhood = val;
        localStorage.setItem('muni_user_neighborhood', val);
        input.value = "";

        const rangosEdad = [
            { id: 'age_1', label: 'Menos de 20', type: 'age_select' },
            { id: 'age_2', label: '20 a 40', type: 'age_select' },
            { id: 'age_3', label: '40 a 60', type: 'age_select' },
            { id: 'age_4', label: 'Más de 60', type: 'age_select' }
        ];

        setTimeout(() => {
            addMessage("¡Perfecto! Y por último, para conocer mejor las necesidades de los vecinos, ¿en qué rango de edad estás?", 'bot', rangosEdad);
        }, 600);
        return;
    }

    // 4. ONBOARDING: EDAD
    // (Si llegamos aquí y no tiene edad, asumimos que escribió en lugar de tocar botón)
    if (!userAge) {
        // Opcional: Podrías guardar lo que escribió como edad, o forzar los botones.
        // Por simplicidad, guardamos lo escrito:
        addMessage(val, 'user');
        userAge = val;
        localStorage.setItem('muni_user_age', val);
        input.value = "";
        registrarEvento("Onboarding Completado", "Texto Manual");
        
        setTimeout(() => {
            addMessage("¡Gracias! Ahora sí, ¿en qué puedo ayudarte? Podés escribir 'Menú' o palabras clave.", 'bot');
            resetToMain();
        }, 600);
        return;
    }

    // 5. CHAT NORMAL
    addMessage(val, 'user');
    const texto = val.toLowerCase();
    input.value = "";
    
    registrarEvento("Consulta Escrita", val);

    /* --- COMANDO SECRETO --- */
    if (texto === 'autor') {
        addMessage(`<div class="info-card" style="border-left:5px solid #000;">👨‍💻 <b>Desarrollo Original:</b><br>Federico de Sistemas<br>© 2026 Municipalidad de Chascomús</div>`, 'bot');
        return;
    }

    /* --- DICCIONARIO DE PALABRAS CLAVE --- */
    const diccionario = {
        'farmacia':   { type: 'leaf', apiKey: 'farmacias_lista', label: '💊 Farmacias' },
        'agenda':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'cultural':   { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'turno':      { type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        '147':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'reclamo':    { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'basura':     { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'poda':       { type: 'leaf', apiKey: 'poda', label: '🌿 Poda' },
        'agua':       { type: 'leaf', apiKey: 'agua', label: '💧 Consumo Agua' },
        'deuda':      { type: 'leaf', apiKey: 'deuda', label: '💸 Deuda' },
        'boleta':     { type: 'leaf', apiKey: 'boleta', label: '📧 Boleta Digital' },
        'menu':       { id: 'nav_home', label: '☰ Menú Principal' }
        // ... (puedes agregar más aquí)
    };
    
    for (let palabra in diccionario) {
        if (texto.includes(palabra)) { 
            const accion = diccionario[palabra];
            setTimeout(() => {
                addMessage(`¡Encontré esto sobre <b>"${palabra.toUpperCase()}"</b>! 👇`, 'bot');
                handleAction(accion);
            }, 600);
            return;
        }
    }
    
    setTimeout(() => addMessage("No entendí tu mensaje. 🤔<br>Por favor, <b>utilizá los botones del menú</b> o escribí 'Menú'.", 'bot'), 600);
}

function resetToMain() {
    currentPath = ['main'];
    showMenu('main');
}

function clearSession() {
    if(confirm("¿Borrar tus datos y reiniciar?")) {
        localStorage.clear();
        location.reload();
    }
}

document.getElementById('sendButton').onclick = processInput;
document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') processInput(); };

window.onload = () => {
    // Si no hay nombre, iniciamos el Onboarding
    if (!userName) {
        addMessage("👋 Bienvenido al asistente de Chascomús.<br>Para comenzar, por favor <b>ingresá tu nombre</b>:", 'bot');
        toggleInput(true);
    } else {
        showMenu('main');
    }
};

/* --- SERVICE WORKER --- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js'); });
}

/* --- SEGURIDAD --- */
(function() {
    const _0x1 = "Q3JlYWRvIHBvcjogPGI+RmVkZXJpY28gZGUgU2lzdGVtYXM8L2I+PGJyPnBhcmEgbGEgTXVuaWNpcGFsaWRhZCBkZSBDaGFzY29tw7pz";
    function _secure() {
        const _el = document.getElementById('authorCredit');
        if (_el) { if(_el.innerHTML !== atob(_0x1)) _el.innerHTML = atob(_0x1); }
    }
    window.addEventListener('load', _secure);
    setInterval(_secure, 3000);
})();





