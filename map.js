/* =====================================================
   CONFIGURACIÓN INICIAL
   ===================================================== */

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9tdWxvY29yZGVybyIsImEiOiJjbWd4emVpeW0wNWEyMmxxOWZnaDJrMGQ2In0.0t1RZwHup3NH5Y_M3UN6pA';

const SUPABASE_CONFIG = {
    url: 'https://fddccovvfwgczphmzbqh.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZGNjb3Z2ZndnY3pwaG16YnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc2NzgsImV4cCI6MjA4NTQ5MzY3OH0.wimNWxnaB9fNBgSmyoV3627Ql0hfuO_JQoEKuxYQ2gs'
};

const MAP_CONFIG = {
    center: [-67.1837486, -17.7423068], 
    zoom: 12,
    style: 'mapbox://styles/mapbox/streets-v12',
    pitch: 0,
    bearing: 0
};

const URB_NOMBRES = {
    '1': 'URBANIZACIÓN CANDELARIA',
};

const USUARIOS_AUTORIZADOS = {
    'admin': { password: 'admin', tipo: 'administrador' },
    'admin2': { password: 'admin2', tipo: 'administrador' }
};

// Usuarios secundarios - solo pueden cambiar de DISPONIBLE a RESERVADO
const USUARIOS_SECUNDARIOS = {
    'usuario1': { password: 'usuario1', tipo: 'secundario' },
    'usuario2': { password: 'usuario2', tipo: 'secundario' }
};

const ZOOM_LEVELS = {
    lotes: { minzoom: 14, maxzoom: 22 },
    manzanos: { minzoom: 12, maxzoom: 22 },
    vias: { minzoom: 13, maxzoom: 22 },
    cotas: { minzoom: 15, maxzoom: 22 },
    praderas: { minzoom: 13, maxzoom: 22 },
    equipamiento: { minzoom: 13, maxzoom: 22 },
    rutas: { minzoom: 7, maxzoom: 22 },
    centros: { minzoom: 0, maxzoom: 22 },
    veredas: { minzoom: 15, maxzoom: 22 },
    fotos: { minzoom: 0, maxzoom: 22 },
    labels: {
        lotes: { minzoom: 16, maxzoom: 22 },
        manzanos: { minzoom: 14, maxzoom: 22 },
        vias: { minzoom: 13, maxzoom: 22 },
        cotas: { minzoom: 16, maxzoom: 22 },
        praderas: { minzoom: 15, maxzoom: 22 },
        equipamiento: { minzoom: 15, maxzoom: 22 },
        centros: { minzoom: 0, maxzoom: 22 }
    }
};

const COLOR_PALETTE = {
    lotes: {
        vendido: '#ff0000',
        disponible: '#3ac91d',
        reservado: '#ffd900',
        default: '#0000ff',
        opacity: 0.3,
        borderColor: '#000000',
        borderWidth: 0.7,
        hoverOpacity: 0.7
    },
    manzanos: {
        fillColor: '#0000ff',
        fillOpacity: 0.02,
        lineColor: '#0000ff',
        lineWidth: 1,
        lineOpacity: 0.3
    },
    vias: {
        lineColor: '#ff0202',
        lineWidth: 20,
        lineOpacity: 0.15
    },
    cotas: {
        lineColor: '#000000',
        lineWidth: 1,
        lineOpacity: 0.1
    },
    praderas: {
        fillColor: '#04593e',
        fillOpacity: 0.5,
        lineColor: '#000000',
        lineWidth: 1,
        lineOpacity: 1
    },
    equipamiento: {
        fillColor: '#0000ff',
        fillOpacity: 0.35,
        lineColor: '#000000',
        lineWidth: 1,
        lineOpacity: 1
    },
    rutas: {
        lineColor: '#ff0202',
        lineWidth: 20,
        lineOpacity: 0.15
    },
    veredas: {
        fillColor: '#d1d5db',
        fillOpacity: 0.1,
        lineColor: '#000000',
        lineWidth: 1.5,
        lineOpacity: 0.9
    },
    fotos: {
        iconSize: 0.8,
        iconColor: '#e11d48'
    },
    labels: {
        lotes: { textColor: '#000000', haloColor: '#ffffff', haloWidth: 2, textSize: 12 },
        manzanos: { textColor: '#ffffff', haloColor: '#000000', haloWidth: 2, textSize: 13 },
        vias: { textColor: '#000000', haloColor: '#ffffff', haloWidth: 2, textSize: 10 },
        cotas: { textColor: '#131513', haloColor: '#ffffff', haloWidth: 2, textSize: 10 },
        praderas: { textColor: '#006400', haloColor: '#ffffff', haloWidth: 2, textSize: 11 },
        equipamiento: { textColor: '#00008b', haloColor: '#ffffff', haloWidth: 2, textSize: 11 },
        centros: { textColor: '#e11d48', haloColor: '#ffffff', haloWidth: 2, textSize: 12 }
    }
};

const CENTRO_ICONS = {
    'centro': 'fas fa-map-marker-alt',
    'oficina': 'fas fa-building',
    'transporte': 'fas fa-bus',
    'default': 'fas fa-map-pin'
};

const ESTADOS_DISPONIBLES = ['VENDIDO', 'DISPONIBLE', 'RESERVADO'];

const ESTADO_COLORS = {
    'VENDIDO': COLOR_PALETTE.lotes.vendido,
    'DISPONIBLE': COLOR_PALETTE.lotes.disponible,
    'RESERVADO': COLOR_PALETTE.lotes.reservado,
    'default': COLOR_PALETTE.lotes.default
};

let map;
let draw;
let urbData = {};
let currentPopup = null;
let currentFeatureId = null;
let currentUrb = null;
let idFieldName = 'gid';
let currentBaseLayer = 'mapbox';
let hoveredStateId = null;
let currentLoteData = null;
let rutasData = null;
let centrosData = null;
let fotosData = null;
let pendingEstadoChange = null;
let isUserLoggedIn = false;
let currentUsername = null;
let currentUserType = null; // 'administrador' o 'secundario'

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

function checkStoredSession() {
    const storedUser = localStorage.getItem('geoportal_user');
    const storedUserType = localStorage.getItem('geoportal_user_type');
    if (storedUser && storedUserType) {
        currentUsername = storedUser;
        currentUserType = storedUserType;
        isUserLoggedIn = true;
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    const userBtn = document.getElementById('user-btn');
    userBtn.classList.add('user-logged');
    userBtn.title = `Usuario: ${currentUsername}`;
}

function updateUIForLoggedOutUser() {
    const userBtn = document.getElementById('user-btn');
    userBtn.classList.remove('user-logged');
    userBtn.title = 'Usuario';
}

function loginUser(username, password) {
    // Verificar usuarios administradores
    if (USUARIOS_AUTORIZADOS[username] && USUARIOS_AUTORIZADOS[username].password === password) {
        isUserLoggedIn = true;
        currentUsername = username;
        currentUserType = 'administrador';
        localStorage.setItem('geoportal_user', username);
        localStorage.setItem('geoportal_user_type', 'administrador');
        updateUIForLoggedInUser();
        return true;
    }
    // Verificar usuarios secundarios
    if (USUARIOS_SECUNDARIOS[username] && USUARIOS_SECUNDARIOS[username].password === password) {
        isUserLoggedIn = true;
        currentUsername = username;
        currentUserType = 'secundario';
        localStorage.setItem('geoportal_user', username);
        localStorage.setItem('geoportal_user_type', 'secundario');
        updateUIForLoggedInUser();
        return true;
    }
    return false;
}

function logoutUser() {
    isUserLoggedIn = false;
    currentUsername = null;
    currentUserType = null;
    localStorage.removeItem('geoportal_user');
    localStorage.removeItem('geoportal_user_type');
    updateUIForLoggedOutUser();
    if (currentPopup) {
        currentPopup.remove();
    }
}

function canAccessRestrictedFeatures() {
    return isUserLoggedIn;
}

map = new mapboxgl.Map({
    container: 'map',
    style: MAP_CONFIG.style,
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    pitch: MAP_CONFIG.pitch,
    bearing: MAP_CONFIG.bearing,
    preserveDrawingBuffer: true,
    antialias: true
});

map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.ScaleControl(), 'bottom-right');
map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
}), 'top-right');

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: 'bo',
    placeholder: 'Buscar lugares en Bolivia...',
    language: 'es'
});
document.getElementById('geocoder-container').appendChild(geocoder.onAdd(map));

draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: { line_string: true, trash: true }
});
map.addControl(draw, 'top-right');

document.getElementById('toggle-sidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const legend = document.getElementById('sidebar-legend');
    if (sidebar.classList.contains('visible')) {
        sidebar.classList.remove('visible');
    } else {
        if (legend.classList.contains('visible')) legend.classList.remove('visible');
        sidebar.classList.add('visible');
    }
});

document.getElementById('close-sidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('visible');
});

const infoModal = document.getElementById('info-modal');
document.getElementById('info-btn').addEventListener('click', () => {
    infoModal.classList.add('active');
});

