/* ============================================================
   MUNICIPALIDAD DE CHASCOMÚS - CHATBOT SCRIPT (V. FINAL)
   ============================================================ */

/* --- 1. CONFIGURACIÓN Y ESTADO --- */
let userName = localStorage.getItem('muni_user_name') || "";
let userNeighborhood = localStorage.getItem('muni_user_neighborhood') || "";
let userAge = localStorage.getItem('muni_user_age') || "";

let currentPath = ['main'];
let isAwaitingForm = false;
let currentFormStep = 0;
let formData = { tipo: "", ubicacion: "", descripcion: "" };
let isBotThinking = false; 

/* --- 2. ESTADÍSTICAS --- */
const STATS_URL = "https://script.google.com/macros/s/AKfycbyv6W175qMpbqVUsg0ETM2SOtkdUPsoAUHG3XnaiIjgMFmEnDr7FeVGcyr9dl9AfHB0/exec";

function registrarEvento(accion, detalle) {
    if (!STATS_URL || STATS_URL.includes("TUS_LETRAS_RARAS")) return;
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
    }).catch(console.error);
}

/* --- 3. MENÚS (DATA INTACTA) --- */  
const MENUS = {
    main: { 
        title: (name) => `¡Hola <b>${name}</b>! 👋 Soy MuniBot el asistente virtual de la Municipalidad. ¿Empecemos la recorrida?`, 
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
        options: [ { id: 'omic', label: '📢 OMIC (Defensa Consumidor)', type: 'leaf', apiKey: 'omic_info' } ]
    },

    hab_menu: {
        title: () => 'Gestión de Habilitaciones:',
        options: [
            { id: 'hab_gral', label: '🏢 Comercio e Industria', type: 'leaf', apiKey: 'hab_gral' },
            { id: 'hab_eventos', label: '🎉 Eventos y Salones', type: 'leaf', apiKey: 'hab_eventos' },
            { id: 'hab_espacio', label: '🍔 Patios y Carros (Foodtruck)', type: 'leaf', apiKey: 'hab_espacio' },
            { id: 'hab_reba', label: '🍷 REBA (Alcohol)', type: 'leaf', apiKey: 'hab_reba' }
        ]
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

/* --- 4. RESPUESTAS (HTML CONSERVADO) --- */
const RES = {
    'agenda_actual': `
    <div class="info-card">
        <strong>📅 AGENDA FEBRERO 2026</strong><br>
        <i>¡Disfrutá el verano en Chascomús!</i><br><br>
        🌕 <b>Sáb 1 - Remada Luna Llena:</b><br>
        📍 Club de Pesca y Náutica.<br><br>
        🎬 <b>Vie 6 - Audiovisual:</b><br>
        "Mis imágenes diarias". 📍 C.C. Vieja Estación | 21hs | Gratis.<br><br>
        🎭 <b>Sáb 7 - Teatro:</b><br>
        "Amores y Desamores". 📍 Casa de Casco | 21hs | 🎟️ $18.000.<br><br>
        🎉 <b>13 al 16 - CARNAVAL INFANTIL:</b><br>
        📍 Corsódromo (Av. Alfonsín) | 20hs | Gratis.<br><br>
        🏊 <b>Sáb 14 - Aguas Abiertas:</b><br>
        📍 Escalinatas Costanera | 12:00hs.<br><br>
        🐴 <b>21 y 22 - Gran Fiesta Criolla:</b><br>
        📍 Fortín Chascomús (Ruta 20) | 13hs.<br><br>
        🔗 <b><a href="https://linktr.ee/visitasguiadas.turismoch" target="_blank">Inscripciones (Linktree)</a></b>
    </div>`,
    
    'omic_info': `<div class="info-card"><strong>📢 OMIC (Defensa del Consumidor)</strong><br>⚖️ <b>Asesoramiento y Reclamos:</b><br>📍 Dorrego 229.<br>⏰ Lun-Vie 8 a 13hs.<br>📞 43-1287 / 42-5558</div>`,

    'caps_wa': `<div class="info-card"><strong>📞 WhatsApp de los CAPS:</strong><br><br>🟢 <b>30 de Mayo:</b> <a href="https://wa.me/5492241588248">2241-588248</a><br>🟢 <b>Barrio Jardín:</b> <a href="https://wa.me/5492241498087">2241-498087</a><br>🟢 <b>San Luis:</b> <a href="https://wa.me/5492241604874">2241-604874</a><br>🟢 <b>El Porteño:</b> <a href="https://wa.me/5492241409316">2241-409316</a><br>🟢 <b>Gallo Blanco:</b> <a href="https://wa.me/5492241469267">2241-469267</a><br>🟢 <b>Iporá:</b> <a href="https://wa.me/5492241588247">2241-588247</a><br>🟢 <b>La Noria:</b> <a href="https://wa.me/5492241604872">2241-604872</a><br>🟢 <b>San Cayetano:</b> <a href="https://wa.me/5492241511430">2241-511430</a></div>`,

    'link_147': `<div class="info-card"><strong>📝 ATENCIÓN AL VECINO 147</strong><br><br>💻 <b>Web Autogestión (Recomendado):</b><br>🔗 <a href="https://147.chascomus.gob.ar" target="_blank">147.chascomus.gob.ar</a><br><br>📧 <a href="mailto:atencionalvecino@chascomus.gob.ar">atencionalvecino@chascomus.gob.ar</a><br><br>📞 <b>Teléfono 147:</b> Lun a Vie 8-15hs.</div>`,

    'caps_mapas': `<div class="info-card"><strong>📍 Ubicaciones CAPS:</strong><br>• <a href="https://www.google.com/maps/search/?api=1&query=CIC+30+de+Mayo+Chascomus" target="_blank">CIC 30 de Mayo</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=Barrio+Jardin+Chascomus" target="_blank">Barrio Jardín</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Luis+Chascomus" target="_blank">San Luis</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+El+Porteño+Chascomus" target="_blank">El Porteño</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+Gallo+Blanco+Chascomus" target="_blank">Gallo Blanco</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+Ipora+Chascomus" target="_blank">Iporá</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+La+Noria+Chascomus" target="_blank">La Noria</a><br>• <a href="https://www.google.com/maps/search/?api=1&query=CAPS+San+Cayetano+Chascomus" target="_blank">San Cayetano</a></div>`,

    'farmacias_lista': `<div class="info-card"><strong>📍 Farmacias:</strong><br>Consultá el listado completo en la web.<br><br>💊 <a href="https://www.turnofarma.com/turnos/ar/ba/chascomus" target="_blank" class="wa-btn" style="background:#2ecc71 !important;">VER FARMACIAS DE TURNO</a></div>`,

    'zoo_rabia': `<div class="info-card" style="border-left: 5px solid #f1c40f;"><strong style="color:#d35400;">🐾 Zoonosis & Castración</strong><br><br>✅ <b>GRATIS</b> - Revisación Clínica.<br>🐕 Llevar con collar y correa.<br>🏢 <b>Sede:</b> Mendoza 95.</div>`,

    'vacunacion_info': `<div class="info-card"><strong>💉 Vacunación</strong><br>🏥 <b>Hospital:</b> Vacunatorio central.<br>🏠 <b>Puntos Barriales:</b> CIC y CAPS.<br>📋 <b>Demanda espontánea</b> con DNI y Libreta.</div>`,

    'info_habitat': `<div class="info-card"><strong>🔑 Info de Hábitat</strong><br>• Registro de Demanda.<br>• Bien de Familia.<br>• Gestión de Tierras.</div>`,
    
    'habitat_info': `<div class="info-card"><strong>📍 Dirección de Hábitat</strong><br><a href="https://wa.me/5492241559412" target="_blank" class="wa-btn" style="background-color: #25D366 !important;">💬 Consultas WhatsApp</a><br><br>📍 Dorrego y Bolivar (Ex IOMA)</div>`,
       
    'habitat_planes': `<div class="info-card"><strong>🏘️ Planes Habitacionales</strong><br><a href="https://apps.chascomus.gob.ar/vivienda/" target="_blank" class="wa-btn" style="background-color: #004a7c !important;">🔗 Planes Habitacionales</a></div>`,

    'ojos_en_alerta': `<div class="info-card"><strong>👀 OJOS EN ALERTA</strong><br>Seguridad ciudadana 24hs.<br>📍 Arenales y Julian Quintana.<br><a href="https://wa.me/5492241557444" class="wa-btn">📲 WhatsApp 2241-557444</a></div>`,

    'pamuv': `<div class="info-card" style="border-left: 5px solid #c0392b;"><strong style="color: #c0392b;">🆘 PAMUV (Asistencia Víctima)</strong><br><br>🚨 <b>ATENCIÓN 24 HS:</b><br><a href="https://wa.me/5492241514881" class="wa-btn" style="background-color: #c0392b !important;">📞 2241-514881 (WhatsApp)</a></div>`,
    
    'defensa_civil': `<div class="info-card" style="border-left: 5px solid #c0392b;"><strong style="color: #c0392b;">🌪️ Defensa Civil</strong><br>🚨 <b>LÍNEA DE EMERGENCIA:</b><br><a href="tel:103" class="wa-btn" style="background-color: #c0392b !important; text-align:center; display:block;">LLAMAR AL 103</a></div>`,
    
    'apps_seguridad': `<div class="info-card"><strong>📲 Apps Seguridad</strong><br>🔔 <b>BASAPP:</b> Alerta Vecinal.<br>🅿️ <b>SEM:</b> Estacionamiento.<br>Busalas en Play Store o App Store.</div>`,
    
    'turismo_info': `<div class="info-card"><strong>🏖️ Turismo</strong><br>📍 Av. Costanera España 25<br>📞 02241 61-5542<br>🔗 <a href="https://linktr.ee/turismoch" target="_blank">Más info</a></div>`,
    
    'deportes_info': `<div class="info-card"><strong>⚽ Deportes</strong><br>📍 Av. Costanera España y Av. Lastra<br>📞 (02241) 42 4649</div>`,
    
    'deportes_circuito': `<div class="info-card"><strong>🏃 Circuito de Calle</strong><br>🔗 <a href="https://apps.chascomus.gob.ar/deportes/circuitodecalle/" target="_blank">IR A LA WEB</a></div>`,
    
    'seg_academia': `<div class="info-card"><strong>🚗 Academia Conductores</strong><br>🔗 <a href="https://apps.chascomus.gob.ar/academia/" target="_blank">WEB ACADEMIA</a></div>`,
    
    'lic_turno': `<b>📅 Turno Licencia:</b><br>🔗 <a href="https://apps.chascomus.gob.ar/academia/">SOLICITAR TURNO</a>`, 
    
    'seg_infracciones': `<b>⚖️ Infracciones:</b><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaInfracciones">VER MIS MULTAS</a>`, 

    'poli': `<div class="info-card"><strong>🎥 MONITOREO</strong><br>☎️ <a href="tel:43-1333">43-1333</a><br><br>🚔 <b>POLICIA:</b> <a href="tel:422222">42-2222</a></div>`,

    'politicas_gen': `<div class="info-card" style="border-left: 5px solid #9b59b6;"><strong style="color: #8e44ad;">💜 Género y Diversidad</strong><br>🚨 <b>Guardia 24/7:</b> Orientación y acompañamiento.<br>📍 Moreno 259 (Lun-Vie 9-14hs)<br><a href="https://wa.me/5492241559397" target="_blank" class="wa-btn" style="background-color: #8e44ad !important;">🚨 GUARDIA 24HS (WhatsApp)</a></div>`,
    
    'asistencia_social': `<div class="info-card" style="border-left: 5px solid #e67e22;"><strong style="color: #d35400;">🍎 Módulos Alimentarios (CAM)</strong><br>📦 <b>Retiro:</b> Depósito de calle Juárez.<br>⏰ Lun-Vie 8-14hs.<br>📋 Llevar DNI titular.<br><a href="https://wa.me/5492241530478" target="_blank" class="wa-btn" style="background-color: #d35400 !important;">📲 Consultar (WhatsApp)</a></div>`,
    
    'ninez': `<div class="info-card"><strong>👶 Niñez:</strong> Mendoza Nº 95. 📞 43-1146.</div>`,
    'mediacion_info': `<div class="info-card"><strong>⚖️ Mediación Vecinal</strong><br>Resolución pacífica de conflictos.<br>📍 Moreno 259.</div>`,
    'uda_info': `<div class="info-card"><strong>📍 Puntos UDA (Atención Barrios)</strong><br>Acercate a tu punto más cercano (San Luis, El Porteño, 30 de Mayo, etc).<br>🚨 <b>Guardia 24hs:</b> <a href="https://wa.me/5492241559397">2241-559397</a></div>`,

    'poda': `<div class="info-card"><strong>🌿 Poda Responsable</strong><br>🔗 <a href="https://apps.chascomus.gob.ar/podaresponsable/solicitud.php">🌳 Solicitud Poda</a></div>`,
    'obras_basura': `<div class="info-card"><strong>♻️ Recolección</strong><br>Lun a Sáb 20hs (Húmedos)<br>Jueves 14hs (Reciclables)</div>`,

    'hac_tomasa': `<div class="info-card"><strong>🌾 TOMASA</strong><br>🔗 <a href="https://tomasa.chascomus.gob.ar/">INGRESAR</a></div>`,
    'boleta': `<div class="info-card"><strong>📧 BOLETA DIGITAL</strong><br>📲 WA: <a href="https://wa.me/5492241557616">2241-557616</a></div>`,
    'agua': `<div class="info-card"><strong>💧 CONSUMO DE AGUA</strong><br>🔗 <a href="https://apps.chascomus.gob.ar/caudalimetros/consulta.php">VER MI CONSUMO</a></div>`, 
    'deuda': `<div class="info-card"><strong>🔍 CONSULTA DE DEUDA</strong><br>🔗 <a href="https://chascomus.gob.ar/municipio/estaticas/consultaDeudas">CONSULTAR AQUÍ</a></div>`,
     
    'hab_gral': `<div class="info-card"><strong>🏢 Habilitación Comercial</strong><br>📍 Maipú 415.<br>🚀 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionComercial.php" target="_blank" class="wa-btn">INICIAR TRÁMITE ONLINE</a></div>`,

    'hab_video_info': `<div class="info-card"><strong>🎥 Guía de Habilitaciones</strong><br><video width="100%" controls style="border-radius: 8px;"><source src="videos/tutorial_habilitacion.mp4" type="video/mp4"></video><br>Tutorial trámite online.</div>`,

    'hab_eventos': `<div class="info-card"><strong>🎉 Eventos y Salones</strong><br>Solicitar con <b>10 días hábiles</b>.<br>📝 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionEventoPrivado2.0.php" target="_blank">IR AL FORMULARIO</a></div>`,

    'hab_espacio': `<div class="info-card"><strong>🍔 Espacio Público / Foodtrucks</strong><br>Requisitos: DNI, CUIT, Curso Manipulación, Seguro.<br>📝 <a href="https://apps.chascomus.gob.ar/habilitaciones/habilitacionCarro.php" target="_blank">SOLICITAR PERMISO</a></div>`,

    'hab_reba': `<div class="info-card"><strong>🍷 REBA (Alcohol)</strong><br>📲 <a href="https://wa.me/5492241559389" class="wa-btn">💬 2241-559389</a> (Solo mensajes).</div>`,
    
    'h_turnos': `<div class="info-card"><strong>📅 Turnos Hospital</strong><br>WhatsApp: <a href="https://wa.me/5492241466977">📲 2241-466977</a></div>`,
    'h_info':  `<div class="info-card"><strong>📍 Hospital Municipal</strong><br>Av. Alfonsín e Yrigoyen.<br>🚨 Guardia 24 hs.</div>`,
    
    'info_pediatria': `<div class="info-card"><strong>👶 Pediatría</strong><br>Lun, Mar, Jue.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_clinica': `<div class="info-card"><strong>🩺 Clínica Médica</strong><br>Lun, Mié, Vie.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_gineco': `<div class="info-card"><strong>🤰 Ginecología / Obs</strong><br>Lun / Mié.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_cardio': `<div class="info-card"><strong>❤️ Cardiología</strong><br>Martes.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_trauma': `<div class="info-card"><strong>🦴 Traumatología</strong><br>Martes.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_oftalmo': `<div class="info-card"><strong>👁️ Oftalmología</strong><br>Miércoles.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_nutri': `<div class="info-card"><strong>🍎 Nutrición</strong><br>Jueves.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_cirugia': `<div class="info-card"><strong>🔪 Cirugía General</strong><br>Jueves.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    'info_neuro_psiq': `<div class="info-card"><strong>🧠 Salud Mental</strong><br>Viernes.<br><a href="https://wa.me/5492241466977" target="_blank" class="wa-btn">📅 SACAR TURNO</a></div>`,
    
    'res_compre_chascomus': `<div class="info-card"><strong>🤝 Compre Chascomús</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSfa4LPccR6dYwkQFWhG31HELnaKMCSgUF7Jqy1xfiSNR_fA_g/viewform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'res_prod_frescos': `<div class="info-card"><strong>🥦 Productores Frescos</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSeMzImHt14uXF4ZSk3wiJEqfxK4U2Tw9bSJrJXaKGLv5kLGew/closedform" target="_blank" class="wa-btn">📝 FORMULARIO PRODUCTORES</a></div>`,
    'res_oe_inscripcion': `<div class="info-card"><strong>📝 Inscripción Laboral</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSfl7uzaIU0u8G-S3uTjtddZl7y4o5jajZUzNuftZEyfqPdDKg/viewform" target="_blank" class="wa-btn">📝 CARGAR CV</a></div>`,
    'res_oe_promover': `<div class="info-card"><strong>♿ Programa Promover</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSdGoPi4Xmg0zD2VtBzTr1sFol1QtLAM5G0oDA6vExM_cvIYbQ/viewform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'res_oe_taller_cv': `<div class="info-card"><strong>📄 Taller CV</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSdQkEPZZx7gXZXO9vAb7u3Klxj8g5cwSe1fXqz6Zmo4jjMNBg/viewform" target="_blank" class="wa-btn">📝 INSCRIBIRSE</a></div>`,
    'res_emp_chasco': `<div class="info-card"><strong>🚀 Chascomús Emprende</strong><br><a href="https://uploads.chascomus.gob.ar/produccion/PROGRAMA%20CHASCOMUS%20EMPRENDE.pdf" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'res_empl_busqueda': `<div class="info-card"><strong>🔎 Búsqueda de Personal</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSdOeVRsshYtc8JF-sTXyEqQgJl2hyTbxyfDPb0G7SsiGBMj_g/viewform" target="_blank" class="wa-btn">📝 PUBLICAR PUESTO</a></div>`,
    'res_empl_madrinas': `<div class="info-card"><strong>🤝 Empresas Madrinas</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSe7SA_eKKQw-EDuFU9pDBIE_nUjzLOX6AZrHI_KfO3bwufVSA/viewform" target="_blank" class="wa-btn">📝 SER MADRINA</a></div>`,
    'res_manipulacion': `<div class="info-card"><strong>🔴 Manipulación Alimentos</strong><br><a href="https://docs.google.com/forms/d/e/1FAIpQLSctX7eGQxBNei5howcIjXhIzlBTKQQb_RIBImnKXjVPvIVrvw/closedform" target="_blank" class="wa-btn">📝 INSCRIPCIÓN</a></div>`,
    'prod_contacto': `<div class="info-card"><strong>📍 Producción</strong><br>Maipú 415.<br>📞 43-6365</div>`,

    'contacto_gral': `<div class="info-card"><strong>🏛️ Contacto Municipal</strong><br>📞 <a href="tel:02241431341">43-1341</a> (7:30-13:30)<br>📍 Cramer 270.</div>`
};

/* --- 5. MOTOR DE CHAT (REPARADO Y OPTIMIZADO) --- */

const FRASES_RESPUESTA = [
    "¡Perfecto! 👍", "¡Entendido! 😊", "¡Genial, te ayudo con eso! 🎯", 
    "¡Excelente elección! ⭐", "¡Dame un segundo! ⏳"
];

function getFraseAleatoria() {
    return FRASES_RESPUESTA[Math.floor(Math.random() * FRASES_RESPUESTA.length)];
}

function scrollToBottom() {
    const container = document.getElementById('chatMessages'); 
    // Asegura que el scroll baje suavemente
    setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 100);
}

// Muestra la animación de 3 puntos
function showTyping() {
    isBotThinking = true;
    const container = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.id = 'typingIndicator';
    typing.className = 'typing-indicator';
    typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    container.appendChild(typing);
    scrollToBottom();
}

// Elimina la animación
function removeTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
    isBotThinking = false;
}

