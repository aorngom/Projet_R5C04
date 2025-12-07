let continent = null;
let loadedData = [];
let frameworkChart = null; // pour détruire l'ancien graphique si un filtre change

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    continent = params.get("continent");

    if (!continent) {
        alert("Aucun continent reçu.");
        return;
    }

    loadedData = await loadDataset(continent);

    remplirPays();
    remplirExperiences();
});

// Remplissage des filtres


// remplir la liste des pays
function remplirPays() {
    const select = document.getElementById("countrySelect");

    const pays = [...new Set(
        loadedData.map(r => r.Country).filter(c => c && c !== "NA")
    )].sort();

    pays.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });
}

// remplir les années d'expérience
function remplirExperiences() {
    const select = document.getElementById("expSelect");

    const experiences = [...new Set(
        loadedData.map(r => r.WorkExp).filter(e => e && !isNaN(e))
    )].sort((a, b) => parseInt(a) - parseInt(b));

    experiences.forEach(exp => {
        const opt = document.createElement("option");
        opt.value = exp;
        opt.textContent = exp + " ans";
        select.appendChild(opt);
    });
}

//Bouton Générer


document.getElementById("btnGenerate").addEventListener("click", () => {

    const country = document.getElementById("countrySelect").value;
    const exp = document.getElementById("expSelect").value;

    if (!country || !exp) {
        alert("Veuillez choisir un pays et une expérience.");
        return;
    }

    const data = calculerRevenuFrameworks(country, exp);

    if (data.length === 0) {
        alert("Aucune donnée trouvée pour ce pays et cette expérience.");
        return;
    }

    afficherGraphiqueFrameworks(data);
});

//Calcul du revenu moyen


function calculerRevenuFrameworks(country, exp) {

    const stats = {};

    loadedData.forEach(row => {

        if (row.Country !== country) return;
        if (parseInt(row.WorkExp) !== parseInt(exp)) return;
        if (!row.WebframeHaveWorkedWith) return;

        const frameworks = row.WebframeHaveWorkedWith.split(";");

        const salaire = convertirEnEuro(
            parseInt(row.CompTotal || 0),
            row.Currency
        );

        frameworks.forEach(fw => {
            if (!stats[fw]) stats[fw] = { total: 0, count: 0 };
            stats[fw].total += salaire;
            stats[fw].count++;
        });
    });

    return Object.entries(stats).map(([fw, data]) => ({
        framework: fw,
        moyenne: Math.round(data.total / data.count)
    }));
}

//Gestion des icônes Devicon


// construire l’URL devicon à partir du nom du framework
function deviconURL(framework) {
    let name = framework.toLowerCase();
    name = name.replace(/\.js/, "js");
    name = name.replace(/[^a-z0-9]/g, "");
    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;
}

// plugin Chart.js pour afficher les icônes au-dessus des barres
const iconPlugin = {
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);

        chart.data.labels.forEach((label, index) => {
            const bar = meta.data[index];
            if (!bar) return;

            const x = bar.x;
            const y = bar.y - 25;

            const img = new Image();
            img.src = deviconURL(label);
            img.width = 26;
            img.height = 26;

            img.onload = () => {
                ctx.drawImage(img, x - 13, y - 13, 26, 26);
            };
        });
    }
};

//Affichage du graphique


function afficherGraphiqueFrameworks(data) {

    const canvas = document.getElementById("frameworkChart");

    // tri du revenu le plus élevé au plus faible
    data.sort((a, b) => b.moyenne - a.moyenne);

    // détruire l’ancien graphique
    if (frameworkChart) {
        frameworkChart.destroy();
    }

    frameworkChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: data.map(x => x.framework),
            datasets: [{
                label: "Revenu moyen (€)",
                data: data.map(x => x.moyenne),
                backgroundColor: "rgba(45, 212, 191, 0.85)", // couleur harmonisée
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#ffffff" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            }
        },
        plugins: [iconPlugin]
    });
}
