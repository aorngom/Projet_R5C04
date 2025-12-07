// Convertit un salaire dans sa monnaie d'origine vers l'euro
function convertirEnEuro(salaire, currency) {
    if (!salaire || !currency) return 0;

    const code = currency.split("\t")[0];

    // Taux de conversion de base
    const rates = {
        "USD": 0.93,
        "GBP": 1.14,
        "CAD": 0.68,
        "EUR": 1
    };

    return Math.round(salaire * (rates[code] || 1));
}
