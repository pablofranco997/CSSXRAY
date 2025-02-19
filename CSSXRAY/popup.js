document.addEventListener("DOMContentLoaded", async function () {
    // Elementos del menú principal
    const mainMenu = document.getElementById("main-menu");
    const btnXray = document.getElementById("btn-xray");
    const btnOverflow = document.getElementById("btn-overflow");
    const btnFlex = document.getElementById("btn-flex");
    const btnGrid = document.getElementById("btn-grid");
  
    // Paneles de cada funcionalidad
    const panelXray = document.getElementById("panel-xray");
    const panelOverflow = document.getElementById("panel-overflow");
    const panelFlex = document.getElementById("panel-flex");
    const panelGrid = document.getElementById("panel-grid");
  
    // Botones "Off" de cada panel
    const offXray = document.getElementById("off-xray");
    const offOverflow = document.getElementById("off-overflow");
    const offFlex = document.getElementById("off-flex");
    const offGrid = document.getElementById("off-grid");
  
    // Elementos de opciones para X-Ray principal
    const outlineSlider = document.getElementById("outline-slider");
    const outlineValueDisplay = document.getElementById("outline-value");
    const outlineColorInput = document.getElementById("outline-color");
    const backgroundSlider = document.getElementById("background-slider");
    const backgroundValueDisplay = document.getElementById("background-value");
    const backgroundColorInput = document.getElementById("background-color");
  
    // Valores por defecto
    const defaultOutline = 1;
    const defaultOutlineColor = "#ff0000";
    const defaultBackground = 2;
    const defaultBackgroundColor = "#ff0000";
  
    /* ===== Funciones de navegación ===== */
    // Muestra el panel indicado y oculta el menú principal
    function showPanel(panel) {
      mainMenu.classList.add("hidden");
      panel.classList.remove("hidden");
    }
  
    // Regresa al menú principal: oculta todos los paneles y limpia sus efectos
    async function backToMain() {
      // Llamamos a las funciones clear en el contexto de la página
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearXrayCSS
      });
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearOverflow
      });
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearFlex
      });
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearGrid
      });
  
      // Oculta todos los paneles
      panelXray.classList.add("hidden");
      panelOverflow.classList.add("hidden");
      panelFlex.classList.add("hidden");
      panelGrid.classList.add("hidden");
  
      // Muestra el menú principal
      mainMenu.classList.remove("hidden");
    }
  
    /* ===== Eventos del menú principal ===== */
    btnXray.addEventListener("click", async () => {
      // Al seleccionar X-Ray, mostramos el panel, reiniciamos controles y aplicamos la función inmediatamente
      showPanel(panelXray);
      resetXrayControls();
      updateInjectedXrayCSS();
    });
  
    btnOverflow.addEventListener("click", async () => {
      showPanel(panelOverflow);
      chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: detectOverflow
      });
    });
  
    btnFlex.addEventListener("click", async () => {
      showPanel(panelFlex);
      chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: detectFlex
      });
    });
  
    btnGrid.addEventListener("click", async () => {
      showPanel(panelGrid);
      chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: detectGrid
      });
    });
  
    /* ===== Eventos de los botones Off ===== */
    offXray.addEventListener("click", async () => {
      // Ejecuta la función clearXrayCSS en la pestaña activa, resetea controles y vuelve al menú
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearXrayCSS
      });
      resetXrayControls();
      backToMain();
    });
    offOverflow.addEventListener("click", async () => {
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearOverflow
      });
      backToMain();
    });
    offFlex.addEventListener("click", async () => {
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearFlex
      });
      backToMain();
    });
    offGrid.addEventListener("click", async () => {
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: clearGrid
      });
      backToMain();
    });
  
    /* ===== Eventos de controles de X-Ray ===== */
    outlineSlider.addEventListener("input", () => {
      outlineValueDisplay.textContent = outlineSlider.value;
      updateInjectedXrayCSS();
    });
    backgroundSlider.addEventListener("input", () => {
      backgroundValueDisplay.textContent = backgroundSlider.value;
      updateInjectedXrayCSS();
    });
    outlineColorInput.addEventListener("input", () => {
      updateInjectedXrayCSS();
    });
    backgroundColorInput.addEventListener("input", () => {
      updateInjectedXrayCSS();
    });
  
    /* ===== Funciones para X-Ray principal ===== */
    async function updateInjectedXrayCSS() {
      const outlineIntensity = outlineSlider.value;
      const outlineColor = outlineColorInput.value;
      const backgroundIntensityPercent = backgroundSlider.value;
      const backgroundColor = backgroundColorInput.value;
      const rgb = hexToRgb(backgroundColor);
      const alpha = backgroundIntensityPercent / 100;
      const cssCode = `* {
        outline: ${outlineIntensity}px solid ${outlineColor} !important;
        background-color: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}) !important;
      }`;
      await chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: injectCSS,
        args: [cssCode]
      });
    }
  
    function resetXrayControls() {
      outlineSlider.value = defaultOutline;
      outlineValueDisplay.textContent = defaultOutline;
      outlineColorInput.value = defaultOutlineColor;
      backgroundSlider.value = defaultBackground;
      backgroundValueDisplay.textContent = defaultBackground;
      backgroundColorInput.value = defaultBackgroundColor;
    }
  
    /* ===== Función para obtener la pestaña activa ===== */
    async function getActiveTab() {
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
      return tab;
    }
  
    /* ===== Función para convertir hexadecimal a RGB ===== */
    function hexToRgb(hex) {
      hex = hex.replace(/^#/, '');
      let bigint = parseInt(hex, 16);
      let r, g, b;
      if (hex.length === 3) {
        r = (bigint >> 8) & 0xf;
        g = (bigint >> 4) & 0xf;
        b = bigint & 0xf;
        r *= 17;
        g *= 17;
        b *= 17;
      } else if (hex.length === 6) {
        r = (bigint >> 16) & 255;
        g = (bigint >> 8) & 255;
        b = bigint & 255;
      }
      return { r, g, b };
    }
  });
    
  /* ===== Funciones inyectadas en la página ===== */
    
  // Inyecta CSS (para X-Ray principal)
  function injectCSS(cssCode) {
    let styleElement = document.getElementById("custom-css-injector");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "custom-css-injector";
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = cssCode;
  }
    
  // Elimina el CSS inyectado para X-Ray
  function clearXrayCSS() {
    let styleElement = document.getElementById("custom-css-injector");
    if (styleElement) {
      styleElement.remove();
    }
  }
    
  /* ===== Funciones de detección ===== */
    
  // Detecta elementos con overflow y les aplica un fondo verde,
  // marcándolos con data-overflow-highlight para facilitar su limpieza.
  function detectOverflow() {
    document.querySelectorAll("*").forEach(el => {
      // Primero, si el scroll es mayor que el tamaño visible...
      if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
        const rect = el.getBoundingClientRect();
        let causingOverflow = false;
        
        // Revisamos cada hijo (elemento) para ver si su bounding box se sale del contenedor
        Array.from(el.children).forEach(child => {
          const childRect = child.getBoundingClientRect();
          if (childRect.right > rect.right || childRect.bottom > rect.bottom) {
            causingOverflow = true;
          }
        });
        
        // Si se detecta que algún hijo se sale, marcamos el elemento
        if (causingOverflow) {
          el.style.backgroundColor = "rgba(0,255,0,0.3)";
          el.dataset.overflowHighlight = "true";
        }
      }
    });
  }
  function clearOverflow() {
    document.querySelectorAll("[data-overflow-highlight]").forEach(el => {
      el.style.removeProperty("background-color");
      delete el.dataset.overflowHighlight;
    });
  }
    
  // Detecta elementos con display flex y les aplica un fondo azul claro,
  // marcándolos con data-flex-highlight para facilitar su limpieza.
  function detectFlex() {
    document.querySelectorAll("*").forEach(el => {
      if (getComputedStyle(el).display === "flex") {
        el.style.backgroundColor = "rgba(0,191,255,0.3)";
        el.dataset.flexHighlight = "true";
      }
    });
  }
  function clearFlex() {
    document.querySelectorAll("[data-flex-highlight]").forEach(el => {
      el.style.removeProperty("background-color");
      delete el.dataset.flexHighlight;
    });
  }
    
  // Detecta elementos con display grid y les aplica un fondo violeta claro,
  // marcándolos con data-grid-highlight para facilitar su limpieza.
  function detectGrid() {
    document.querySelectorAll("*").forEach(el => {
      if (getComputedStyle(el).display === "grid") {
        el.style.backgroundColor = "rgba(148,0,211,0.3)";
        el.dataset.gridHighlight = "true";
      }
    });
  }
  function clearGrid() {
    document.querySelectorAll("[data-grid-highlight]").forEach(el => {
      el.style.removeProperty("background-color");
      delete el.dataset.gridHighlight;
    });
  }