document.getElementById('close-info-modal').addEventListener('click', () => {
    infoModal.classList.remove('active');
});

infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.remove('active');
});

const reporteModal = document.getElementById('reporte-modal');
document.getElementById('close-reporte-modal').addEventListener('click', () => {
    reporteModal.classList.remove('active');
});

reporteModal.addEventListener('click', (e) => {
    if (e.target === reporteModal) reporteModal.classList.remove('active');
});

document.getElementById('layer-rutas').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    if (map.getLayer('rutas-line')) {
        map.setLayoutProperty('rutas-line', 'visibility', visibility);
    }
});

document.getElementById('layer-centros').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    if (map.getLayer('centros-symbol')) {
        map.setLayoutProperty('centros-symbol', 'visibility', visibility);
    }
    if (map.getLayer('centros-label')) {
        map.setLayoutProperty('centros-label', 'visibility', visibility);
    }
});

document.getElementById('layer-fotos').addEventListener('change', (e) => {
    const visibility = e.target.checked ? 'visible' : 'none';
    Object.keys(urbData).forEach(urb => {
        const layerId = `fotos-${urb}-symbol`;
        if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
        }
    });
});

const userModal = document.getElementById('user-modal');
const loginFormContainer = document.getElementById('login-form-container');
const userInfoContainer = document.getElementById('user-info-container');
const modalTitle = document.getElementById('modal-title');

document.getElementById('user-btn').addEventListener('click', () => {
    if (isUserLoggedIn) {
        modalTitle.textContent = 'Mi Cuenta';
        loginFormContainer.style.display = 'none';
        // Actualizar mensaje según tipo de usuario
        const accessLevelText = document.getElementById('access-level-text');
        if (accessLevelText) {
            if (currentUserType === 'administrador') {
                accessLevelText.textContent = 'Tienes acceso completo a todas las funcionalidades del sistema.';
            } else {
                accessLevelText.textContent = 'Puedes cambiar lotes DISPONIBLES a RESERVADOS únicamente.';
            }
        }
        userInfoContainer.style.display = 'block';
        document.getElementById('logged-username').textContent = currentUsername;
    } else {
        modalTitle.textContent = 'Iniciar Sesión';
        loginFormContainer.style.display = 'block';
        userInfoContainer.style.display = 'none';
        document.getElementById('login-error').classList.remove('show');
    }
    userModal.classList.add('active');
});

document.getElementById('close-user-modal').addEventListener('click', () => {
    userModal.classList.remove('active');
    document.getElementById('login-form').reset();
    document.getElementById('login-error').classList.remove('show');
});

userModal.addEventListener('click', (e) => {
    if (e.target === userModal) {
        userModal.classList.remove('active');
        document.getElementById('login-form').reset();
        document.getElementById('login-error').classList.remove('show');
    }
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    if (loginUser(username, password)) {
        userModal.classList.remove('active');
        document.getElementById('login-form').reset();
        errorDiv.classList.remove('show');
        alert(`✅ ¡Bienvenido ${currentUsername}!\n\nAhora tienes acceso completo a todas las funcionalidades.`);
    } else {
        errorDiv.textContent = '❌ Usuario o contraseña incorrectos';
        errorDiv.classList.add('show');
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        logoutUser();
        userModal.classList.remove('active');
        alert('✅ Sesión cerrada exitosamente');
    }
});

const ventaModal = document.getElementById('venta-modal');
document.getElementById('close-venta-modal').addEventListener('click', () => {
    ventaModal.classList.remove('active');
    pendingEstadoChange = null;
});

ventaModal.addEventListener('click', (e) => {
    if (e.target === ventaModal) {
        ventaModal.classList.remove('active');
        pendingEstadoChange = null;
    }
});
// Botón para omitir el registro de datos de venta
document.getElementById('omitir-registro-btn').addEventListener('click', async function() {
    if (!pendingEstadoChange) {
        alert('Error: No hay cambio de estado pendiente');
        return;
    }
    
    ventaModal.classList.remove('active');
    document.getElementById('venta-form').reset();
    
    // Guardar estado sin datos de venta (campos vacíos)
    await guardarEstadoSinDatos(
        pendingEstadoChange.featureId, 
        pendingEstadoChange.nuevoEstado, 
        pendingEstadoChange.urb
    );
    
    pendingEstadoChange = null;
});
const excelModal = document.getElementById('excel-modal');
document.getElementById('export-excel-btn').addEventListener('click', () => {
    if (!canAccessRestrictedFeatures()) {
        alert('⚠️ Debes iniciar sesión para exportar a Excel.\n\nHaz clic en el botón de usuario para iniciar sesión.');
        return;
    }
    mostrarModalExcel();
});

document.getElementById('close-excel-modal').addEventListener('click', () => {
    excelModal.classList.remove('active');
});

excelModal.addEventListener('click', (e) => {
    if (e.target === excelModal) excelModal.classList.remove('active');
});

function getColorByEstado(estado) {
    return ESTADO_COLORS[estado] || ESTADO_COLORS.default;
}

function procesarUrlImagen(url) {
    if (!url) {
        console.error('❌ URL vacía o nula');
        return null;
    }
    
    url = url.trim();
    console.log('🔍 Procesando URL:', url);
    
    if (url.includes('imgur.com')) {
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            console.log('✅ URL de Imgur válida:', url);
            return url;
        }
        
        if (url.match(/imgur\.com\/[a-zA-Z0-9]+$/)) {
            const urlWithExtension = url + '.jpg';
            console.log('✅ URL de Imgur corregida:', urlWithExtension);
            return urlWithExtension;
        }
        
        if (url.match(/i\.imgur\.com\/[a-zA-Z0-9]+$/)) {
            const urlWithExtension = url + '.jpg';
            console.log('✅ URL de Imgur corregida:', urlWithExtension);
            return urlWithExtension;
        }
    }
    
    console.log('✅ URL procesada:', url);
    return url;
}

function generarPopupFotos(properties) {
    const urlOriginal = properties.foto || properties.FOTO || properties.url || properties.URL;
    const fotoUrl = procesarUrlImagen(urlOriginal);
    const nombre = properties.nombre || properties.NOMBRE || 'Sin título';
    const descripcion = properties.descripcion || properties.DESCRIPCION || '';
    const uniqueId = Math.random().toString(36).substr(2, 9);
    
    console.log('📸 Generando popup para:', { nombre, urlOriginal, fotoUrl });
    
    let html = '<div class="photo-popup">';
    
    if (fotoUrl) {
        html += `
            <div style="width: 100%; min-height: 200px; background: #f1f5f9; border-radius: 8px; margin-bottom: 10px; position: relative; overflow: hidden;">
                <div id="photo-loading-${uniqueId}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 1;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #001562;"></i>
                    <p style="margin-top: 10px; font-size: 12px; color: #64748b;">Cargando imagen...</p>
                </div>
                <img 
                    id="photo-img-${uniqueId}"
                    src="${fotoUrl}" 
                    alt="${nombre}"
                    style="width: 100%; height: auto; display: none; border-radius: 8px; cursor: pointer; transition: transform 0.2s ease; position: relative; z-index: 2;"
                    onload="this.style.display='block'; document.getElementById('photo-loading-${uniqueId}').style.display='none'; document.getElementById('fullscreen-btn-${uniqueId}').style.display='block';"
                    onerror="document.getElementById('photo-loading-${uniqueId}').innerHTML='<div style=\\'background:#fee2e2; padding:15px; border-radius:8px; color:#dc2626; font-size:12px; text-align:center;\\'><i class=\\'fas fa-exclamation-triangle\\'></i><br><strong>Error al cargar</strong><br><small>Verifica la URL</small><br><a href=\\\'${fotoUrl}\\\' target=\\'_blank\\' style=\\'color:#0ea5e9; text-decoration:underline; margin-top:5px; display:inline-block;\\'>Abrir imagen</a></div>';"
                    onclick="window.abrirImagenPantallaCompleta('${fotoUrl}', '${nombre.replace(/'/g, "\\'")}')"
                />
                <button id="fullscreen-btn-${uniqueId}" onclick="window.abrirImagenPantallaCompleta('${fotoUrl}', '${nombre.replace(/'/g, "\\'")}'); event.stopPropagation();" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; display: none; z-index: 3; transition: all 0.2s ease;">
                    <i class="fas fa-expand"></i> Ampliar
                </button>
            </div>
        `;
    } else {
        html += `
            <div style="padding: 20px; background: #fef3c7; border-radius: 8px; text-align: center; margin-bottom: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #f59e0b;"></i>
                <p style="margin-top: 10px; font-size: 13px; color: #92400e;"><strong>No hay foto disponible</strong></p>
                <small style="color: #92400e;">El campo FOTO está vacío</small>
            </div>
        `;
    }
    
    html += `
        <div style="margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #001562; font-size: 11px; text-transform: uppercase; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-image"></i> Nombre:
            </strong>
            <div style="color: #334155; font-size: 13px; font-weight: 500; margin-top: 3px;">${nombre}</div>
        </div>
    `;
    
    if (descripcion) {
        html += `
            <div style="margin-bottom: 8px; padding: 8px 0;">
                <strong style="color: #001562; font-size: 11px; text-transform: uppercase; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-align-left"></i> Descripción:
                </strong>
                <div style="color: #334155; font-size: 13px; font-weight: 500; margin-top: 3px;">${descripcion}</div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

window.abrirImagenPantallaCompleta = function(url, nombre) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 10000; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px; cursor: zoom-out; animation: fadeIn 0.3s ease;`;
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = nombre;
    img.style.cssText = `max-width: 90%; max-height: 85vh; object-fit: contain; border-radius: 8px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); cursor: default; animation: zoomIn 0.3s ease;`;
    
    const title = document.createElement('div');
    title.textContent = nombre;
    title.style.cssText = `color: white; font-size: 16px; font-weight: 600; margin-top: 15px; text-align: center; text-shadow: 0 2px 4px rgba(0,0,0,0.5);`;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i> Cerrar';
    closeBtn.style.cssText = `position: absolute; top: 20px; right: 20px; background: rgba(255, 255, 255, 0.2); color: white; border: 2px solid white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s ease; backdrop-filter: blur(10px);`;
    
    closeBtn.onmouseover = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
        closeBtn.style.transform = 'scale(1.05)';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        closeBtn.style.transform = 'scale(1)';
    };
    
    const closeOverlay = () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
    };
    
    closeBtn.onclick = closeOverlay;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeOverlay();
    };
    img.onclick = (e) => e.stopPropagation();
    
    const style = document.createElement('style');
    style.textContent = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } } @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
    document.head.appendChild(style);
    
    overlay.appendChild(closeBtn);
    overlay.appendChild(img);
    overlay.appendChild(title);
    document.body.appendChild(overlay);
};

