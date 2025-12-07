let continent = null;
let loadedData = [];
let osChart = null; // pour pouvoir détruire l'ancien graphique

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    continent = params.get("continent");

    if (!continent) {
        alert("Aucun continent reçu.");
        return;
    }

    loadedData = await loadDataset(continent);

    remplirDevType();
});

//    Remplissage du filtre DevType

function remplirDevType() {
    const select = document.getElementById("devtypeSelect");

    const types = [...new Set(
        loadedData
            .map(r => r.DevType)
            .filter(t => t && t !== "NA")
    )].sort();

    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });
}

//    Bouton Générer



document.getElementById("btnGenerate").addEventListener("click", () => {

    const devtype = document.getElementById("devtypeSelect").value;
    const topN = parseInt(document.getElementById("topNSelect").value);

    if (!devtype) {
        alert("Veuillez choisir un métier.");
        return;
    }

    const data = calculerTopOS(devtype);

    if (data.length === 0) {
        alert("Aucune donnée trouvée pour ce métier.");
        return;
    }

    const topData = data.slice(0, topN);

    afficherDonut(topData);
    afficherLegende(topData);
});

//    Calcul du TOP OS professionnel

function calculerTopOS(devType) {

    const stats = {};

    loadedData.forEach(row => {

        if (row.DevType !== devType) return;
        if (!row.OpSysProfessionaluse) return;

        const osList = row.OpSysProfessionaluse.split(";");

        osList.forEach(os => {
            if (!stats[os]) stats[os] = 0;
            stats[os]++;
        });
    });

    return Object.entries(stats)
        .map(([os, count]) => ({ os, count }))
        .sort((a, b) => b.count - a.count);
}

// Affichage du donut Chart.js
   


function afficherDonut(data) {

    const canvas = document.getElementById("osChart");

    if (osChart) {
        osChart.destroy();
    }

    const colors = [
        "#38bdf8", "#f472b6", "#a78bfa",
        "#34d399", "#facc15", "#fb923c",
        "#f87171", "#4ade80"
    ];

    osChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: data.map(x => x.os),
            datasets: [{
                data: data.map(x => x.count),
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 2,
                borderColor: "#0f172a",
                cutout: "55%"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

//  Génération de la légende
  


function afficherLegende(data) {

    const zone = document.getElementById("legendZone");
    zone.innerHTML = "";

    const colors = [
        "#38bdf8", "#f472b6", "#a78bfa",
        "#34d399", "#facc15", "#fb923c",
        "#f87171", "#4ade80"
    ];

    data.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "legend-item";

        div.innerHTML = `
            <div class="legend-color" style="background:${colors[index]}"></div>
            ${item.os} (${item.count})
        `;

        zone.appendChild(div);
    });
}
