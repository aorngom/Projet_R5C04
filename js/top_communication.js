let continent = null;
let loadedData = [];
let outilComChart = null; // pour pouvoir détruire l'ancien graphique

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

    const data = calculerTopOutilCom(devtype);

    if (data.length === 0) {
        alert("Aucune donnée trouvée pour ce métier.");
        return;
    }

    const topData = data.slice(0, topN);

    afficherOutilsCom(topData);
});

//    Calcul du TOP Outil de communication
function calculerTopOutilCom(devType) {

    const stats = {};

    loadedData.forEach(row => {

        if (row.DevType !== devType) return;
        if (!row.OfficeStackSyncHaveWorkedWith) return;

        const outilComList = row.OfficeStackSyncHaveWorkedWith.split(";");

        outilComList.forEach(outilCom => {
            if (!stats[outilCom]) stats[outilCom] = 0;
            stats[outilCom]++;
        });
    });

    return Object.entries(stats)
        .map(([outilCom, count]) => ({ outilCom, count }))
        .sort((a, b) => b.count - a.count);
}

// Affichage du donut Chart.js
function afficherOutilsCom(data) {

    const canvas = document.getElementById("outilComChart");

    if (outilComChart) {
        outilComChart.destroy();
    }

    // Tri décroissant pour avoir un vrai "Top"
    data = data.sort((a, b) => b.count - a.count);

    const labels = data.map(x => x.outilCom);
    const values = data.map(x => x.count);

    const colors = [
        "#38bdf8", "#f472b6", "#a78bfa",
        "#34d399", "#facc15"
    ];

    outilComChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Nombre d'utilisations",
                data: values,
                backgroundColor: colors.slice(0, data.length),
                borderColor: "#ffffff",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            indexAxis: "y", // ← Bar chart horizontal
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "rgba(20,20,20,0.9)",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)"
                }
            },
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.1)" }
                },
                y: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                }
            }
        }
    });
}