async function loadLayer(tableName) {
    try {
        console.log(`🔥 Cargando tabla: ${tableName}`);
        let allData = [];
        let offset = 0;
        const limit = 1000;
        let hasMore = true;
        
        while (hasMore) {
            const response = await fetch(
                `${SUPABASE_CONFIG.url}/rest/v1/${tableName}?select=*&limit=${limit}&offset=${offset}`, 
                {
                    headers: {
                        'apikey': SUPABASE_CONFIG.key,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'count=exact'
                    }
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            allData = allData.concat(data);
            console.log(`   📦 Lote ${offset}-${offset + data.length} cargado (${allData.length} registros acumulados)`);
            
            if (data.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }
        
        console.log(`✅ ${tableName} cargado completamente: ${allData.length} registros`);
        
        if (allData.length > 0) {
            const firstRow = allData[0];
            if ('gid' in firstRow) idFieldName = 'gid';
            else if ('objectid' in firstRow) idFieldName = 'objectid';
            else if ('fid' in firstRow) idFieldName = 'fid';
            else if ('id' in firstRow) idFieldName = 'id';
            console.log(`🔑 Campo ID detectado para ${tableName}: ${idFieldName}`);
        }

        const features = allData
            .filter(row => row.geom)
            .map(row => {
                const { geom, ...properties } = row;
                return {
                    type: 'Feature',
                    geometry: geom,
                    properties: properties,
                    id: row[idFieldName]
                };
            });

        return { type: 'FeatureCollection', features: features };
    } catch (error) {
        console.error(`❌ Error cargando ${tableName}:`, error);
        return { type: 'FeatureCollection', features: [] };
    }
}

function groupByUrb(geojson, tableName) {
    if (!geojson || !geojson.features) return;
    
    geojson.features.forEach(feature => {
        const urb = feature.properties.urb || feature.properties.URB || 'SIN_URB';
        if (!urbData[urb]) {
            urbData[urb] = { lotes: [], manzanos: [], vias: [], cotas: [], praderas: [], equipamiento: [], veredas: [], fotos: [] };
        }
        urbData[urb][tableName].push(feature);
    });
}

function generarPopupContent(properties, editMode = false) {
    const color = getColorByEstado(properties.estado);
    const featureId = properties[idFieldName];
    const loteValue = properties.lote || 'N/A';
    const manzanoValue = properties.manzano || 'N/A';
    const supm2Value = properties['supm2'] || properties.supm2 || 'N/A';
    const precioLot = properties.precio_lot || 'N/A';
    const isLoggedIn = canAccessRestrictedFeatures();
    
    let html = '<div>';
    
    if (!editMode) {
        html += `<div class="popup-field"><strong>LOTE:</strong><div class="value">${loteValue}</div></div>`;
        html += `<div class="popup-field"><strong>MANZANO:</strong><div class="value">${manzanoValue}</div></div>`;
        html += `<div class="popup-field"><strong>SUPERFICIE:</strong><div class="value">${supm2Value}</div></div>`;
        html += `<div class="popup-field"><strong>PRECIO:</strong><div class="value">${precioLot} $us</div></div>`;
        html += `<div class="popup-field"><strong>ESTADO:</strong><div class="value"><span class="estado-badge" style="background:${color}">${properties.estado || 'N/A'}</span></div></div>`;
        
        if (isLoggedIn) {
            html += `<button class="popup-btn" onclick="window.editarEstado(${featureId})"><i class="fas fa-edit"></i> Editar Estado</button>`;
            html += `<button class="popup-btn popup-btn-secondary" onclick="window.abrirFormularioReporte(${featureId})"><i class="fas fa-file-pdf"></i> Cotizar Lote</button>`;
        } else {
            html += `<div style="margin-top: 10px; padding: 10px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 11px; color: #92400e;">
                        <i class="fas fa-lock"></i> <strong>Funciones restringidas</strong><br>
                        Contactate con el administrador.
                     </div>`;
        }
    } else {
        html += `<div class="popup-field"><strong>LOTE:</strong><div class="value">${loteValue}</div></div>`;
        html += `<div class="popup-field"><strong>MANZANO:</strong><div class="value">${manzanoValue}</div></div>`;
        html += `<div class="popup-field"><strong>SUPERFICIE:</strong><div class="value">${supm2Value}</div></div>`;
        html += `<div class="popup-field"><strong>PRECIO:</strong><div class="value">${precioLot} $us</div></div>`;
        html += `<div class="popup-field full-width"><strong>CAMBIAR ESTADO:</strong><select id="estado-select-${featureId}">`;
        
        // Si es usuario secundario, solo mostrar DISPONIBLE y RESERVADO
        if (currentUserType === 'secundario') {
            const estadosPermitidos = ['DISPONIBLE', 'RESERVADO'];
            estadosPermitidos.forEach(estado => {
                html += `<option value="${estado}" ${properties.estado === estado ? 'selected' : ''}>${estado}</option>`;
            });
        } else {
            // Usuario administrador: mostrar todas las opciones
            ESTADOS_DISPONIBLES.forEach(estado => {
                html += `<option value="${estado}" ${properties.estado === estado ? 'selected' : ''}>${estado}</option>`;
            });
        }
        
        html += `</select></div>`;
        html += `<button class="popup-btn" onclick="window.guardarEstado(${featureId})"><i class="fas fa-save"></i> Guardar</button>`;
        html += `<button class="popup-btn" onclick="window.cancelarEdicion(${featureId})" style="background:#6c757d;margin-top:5px;"><i class="fas fa-times"></i> Cancelar</button>`;
    }
    
    html += '</div>';
    return html;
}

function zoomToFeatures(features) {
    if (!features || features.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    features.forEach(feature => {
        const geomType = feature.geometry.type;
        if (geomType === 'Point') {
            bounds.extend(feature.geometry.coordinates);
        } else if (geomType === 'LineString') {
            feature.geometry.coordinates.forEach(coord => bounds.extend(coord));
        } else if (geomType === 'Polygon') {
            feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
        } else if (geomType === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
                polygon[0].forEach(coord => bounds.extend(coord));
            });
        }
    });
    map.fitBounds(bounds, { padding: 50, duration: 1000 });
}

function updateMeasureVisibility() {
    const measureContainer = document.getElementById('measure-container');
    if (currentBaseLayer !== 'mapbox') {
        measureContainer.style.display = 'none';
    }
}

function getCentroid(geometry) {
    if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0];
        let x = 0, y = 0;
        coords.forEach(coord => { x += coord[0]; y += coord[1]; });
        return [x / coords.length, y / coords.length];
    } else if (geometry.type === 'MultiPolygon') {
        const coords = geometry.coordinates[0][0];
        let x = 0, y = 0;
        coords.forEach(coord => { x += coord[0]; y += coord[1]; });
        return [x / coords.length, y / coords.length];
    }
    return null;
}