function addMessage(content, side = 'bot', options = null) {
    if (side === 'bot') removeTyping();
    
    const container = document.getElementById('chatMessages');
    const row = document.createElement('div');
    row.className = 'message-wrapper';
    
    const div = document.createElement('div');
    div.className = `message ${side}`;
    
    // SEGURIDAD: User text = textContent (evita XSS), Bot text = innerHTML (permite tarjetas)
    if (side === 'user') {
        div.textContent = content; 
    } else {
        div.innerHTML = content;
    }
    
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
    scrollToBottom();
}

function handleAction(opt) {
    if (isBotThinking) return; // Evita doble click mientras piensa
    
    // --- FIX: LOGICA DE EDAD (ONBOARDING) ---
    if (opt.type === 'age_select') {
        userAge = opt.label;
        localStorage.setItem('muni_user_age', userAge);
        registrarEvento("Registro", "Perfil Completo");
        
        addMessage(opt.label, 'user'); // Mostrar lo que eligió
        showTyping();
        
        setTimeout(() => {
            addMessage(`¡Gracias <b>${userName}</b>! Ya tengo tus datos para ayudarte mejor. ¿En qué te ayudo hoy?`, 'bot');
            resetToMain();
        }, 1000);
        return;
    }
    // ----------------------------------------
    
    registrarEvento("Click", opt.label || opt.id);

    if (opt.id === 'nav_home') return resetToMain();
    
    if (opt.id === 'back' || opt.id === 'nav_back') {
        if (currentPath.length > 1) {
            currentPath.pop();
            showMenu(currentPath[currentPath.length - 1]);
        } else {
            resetToMain();
        }
        return;
    }

    if (opt.link) {
        window.open(opt.link, '_blank');
        return;
    }

    addMessage(opt.label, 'user');

    if (opt.type === 'form_147') return startReclamoForm();

    showTyping(); // Empieza a "pensar"

    if (opt.type === 'leaf' || opt.apiKey) {
        setTimeout(() => {
            addMessage(RES[opt.apiKey] || "Información no disponible.", 'bot');
            showNavControls(); 
        }, 800);
    } else if (MENUS[opt.id]) {
        currentPath.push(opt.id);
        setTimeout(() => showMenu(opt.id), 600);
    }
}

