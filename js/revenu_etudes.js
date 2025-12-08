let continent = null;
let loadedData = [];
let edLevelChart = null; // pour pouvoir détruire l'ancien graphique (si un user selection quelque chose de nouveau dan sle filtre)

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    continent = params.get("continent");

    if (!continent) {
        alert("Aucun continent reçu.");
        return;
    }

    loadedData = await loadDataset(continent);

    remplirPays();
});

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

// Liste des pays de l'Europe de l'Ouest
function getCountries(jsonData) {
    return [...new Set(jsonData.map(item => item.Country))];
}

// Liste des niveaux d'études
function getStudies(jsonData) {
    return [...new Set(jsonData.filter(item => item.EdLevel !== 'NA').map(item => item.EdLevel))];
}

//  Bouton Generer
document.getElementById("btnGenerate").addEventListener("click", () => {
    const country = document.getElementById("countrySelect").value;

    if (!country) {
        alert("Veuillez.");
        return;
    }

    const listePays = getCountries(loadedData);
    const listeEdLevel = getStudies(loadedData);
    const data = calculerRevenuEdLevel(listePays, listeEdLevel);

    afficherGraphique(data, country);
});

//  Calcul revenu moyen pour Cloud
function calculerRevenuEdLevel(listePays, listeEdLevel) {
    let dict = {};
    let count = {};

    // initialisation du dictionnaire
    listeEdLevel.forEach(edLevel => {
        dict[edLevel] = {};
        count[edLevel] = {};

        listePays.forEach(country => {
            dict[edLevel][country] = 0;
            count[edLevel][country] = 0;
        });
    });
    // parcourir les données JSON
    loadedData.forEach(item => {
        let pays = item.Country;
        let edLevel = item.EdLevel;
        let currency = item.Currency;
        let comp = item.CompTotal;

        if (edLevel !== 'NA' && currency !== 'NA' && comp !== 'NA') {
            comp = parseFloat(comp);
            count[edLevel][pays] += 1;
            dict[edLevel][pays] += convertirEnEuro(comp, currency);
        }
    });
    // calculer le revenu moyen
    listeEdLevel.forEach(edLevel => {
        listePays.forEach(pays => {
            if (count[edLevel][pays] > 0) {
                dict[edLevel][pays] /= count[edLevel][pays];
            }
        });
    });
    // retourner le résultat
    return dict;
}

//  Chart.js 
function afficherGraphique(dict, country) {

    const canvas = document.getElementById("edLevelChart");

    // Détruire l'ancien graphique
    if (edLevelChart) {
        edLevelChart.destroy();
    }

    const edLevels = Object.keys(dict);
    const revenus = edLevels.map(exp => dict[exp][country]);

    edLevelChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: edLevels,
            datasets: [{
                label: "Revenu moyen (€)",
                data: revenus,
                backgroundColor: "rgba(109,132,255,0.7)"
            }]
        },
        options: {
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