window.abrirFormularioReporte = function(featureId) {
    if (!canAccessRestrictedFeatures()) {
        alert('⚠️ Debes iniciar sesión para generar cotizaciones.\n\nHaz clic en el botón de usuario para iniciar sesión.');
        return;
    }
    
    if (!currentUrb) {
        alert('Error: No se pudo identificar la urbanización');
        return;
    }
    
    const lote = urbData[currentUrb].lotes.find(l => l.properties[idFieldName] === featureId);
    if (!lote) {
        alert('Error: No se encontró el lote');
        return;
    }
    
    currentLoteData = {
        id: featureId,
        properties: lote.properties,
        geometry: lote.geometry,
        urb: currentUrb
    };
    
    document.getElementById('form-lote').value = lote.properties.lote || 'N/A';
    document.getElementById('form-manzano').value = lote.properties.manzano || 'N/A';
    document.getElementById('form-Supm2').value = lote.properties['supm2'] || lote.properties.Supm2 || 'N/A';
    document.getElementById('form-precio-contado').value = '';
    document.getElementById('form-precio').value = '';
    document.getElementById('form-cuota-inicial').value = '';
    document.getElementById('form-plazo-anos').value = '';
    document.getElementById('form-cuota-mensual').value = '';
    document.getElementById('form-observaciones').value = '';
    document.querySelectorAll('#reporte-form input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('reporte-modal').classList.add('active');
};

document.getElementById('reporte-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentLoteData) {
        alert('Error: No hay datos del lote');
        return;
    }
    
    const formData = {
        lote: document.getElementById('form-lote').value,
        manzano: document.getElementById('form-manzano').value,
        Supm2: document.getElementById('form-Supm2').value,
        precioContado: parseFloat(document.getElementById('form-precio-contado').value) || 0,
        precio: parseFloat(document.getElementById('form-precio').value) || 0,
        cuotaInicial: parseFloat(document.getElementById('form-cuota-inicial').value) || 0,
        plazoAnos: parseInt(document.getElementById('form-plazo-anos').value) || 0,
        cuotaMensual: parseFloat(document.getElementById('form-cuota-mensual').value) || 0,
        observaciones: document.getElementById('form-observaciones').value,
        servicios: []
    };
    
    document.querySelectorAll('#reporte-form input[type="checkbox"]:checked').forEach(cb => {
        formData.servicios.push(cb.value);
    });
    
    await generarPDF(formData);
    document.getElementById('reporte-modal').classList.remove('active');
});

async function generarPDF(formData) {
    try {
        alert('⏳ Generando PDF... Por favor espere.');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;
        let yPos = margin;
        
        pdf.setFillColor(0, 31, 98);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(22);
        pdf.setFont(undefined, 'bold');
        pdf.text('LIEBE SERVICIOS MOBILIARIOS', margin, 13);
        
        const nombreUrbanizacion = URB_NOMBRES[currentLoteData.urb] || `URB: ${currentLoteData.urb}`;
        pdf.setFontSize(15);
        pdf.setFont(undefined, 'normal');
        pdf.text(`URBANIZACIÓN: ${nombreUrbanizacion}`, margin, 21);
        
        const fecha = new Date().toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pdf.setFontSize(9);
        pdf.text(fecha, pageWidth - margin, 13, { align: 'right' });
        yPos = 38;
        
        const centroid = getCentroid(currentLoteData.geometry);
        
        if (centroid) {
            try {
                const originalCenter = map.getCenter();
                const originalZoom = map.getZoom();
                const originalPitch = map.getPitch();
                if (currentPopup) currentPopup.remove();
                document.querySelectorAll('.mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left').forEach(el => {
                    el.style.display = 'none';
                });
                
                map.setLayoutProperty('google-satellite-layer', 'visibility', 'visible');
                map.setLayoutProperty('terrain-3d-layer', 'visibility', 'none');
                map.setPitch(0);
                map.setTerrain(null);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const tempSourceId = 'temp-lote-pdf';
                if (map.getSource(tempSourceId)) {
                    map.removeLayer(`${tempSourceId}-fill`);
                    map.removeLayer(`${tempSourceId}-line`);
                    map.removeSource(tempSourceId);
                }
                
                map.addSource(tempSourceId, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            geometry: currentLoteData.geometry,
                            properties: currentLoteData.properties
                        }]
                    }
                });
                
                map.addLayer({
                    id: `${tempSourceId}-fill`,
                    type: 'fill',
                    source: tempSourceId,
                    paint: {
                        'fill-color': getColorByEstado(currentLoteData.properties.estado),
                        'fill-opacity': 0.7
                    }
                });
                
                map.addLayer({
                    id: `${tempSourceId}-line`,
                    type: 'line',
                    source: tempSourceId,
                    paint: {
                        'line-color': '#ff0000',
                        'line-width': 5
                    }
                });
                
                map.jumpTo({ center: centroid, zoom: 19 });
                map.triggerRepaint();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await new Promise(resolve => {
                    if (map.loaded() && map.areTilesLoaded()) {
                        resolve();
                    } else {
                        const checkLoaded = () => {
                            if (map.loaded() && map.areTilesLoaded()) {
                                map.off('render', checkLoaded);
                                resolve();
                            }
                        };
                        map.on('render', checkLoaded);
                        setTimeout(resolve, 3000);
                    }
                });
                
                const mapCanvas = map.getCanvas();
                const mapImage = mapCanvas.toDataURL('image/png', 1.0);
                
                if (mapImage && mapImage.length > 100) {
                    const imgWidth = pageWidth - (margin * 2);
                    const imgHeight = 70;
                    pdf.addImage(mapImage, 'PNG', margin, yPos, imgWidth, imgHeight);
                    yPos += imgHeight + 5;
                }
                
                if (map.getLayer(`${tempSourceId}-fill`)) map.removeLayer(`${tempSourceId}-fill`);
                if (map.getLayer(`${tempSourceId}-line`)) map.removeLayer(`${tempSourceId}-line`);
                if (map.getSource(tempSourceId)) map.removeSource(tempSourceId);
                
                if (currentBaseLayer === 'mapbox') {
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'none');
                    map.setTerrain(null);
                } else if (currentBaseLayer === 'terrain-3d') {
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'none');
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'visible');
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                } else if (currentBaseLayer === 'satellite-3d') {
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'visible');
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'none');
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                } else if (currentBaseLayer === 'google-satellite') {
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'visible');
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'none');
                    map.setTerrain(null);
                }
                
                map.jumpTo({ center: originalCenter, zoom: originalZoom });
                map.setPitch(originalPitch);
                document.querySelectorAll('.mapboxgl-ctrl-top-right, .mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left').forEach(el => {
                    el.style.display = '';
                });
            } catch (error) {
                console.error('Error capturando miniatura:', error);
            }
        }
        
        pdf.setTextColor(0, 31, 98);
        pdf.setFontSize(13);
        pdf.setFont(undefined, 'bold');
        pdf.text('INFORMACIÓN DEL LOTE', margin, yPos);
        yPos += 2;
        pdf.setDrawColor(0, 31, 98);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Lote N°:', margin, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(formData.lote, margin + 20, yPos);
        pdf.setFont(undefined, 'bold');
        pdf.text('Manzano:', pageWidth/2, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(formData.manzano, pageWidth/2 + 22, yPos);
        yPos += 5;
        
        pdf.setFont(undefined, 'bold');
        pdf.text('Superficie:', margin, yPos);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${formData.Supm2} m²`, margin + 25, yPos);
        
        const estado = currentLoteData.properties.estado || 'N/A';
        pdf.setFont(undefined, 'bold');
        pdf.text('Estado:', pageWidth/2, yPos);
        const colorEstado = getColorByEstado(estado);
        pdf.setTextColor(colorEstado);
        pdf.setFont(undefined, 'bold');
        pdf.text(estado, pageWidth/2 + 17, yPos);
        pdf.setTextColor(0, 0, 0);
        yPos += 8;
        
        if (formData.precioContado > 0) {
            pdf.setTextColor(0, 31, 98);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('PRECIO AL CONTADO', margin, yPos);
            yPos += 2;
            pdf.setDrawColor(0, 31, 98);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text('Precio Total:', margin, yPos);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Dólares $. ${formData.precioContado.toLocaleString('es-BO')}`, margin + 27, yPos);
            yPos += 8;
        }
        
        if (formData.precio > 0) {
            pdf.setTextColor(0, 31, 98);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('PRECIO A CRÉDITO', margin, yPos);
            yPos += 2;
            pdf.setDrawColor(0, 31, 98);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(10);
            pdf.setFont(undefined, 'bold');
            pdf.text('Precio Total :', margin, yPos);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Dólares $. ${formData.precio.toLocaleString('es-BO')}`, margin + 27, yPos);
            pdf.setFont(undefined, 'bold');
            pdf.text('Cuota Inicial:', pageWidth/2, yPos);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Bs. ${formData.cuotaInicial.toLocaleString('es-BO')}`, pageWidth/2 + 28, yPos);
            yPos += 5;
            
            if (formData.plazoAnos > 0) {
                pdf.setFont(undefined, 'bold');
                pdf.text('Plazo:', margin, yPos);
                pdf.setFont(undefined, 'normal');
                pdf.text(`${formData.plazoAnos} años`, margin + 15, yPos);
            }
            pdf.setFont(undefined, 'bold');
            pdf.text('Cuota Mensual:', pageWidth/2, yPos);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Bs. ${formData.cuotaMensual.toLocaleString('es-BO')}`, pageWidth/2 + 33, yPos);
            yPos += 8;
        }
        
        if (formData.servicios.length > 0) {
            pdf.setTextColor(0, 31, 98);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('SERVICIOS DISPONIBLES', margin, yPos);
            yPos += 2;
            pdf.setDrawColor(0, 31, 98);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            const colWidth = (pageWidth - margin * 2) / 2;
            formData.servicios.forEach((servicio, index) => {
                const col = index % 2;
                const xPos = margin + (col * colWidth);
                pdf.text(`✓ ${servicio}`, xPos, yPos);
                if (col === 1 || index === formData.servicios.length - 1) {
                    yPos += 5;
                }
            });
            yPos += 3;
        }
        
        if (formData.observaciones) {
            pdf.setTextColor(0, 31, 98);
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('OBSERVACIONES', margin, yPos);
            yPos += 2;
            pdf.setDrawColor(0, 31, 98);
            pdf.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 6;
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            const lines = pdf.splitTextToSize(formData.observaciones, pageWidth - (margin * 2));
            pdf.text(lines, margin, yPos);
            yPos += lines.length * 5 + 3;
        }
        
        if (centroid) {
            pdf.setTextColor(0, 31, 98);
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'bold');
            pdf.text('VER UBICACIÓN EN GOOGLE MAPS:', margin, yPos);
            yPos += 5;
            const mapsLink = `https://www.google.com/maps?q=${centroid[1]},${centroid[0]}`;
            pdf.setTextColor(14, 165, 233);
            pdf.setFontSize(12);
            pdf.textWithLink(mapsLink, margin, yPos, { url: mapsLink });
        }
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(7);
        pdf.setFont(undefined, 'italic');
        pdf.text('Desarrollado por INGEOMATIC.TECH ©2026 - Todos los derechos reservados - CEL: 75211489', pageWidth/2, 287, { align: 'center' });
        
        const nombreArchivo = `Lote_${formData.lote}_Mz_${formData.manzano}_${new Date().getTime()}.pdf`;
        pdf.save(nombreArchivo);
        alert('✅ PDF generado exitosamente!');
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('❌ Error al generar el PDF: ' + error.message);
    }
}

