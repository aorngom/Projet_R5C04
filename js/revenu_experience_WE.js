// Liste des monnaies de chaque pays
function getCurrencies(jsonData) {
    return [...new Set(jsonData.filter(item => item.Currency !== 'NA').map(item => item.Currency.substring(0, 3)))];
}

// Convertir en euro les monnaies de chaque pays de l'Europe de l'Ouest
const CURRENCY_EURO = {
    'GBP': 0.85,
    'EUR': 1.00,
    'CHF': 0.95,
    'PLN': 4.45,
    'USD': 1.07,
    'CAD': 1.45,
    'CUP': 24.00,
    'XPF': 119.33,
    'IRR': 45000.00,
    'FJD': 2.41,
    'GIP': 0.85,
    'UAH': 41.50,
    'ZAR': 20.15,
    'ALL': 102.00,
    'CDF': 2700.00,
    'ANG': 1.93,
    'AED': 3.93,
    'FKP': 0.85,
    'CLP': 950.00,
    'ZMW': 28.50,
    'BRL': 5.45,
    'DJF': 190.00,
    'GHS': 14.20,
    'HUF': 385.00,
    'AFN': 77.00,
    'THB': 38.50,
    'AZN': 1.82,
    'AUD': 1.63,
    'TWD': 34.20,
    'YER': 268.00,
    'AWG': 1.93,
    'BAM': 1.96,
    'QAR': 3.89,
    'LAK': 22000.00,
    'PEN': 4.05,
    'BIF': 3100.00,
    'SLL': 22000.00,
    'NOK': 11.50,
    'IDR': 16800.00,
    'AMD': 420.00,
    'ARS': 920.00,
    'COP': 4400.00
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