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

    // --- Configuration ---
    const MASTER_PASSWORD = 'Richeavenir000@'; // <<< TRÈS IMPORTANT : REMPLACEZ CECI PAR VOTRE VRAI MOT DE PASSE !!!

    let currentAnalyzedScenario = null; // Variable pour stocker le scénario trouvé
    let trades = []; // Tableau pour stocker tous les trades

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
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas A** / RSI: Haussière. **ATTENTION : Pas d\'opportunité directe.** Attendez que le H1 de Trade clôture en Algo (M30A algo et M30B algo). Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 de Trade ayant clôturé en Algo.'
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
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas C** / RSI: Haussière. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé directement sur la mèche du bas de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
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
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas D** / RSI: Haussière. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé directement sur la mèche du bas de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
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
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** / RSI: Haussière. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
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
            detailedGuidance: 'H2: Algo Valide / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** / RSI: Survente. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
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
            detailedGuidance: 'H2: Pleine Haussière / Comp. H2: Les deux H1 sont Algo / **H1 AVANT TRADE: Cas E** / RSI: Survente. **Naissance directe d\'opportunité de trade.** Un **Buy Limit** est placé sur la mèche du bas de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
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
                'rsiStatus': 'baissiere' // RSI baissière pour ce cas
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade A',
            expectedH1Trade: 'H1 heure de trade clôture en Algo (M30A algo et M30B algo)',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas A** / RSI: Baissière. **ATTENTION : Pas d\'opportunité directe.** Attendez que le H1 de Trade clôture en Algo (M30A algo et M30B algo). Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 de Trade ayant clôturé en Algo.'
        },
        // SELL 2: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'C'
        {
            id: 'S2',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'C', // h1 = pleine baissière (M30 A pleine baissière et M30 B algo)
                'rsiStatus': 'baissiere' // RSI baissière
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade C',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas C** / RSI: Baissière. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé directement sur la mèche du haut de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
        },
        // SELL 3: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'D'
        {
            id: 'S3',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'D', // h1 = pleine baissière (M30 A algo et M30 B algo)
                'rsiStatus': 'baissiere' // RSI baissière
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade D',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas D** / RSI: Baissière. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé directement sur la mèche du haut de la bougie Algo M30B de H1 d\'Avant Trade ayant clôturé.'
        },
        // SELL 4: H2 pleine baissière + H1 (deuxième bougie de H2) algo + H1 Avant Trade 'E'
        {
            id: 'S4',
            type: 'SELL',
            conditions: {
                'h2Shape': 'pleine-baissiere',
                'h2Composition': 'h1-2-algo', // H1 (la deuxième bougie de H2) algo
                'h1ConfigBefore': 'E', // h1 = algo (M30 A algo et M30 B algo)
                'rsiStatus': 'baissiere' // RSI baissière
            },
            name: 'Sell - H2 PB + H1 Algo (2e) + H1 Av.Trade E',
            expectedH1Trade: 'Naissance directe d\'opportunité',
            description: 'Opportunité de continuité de la baisse.',
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** / RSI: Baissière. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
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
            detailedGuidance: 'H2: Algo Valide / Comp. H2: Dernière H1 Algo / **H1 AVANT TRADE: Cas E** / RSI: Surachat. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
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
            detailedGuidance: 'H2: Pleine Baissière / Comp. H2: Les deux H1 sont Algo / **H1 AVANT TRADE: Cas E** / RSI: Surachat. **Naissance directe d\'opportunité de trade.** Un **Sell Limit** est placé sur la mèche du haut de la bougie H1 Avant Heure de Trade ayant clôturé en Algo.'
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
            loadTrades(); // Charger les données après connexion réussie
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
            }
            if (!value) {
                allFieldsSelected = false;
                break;
            }
            // N'ajoute au currentConditions que les champs qui sont des VRAIES conditions
            if (name !== 'tradeHour') {
                currentConditions[name] = value;
            }
        }

        if (!allFieldsSelected) {
            resultDisplay.innerHTML = '<span style="color: orange;">Veuillez remplir tous les champs pour l\'analyse.</span>';
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

                if (currentConditions.h2Shape === scenario.conditions.h2Shape) {
                    currentMatches++;
                } else if (currentConditions.h2Shape) { // Suggestion si H2 est rentré mais ne matche pas
                    tempSuggestion.push(`Forme H2 attendue: **${getReadableValue(scenario.conditions.h2Shape)}**`);
                }

                if (currentConditions.h2Composition === scenario.conditions.h2Composition) {
                    currentMatches++;
                } else if (currentConditions.h2Composition) { // Suggestion si H2 Comp est rentré mais ne matche pas
                    tempSuggestion.push(`Composition H2 attendue: **${getReadableValue(scenario.conditions.h2Composition)}**`);
                }

                if (currentConditions.h1ConfigBefore === scenario.conditions.h1ConfigBefore) {
                    currentMatches++;
                } else if (currentConditions.h1ConfigBefore) { // Suggestion si H1 Av.Trade est rentré mais ne matche pas
                    tempSuggestion.push(`Configuration H1 Avant Trade attendue: **${getReadableValue(scenario.conditions.h1ConfigBefore)}**`);
                }

                if (currentConditions.rsiStatus === scenario.conditions.rsiStatus) {
                    currentMatches++;
                } else if (currentConditions.rsiStatus) { // Suggestion si RSI est rentré mais ne matche pas
                    tempSuggestion.push(`Statut RSI attendu: **${getReadableValue(scenario.conditions.rsiStatus)}**`);
                }

                // Pour ne pas surcharger, on ne garde que les scénarios avec le plus de correspondances
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
                    const scenarioType = item.scenario.type;
                    const h2Shape = getReadableValue(item.scenario.conditions.h2Shape);
                    const h2Composition = getReadableValue(item.scenario.conditions.h2Composition);
                    const h1Config = getReadableValue(item.scenario.conditions.h1ConfigBefore);
                    const rsiStatus = getReadableValue(item.scenario.conditions.rsiStatus);

                    suggestionMessage += `Pour un ${scenarioType} (Type: ${item.scenario.name}) :<br>`;
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

    // Aide pour rendre les valeurs plus lisibles pour les suggestions
    function getReadableValue(value) {
        switch (value) {
            case 'pleine-haussiere': return 'Pleine Haussière';
            case 'pleine-baissiere': return 'Pleine Baissière';
            case 'algo-valide': return 'Algo Valide';
            case 'h1-2-algo': return 'Dernière H1 est Algo';
            case 'h1-1-2-algo': return 'Les deux H1 sont Algo';
            case 'autre': return 'Autre';
            case 'A': return 'Cas A (H1 Pleine Baissière)';
            case 'C': return 'Cas C (H1 Indécise)'; // Note: Updated description in HTML
            case 'D': return 'Cas D (H1 Pleine Haussière)';
            case 'E': return 'Cas E (H1 Longue Mèche/Corps)';
            case 'haussiere': return 'Tendance Haussière';
            case 'baissiere': return 'Tendance Baissière';
            case 'surachat': return 'Surachat';
            case 'survente': return 'Survente';
            default: return value;
        }
    }


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
            row.insertCell().textContent = trade.date;
            row.insertCell().textContent = trade.time;
            row.insertCell().textContent = trade.scenarioName;
            
            const resultCell = row.insertCell();
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

            row.insertCell().textContent = trade.comments;
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
            comments: comments || '',
            // Sauvegarder l'heure de trade si elle était pertinente lors de l'analyse
            tradeHourContext: currentAnalyyzedScenario.tradeHour || 'N/A' 
        };

        trades.push(newTrade);
        saveTrades();
        renderTrades();
        alert("Trade ajouté au journal. N'oubliez pas d'évaluer la validation du H1 de Trade manuellement pour ce scénario anticipé.");
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
                winRate: 0
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
            row.insertCell().textContent = stats.name;
            row.insertCell().textContent = stats.trades;
            row.insertCell().textContent = stats.tp;
            row.insertCell().textContent = stats.sl;
            row.insertCell().textContent = stats.be;
            const winRateCell = row.insertCell();
            winRateCell.textContent = `${currentWinRate}%`;
            
            if (currentWinRate >= 60 && stats.trades > 0) {
                winRateCell.style.color = 'green';
                winRateCell.style.fontWeight = 'bold';
            } else if (currentWinRate < 40 && stats.trades > 0) {
                winRateCell.style.color = 'red';
                winRateCell.style.fontWeight = 'bold';
            }
        });
    };

    // --- Initialisation et Écouteurs d'Événements ---

    // Gère l'affichage initial (login ou app)
    if (localStorage.getItem('zeldaLoggedIn') === 'true') {
        loginScreen.style.display = 'none';
        appContent.style.display = 'block';
        loadTrades(); // Charger les données si déjà connecté
    } else {
        loginScreen.style.display = 'flex'; // Afficher l'écran de login
        appContent.style.display = 'none'; // Masquer l'application
    }

    // Attacher l'écouteur du bouton de connexion
    loginButton.addEventListener('click', handleLogin);
    // Permettre la connexion avec la touche Entrée
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Écouteur pour afficher la description H1 Avant Trade quand la sélection change
    h1ConfigSelect.addEventListener('change', displayH1Description);

    // Attacher l'écouteur d'événement au bouton d'analyse
    analyzeButton.addEventListener('click', analyzeMarket);

    // Afficher la description initiale si une option est déjà sélectionnée au chargement
    displayH1Description();
});