function showMenu(key) {
    if (document.getElementById('typingIndicator')) removeTyping();
    
    const menu = MENUS[key];
    const title = typeof menu.title === 'function' ? menu.title(userName) : menu.title;
    let opts = [...menu.options];
    
    if (currentPath.length > 1) opts.push({ id: 'back', label: '⬅️ Volver' });
    
    addMessage(title, 'bot', opts);
}

/* --- CONTROLES DE NAVEGACIÓN MODERNOS --- */
function showNavControls() {
    const container = document.getElementById('chatMessages');
    const navDiv = document.createElement('div');
    navDiv.className = 'options-container'; 
    navDiv.style.marginTop = "15px";
    navDiv.style.borderTop = "1px solid #eee";
    navDiv.style.paddingTop = "10px";

    // Botón Volver (Estilo secundario)
    const btnBack = document.createElement('button');
    btnBack.className = 'option-button back';
    btnBack.innerHTML = '⬅️ Volver';
    btnBack.onclick = () => handleAction({id: 'back', label: 'Volver'});

    // Botón Inicio (Estilo principal)
    const btnHome = document.createElement('button');
    btnHome.className = 'option-button';
    btnHome.style.borderColor = 'var(--primary)'; // Asegura color primario
    btnHome.innerHTML = '🏠 Menú Principal';
    btnHome.onclick = () => resetToMain();

    navDiv.appendChild(btnBack);
    navDiv.appendChild(btnHome);
    
    container.appendChild(navDiv);
    scrollToBottom();
}

