let continent = null;
let loadedData = [];
let cloudChart = null; // pour pouvoir détruire l'ancien graphique (si un user selection quelque chose de nouveau dan sle filtre)

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

//  Remplissage des filtres 
//remplir pays en fonction du continent sélectionné dans la page d'accueil
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

//remplir experience en fonction du continent sélectionné dans la page d'accueil

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

//  Bouton Genere

document.getElementById("btnGenerate").addEventListener("click", () => {

    const country = document.getElementById("countrySelect").value;
    const exp = document.getElementById("expSelect").value;

    if (!country || !exp) {
        alert("Veuillez choisir un pays et une année expérience.");
        return;
    }

    const data = calculerRevenuCloud(country, exp);

    afficherGraphique(data);
});

//  Calcul revenu moyen pour Cloud
function calculerRevenuCloud(country, exp) {

    const stats = {};

    loadedData.forEach(row => {

        if (row.Country !== country) return;
        if (parseInt(row.WorkExp) !== parseInt(exp)) return;
        if (!row.PlatformHaveWorkedWith) return;

        const platforms = row.PlatformHaveWorkedWith.split(";");

        const salaire = convertirEnEuro(
            parseInt(row.CompTotal || 0),
            row.Currency
        );

        platforms.forEach(p => {
            if (!stats[p]) stats[p] = { total: 0, count: 0 };

            stats[p].total += salaire;
            stats[p].count++;
        });
    });

    return Object.entries(stats).map(([platform, data]) => ({
        plateforme: platform,
        moyenne: Math.round(data.total / data.count)
    }));
}

//  Chart.js 

function afficherGraphique(data) {

    const canvas = document.getElementById("cloudChart");

    // Trier du plus haut au plus bas
    data.sort((a, b) => b.moyenne - a.moyenne);

    // Détruire l'ancien graphique
    if (cloudChart) {
        cloudChart.destroy();
    }

    cloudChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.map(x => x.plateforme),
            datasets: [{
                label: "Revenu moyen (€)",
                data: data.map(x => x.moyenne),
                backgroundColor: "rgba(109,132,255,0.7)"
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { color: "#ffffff" },   // texte axe X
                    grid: { color: "rgba(255,255,255,0.1)" }
                },
                y: {
                    ticks: { color: "#ffffff" },   // texte axe Y
                    grid: { color: "rgba(255,255,255,0.1)" }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }   // texte de la légende
                }
            }
        }
        
    });
}
