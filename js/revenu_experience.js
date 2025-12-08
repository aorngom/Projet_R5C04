let continent = null;
let loadedData = [];
let workExpChart = null; // pour pouvoir détruire l'ancien graphique (si un user selection quelque chose de nouveau dan sle filtre)

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

// Liste des années d'expériences
function getWorkExp(jsonData) {
    return [...new Set(jsonData.filter(item => item.WorkExp !== 'NA').map(item => parseInt(item.WorkExp)))]
        .sort((a, b) => a - b);
}

//  Bouton Generer
document.getElementById("btnGenerate").addEventListener("click", () => {
    const country = document.getElementById("countrySelect").value;

    if (!country) {
        alert("Veuillez.");
        return;
    }

    const listePays = getCountries(loadedData);
    const listeWorkExp = getWorkExp(loadedData);
    const data = calculerRevenuExp(listePays, listeWorkExp);

    afficherGraphique(data, country);
});

//  Calcul revenu moyen pour Cloud
function calculerRevenuExp(listePays, listeWorkExp) {
    let dict = {};
    let count = {};

    // initialisation du dictionnaire
    listeWorkExp.forEach(workExp => {
        dict[workExp] = {};
        count[workExp] = {};

        listePays.forEach(country => {
            dict[workExp][country] = 0;
            count[workExp][country] = 0;
        });
    });
    // parcourir les données JSON
    loadedData.forEach(item => {
        let pays = item.Country;
        let workExp = item.WorkExp;
        let currency = item.Currency.substring(0, 3);
        let comp = item.CompTotal;

        if (workExp !== 'NA' && currency !== 'NA' && comp !== 'NA') {
            workExp = parseInt(workExp);
            comp = parseFloat(comp);
            count[workExp][pays] += 1;
            dict[workExp][pays] += convertirEnEuro(comp, currency);
        }
    });
    // calculer le revenu moyen
    listeWorkExp.forEach(workExp => {
        listePays.forEach(pays => {
            if (count[workExp][pays] > 0) {
                dict[workExp][pays] /= count[workExp][pays];
            }
        });
    });
    // retourner le résultat
    return dict;
}

//  Chart.js 
function afficherGraphique(dict, country) {

    const canvas = document.getElementById("workExpChart");

    // Détruire l'ancien graphique
    if (workExpChart) {
        workExpChart.destroy();
    }

    const workExps = Object.keys(dict).map(x => parseInt(x)).sort((a,b)=>a-b);
    const revenus = workExps.map(exp => dict[exp][country]);

    workExpChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: workExps,
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
