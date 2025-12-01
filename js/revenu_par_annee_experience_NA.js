// Liste des monnaies de chaque pays
function getCurrencies(jsonData) {
    return [...new Set(jsonData.filter(item => item.Currency !== 'NA').map(item => item.Currency.substring(0, 3)))];
}

// Convertir en euro les monnaies de chaque pays de l'Europe de l'Ouest
const CURRENCY_EURO = {
    "USD": 0.92,
    "CAD": 0.67,
    "UZS": 0.000074,
    "UGX": 0.00024,
    "AED": 0.25,
    "SAR": 0.25,
    "GHS": 0.075,
    "EUR": 1.00,
    "MYR": 0.20,
    "BGN": 0.51,
    "ILS": 0.25,
    "AMD": 0.0023,
    "CRC": 0.0017,
    "BAM": 0.51,
    "GBP": 1.17,
    "HKD": 0.12,
    "INR": 0.011,
    "TWD": 0.029,
    "AUD": 0.60,
    "CNY": 0.13,
    "JPY": 0.0060,
    "BOB": 0.13
};

// Liste des pays de l'Europe de l'Ouest
function getCountries(jsonData) {
    return [...new Set(jsonData.map(item => item.Country))];
}

// Liste des années d'expériences
function getWorkExp(jsonData) {
    return [...new Set(jsonData.filter(item => item.WorkExp !== 'NA').map(item => parseInt(item.WorkExp)))]
        .sort((a, b) => a - b);
}

// Calculer le revenu moyen par expérience et par pays
function calculerRevenuParExperience(jsonData, listePays, listeWorkExp) {
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
    jsonData.forEach(item => {
        let pays = item.Country;
        let workExp = item.WorkExp;
        let currency = item.Currency.substring(0, 3);
        let comp = item.CompTotal;

        if (workExp !== 'NA' && currency !== 'NA' && comp !== 'NA') {
            workExp = parseInt(workExp);
            comp = parseFloat(comp);
            count[workExp][pays] += 1;
            dict[workExp][pays] += comp * CURRENCY_EURO[currency];
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

// Créer un drop down pour le choix du pays
function createCountriesDropDown(countries, dict) {
    const div = document.getElementById("countriesDropDown");
    const select = document.createElement("select");

    countries.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.text = c;
        select.appendChild(opt);
    });

    // Lors du changement de pays → MAJ du graphique
    select.addEventListener("change", e => {
        load_chart(dict, "chart", e.target.value);
    });

    div.appendChild(select);
}

// Charge le graphique
let chartInstance = null;

function load_chart(dict, chartId, country) {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
        console.error("Canvas non trouvé !");
        return;
    }

    const workExps = Object.keys(dict).map(x => parseInt(x)).sort((a,b)=>a-b);
    const revenus = workExps.map(exp => dict[exp][country]);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: workExps,
            datasets: [{
                label: `Revenu moyen (${country})`,
                data: revenus,
                borderWidth: 3,
                borderColor: "blue"
            }]
        },
        options: {
            scales: {
                x: {
                    title: { display: true, text: "Années d'expérience" }
                },
                y: {
                    title: { display: true, text: "Revenu moyen (€)" }
                }
            }
        }
    });
}

// Envoi de la requête vers le fichier JSON
$.ajax({
    type: "GET",
    url: "./../survey_results_NA.json",
    success: function(data) {
        const listePays = getCountries(data);
        const listeWorkExp = getWorkExp(data);
        const dict = calculerRevenuParExperience(data, listePays, listeWorkExp);

        console.log(getCurrencies(data));
        createCountriesDropDown(listePays, dict);

        // Pays par défaut
        load_chart(dict, "chart", listePays[0]);
    },
    error: function (http_error) {
        alert("Erreur " + http_error.status + " (" + http_error.statusText + ")");
    }
});