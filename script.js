// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const loginMessage = document.getElementById('login-message');

    const analyzeButton = document.getElementById('analyze-button');
    const analysisForm = document.getElementById('analysis-form');
    const resultDisplay = document.getElementById('result-display');
    const journalTableBody = document.getElementById('journal-table-body');
    const statsTableBody = document.getElementById('stats-table-body');
    
    // Éléments pour les statistiques globales
    const globalWinRateSpan = document.getElementById('global-win-rate');
    const totalTradesSpan = document.getElementById('total-trades');
    const totalTpSpan = document.getElementById('total-tp');
    const totalSlSpan = document.getElementById('total-sl');
    const totalBeSpan = document.getElementById('total-be');

    // Nouveaux éléments pour les descriptions H1 Avant Trade
    const h1ConfigSelect = document.getElementById('h1-config');
    const h1DescElements = document.querySelectorAll('.h1-desc'); // Sélectionne toutes les descriptions

    // --- Éléments pour le suivi d'objectif ---
    const initialCapitalInput = document.getElementById('initial-capital');
    const finalObjectiveInput = document.getElementById('final-objective');
    const setObjectiveButton = document.getElementById('set-objective-button');
    const currentCapitalSpan = document.getElementById('current-capital');
    const progressPercentageSpan = document.getElementById('progress-percentage');
    const objectiveSummarySpan = document.getElementById('objective-summary');

    // Nouveau canvas pour le graphique de l'objectif
    const objectiveCapitalChartCanvas = document.getElementById('objectiveCapitalChart');
    let objectiveCapitalChartInstance = null; // Instance du graphique Chart.js pour l'objectif

    const riskPercentageInput = document.getElementById('risk-percentage');
    const stopLossPipsInput = document.getElementById('stop-loss-pips');
    const calculateLotButton = document.getElementById('calculate-lot-button');
    const calculatedLotDisplay = document.getElementById('calculated-lot');
    const riskAmountDisplay = document.getElementById('risk-amount-display');
    const lotWarning = document.getElementById('lot-warning');

    const objectiveHistoryBody = document.getElementById('objective-history-body');
    const addPreviousObjectiveButton = document.getElementById('add-previous-objective-button');

    const exportJournalButton = document.getElementById('export-journal-button'); // Nouveau bouton d'exportation
    const winLossChartCanvas = document.getElementById('winLossChart'); // Canvas pour le graphique
    let winLossChartInstance = null; // Instance du graphique Chart.js

    // Nouveau bouton de réinitialisation
    const resetAllDataButton = document.getElementById('reset-all-data-button');

    // --- Configuration ---
    const MASTER_PASSWORD = 'Richeavenir000@'; // <<< TRÈS IMPORTANT : REMPLACEZ CECI PAR VOTRE VRAI MOT DE PASSE !!!
    const JUMP50_PIP_VALUE = 10; // Valeur d'un point/pip pour 1 lot standard (1.0) sur Jump 50. (1 lot = 10$/pip)
    const MIN_LOT_SIZE = 0.01; // Lot minimum pour Jump 50

    let currentAnalyzedScenario = null; // Variable pour stocker le scénario trouvé
    let trades = []; // Tableau pour stocker tous les trades
    // Objectif avec un historique de son capital pour le graphique
    let objective = {
        id: null,
        initialCapital: 0,
        finalObjective: 0,
        currentCapital: 0,
        startDate: null,
        capitalHistory: [] // Tableau pour stocker l'évolution du capital [{date: '...', capital: X}]
    }; 
    let objectiveHistory = []; // Tableau pour les objectifs passés

    // Définition des scénarios avec leurs descriptions détaillées
    // Les clés des 'conditions' DOIVENT correspondre EXACTEMENT aux attributs 'name' des <select> dans index.html
    // L'heure de trade est DEHORS des conditions de match pour les scénarios.
    const scenarios = [
        // --- SCENARIOS BUY ---

        // BUY 1: H2 pleine haussière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'A'
        {
            id: 'B1',
            type: 'BUY',
            conditions: {
                'h2Shape': 'pleine-haussiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'A', // h1 = pleine haussière (M30 A pleine haussière et M30 B pleine haussière)
                'rsiStatus': 'haussiere'
            },
            name: 'Buy - H2 PH + H1 Algo (2e) + H1 Av.Trade A',
            expectedH1Trade: 'H1 heure de trade clôture en Algo (M30A algo et M30B algo)',
            description: 'Opportunité de continuité de la hausse.',
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas A** (M30 A pleine haussière et M30 B pleine haussière) / RSI: Haussière. **ATTENTION : Pas d\'opportunité directe.** Attendez que le H1 de Trade clôture en Algo (M30A algo et M30B algo). Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 de Trade ayant clôturé en Algo.'
        },
        // BUY 2: H2 pleine haussière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'C'
        {
            id: 'B2',
            type: 'BUY',
            conditions: {
                'h2Shape': 'pleine-haussiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'C', // h1 = pleine haussière (M30 A pleine haussière et M30 B algo)
                'rsiStatus': 'haussiere'
            },
            name: 'Buy - H2 PH + H1 Algo (2e) + H1 Av.Trade C',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la hausse.',
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas C** (M30 A pleine haussière et M30 B algo) / RSI: Haussière. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé directement sur la mèche du bas de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
        },
        // BUY 3: H2 pleine haussière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'D'
        {
            id: 'B3',
            type: 'BUY',
            conditions: {
                'h2Shape': 'pleine-haussiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'D', // h1 = pleine haussière (M30 A algo et M30 B algo)
                'rsiStatus': 'haussiere'
            },
            name: 'Buy - H2 PH + H1 Algo (2e) + H1 Av.Trade D',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la hausse.',
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas D** (M30 A algo et M30 B algo) / RSI: Haussière. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé directement sur la mèche du bas de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
        },
        // BUY 4: H2 pleine haussière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'E'
        {
            id: 'B4',
            type: 'BUY',
            conditions: {
                'h2Shape': 'pleine-haussiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'haussiere'
            },
            name: 'Buy - H2 PH + H1 Algo (2e) + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la hausse.',
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Haussière. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },
        // BUY 5: H2 clôture en algo + Dernière H1 algo + H1 Avant Trade 'E'
        {
            id: 'B5',
            type: 'BUY',
            conditions: {
                'h2Shape': 'algo-valide', // h2 clôture en algo
                'h2Composition': 'h1-2-algo', // sa dernière bougie h1 soit aussi une bougie algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'survente' // RSI en survente
            },
            name: 'Buy - H2 Algo + Dernière H1 Algo + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de renversement haussier.',
            detailedGuidance: 'H2: Algo Valide / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Survente. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },
        // BUY 6: H2 clôture en pleine haussière + Ses deux bougies H1 clôturent en algo + H1 Avant Trade 'E'
        {
            id: 'B6',
            type: 'BUY',
            conditions: {
                'h2Shape': 'pleine-haussiere',
                'h2Composition': 'h1-1-2-algo', // ses deux bougies H1 clôturent en algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'survente' // RSI en survente
            },
            name: 'Buy - H2 PH + Deux H1 Algo + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de renversement haussier.',
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Les deux H1 sont Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Survente. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },
        // NOUVEAU SCENARIO BUY 7
        {
            id: 'B7',
            type: 'BUY',
            conditions: {
                'h2Shape': 'pleine-baissiere', // H2 clôture en pleine baissière
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'survente' // RSI en survente
            },
            name: 'Buy - H2 PB + H1 Algo (2e) + H1 Av.Trade E (Renversement Haussier)',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de renversement haussier.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Survente. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },


        // --- SCENARIOS SELL ---

        // SELL 1: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'A'
        {
            id: 'S1',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'A', // h1 = pleine baissière (M30 A pleine baissière et M30 B pleine baissière)
                'rsiStatus': 'baissiere'
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade A',
            expectedH1Trade: 'H1 heure de trade clôture en Algo (M30A algo et M30B algo)',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas A** (M30 A pleine baissière et M30 B pleine baissière) / RSI: Baissière. **ATTENTION : Pas d\'opportunité directe.** Attendez que le H1 de Trade clôture en Algo (M30A algo et M30B algo). Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 de Trade ayant clôturé en Algo.'
        },
        // SELL 2: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'C'
        {
            id: 'S2',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'C', // h1 = pleine baissière (M30 A pleine baissière et M30 B algo)
                'rsiStatus': 'baissiere'
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade C',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas C** (M30 A pleine baissière et M30 B algo) / RSI: Baissière. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé directement sur la mèche du haut de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
        },
        // SELL 3: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'D'
        {
            id: 'S3',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'D', // h1 = pleine baissière (M30 A algo et M30 B algo)
                'rsiStatus': 'baissiere'
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade D',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas D** (M30 A algo et M30 B algo) / RSI: Baissière. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé directement sur la mèche du haut de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
        },
        // SELL 4: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'E'
        {
            id: 'S4',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'baissiere'
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Baissière. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },
        // SELL 5: H2 clôture en algo + Dernière H1 algo + H1 Avant Trade 'E'
        {
            id: 'S5',
            type: 'SELL',
            conditions: {
                'h2Shape': 'algo-valide', // h2 clôture en algo
                'h2Composition': 'h1-2-algo', // sa dernière bougie h1 soit aussi une bougie algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'surachat' // RSI en surachat
            },
            name: 'Sell - H2 Algo + Dernière H1 Algo + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de renversement baissier.',
            detailedGuidance: 'H2: Algo Valide / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Surachat. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },
        // SELL 6: H2 clôture en pleine baissière + Ses deux bougies H1 clôturent en algo + H1 Avant Trade 'E'
        {
            id: 'S6',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-1-2-algo', // ses deux bougies h1 clôturent en algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'surachat' // RSI en surachat
            },
            name: 'Sell - H2 PB + Deux H1 Algo + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de renversement baissier.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Les deux H1 sont Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Surachat. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        },
        // NOUVEAU SCENARIO SELL 7
        {
            id: 'S7',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-haussiere', // H2 clôture en pleine haussière
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'surachat' // RSI en surachat
            },
            name: 'Sell - H2 PH + H1 Algo (2e) + H1 Av.Trade E (Renversement Baissier)',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de renversement baissier.',
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** (M30 A algo et M30 B algo) / RSI: Surachat. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
        }
    ];

    // --- Fonctions de l'Application ---

    // Gère la logique de connexion
    const handleLogin = () => {
        const enteredPassword = passwordInput.value;
        if (enteredPassword === MASTER_PASSWORD) {
            loginScreen.style.display = 'none';
            appContent.style.display = 'block';
            localStorage.setItem('zeldaLoggedIn', 'true'); // Stocker l'état de connexion
            loadAllData(); // Charger toutes les données après connexion réussie
        } else {
            loginMessage.textContent = 'Mot de passe incorrect. Veuillez réessayer.';
            passwordInput.value = ''; // Effacer le champ du mot de passe
        }
    };

    // Fonction pour afficher la description du cas H1 Avant Trade sélectionné
    const displayH1Description = () => {
        const selectedValue = h1ConfigSelect.value;
        h1DescElements.forEach(p => p.classList.add('hidden')); // Masque toutes les descriptions

        if (selectedValue) {
            const descElement = document.getElementById(`desc-${selectedValue}`);
            if (descElement) {
                descElement.classList.remove('hidden'); // Affiche la description correspondante
            }
        }
    };

    // Fonction pour analyser les conditions et trouver le scénario correspondant
    const analyzeMarket = () => {
        const formData = new FormData(analysisForm);
        const currentConditions = {};
        let allFieldsSelected = true;
        let tradeHour = ''; // Pour stocker l'heure de trade pour l'affichage

        // Récupère les valeurs du formulaire et vérifie si tous les champs sont remplis
        for (let [name, value] of formData.entries()) {
            if (name === 'tradeHour') {
                tradeHour = value; // Stocke l'heure séparément
                // Si 'tradeHour' est optionnel, on ne le vérifie pas pour allFieldsSelected
            } else if (value === "") { // Vérifie les autres champs obligatoires
                allFieldsSelected = false;
                break;
            }
            // N'ajoute au currentConditions que les champs qui sont des VRAIES conditions pour les scénarios
            if (name !== 'tradeHour') {
                currentConditions[name] = value;
            }
        }

        if (!allFieldsSelected) {
            resultDisplay.innerHTML = '<span style="color: orange;">Veuillez remplir tous les champs obligatoires pour l\'analyse.</span>';
            currentAnalyzedScenario = null;
            return;
        }

        let foundScenario = null;
        let suggestionMessage = ''; // Pour construire le message de suggestion

        // Tenter de trouver une correspondance exacte
        for (const scenario of scenarios) {
            let match = true;
            for (const key in scenario.conditions) {
                if (scenario.conditions[key] !== currentConditions[key]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                foundScenario = scenario;
                break; // Scénario correspondant trouvé
            }
        }

        // Si aucun scénario exact n'est trouvé, tenter de trouver des suggestions
        if (!foundScenario) {
            let closestScenarios = [];
            let maxMatches = 0;

            for (const scenario of scenarios) {
                let currentMatches = 0;
                let tempSuggestion = [];

                const conditionsKeys = Object.keys(scenario.conditions);
                for (const key of conditionsKeys) {
                    if (scenario.conditions[key] === currentConditions[key]) {
                        currentMatches++;
                    } else if (currentConditions[key]) { // Si la condition actuelle est présente mais ne matche pas
                        // Affiche la condition attendue par le SCENARIO, PAS la valeur entrée par l'utilisateur
                        tempSuggestion.push(`${getReadableLabel(key)} attendue: **${getReadableValue(scenario.conditions[key])}**`);
                    }
                }

                if (currentMatches > 0 && currentMatches >= maxMatches) {
                    if (currentMatches > maxMatches) {
                        closestScenarios = []; // Réinitialise si un meilleur match est trouvé
                        maxMatches = currentMatches;
                    }
                    closestScenarios.push({
                        scenario: scenario,
                        suggestions: tempSuggestion.filter(s => s.length > 0) // Garde seulement les suggestions non vides
                    });
                }
            }

            if (closestScenarios.length > 0) {
                suggestionMessage += '<br><br><span style="color: #666; font-size: 0.9em;">Suggestions basées sur vos entrées :<br>';
                closestScenarios.forEach(item => {
                    // Ces valeurs sont celles DÉFINIES dans le scénario suggéré, pas forcément celles de l'utilisateur
                    const h2Shape = getReadableValue(item.scenario.conditions.h2Shape);
                    const h2Composition = getReadableValue(item.scenario.conditions.h2Composition);
                    const h1Config = getReadableValue(item.scenario.conditions.h1ConfigBefore);
                    const rsiStatus = getReadableValue(item.scenario.conditions.rsiStatus);

                    suggestionMessage += `Pour un ${item.scenario.type} (Scénario ID: **${item.scenario.id}** - ${item.scenario.name}) :<br>`;
                    suggestionMessage += `- Forme H2: **${h2Shape}** | Comp. H2: **${h2Composition}** | H1 Av.Trade: **${h1Config}** | RSI: **${rsiStatus}**<br>`;
                    if (item.suggestions.length > 0) {
                        suggestionMessage += `   (Vos entrées ne correspondent pas sur: ${item.suggestions.join(', ')})<br>`;
                    }
                });
                suggestionMessage += '</span>';
            }
        }
        
        // --- Affichage du Résultat ---
        if (foundScenario) {
            const hourDisplay = tradeHour ? `Heure de Trade: **${tradeHour}:00** / ` : '';
            
            resultDisplay.innerHTML = `
                <span style="color: green;">OPPORTUNITÉ À ANTICIPER : ${foundScenario.type} - ${foundScenario.name}</span>
                <br><br>
                <span style="font-size: 1.1em; color: #444;">${foundScenario.description}</span>
                <br>
                <span style="font-size: 1.0em; color: #555;">${hourDisplay}${foundScenario.detailedGuidance}</span>
                <br><br>
                <button id="add-trade-button">Ajouter au Journal (Une fois Validée)</button>
            `;
            // Stockons le scénario et l'heure pour l'ajouter au journal plus tard
            currentAnalyzedScenario = { ...foundScenario, tradeHour: tradeHour }; // Ajoute l'heure au scénario temporaire
            // Attacher l'écouteur d'événement au bouton "Ajouter au Journal" (important car il est recréé)
            document.getElementById('add-trade-button').addEventListener('click', addTradeToJournalPrompt);
        } else {
            resultDisplay.innerHTML = `<span style="color: red;">Aucune opportunité exacte correspondant à ces conditions d'entrée.</span>${suggestionMessage}`;
            currentAnalyzedScenario = null;
        }
    };

    // Fonction pour obtenir les libellés lisibles des clés de formulaire
    function getReadableLabel(key) {
        switch (key) {
            case 'h2Shape': return 'Forme H2';
            case 'h2Composition': return 'Composition H2';
            case 'h1ConfigBefore': return 'Configuration H1 Avant Trade';
            case 'rsiStatus': return 'Statut RSI';
            default: return key;
        }
    }

    // Fonction pour rendre les valeurs des sélecteurs plus lisibles
    function getReadableValue(value) {
        switch (value) {
            case 'pleine-haussiere': return 'Pleine Haussière';
            case 'pleine-baissiere': return 'Pleine Baissière';
            case 'algo-valide': return 'Algo Valide';
            case 'algo-invalide': return 'Algo Invalide';
            case 'indecise': return 'Indécise';
            case 'h1-2-algo': return 'Dernière H1 est Algo';
            case 'h1-1-2-algo': return 'Les deux H1 sont Algo';
            case 'autre': return 'Autre Composition';
            case 'A': return 'Cas A';
            case 'C': return 'Cas C';
            case 'D': return 'Cas D';
            case 'E': return 'Cas E';
            case 'haussiere': return 'Tendance Haussière';
            case 'baissiere': return 'Tendance Baissière';
            case 'surachat': return 'Surachat';
            case 'survente': return 'Survente';
            case 'neutre': return 'Neutre';
            default: return value;
        }
    }


    // --- Fonctions de Gestion du Journal ---

    // Fonction pour charger les trades depuis le localStorage
    const loadTrades = () => {
        const storedTrades = localStorage.getItem('tradingJournal');
        if (storedTrades) {
            trades = JSON.parse(storedTrades);
        } else {
            trades = [];
        }
        renderTrades();
    };

    // Fonction pour sauvegarder les trades dans le localStorage
    const saveTrades = () => {
        localStorage.setItem('tradingJournal', JSON.stringify(trades));
    };

    // Fonction pour afficher les trades dans le tableau du journal
    const renderTrades = () => {
        journalTableBody.innerHTML = '';
        trades.forEach(trade => {
            const row = journalTableBody.insertRow();
            // Ajout de data-label pour la responsivité
            row.insertCell().setAttribute('data-label', 'Date'); row.cells[0].textContent = trade.date;
            row.insertCell().setAttribute('data-label', 'Heure'); row.cells[1].textContent = trade.time;
            row.insertCell().setAttribute('data-label', 'Scénario'); row.cells[2].textContent = trade.scenarioName;
            
            const resultCell = row.insertCell();
            resultCell.setAttribute('data-label', 'Résultat');
            resultCell.textContent = trade.result;
            if (trade.result === 'TP') {
                resultCell.style.color = 'green';
                resultCell.style.fontWeight = 'bold';
            } else if (trade.result === 'SL') {
                resultCell.style.color = 'red';
                resultCell.style.fontWeight = 'bold';
            } else if (trade.result === 'BE') {
                resultCell.style.color = 'blue';
                resultCell.style.fontWeight = 'bold';
            }

            const profitLossCell = row.insertCell();
            profitLossCell.setAttribute('data-label', 'Gain/Perte');
            profitLossCell.textContent = trade.profitLoss !== undefined ? `${trade.profitLoss.toFixed(2)}$` : 'N/A';
            if (trade.profitLoss > 0) {
                profitLossCell.style.color = 'green';
                profitLossCell.style.fontWeight = 'bold';
            } else if (trade.profitLoss < 0) {
                profitLossCell.style.color = 'red';
                profitLossCell.style.fontWeight = 'bold';
            }

            row.insertCell().setAttribute('data-label', 'Commentaires'); row.cells[5].textContent = trade.comments;
        });
        updateStats();
    };

    // Fonction pour ajouter un trade (avec prompt pour le résultat et les commentaires)
    const addTradeToJournalPrompt = () => {
        if (!currentAnalyzedScenario) {
            alert("Veuillez d'abord analyser une opportunité pour ajouter un trade.");
            return;
        }

        const tradeResult = prompt("Quel a été le résultat du trade ? (TP, SL, ou BE)", "TP");
        if (tradeResult === null || !['TP', 'SL', 'BE'].includes(tradeResult.toUpperCase())) {
            alert("Résultat invalide. Le trade n'a pas été ajouté. Choisissez TP, SL ou BE.");
            return;
        }
        
        let profitLoss = 0;
        if (tradeResult.toUpperCase() === 'TP' || tradeResult.toUpperCase() === 'SL') {
            const amountStr = prompt(`Entrez le montant ${tradeResult.toUpperCase() === 'TP' ? 'gagné' : 'perdu'} ($) :`, "0");
            profitLoss = parseFloat(amountStr);
            if (isNaN(profitLoss)) {
                alert("Montant invalide. Le trade n'a pas été ajouté.");
                return;
            }
            if (tradeResult.toUpperCase() === 'SL') {
                profitLoss = -Math.abs(profitLoss); // Assurer que la perte est négative
            }
        }

        const comments = prompt("Ajoutez des commentaires (facultatif) :", "");

        const now = new Date();
        const date = now.toLocaleDateString('fr-FR');
        const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const newTrade = {
            date: date,
            time: time,
            scenarioId: currentAnalyzedScenario.id,
            scenarioName: currentAnalyzedScenario.name,
            result: tradeResult.toUpperCase(),
            profitLoss: profitLoss, // Ajout du gain/perte
            comments: comments || '',
            tradeHourContext: currentAnalyzedScenario.tradeHour || 'N/A' 
        };

        trades.push(newTrade);
        saveTrades();
        
        // Mettre à jour le capital actuel de l'objectif et son historique
        if (objective && objective.id) { // Vérifie qu'un objectif est bien défini et actif
            objective.currentCapital = parseFloat((objective.currentCapital + profitLoss).toFixed(2));
            const nowForHistory = new Date();
            objective.capitalHistory.push({
                date: nowForHistory.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
                capital: objective.currentCapital
            });
            saveObjectiveData(); // Sauvegarder l'objectif mis à jour
        }
        
        renderTrades();
        renderObjectiveStatus(); // Mettre à jour l'affichage de l'objectif et le graphique
        alert("Trade ajouté au journal. N'oubliez pas d'évaluer la validation du H1 de Trade manuellement pour ce scénario anticipé.");
    };

    // Fonction pour exporter le journal en CSV
    const exportJournalToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        // En-têtes
        csvContent += "Date,Heure,Scénario,Résultat,Gain/Perte,Commentaires\n";

        // Données
        trades.forEach(trade => {
            const row = [
                `"${trade.date}"`,
                `"${trade.time}"`,
                `"${trade.scenarioName}"`,
                `"${trade.result}"`, // Ajouter le résultat ici
                `"${trade.profitLoss !== undefined ? trade.profitLoss.toFixed(2) : 'N/A'}"`,
                `"${trade.comments.replace(/"/g, '""')}"` // Gérer les guillemets dans les commentaires
            ].join(',');
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `journal_trading_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link); // Requis pour Firefox
        link.click();
        document.body.removeChild(link);
    };

    // Fonction pour mettre à jour le tableau de bord statistique
    const updateStats = () => {
        let totalTrades = trades.length;
        let totalTP = 0;
        let totalSL = 0;
        let totalBE = 0;

        const scenarioStats = {};

        // Initialiser les statistiques pour tous les scénarios pour qu'ils apparaissent même sans trades
        scenarios.forEach(scenario => {
            scenarioStats[scenario.id] = {
                name: scenario.name,
                trades: 0,
                tp: 0,
                sl: 0,
                be: 0,
                winRate: 0,
                totalProfitLoss: 0 // Pour les stats par scénario
            };
        });

        trades.forEach(trade => {
            if (trade.result === 'TP') {
                totalTP++;
            } else if (trade.result === 'SL') {
                totalSL++;
            } else if (trade.result === 'BE') {
                totalBE++;
            }

            // Assurez-vous que le scénario existe avant de tenter d'accéder à ses propriétés
            if (scenarioStats[trade.scenarioId]) {
                scenarioStats[trade.scenarioId].trades++;
                if (trade.result === 'TP') {
                    scenarioStats[trade.scenarioId].tp++;
                } else if (trade.result === 'SL') {
                    scenarioStats[trade.scenarioId].sl++;
                } else if (trade.result === 'BE') {
                    scenarioStats[trade.scenarioId].be++;
                }
                scenarioStats[trade.scenarioId].totalProfitLoss += trade.profitLoss || 0;
            }
        });

        // Afficher les statistiques globales
        const globalWinRate = totalTrades > 0 ? ((totalTP / totalTrades) * 100).toFixed(2) : '0.00';
        globalWinRateSpan.textContent = `${globalWinRate}%`;
        totalTradesSpan.textContent = totalTrades;
        totalTpSpan.textContent = totalTP;
        totalSlSpan.textContent = totalSL;
        totalBeSpan.textContent = totalBE;

        // Remplir le tableau des statistiques par scénario
        statsTableBody.innerHTML = '';
        scenarios.forEach(scenario => {
            const stats = scenarioStats[scenario.id]; // Utilise les stats déjà initialisées ou mises à jour
            const currentWinRate = stats.trades > 0 ? ((stats.tp / stats.trades) * 100).toFixed(2) : '0.00';

            const row = statsTableBody.insertRow();
            // Ajout de data-label pour la responsivité
            row.insertCell().setAttribute('data-label', 'Scénario'); row.cells[0].textContent = stats.name;
            row.insertCell().setAttribute('data-label', 'Trades'); row.cells[1].textContent = stats.trades;
            row.insertCell().setAttribute('data-label', 'TP'); row.cells[2].textContent = stats.tp;
            row.insertCell().setAttribute('data-label', 'SL'); row.cells[3].textContent = stats.sl;
            row.insertCell().setAttribute('data-label', 'BE'); row.cells[4].textContent = stats.be;
            const winRateCell = row.insertCell();
            winRateCell.setAttribute('data-label', 'Win Rate');
            winRateCell.textContent = `${currentWinRate}%`;
            
            if (currentWinRate >= 60 && stats.trades > 0) {
                winRateCell.style.color = 'green';
                winRateCell.style.fontWeight = 'bold';
            } else if (currentWinRate < 40 && stats.trades > 0) {
                winRateCell.style.color = 'red';
                winRateCell.style.fontWeight = 'bold';
            }
        });

        // Mettre à jour les graphiques globaux
        updateGlobalWinLossChart();
    };


    // --- Fonctions de Suivi d'Objectifs ---

    // Charger les données d'objectif et d'historique depuis localStorage
    const loadObjectiveData = () => {
        const storedObjective = localStorage.getItem('currentObjective');
        if (storedObjective) {
            // S'assurer que le capitalHistory existe, sinon l'initialiser
            objective = JSON.parse(storedObjective);
            if (!objective.capitalHistory) {
                objective.capitalHistory = [{ date: objective.startDate, capital: objective.initialCapital }];
            }
        } else {
            // Initialiser un objectif par défaut si rien n'est stocké
            objective = {
                id: null,
                initialCapital: 100,
                finalObjective: 1000,
                currentCapital: 100,
                startDate: new Date().toLocaleDateString('fr-FR'),
                capitalHistory: [{ date: new Date().toLocaleDateString('fr-FR'), capital: 100 }]
            };
        }

        const storedObjectiveHistory = localStorage.getItem('objectiveHistory');
        if (storedObjectiveHistory) {
            objectiveHistory = JSON.parse(storedObjectiveHistory);
        } else {
            objectiveHistory = [];
        }
        renderObjectiveStatus();
        renderObjectiveHistory();
    };

    // Sauvegarder les données d'objectif et d'historique dans localStorage
    const saveObjectiveData = () => {
        localStorage.setItem('currentObjective', JSON.stringify(objective));
        localStorage.setItem('objectiveHistory', JSON.stringify(objectiveHistory));
    };

    // Mettre à jour l'affichage de l'objectif actuel et son graphique
    const renderObjectiveStatus = () => {
        if (objective && objective.id) {
            currentCapitalSpan.textContent = `$${objective.currentCapital.toFixed(2)}`;
            
            const progress = (objective.currentCapital - objective.initialCapital) / (objective.finalObjective - objective.initialCapital);
            const progressPercentage = Math.max(0, Math.min(100, progress * 100)).toFixed(2); // Clamp entre 0 et 100
            progressPercentageSpan.textContent = `${progressPercentage}%`;

            if (objective.currentCapital >= objective.finalObjective) {
                objectiveSummarySpan.innerHTML = `Objectif atteint : ${objective.initialCapital}$ &rarr; ${objective.finalObjective}$`;
            } else if (objective.currentCapital < objective.initialCapital) {
                objectiveSummarySpan.innerHTML = `Objectif en cours : ${objective.initialCapital}$ &rarr; ${objective.finalObjective}$ <span style="color: red;">(sous le capital initial)</span>`;
            } else {
                objectiveSummarySpan.innerHTML = `Objectif en cours : ${objective.initialCapital}$ &rarr; ${objective.finalObjective}$`;
            }

            // Mettre à jour les inputs avec les valeurs de l'objectif actuel
            initialCapitalInput.value = objective.initialCapital;
            finalObjectiveInput.value = objective.finalObjective;
            
            updateObjectiveCapitalChart(); // Mettre à jour le graphique
        } else {
            // Si pas d'objectif en cours (ou réinitialisé)
            currentCapitalSpan.textContent = '$0.00';
            progressPercentageSpan.textContent = '0.00%';
            objectiveSummarySpan.textContent = 'Non défini';
            // Réinitialiser les inputs si pas d'objectif
            initialCapitalInput.value = 100;
            finalObjectiveInput.value = 1000;
            
            // Effacer le graphique si pas d'objectif
            if (objectiveCapitalChartInstance) {
                objectiveCapitalChartInstance.destroy();
                objectiveCapitalChartInstance = null;
            }
        }
        calculateLotAndRisk(); // Assure que le calculateur de lot se met à jour avec le bon capital
    };

    // Définir un nouvel objectif
    const setObjective = () => {
        const initial = parseFloat(initialCapitalInput.value);
        const final = parseFloat(finalObjectiveInput.value);

        if (isNaN(initial) || initial <= 0 || isNaN(final) || final <= 0) {
            alert("Veuillez entrer des montants valides et positifs pour le capital.");
            return;
        }
        if (final <= initial) {
            alert("L'objectif final doit être supérieur au capital de départ.");
            return;
        }

        // Si un objectif précédent existe et n'est pas "terminé", l'archiver
        if (objective && objective.id) { // Vérifier si un objectif existait avant de le créer
            const endDate = new Date().toLocaleDateString('fr-FR');
            objectiveHistory.unshift({ // Ajouter au début pour les plus récents en haut
                id: objective.id, // Garder l'ID de l'objectif archivé
                startDate: objective.startDate,
                endDate: endDate,
                initialCapital: objective.initialCapital,
                finalCapital: objective.currentCapital,
                objectiveTarget: objective.finalObjective,
                result: objective.currentCapital >= objective.finalObjective ? 'Atteint' : 'Non Atteint'
            });
        }

        const newId = (objectiveHistory.length > 0 ? Math.max(...objectiveHistory.map(o => o.id)) : 0) + 1;

        objective = {
            id: newId, 
            initialCapital: initial,
            finalObjective: final,
            currentCapital: initial, // Le capital actuel commence par le capital initial
            startDate: new Date().toLocaleDateString('fr-FR'),
            capitalHistory: [{ date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }), capital: initial }]
        };
        saveObjectiveData();
        renderObjectiveStatus();
        renderObjectiveHistory();
        alert("Nouvel objectif défini !");
    };

    // Calculer le lot et le risque en $
    const calculateLotAndRisk = () => {
        const riskPercentage = parseFloat(riskPercentageInput.value);
        const stopLossPips = parseFloat(stopLossPipsInput.value);

        if (!objective || objective.currentCapital === undefined || objective.currentCapital <= 0) {
            calculatedLotDisplay.textContent = 'N/A';
            riskAmountDisplay.textContent = 'Risque en $ : N/A (Définissez un objectif avec capital)';
            lotWarning.style.display = 'none';
            return;
        }

        if (isNaN(riskPercentage) || riskPercentage <= 0 || isNaN(stopLossPips) || stopLossPips <= 0) {
            calculatedLotDisplay.textContent = '0.00';
            riskAmountDisplay.textContent = 'Risque en $ : $0.00';
            lotWarning.style.display = 'none';
            return;
        }

        // Calcul du montant risqué en $
        const riskAmount = objective.currentCapital * (riskPercentage / 100);
        riskAmountDisplay.textContent = `Risque en $ : $${riskAmount.toFixed(2)}`;

        // Calcul du lot
        // Formule: Lot = Montant Risqué / (SL en points * Valeur d'un point pour 1 lot standard)
        // Pour Jump 50: 1 lot = 10$ par point. Donc JUMP50_PIP_VALUE = 10.
        const calculatedLot = riskAmount / (stopLossPips * JUMP50_PIP_VALUE);
        
        // Arrondir au 2ème chiffre après la virgule (lot minimum 0.01)
        let finalLot = parseFloat(calculatedLot.toFixed(2));
        
        // Assurer que le lot final est au moins le lot minimum
        if (finalLot < MIN_LOT_SIZE && calculatedLot > 0) { // Si le calcul théorique est > 0 mais < MIN_LOT_SIZE
            calculatedLotDisplay.textContent = MIN_LOT_SIZE.toFixed(2);
            lotWarning.style.display = 'block';
        } else if (finalLot === 0 && calculatedLot === 0) { // Si le risque est 0 ou SL est infini
            calculatedLotDisplay.textContent = '0.00';
            lotWarning.style.display = 'none';
        } else {
            calculatedLotDisplay.textContent = finalLot.toFixed(2);
            lotWarning.style.display = 'none';
        }
    };

    // Ajouter manuellement un objectif passé
    const addPreviousObjective = () => {
        const id = (objectiveHistory.length > 0 ? Math.max(...objectiveHistory.map(o => o.id)) : (objective && objective.id ? objective.id : 0)) + 1;
        const startDate = prompt("Date de début (JJ/MM/AAAA) :", new Date().toLocaleDateString('fr-FR'));
        const endDate = prompt("Date de fin (JJ/MM/AAAA) :", new Date().toLocaleDateString('fr-FR'));
        const initial = parseFloat(prompt("Capital Initial ($) :", "100"));
        const final = parseFloat(prompt("Capital Final ($) :", "100"));
        const target = parseFloat(prompt("Objectif Cible ($) :", "1000"));

        if (isNaN(initial) || isNaN(final) || isNaN(target) || initial < 0 || final < 0 || target < 0) {
            alert("Valeurs invalides. Veuillez entrer des nombres valides.");
            return;
        }

        const result = final >= target ? 'Atteint' : 'Non Atteint';

        objectiveHistory.unshift({
            id: id,
            startDate: startDate,
            endDate: endDate,
            initialCapital: initial,
            finalCapital: final,
            objectiveTarget: target,
            result: result
        });
        saveObjectiveData();
        renderObjectiveHistory();
    };

    // Afficher l'historique des objectifs
    const renderObjectiveHistory = () => {
        objectiveHistoryBody.innerHTML = '';
        objectiveHistory.forEach(obj => {
            const row = objectiveHistoryBody.insertRow();
            // Ajout de data-label pour la responsivité
            row.insertCell().setAttribute('data-label', 'ID'); row.cells[0].textContent = obj.id;
            row.insertCell().setAttribute('data-label', 'Début'); row.cells[1].textContent = obj.startDate;
            row.insertCell().setAttribute('data-label', 'Fin'); row.cells[2].textContent = obj.endDate || 'En cours';
            row.insertCell().setAttribute('data-label', 'Capital Initial'); row.cells[3].textContent = `$${obj.initialCapital.toFixed(2)}`;
            row.insertCell().setAttribute('data-label', 'Capital Final'); row.cells[4].textContent = `$${obj.finalCapital.toFixed(2)}`;
            const resultCell = row.insertCell();
            resultCell.setAttribute('data-label', 'Résultat');
            resultCell.textContent = obj.result;
            resultCell.style.color = obj.result === 'Atteint' ? 'green' : 'red';
            resultCell.style.fontWeight = 'bold';

            const actionsCell = row.insertCell();
            actionsCell.setAttribute('data-label', 'Actions');
            // Optionnel: ajouter des boutons d'action (ex: supprimer)
            // const deleteButton = document.createElement('button');
            // deleteButton.textContent = 'X';
            // deleteButton.onclick = () => deleteObjectiveFromHistory(obj.id);
            // actionsCell.appendChild(deleteButton);
        });
    };

    // --- Fonctions de Graphiques (Chart.js) ---

    // Graphique pour l'évolution du capital de l'objectif en cours
    const updateObjectiveCapitalChart = () => {
        if (objectiveCapitalChartInstance) {
            objectiveCapitalChartInstance.destroy();
        }

        if (!objective || !objective.capitalHistory || objective.capitalHistory.length === 0) {
            // Masquer ou effacer le canvas si pas de données
            const ctx = objectiveCapitalChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, objectiveCapitalChartCanvas.width, objectiveCapitalChartCanvas.height);
            return;
        }

        const labels = objective.capitalHistory.map(entry => entry.date);
        const data = objective.capitalHistory.map(entry => entry.capital);

        const ctx = objectiveCapitalChartCanvas.getContext('2d');
        objectiveCapitalChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Évolution du Capital',
                    data: data,
                    borderColor: '#007bff', // Couleur bleue pour le capital
                    tension: 0.2,
                    fill: false,
                    pointRadius: 3
                },
                {
                    label: 'Objectif Final',
                    data: Array(labels.length).fill(objective.finalObjective),
                    borderColor: 'rgb(255, 99, 132)', // Rouge pour l'objectif
                    borderDash: [5, 5], // Ligne pointillée
                    tension: 0,
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution du Capital Actuel de l\'Objectif'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date et Heure'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Capital ($)'
                        },
                        beginAtZero: false // Peut commencer ailleurs que zéro si le capital est élevé
                    }
                }
            }
        });
    };

    // Graphique pour les statistiques globales de gain/perte
    const updateGlobalWinLossChart = () => {
        if (winLossChartInstance) {
            winLossChartInstance.destroy(); // Détruire l'instance précédente
        }

        const labels = [];
        const data = [];
        let cumulativeProfitLoss = 0;

        trades.forEach(trade => {
            const dateTime = `${trade.date} ${trade.time}`;
            labels.push(dateTime);
            cumulativeProfitLoss += trade.profitLoss || 0;
            data.push(cumulativeProfitLoss);
        });

        const ctx = winLossChartCanvas.getContext('2d');
        winLossChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Évolution du Capital (cumulé)',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permet au graphique de s'adapter au conteneur
                plugins: {
                    title: {
                        display: true,
                        text: 'Évolution Cumulée des Gains/Pertes (Journal Global)'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date et Heure'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Gain/Perte Cumulé ($)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // --- Fonction de Réinitialisation Globale ---
    const resetAllData = () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser TOUTES les données (journal, objectifs, historique) ? Cette action est irréversible.")) {
            // Réinitialiser les variables globales
            trades = [];
            objective = { // Réinitialiser à un état initial propre
                id: null,
                initialCapital: 100,
                finalObjective: 1000,
                currentCapital: 100,
                startDate: new Date().toLocaleDateString('fr-FR'),
                capitalHistory: [{ date: new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }), capital: 100 }]
            };
            objectiveHistory = [];

            // Supprimer les données du localStorage
            localStorage.removeItem('tradingJournal');
            localStorage.removeItem('currentObjective');
            localStorage.removeItem('objectiveHistory');

            // Mettre à jour l'affichage
            renderTrades(); // Va aussi appeler updateGlobalWinLossChart() via updateStats()
            renderObjectiveStatus(); // Va aussi appeler updateObjectiveCapitalChart()
            renderObjectiveHistory();

            alert("Toutes les données ont été réinitialisées.");
        }
    };


    // --- Initialisation et Écouteurs d'Événements ---

    // Fonction de chargement de toutes les données
    const loadAllData = () => {
        loadTrades(); // Charge les trades et met à jour les stats et graphiques globaux
        loadObjectiveData(); // Charge les données d'objectifs et met à jour son graphique
    };


    // Gère l'affichage initial (login ou app)
    if (localStorage.getItem('zeldaLoggedIn') === 'true') {
        loginScreen.style.display = 'none';
        appContent.style.display = 'block';
        loadAllData(); // Charger toutes les données si déjà connecté
    } else {
        loginScreen.style.display = 'flex'; // Afficher l'écran de login
        appContent.style.display = 'none'; // Masquer l'application
    }

    // Attacher l'écouteur du bouton de connexion
    loginButton.addEventListener('click', handleLogin);
    // Permettre la connexion avec la touche Entrée
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche le comportement par défaut (soumission du formulaire)
            handleLogin();
        }
    });

    // Écouteur pour afficher la description H1 Avant Trade quand la sélection change
    h1ConfigSelect.addEventListener('change', displayH1Description);

    // Attacher l'écouteur d'événement au bouton d'analyse
    analyzeButton.addEventListener('click', analyzeMarket);

    // Attacher les écouteurs pour le suivi d'objectifs
    setObjectiveButton.addEventListener('click', setObjective);
    calculateLotButton.addEventListener('click', calculateLotAndRisk);
    // Recalculer le lot/risque dès que les inputs changent
    riskPercentageInput.addEventListener('input', calculateLotAndRisk);
    stopLossPipsInput.addEventListener('input', calculateLotAndRisk);
    // Recalculer le lot si le capital de l'objectif change (utile si l'utilisateur modifie directement les champs)
    initialCapitalInput.addEventListener('change', calculateLotAndRisk);
    finalObjectiveInput.addEventListener('change', calculateLotAndRisk);

    addPreviousObjectiveButton.addEventListener('click', addPreviousObjective);
    exportJournalButton.addEventListener('click', exportJournalToCSV); // Écouteur pour le bouton d'exportation
    resetAllDataButton.addEventListener('click', resetAllData); // Écouteur pour le bouton de réinitialisation


    // Afficher la description initiale si une option est déjà sélectionnée au chargement
    displayH1Description();

    // Le calcul de lot est maintenant appelé par renderObjectiveStatus() au chargement
    // pour s'assurer que le capital actuel est pris en compte.
});