function resetToMain() {
    currentPath = ['main'];
    showTyping();
    setTimeout(() => showMenu('main'), 600);
}

/* --- 6. FORMULARIO 147 --- */
function startReclamoForm() {
    isAwaitingForm = true;
    currentFormStep = 1;
    toggleInput(true); 
    showTyping();
    setTimeout(() => addMessage("📝 <b>Paso 1/3:</b> ¿Qué tipo de problema es? (Ej: Luminaria, Basura)", 'bot'), 600);
}

function processFormStep(text) {
    showTyping();
    setTimeout(() => {
        if (currentFormStep === 1) {
            formData.tipo = text;
            currentFormStep = 2;
            addMessage("📍 <b>Paso 2/3:</b> ¿Cuál es la dirección exacta?", 'bot');
        } else if (currentFormStep === 2) {
            formData.ubicacion = text;
            currentFormStep = 3;
            addMessage("🖊️ <b>Paso 3/3:</b> Breve descripción del problema.", 'bot');
        } else if (currentFormStep === 3) {
            formData.descripcion = text;
            finalizeForm();
        }
    }, 600);
}

function finalizeForm() {
    isAwaitingForm = false;
    toggleInput(false);
    const tel147 = "5492241514700"; 
    const msg = `🏛️ *RECLAMO 147*\n👤 *Vecino:* ${userName}\n🏷️ *Tipo:* ${formData.tipo}\n📍 *Ubicación:* ${formData.ubicacion}\n📝 *Desc:* ${formData.descripcion}`;
    const url = `https://wa.me/${tel147}?text=${encodeURIComponent(msg)}`;
    
    addMessage(`<div class="info-card">✅ <strong>Datos Listos</strong><br><a href="${url}" target="_blank" class="wa-btn">📲 ENVIAR RECLAMO</a></div>`, 'bot');
    showNavControls();
}

