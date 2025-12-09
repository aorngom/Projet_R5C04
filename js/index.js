const continentSelect = document.getElementById("continentSelect");

// Toutes les cartes
const buttons = {
    btnExp: "../templates/revenu_experience.html",
    btnEtudes: "../templates/revenu_etudes.html",
    btnCloud: "../templates/revenu_cloud.html",
    btnFrameworks: "../templates/revenu_frameworks.html",
    btnOS: "../templates/top_os.html",
    btnComm: "../templates/top_communication.html"
};

// Désactiver tous les blocs tant que pas de continent
Object.keys(buttons).forEach(id => {
    document.getElementById(id).style.opacity = "0.4";
    document.getElementById(id).style.pointerEvents = "none";
});

// Quand un continent est sélectionné
continentSelect.addEventListener("change", () => {
    const cont = continentSelect.value;

    if (!cont) return;

    // Activer les cartes
    Object.keys(buttons).forEach(id => {
        document.getElementById(id).style.opacity = "1";
        document.getElementById(id).style.pointerEvents = "auto";

        document.getElementById(id).onclick = () => {
            window.location.href = `${buttons[id]}?continent=${cont}`;
        };
    });
});