document.getElementById('venta-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!pendingEstadoChange) {
        alert('Error: No hay cambio de estado pendiente');
        return;
    }
    
    const datosVenta = {
        nom_cliente: document.getElementById('venta-cliente').value.trim(),
        cel_cliente: document.getElementById('venta-celular').value.trim(),
        precio_vent: parseFloat(document.getElementById('venta-precio').value),
        tipo_venta: document.getElementById('venta-tipo').value,
        vendedor: document.getElementById('venta-vendedor').value.trim()
    };
    
    if (!datosVenta.nom_cliente || !datosVenta.cel_cliente || !datosVenta.precio_vent || !datosVenta.tipo_venta || !datosVenta.vendedor) {
        alert('⚠️ Por favor complete todos los campos obligatorios');
        return;
    }
    
    if (isNaN(datosVenta.precio_vent) || datosVenta.precio_vent <= 0) {
        alert('⚠️ El precio de venta debe ser un número mayor a 0');
        return;
    }
    
    ventaModal.classList.remove('active');
    await guardarEstadoConDatos(pendingEstadoChange.featureId, pendingEstadoChange.nuevoEstado, datosVenta, pendingEstadoChange.urb);
    document.getElementById('venta-form').reset();
    pendingEstadoChange = null;
});

async function guardarEstadoConDatos(featureId, nuevoEstado, datosVenta, urb) {
    const lotesSourceId = `lotes-${urb}`;
    
    try {
        const updateData = {
            estado: nuevoEstado,
            nom_cliente: datosVenta.nom_cliente,
            cel_cliente: datosVenta.cel_cliente,
            precio_vent: datosVenta.precio_vent,
            tipo_venta: datosVenta.tipo_venta,
            vendedor: datosVenta.vendedor
        };
        
        console.log('📤 Enviando a Supabase:', updateData);
        console.log('🎯 Feature ID:', featureId, 'URB:', urb, 'Campo ID:', idFieldName);
        
        const response = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/lotes?${idFieldName}=eq.${featureId}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_CONFIG.key,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📥 Respuesta de Supabase:', data);
        
        if (!data || data.length === 0) {
            alert('⚠️ No se encontró el registro a actualizar.');
            return;
        }
        
        const loteIndex = urbData[urb].lotes.findIndex(l => l.properties[idFieldName] === featureId);
        if (loteIndex !== -1) {
            urbData[urb].lotes[loteIndex].properties.estado = nuevoEstado;
            urbData[urb].lotes[loteIndex].properties.nom_cliente = datosVenta.nom_cliente;
            urbData[urb].lotes[loteIndex].properties.cel_cliente = datosVenta.cel_cliente;
            urbData[urb].lotes[loteIndex].properties.precio_vent = datosVenta.precio_vent;
            urbData[urb].lotes[loteIndex].properties.tipo_venta = datosVenta.tipo_venta;
            urbData[urb].lotes[loteIndex].properties.vendedor = datosVenta.vendedor;
            console.log('✅ Datos locales actualizados en urbData');
        }
        
        const source = map.getSource(lotesSourceId);
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: urbData[urb].lotes
            });
            console.log('✅ Mapa actualizado visualmente');
        }
        
        alert('✅ Estado y datos de venta actualizados exitosamente\n\n💡 Tip: Los datos ya están guardados y listos para exportar a Excel.');
        
        if (currentPopup) {
            setTimeout(() => currentPopup.remove(), 1000);
        }
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('Error al actualizar: ' + error.message);
    }
}
// Función para guardar estado sin datos de venta (omitir registro)
async function guardarEstadoSinDatos(featureId, nuevoEstado, urb) {
    const lotesSourceId = `lotes-${urb}`;
    
    try {
        const updateData = {
            estado: nuevoEstado,
            nom_cliente: null,
            cel_cliente: null,
            precio_vent: null,
            tipo_venta: null,
            vendedor: null
        };
        
        console.log('📤 Enviando a Supabase (sin datos de venta):', updateData);
        console.log('🎯 Feature ID:', featureId, 'URB:', urb, 'Campo ID:', idFieldName);
        
        const response = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/lotes?${idFieldName}=eq.${featureId}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_CONFIG.key,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(updateData)
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📥 Respuesta de Supabase:', data);
        
        if (!data || data.length === 0) {
            alert('⚠️ No se encontró el registro a actualizar.');
            return;
        }
        
        // Actualizar datos locales
        const loteIndex = urbData[urb].lotes.findIndex(l => l.properties[idFieldName] === featureId);
        if (loteIndex !== -1) {
            urbData[urb].lotes[loteIndex].properties.estado = nuevoEstado;
            urbData[urb].lotes[loteIndex].properties.nom_cliente = null;
            urbData[urb].lotes[loteIndex].properties.cel_cliente = null;
            urbData[urb].lotes[loteIndex].properties.precio_vent = null;
            urbData[urb].lotes[loteIndex].properties.tipo_venta = null;
            urbData[urb].lotes[loteIndex].properties.vendedor = null;
            console.log('✅ Datos locales actualizados en urbData (sin datos de venta)');
        }
        
        // Actualizar visualización del mapa
        const source = map.getSource(lotesSourceId);
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: urbData[urb].lotes
            });
            console.log('✅ Mapa actualizado visualmente');
        }
        
        alert('✅ Estado actualizado exitosamente (sin datos de venta registrados)');
        
        if (currentPopup) {
            setTimeout(() => currentPopup.remove(), 1000);
        }
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('Error al actualizar: ' + error.message);
    }
}
function mostrarModalExcel() {
    const urbList = document.getElementById('urb-list-excel');
    urbList.innerHTML = '';
    
    Object.keys(urbData).forEach(urb => {
        const div = document.createElement('div');
        div.className = 'urb-excel-item';
        div.innerHTML = `<i class="fas fa-file-excel"></i><span>${URB_NOMBRES[urb] || `URB: ${urb}`}</span>`;
        div.addEventListener('click', () => exportarExcel(urb));
        urbList.appendChild(div);
    });
    
    excelModal.classList.add('active');
}