/* --- 7. PROCESADOR DE TEXTO (BUSCADOR) --- */
function processInput() {
    const input = document.getElementById('userInput');
    const val = input.value.trim();
    if(!val || isBotThinking) return;

    // 1. FLUJO DE FORMULARIOS (147)
    if (isAwaitingForm) {
        addMessage(val, 'user');
        input.value = "";
        processFormStep(val);
        return;
    }

    // 2. REGISTRO DE NOMBRE
    if (!userName) {
        addMessage(val, 'user');
        userName = val;
        localStorage.setItem('muni_user_name', val);
        input.value = "";
        showTyping();
        setTimeout(() => {
            addMessage(`¡Mucho gusto, <b>${userName}</b>! 👋 ¿De qué <b>barrio</b> sos? para mejorar la atención.`, 'bot');
        }, 800);
        return;
    }

    // 3. REGISTRO DE BARRIO
    if (!userNeighborhood) {
        addMessage(val, 'user');
        userNeighborhood = val;
        localStorage.setItem('muni_user_neighborhood', val);
        input.value = "";
        showTyping();
        // Opciones de edad para que sea rápido
        const edades = [
            {label:'Menos de 20', type:'age_select'}, 
            {label:'20 a 40', type:'age_select'}, 
            {label:'40 a 60', type:'age_select'}, 
            {label:'Más de 60', type:'age_select'}
        ];
        setTimeout(() => {
            addMessage(`¡Genial! Por último <b>${userName}</b>, ¿en qué rango de edad estás?`, 'bot', edades);
        }, 800);
        return;
    }

    // 4. BÚSQUEDA GENERAL (Si ya está registrado)
    addMessage(val, 'user');
    registrarEvento("Escribió", val);
    input.value = "";
    ejecutarBusquedaInteligente(val.toLowerCase());
}


