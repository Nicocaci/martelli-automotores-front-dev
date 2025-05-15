function isAppleDevice() {
    return / iPhone | iPad| iPod /i.test(navigator.userAgent);
}

function showAppleInstallationGuide() {
    const isInstalled = localStorage.getItem('autosmart-installed');

    if (isAppleDevice() && !isInstalled) {
        alert("Instala AutoSmart en tu dispositivo:\n\n" +
            "1. Abre la app en Safari.\n" +
            "2. Toca el ícono de compartir (cuadrado con flecha hacia arriba).\n" +
            "3. Selecciona 'Agregar a la pantalla de inicio'.\n" +
            "4. Confirma el nombre y toca 'Agregar'.");
            localStorage.setItem('autosmart_installed', 'true');
    }
}

export {isAppleDevice, showAppleInstallationGuide};