async function exportarExcel(urb) {
    try {
        excelModal.classList.remove('active');
        alert('⏳ Generando Excel... Por favor espere.');
        
        let allData = [];
        let offset = 0;
        const limit = 1000;
        let hasMore = true;
        
        console.log(`📊 Exportando datos para URB: ${urb}`);
        
        while (hasMore) {
            const response = await fetch(
                `${SUPABASE_CONFIG.url}/rest/v1/lotes?urb=eq.${urb}&select=lote,manzano,estado,supm2,precio_lot,vendedor,tipo_venta,cel_cliente,precio_vent,nom_cliente&limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'apikey': SUPABASE_CONFIG.key,
                        'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    }
                }
            );
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            allData = allData.concat(data);
            
            console.log(`   📦 Lote ${offset}-${offset + data.length} cargado para Excel`);
            
            if (data.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }
        
        console.log(`✅ Total de registros obtenidos: ${allData.length}`);
        console.log('📋 Primeros 3 registros:', allData.slice(0, 3));
        
        if (!allData || allData.length === 0) {
            alert('⚠️ No hay datos disponibles para esta urbanización');
            return;
        }
        
        const excelData = allData.map(row => ({
            'LOTE': row.lote !== null && row.lote !== undefined ? row.lote : '',
            'MANZANO': row.manzano !== null && row.manzano !== undefined ? row.manzano : '',
            'ESTADO': row.estado !== null && row.estado !== undefined ? row.estado : '',
            'SUPERFICIE (m²)': row.supm2 !== null && row.supm2 !== undefined ? row.supm2 : '',
            'PRECIO ($us)': row.precio_lot !== null && row.precio_lot !== undefined ? row.precio_lot : '',
            'VENDEDOR': row.vendedor !== null && row.vendedor !== undefined ? row.vendedor : '',
            'TIPO DE VENTA': row.tipo_venta !== null && row.tipo_venta !== undefined ? row.tipo_venta : '',
            'CELULAR CLIENTE': row.cel_cliente !== null && row.cel_cliente !== undefined ? row.cel_cliente : '',
            'PRECIO DE VENTA (Bs)': row.precio_vent !== null && row.precio_vent !== undefined ? row.precio_vent : '',
            'NOMBRE CLIENTE': row.nom_cliente !== null && row.nom_cliente !== undefined ? row.nom_cliente : ''
        }));
        
        console.log('📊 Datos formateados para Excel:', excelData.slice(0, 3));
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        
        const colWidths = [
            { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 15 },
            { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 30 }
        ];
        ws['!cols'] = colWidths;
        
        const nombreUrb = URB_NOMBRES[urb] || `URB_${urb}`;
        XLSX.utils.book_append_sheet(wb, ws, nombreUrb.substring(0, 31));
        
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `Reporte_${nombreUrb.replace(/\s+/g, '_')}_${fecha}.xlsx`;
        XLSX.writeFile(wb, nombreArchivo);
        
        alert(`✅ Excel generado exitosamente!\n\nArchivo: ${nombreArchivo}\nRegistros: ${allData.length}`);
    } catch (error) {
        console.error('❌ Error al exportar Excel:', error);
        alert('Error al generar Excel: ' + error.message);
    }
}

window.editarEstado = function(featureId) {
    if (!canAccessRestrictedFeatures()) {
        alert('⚠️ Debes iniciar sesión para editar estados.\n\nHaz clic en el botón de usuario para iniciar sesión.');
        return;
    }
    
    if (!currentUrb) {
        alert('Error: No se pudo identificar la urbanización');
        return;
    }
    const lote = urbData[currentUrb].lotes.find(l => l.properties[idFieldName] === featureId);
    if (!lote) {
        alert('Error: No se encontró el lote');
        return;
    }
    const content = generarPopupContent(lote.properties, true);
    if (currentPopup) currentPopup.setHTML(content);
};

window.cancelarEdicion = function(featureId) {
    if (!currentUrb) return;
    const lote = urbData[currentUrb].lotes.find(l => l.properties[idFieldName] === featureId);
    if (!lote) return;
    const content = generarPopupContent(lote.properties, false);
    if (currentPopup) currentPopup.setHTML(content);
};

window.guardarEstado = async function(featureId) {
    const selectElement = document.getElementById(`estado-select-${featureId}`);
    if (!selectElement) {
        alert('Error: No se encontró el selector de estado');
        return;
    }
    
    const nuevoEstado = selectElement.value;
    const estadoActual = urbData[currentUrb].lotes.find(l => l.properties[idFieldName] === featureId)?.properties.estado;
    // Validación para usuarios secundarios
    if (currentUserType === 'secundario') {
        // Solo pueden editar si el estado actual es DISPONIBLE
        if (estadoActual !== 'DISPONIBLE') {
            alert('⚠️ Como usuario secundario, solo puedes editar lotes que están DISPONIBLES.');
            selectElement.value = estadoActual;
            return;
        }
        // Solo pueden cambiar a RESERVADO
        if (nuevoEstado !== 'RESERVADO') {
            alert('⚠️ Como usuario secundario, solo puedes cambiar lotes DISPONIBLES a RESERVADOS.');
            selectElement.value = estadoActual;
            return;
        }
    }

    if ((nuevoEstado === 'VENDIDO' || nuevoEstado === 'RESERVADO') && estadoActual !== nuevoEstado) {
        pendingEstadoChange = { 
            featureId: featureId, 
            nuevoEstado: nuevoEstado,
            urb: currentUrb 
        };
        if (currentPopup) currentPopup.remove();
        
        // Auto-completar el campo de vendedor con el usuario actual
        const vendedorInput = document.getElementById('venta-vendedor');
        if (vendedorInput && currentUsername) {
            vendedorInput.value = currentUsername;
        }
        
        document.getElementById('venta-modal').classList.add('active');
        return;
    }
    
    const lotesSourceId = `lotes-${currentUrb}`;
    selectElement.disabled = true;
    
    try {
        const response = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/lotes?${idFieldName}=eq.${featureId}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_CONFIG.key,
                    'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        if (!data || data.length === 0) {
            alert('⚠️ No se encontró el registro a actualizar.');
            selectElement.disabled = false;
            return;
        }
        
        const loteIndex = urbData[currentUrb].lotes.findIndex(l => l.properties[idFieldName] === featureId);
        if (loteIndex !== -1) {
            urbData[currentUrb].lotes[loteIndex].properties.estado = nuevoEstado;
        }
        
        const source = map.getSource(lotesSourceId);
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features: urbData[currentUrb].lotes
            });
        }
        
        alert('✅ Estado actualizado exitosamente');
        if (currentPopup) {
            setTimeout(() => currentPopup.remove(), 1000);
        }
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('Error al actualizar: ' + error.message);
        selectElement.disabled = false;
    }
};

function updateMeasurement() {
    if (currentBaseLayer !== 'mapbox') {
        document.getElementById('measure-container').style.display = 'none';
        return;
    }
    const data = draw.getAll();
    if (data.features.length > 0) {
        const line = data.features[data.features.length - 1];
        if (line.geometry.type === 'LineString') {
            const length = turf.length(line, { units: 'meters' });
            const lengthKm = (length / 1000).toFixed(2);
            const lengthM = length.toFixed(2);
            document.getElementById('measure-container').style.display = 'block';
            document.getElementById('measure-result').innerHTML = 
                `<div style="font-size: 14px; font-weight: 600; color: var(--primary-color);">${lengthM} m</div>
                 <div style="font-size: 11px; color: #64748b; margin-top: 2px;">(${lengthKm} km)</div>`;
        }
    }
}

map.on('draw.create', updateMeasurement);
map.on('draw.update', updateMeasurement);
map.on('draw.delete', () => {
    document.getElementById('measure-container').style.display = 'none';
});

map.on('load', async () => {
    try {
        console.log('🚀 Iniciando carga de capas...');
        
        checkStoredSession();
        
        const [lotesData, manzanosData, viasData, cotasData, praderasData, equipamientoData, rutasDataResult, centrosDataResult, veredasData, fotosDataResult] = await Promise.all([
            loadLayer('lotes'),
            loadLayer('manzanos'),
            loadLayer('vias'),
            loadLayer('cotas'),
            loadLayer('praderas'),
            loadLayer('equipamiento'),
            loadLayer('rutas'),
            loadLayer('centros'),
            loadLayer('veredas'),
            loadLayer('fotos')
        ]);

        rutasData = rutasDataResult;
        centrosData = centrosDataResult;
        fotosData = fotosDataResult;

        groupByUrb(lotesData, 'lotes');
        groupByUrb(manzanosData, 'manzanos');
        groupByUrb(viasData, 'vias');
        groupByUrb(cotasData, 'cotas');
        groupByUrb(praderasData, 'praderas');
        groupByUrb(equipamientoData, 'equipamiento');
        groupByUrb(veredasData, 'veredas');
        groupByUrb(fotosData, 'fotos');

        console.log('📊 URB Data agrupada:', urbData);

        map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
        });

        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

        map.addLayer({
            id: 'terrain-3d-layer',
            type: 'hillshade',
            source: 'mapbox-dem',
            layout: { visibility: 'none' },
            paint: {
                'hillshade-exaggeration': 0.8
            }
        });

        map.addSource('google-satellite', {
            type: 'raster',
            tiles: [
                'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
                'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            ],
            tileSize: 256
        });
        
        map.addLayer({
            id: 'google-satellite-layer',
            type: 'raster',
            source: 'google-satellite',
            layout: { visibility: 'none' }
        });

        if (Object.keys(urbData).length === 0) {
            alert('No se encontraron datos con campo URB');
            return;
        }

        if (rutasData && rutasData.features.length > 0) {
            console.log('🛣️ Agregando capa de Rutas...');
            map.addSource('rutas', { type: 'geojson', data: rutasData });
            map.addLayer({
                id: 'rutas-line',
                type: 'line',
                source: 'rutas',
                paint: {
                    'line-color': COLOR_PALETTE.rutas.lineColor,
                    'line-width': COLOR_PALETTE.rutas.lineWidth,
                    'line-opacity': COLOR_PALETTE.rutas.lineOpacity
                },
                layout: { visibility: 'none' },
                minzoom: ZOOM_LEVELS.rutas.minzoom,
                maxzoom: ZOOM_LEVELS.rutas.maxzoom
            });
        }

        if (centrosData && centrosData.features.length > 0) {
            console.log('📍 Agregando capa de Centros...');
            map.addSource('centros', { type: 'geojson', data: centrosData });

            const iconTypes = ['centro', 'oficina', 'transporte'];
            const iconColors = { 'centro': '#e11d48', 'oficina': '#2563eb', 'transporte': '#16a34a' };
            
            const createFontAwesomeIcon = (iconClass, color) => {
                return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 48;
                    canvas.height = 48;
                    const ctx = canvas.getContext('2d');
                    ctx.beginPath();
                    ctx.arc(24, 24, 20, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.font = 'bold 24px "Font Awesome 6 Free"';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    let iconChar = '';
                    if (iconClass.includes('map-marker')) iconChar = '\uf3c5';
                    else if (iconClass.includes('building')) iconChar = '\uf1ad';
                    else if (iconClass.includes('bus')) iconChar = '\uf207';
                    ctx.fillText(iconChar, 24, 24);
                    canvas.toBlob((blob) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = URL.createObjectURL(blob);
                    });
                });
            };

            for (const tipo of iconTypes) {
                const iconClass = CENTRO_ICONS[tipo] || CENTRO_ICONS.default;
                const color = iconColors[tipo] || '#6b7280';
                try {
                    const img = await createFontAwesomeIcon(iconClass, color);
                    if (!map.hasImage(`icon-${tipo}`)) {
                        map.addImage(`icon-${tipo}`, img, { sdf: false });
                    }
                } catch (error) {
                    console.warn(`No se pudo cargar el icono ${tipo}:`, error);
                }
            }

            map.addLayer({
                id: 'centros-symbol',
                type: 'symbol',
                source: 'centros',
                layout: {
                    'icon-image': [
                        'case',
                        ['==', ['downcase', ['get', 'TIPO']], 'centro'], 'icon-centro',
                        ['==', ['downcase', ['get', 'TIPO']], 'oficina'], 'icon-oficina',
                        ['==', ['downcase', ['get', 'TIPO']], 'transporte'], 'icon-transporte',
                        'icon-centro'
                    ],
                    'icon-size': 0.8,
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    visibility: 'none'
                },
                minzoom: ZOOM_LEVELS.centros.minzoom,
                maxzoom: ZOOM_LEVELS.centros.maxzoom
            });

            map.addLayer({
                id: 'centros-label',
                type: 'symbol',
                source: 'centros',
                layout: {
                    'text-field': ['get', 'NOMBRE'],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': COLOR_PALETTE.labels.centros.textSize,
                    'text-offset': [0, 2],
                    'text-anchor': 'top',
                    visibility: 'none'
                },
                paint: {
                    'text-color': COLOR_PALETTE.labels.centros.textColor,
                    'text-halo-color': COLOR_PALETTE.labels.centros.haloColor,
                    'text-halo-width': COLOR_PALETTE.labels.centros.haloWidth
                },
                minzoom: ZOOM_LEVELS.labels.centros.minzoom,
                maxzoom: ZOOM_LEVELS.labels.centros.maxzoom
            });

            map.on('click', 'centros-symbol', (e) => {
                if (e.features.length > 0) {
                    const feature = e.features[0];
                    const properties = feature.properties;
                    const popupContent = generarPopupFotos(properties);
                    
                    currentPopup = new mapboxgl.Popup({ maxWidth: '350px' })
                        .setLngLat(e.lngLat)
                        .setHTML(popupContent)
                        .addTo(map);
                        
                    currentPopup.on('close', () => {
                        currentPopup = null;
                    });
                }
            });

            map.on('mouseenter', 'centros-symbol', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'centros-symbol', () => {
                map.getCanvas().style.cursor = '';
            });

            let pulseOpacity = 1;
            let pulseDirection = -1;
            setInterval(() => {
                pulseOpacity += pulseDirection * 0.05;
                if (pulseOpacity <= 0.4 || pulseOpacity >= 1) {
                    pulseDirection *= -1;
                }
                if (map.getLayer('centros-symbol')) {
                    map.setPaintProperty('centros-symbol', 'icon-opacity', pulseOpacity);
                }
            }, 50);
        }

        const createCameraIcon = (color) => {
            return new Promise((resolve, reject) => {
                const canvas = document.createElement('canvas');
                canvas.width = 48;
                canvas.height = 48;
                const ctx = canvas.getContext('2d');
                ctx.beginPath();
                ctx.arc(24, 24, 20, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.font = 'bold 24px "Font Awesome 6 Free"';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\uf030', 24, 24);
                canvas.toBlob((blob) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = URL.createObjectURL(blob);
                });
            });
        };

        try {
            const cameraImg = await createCameraIcon('#e11d48');
            if (!map.hasImage('camera-icon')) {
                map.addImage('camera-icon', cameraImg, { sdf: false });
            }
        } catch (error) {
            console.warn('No se pudo cargar el icono de cámara:', error);
        }

        Object.keys(urbData).forEach((urb) => {
            const urbLayers = urbData[urb];

            if (urbLayers.fotos && urbLayers.fotos.length > 0) {
                console.log(`📸 Agregando capa de Fotos para URB: ${urb} - ${urbLayers.fotos.length} fotos`);
                const fotosSourceId = `fotos-${urb}`;
                
                map.addSource(fotosSourceId, {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: urbLayers.fotos }
                });

                map.addLayer({
                    id: `${fotosSourceId}-symbol`,
                    type: 'symbol',
                    source: fotosSourceId,
                    layout: {
                        'icon-image': 'camera-icon',
                        'icon-size': COLOR_PALETTE.fotos.iconSize,
                        'icon-allow-overlap': true,
                        'icon-ignore-placement': true,
                        visibility: 'none'
                    },
                    minzoom: ZOOM_LEVELS.fotos.minzoom,
                    maxzoom: ZOOM_LEVELS.fotos.maxzoom
                });

                map.on('click', `${fotosSourceId}-symbol`, (e) => {
                    if (e.features.length > 0) {
                        const feature = e.features[0];
                        const properties = feature.properties;
                        const popupContent = generarPopupFotos(properties);
                        
                        currentPopup = new mapboxgl.Popup({ maxWidth: '350px' })
                            .setLngLat(e.lngLat)
                            .setHTML(popupContent)
                            .addTo(map);
                            
                        currentPopup.on('close', () => {
                            currentPopup = null;
                        });
                    }
                });

                map.on('mouseenter', `${fotosSourceId}-symbol`, () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', `${fotosSourceId}-symbol`, () => {
                    map.getCanvas().style.cursor = '';
                });
            }

            if (urbLayers.lotes.length > 0) {
                const lotesSourceId = `lotes-${urb}`;
                map.addSource(lotesSourceId, {
                    type: 'geojson',
                    data: { type: 'FeatureCollection', features: urbLayers.lotes }
                });

                map.addLayer({
                    id: `${lotesSourceId}-fill`,
                    type: 'fill',
                    source: lotesSourceId,
                    paint: {
                        'fill-color': [
                            'match',
                            ['get', 'estado'],
                            'VENDIDO', COLOR_PALETTE.lotes.vendido,
                            'DISPONIBLE', COLOR_PALETTE.lotes.disponible,
                            'RESERVADO', COLOR_PALETTE.lotes.reservado,
                            COLOR_PALETTE.lotes.default
                        ],
                        'fill-opacity': [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            COLOR_PALETTE.lotes.hoverOpacity,
                            COLOR_PALETTE.lotes.opacity
                        ]
                    },
                    layout: { visibility: 'none' },
                    minzoom: ZOOM_LEVELS.lotes.minzoom,
                    maxzoom: ZOOM_LEVELS.lotes.maxzoom
                });

                map.addLayer({
                    id: `${lotesSourceId}-line`,
                    type: 'line',
                    source: lotesSourceId,
                    paint: {
                        'line-color': COLOR_PALETTE.lotes.borderColor,
                        'line-width': COLOR_PALETTE.lotes.borderWidth
                    },
                    layout: { visibility: 'none' },
                    minzoom: ZOOM_LEVELS.lotes.minzoom,
                    maxzoom: ZOOM_LEVELS.lotes.maxzoom
                });

                map.addLayer({
                    id: `${lotesSourceId}-label`,
                    type: 'symbol',
                    source: lotesSourceId,
                    layout: {
                        'text-field': ['to-string', ['get', 'lote']],
                        'text-size': COLOR_PALETTE.labels.lotes.textSize,
                        visibility: 'none'
                    },
                    paint: {
                        'text-color': COLOR_PALETTE.labels.lotes.textColor,
                        'text-halo-color': COLOR_PALETTE.labels.lotes.haloColor,
                        'text-halo-width': COLOR_PALETTE.labels.lotes.haloWidth
                    },
                    minzoom: ZOOM_LEVELS.labels.lotes.minzoom,
                    maxzoom: ZOOM_LEVELS.labels.lotes.maxzoom
                });

                map.on('mousemove', `${lotesSourceId}-fill`, (e) => {
                    if (e.features.length > 0) {
                        if (hoveredStateId !== null && hoveredStateId !== e.features[0].id) {
                            map.setFeatureState({ source: lotesSourceId, id: hoveredStateId }, { hover: false });
                        }
                        hoveredStateId = e.features[0].id;
                        map.setFeatureState({ source: lotesSourceId, id: hoveredStateId }, { hover: true });
                    }
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', `${lotesSourceId}-fill`, () => {
                    if (hoveredStateId !== null) {
                        map.setFeatureState({ source: lotesSourceId, id: hoveredStateId }, { hover: false });
                    }
                    hoveredStateId = null;
                    map.getCanvas().style.cursor = '';
                });

                map.on('click', `${lotesSourceId}-fill`, (e) => {
                    if (e.features.length > 0) {
                        const feature = e.features[0];
                        const properties = feature.properties;
                        currentUrb = urb;
                        currentFeatureId = properties[idFieldName];
                        const popupContent = generarPopupContent(properties, false);
                        currentPopup = new mapboxgl.Popup()
                            .setLngLat(e.lngLat)
                            .setHTML(popupContent)
                            .addTo(map);
                        currentPopup.on('close', () => {
                            currentPopup = null;
                            currentFeatureId = null;
                            currentUrb = null;
                        });
                    }
                });
            }

            ['veredas', 'manzanos', 'vias', 'cotas', 'praderas', 'equipamiento'].forEach(layerType => {
                if (urbLayers[layerType] && urbLayers[layerType].length > 0) {
                    const sourceId = `${layerType}-${urb}`;
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: urbLayers[layerType] }
                    });

                    if (layerType === 'veredas' || layerType === 'manzanos' || layerType === 'praderas' || layerType === 'equipamiento') {
                        map.addLayer({
                            id: `${sourceId}-fill`,
                            type: 'fill',
                            source: sourceId,
                            paint: {
                                'fill-color': COLOR_PALETTE[layerType].fillColor,
                                'fill-opacity': COLOR_PALETTE[layerType].fillOpacity
                            },
                            layout: { visibility: 'none' },
                            minzoom: ZOOM_LEVELS[layerType].minzoom,
                            maxzoom: ZOOM_LEVELS[layerType].maxzoom
                        });
                    }

                    map.addLayer({
                        id: `${sourceId}-line`,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': COLOR_PALETTE[layerType].lineColor,
                            'line-width': COLOR_PALETTE[layerType].lineWidth,
                            'line-opacity': COLOR_PALETTE[layerType].lineOpacity
                        },
                        layout: { visibility: 'none' },
                        minzoom: ZOOM_LEVELS[layerType].minzoom,
                        maxzoom: ZOOM_LEVELS[layerType].maxzoom
                    });

                    if (layerType !== 'veredas') {
                        const labelField = layerType === 'manzanos' ? 'manzano' : (layerType === 'vias' ? 'clase' : (layerType === 'cotas' ? 'cota' : 'nombre'));
                        map.addLayer({
                            id: `${sourceId}-label`,
                            type: 'symbol',
                            source: sourceId,
                            layout: {
                                'text-field': ['to-string', ['get', labelField]],
                                'text-size': COLOR_PALETTE.labels[layerType].textSize,
                                'symbol-placement': (layerType === 'vias' || layerType === 'cotas') ? 'line-center' : 'point',
                                'text-anchor': (layerType === 'vias' || layerType === 'cotas') ? undefined : 'center',
                                visibility: 'none'
                            },
                            paint: {
                                'text-color': COLOR_PALETTE.labels[layerType].textColor,
                                'text-halo-color': COLOR_PALETTE.labels[layerType].haloColor,
                                'text-halo-width': COLOR_PALETTE.labels[layerType].haloWidth
                            },
                            minzoom: ZOOM_LEVELS.labels[layerType].minzoom,
                            maxzoom: ZOOM_LEVELS.labels[layerType].maxzoom
                        });
                    }
                }
            });
        });

        const urbLayersDiv = document.getElementById('urb-layers');
        Object.keys(urbData).forEach(urb => {
            const div = document.createElement('div');
            div.className = 'layer-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `urb-${urb}`;
            checkbox.addEventListener('change', (e) => {
                const visibility = e.target.checked ? 'visible' : 'none';
                ['lotes', 'manzanos', 'vias', 'cotas', 'praderas', 'equipamiento', 'veredas'].forEach(layer => {
                    const sourceId = `${layer}-${urb}`;
                    ['fill', 'line', 'label'].forEach(suffix => {
                        const layerId = `${sourceId}-${suffix}`;
                        if (map.getLayer(layerId)) {
                            map.setLayoutProperty(layerId, 'visibility', visibility);
                        }
                    });
                });
                if (e.target.checked && urbData[urb]) {
                    const allFeatures = [
                        ...urbData[urb].lotes,
                        ...urbData[urb].manzanos,
                        ...urbData[urb].vias,
                        ...urbData[urb].cotas,
                        ...urbData[urb].praderas,
                        ...urbData[urb].equipamiento,
                        ...urbData[urb].veredas
                    ];
                    if (allFeatures.length > 0) {
                        zoomToFeatures(allFeatures);
                    }
                }
            });
            const label = document.createElement('label');
            label.htmlFor = `urb-${urb}`;
            label.textContent = URB_NOMBRES[urb] || `URB: ${urb}`;
            const icon = document.createElement('i');
            icon.className = 'fas fa-crosshairs';
            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(icon);
            urbLayersDiv.appendChild(div);
        });

        const baseLayersDiv = document.getElementById('base-layers');
        const baseLayersConfig = [
            { id: 'mapbox-base', label: 'Mapbox Streets', icon: 'fas fa-map', checked: true, layer: 'mapbox' },
            { id: 'terrain-3d', label: 'Mapa 3D con Relieve', icon: 'fas fa-mountain', checked: false, layer: 'terrain-3d' },
            { id: 'satellite-3d', label: 'Satélite 3D con Relieve', icon: 'fas fa-globe-americas', checked: false, layer: 'satellite-3d' },
            { id: 'google-satellite', label: 'Imagen Satelital', icon: 'fas fa-satellite', checked: false, layer: 'google-satellite' }
        ];

        baseLayersConfig.forEach(config => {
            const div = document.createElement('div');
            div.className = 'layer-item';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'base-layer';
            radio.id = config.id;
            radio.checked = config.checked;
            radio.addEventListener('change', () => {
                if (config.layer === 'mapbox') {
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'none');
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'none');
                    map.setPitch(0);
                    map.setTerrain(null);
                    currentBaseLayer = 'mapbox';
                } else if (config.layer === 'terrain-3d') {
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'visible');
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'none');
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                    map.easeTo({ pitch: 60, duration: 1000 });
                    currentBaseLayer = 'terrain-3d';
                } else if (config.layer === 'satellite-3d') {
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'none');
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'visible');
                    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
                    map.easeTo({ pitch: 60, duration: 1000 });
                    currentBaseLayer = 'satellite-3d';
                } else if (config.layer === 'google-satellite') {
                    map.setLayoutProperty('google-satellite-layer', 'visibility', 'visible');
                    map.setLayoutProperty('terrain-3d-layer', 'visibility', 'none');
                    map.setPitch(0);
                    map.setTerrain(null);
                    currentBaseLayer = 'google-satellite';
                }
                updateMeasureVisibility();
            });
            const label = document.createElement('label');
            label.htmlFor = config.id;
            label.textContent = config.label;
            const icon = document.createElement('i');
            icon.className = config.icon;
            div.appendChild(radio);
            div.appendChild(label);
            div.appendChild(icon);
            baseLayersDiv.appendChild(div);
        });

        console.log('✅ Capas cargadas exitosamente');
        console.log('✨ MEJORAS IMPLEMENTADAS:');
        console.log('   ✅ Mapa 3D con visualización de relieve');
        console.log('   ✅ Imagen satelital 3D con relieve');
        console.log('   ✅ Capa de fotos con popups interactivos y pantalla completa');
        console.log('   ✅ Fotos en centros con mismo sistema de iconos');
        console.log('   ✅ Sistema de autenticación implementado');
        console.log('   ✅ Edición de estados CORREGIDA (usando gid)');
        console.log('   ✅ Carga optimizada de datos');
    } catch (error) {
        console.error('❌ Error general cargando capas:', error);
        alert('Error cargando capas: ' + error.message);
    }
});

console.log('🗺️ Geoportal inicializado');
console.log('✨ Funcionalidades activas:');
console.log('   ✅ Visualización 3D con relieve del terreno');
console.log('   ✅ Imagen satelital 3D con relieve');
console.log('   ✅ Capa de fotos con imágenes y pantalla completa');
console.log('   ✅ Fotos en centros con popups');
console.log('   ✅ Sistema de autenticación');
console.log('   ✅ Edición de estados y generación de PDF');
console.log('   ✅ Exportación a Excel');
console.log('   ✅ Todos los errores corregidos');