function ejecutarBusquedaInteligente(texto) {
     /* --- 🧠 CEREBRO DE RESPUESTAS RÁPIDAS --- */
    
    // 1. SALUDOS
    if (['hola', 'buen dia', 'buenas', 'que tal'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage(`¡Hola <b>${userName}</b>! 👋 Qué gusto saludarte. ¿En qué te puedo ayudar hoy? Seleccioná una opción del menú.`, 'bot'), 600);
        return;
    }

    // 2. AGRADECIMIENTOS
    if (['gracias', 'muchas gracias', 'genial', 'excelente' , '👍🏽' , '👌🏼'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage("¡De nada! Es un placer ayudarte. 😊", 'bot'), 600);
        return;
    }

    // 3. PEDIDO DE AYUDA / MENÚ
    if (['ayuda', 'menu', 'menú', 'inicio', 'botones', 'opciones', "me ayudas", "ayudame"].some(palabra => texto.includes(palabra))) {
        setTimeout(() => {
            addMessage("¡Entendido! Acá tenés el menú principal:", 'bot');
            resetToMain();
        }, 600);
        return;
    }

    // 4. INSULTOS (Filtro de educación)
    if (['boludo', 'tonto', 'inutil', 'mierda', 'puto' , 'forro' , 'estupido' , 'tarado'].some(palabra => texto.includes(palabra))) {
        setTimeout(() => addMessage("Por favor, mantengamos el respeto. Soy un robot intentando ayudar. 🤖💔", 'bot'), 600);
        return;
    }

    const diccionario = {
        'farmacia':   { type: 'leaf', apiKey: 'farmacias_lista', label: '💊 Farmacias' },
        'agenda':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'cultural':   { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'teatro':     { type: 'leaf', apiKey: 'agenda_actual', label: '🎭 Agenda Cultural' },
        'turno':      { type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'especialidad':{ type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'medico':     { type: 'leaf', apiKey: 'h_turnos', label: '📅 Turnos Hospital' },
        'hospital':   { id: 'hospital_menu', label: '🏥 Menú Hospital' }, 
        '147':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'reclamo':    { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'luz':        { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'foco':       { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'bache':      { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'perdida':     { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'caño':       { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'ramas':      { type: 'leaf', apiKey: 'link_147', label: '📝 Reclamos 147' },
        'basura':     { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'contenedor': { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'reciclo':    { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'recoleccion': { type: 'leaf', apiKey: 'obras_basura', label: '♻️ Recolección' },
        'poda':       { type: 'leaf', apiKey: 'poda', label: '🌿 Poda' },
        'arbol':      { type: 'leaf', apiKey: 'poda', label: '🌿 Poda' },
        'deporte':    { id: 'deportes', label: '⚽ Deportes' },  
        'futbol':     { id: 'deportes', label: '⚽ Deportes' },
        'canchas':    { id: 'deportes', label: '⚽ Deportes' },
        'natacion':   { id: 'deportes', label: '⚽ Deportes' },
        'piscina':    { id: 'deportes', label: '⚽ Deportes' },
        'turismo':    { id: 'turismo', label: '🏖️ Turismo' },
        'turista':    { id: 'turismo', label: '🏖️ Turismo' },
        'turismo':    { id: 'turismo', label: '🏖️ Turismo' },            
        'reba':       { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'alcohol':    { type: 'leaf', apiKey: 'hab_reba', label: '🍷 REBA' },
        'licencia':   { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'carnet':     { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'carnet':     { type: 'leaf', apiKey: 'lic_turno', label: '🪪 Licencias' },
        'castracion': { type: 'leaf', apiKey: 'zoo_rabia', label: '🐾 Zoonosis' },
        'vacunacion': { type: 'leaf', apiKey: 'vacunacion_info', label: '💉 Vacunación' },
        'vacuna':     { type: 'leaf', apiKey: 'vacunacion_info', label: '💉 Vacunación' },
        'empleo':     { id: 'produccion', label: '👷 Empleo' }, /* FIX: Estaba mal el id */
        'emprende':   { id: 'produccion', label: '👷 Producción y Empleo' }, /* FIX: Estaba mal el id */
        'caps':       { id: 'centros', label: '🏥 Caps' },
        'saludmental': { id: 'centros', label: '🏥 Caps' },
        'salita':     { id: 'centros', label: '🏥 Caps' },
        'salud':      { id: 'salud', label: '🏥 Menú Salud' },         
        'seguridad':  { id: 'seguridad', label: '🛡️ Menú Seguridad' }, 
        'tormenta':   { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'viento':     { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'inundacion': { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'clima':      { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'lluvia':     { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'emergencia': { type: 'leaf', apiKey: 'defensa_civil', label: '🌪️ Defensa Civil' },
        'camara':     { type: 'leaf', apiKey: 'poli', label: '📹 Camaras de seguridad' },
        'camaras':    { type: 'leaf', apiKey: 'poli', label: '📹 Camaras de seguridad' },
        'espacio':    { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'publico':    { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'evento':     { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'fiesta':     { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'foodtruck':  { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'carro':      { type: 'leaf', apiKey: 'hab_espacio', label: '🍔 Uso de Espacio Público' },
        'local':      { type: 'leaf', apiKey: 'hab_gral', label: '🏢 Habilitación Comercial' },  
        'comercio':   { type: 'leaf', apiKey: 'hab_gral', label: '🏢 Habilitación Comercial' },
        'medidor':    { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'agua':       { type: 'leaf', apiKey: 'agua', label: '💧 Consumo de Agua'  }, 
        'boleta':     { type: 'leaf', apiKey: 'boleta', label: '📧 Boleta Digital' },
        'tomasa':     { type: 'leaf', apiKey: 'hac_tomasa', label: '📧 Tomasa' },
        'casa':       { type: 'leaf', apiKey: 'habitat_info', label: '🏢 Habilitación Habitacional'  },
        'vivienda':   { type: 'leaf', apiKey: 'habitat_info', label: '🏢 Habilitación Habitacional'  },       
        'denuncia':   { id: 'omic', label: '🏦 Denuncias Omic' },
        'consumidor': { id: 'omic', label: '🏦 Denuncias Omic' },
        /* FIX: 'barrio' apuntaba a 'vecinales' que NO EXISTÍA en MENUS. Apunté a Desarrollo Social. */
        'barrio':     { id: 'desarrollo_menu', label: '🏘️ Vecinales' },
        'trabajo':    { id: 'produccion', label: '👷 Producción y Empleo' },        
        'curriculum': { id: 'produccion', label: '👷 Producción y Empleo' },
        'cv':         { id: 'produccion', label: '👷 Producción y Empleo' },
        'boletin':    { id: 'sibon', label: '📰 Boletín Oficial' },
        'oficial':    { id: 'sibon', label: '📰 Boletín Oficial' },
        'diario':     { id: 'el_digital', label: '📰 Diario Digital' },
        'digital':    { id: 'el_digital', label: '📰 Diario Digital' }
    };

    showTyping();

    setTimeout(() => {
        for (let palabra in diccionario) {
            if (texto.includes(palabra)) { 
                addMessage(`🔍 Encontré esto sobre <b>"${palabra.toUpperCase()}"</b>:`, 'bot');
                handleAction(diccionario[palabra]);
                return;
            }
        }
        addMessage("No entendí. Escribí '<b>Menú</b>' o usá los botones. 🤔", 'bot');
        showNavControls();
    }, 800);
}

/* --- 8. EVENTOS Y CARGA --- */
function toggleInfo() { document.getElementById('infoModal').classList.toggle('show'); }
function toggleInput(show) { document.getElementById('inputBar').style.display = show ? 'flex' : 'none'; }
function clearSession() { if(confirm("¿Borrar datos?")) { localStorage.clear(); location.reload(); } }

document.getElementById('sendButton').onclick = processInput;
document.getElementById('userInput').onkeypress = (e) => { if(e.key === 'Enter') processInput(); };

window.onload = () => {
    if (!userName) {
        showTyping();
        setTimeout(() => addMessage("👋 Bienvenido. Para empezar, ¿cómo es tu <b>nombre</b>?", 'bot'), 600);
    } else {
        showMenu('main');
    }
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
