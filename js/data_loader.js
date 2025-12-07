/**
 * Charge le dataset StackOverflow selon le continent sélectionné.
 * 
 * @param {string} continent  "WE" (Europe) ou "NA" (Amérique du Nord)
 * @returns {Promise<Array>}  Tableau d'objets JSON 
 */
async function loadDataset(continent) {

    let filePath = "";

    // Choix du fichier JSON
    if (continent === "WE") {
        filePath = "../data/survey_results_WE.json";
    } 
    else if (continent === "NA") {
        filePath = "../data/survey_results_NA.json";
    } 
    else {
        console.error("Continent invalide :", continent);
        return [];
    }

    try {
        // Chargement du fichier JSON
        const response = await fetch(filePath);

        if (!response.ok) {
            console.error("Impossible de charger :", filePath);
            return [];
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Erreur lors du chargement du dataset :", error);
        return [];
    }
}
