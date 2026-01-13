// Gestion des commandes clavier pour copier les offres d'emploi

chrome.commands.onCommand.addListener((command) => {
	if (command === "copy-job") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tab = tabs[0];

			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: copyJobContent
			});
		});
	}
});

// Fonction injectée dans la page pour copier le contenu
function copyJobContent() {
	// Configuration des sélecteurs par site
	const siteSelectors = {
		'Indeed': '.jobsearch-JobComponent-description',
		'LinkedIn': '', // À compléter
		'Welcome to the Jungle': '', // À compléter
		'HelloWork': '', // À compléter
		'Free-Work': '' // À compléter
	};

	// URLs supportées
	const supportedSites = [
		{ name: 'Indeed', url: 'indeed.com' },
		{ name: 'LinkedIn', url: 'linkedin.com' },
		{ name: 'Welcome to the Jungle', url: 'welcometothejungle.com' },
		{ name: 'HelloWork', url: 'hellowork.com' },
		{ name: 'Free-Work', url: 'free-work.com' }
	];

	// Détecte le site actuel
	function detectCurrentSite() {
		const currentUrl = window.location.href;

		for (const site of supportedSites) {
			if (currentUrl.includes(site.url)) {
				return site.name;
			}
		}
		return null;
	}

	// Récupère le sélecteur approprié
	const siteName = detectCurrentSite();

	if (!siteName) {
		console.warn('Site non supporté pour la copie d\'offre');
		return;
	}

	const selector = siteSelectors[siteName];

	if (!selector) {
		console.warn(`Sélecteur non configuré pour ${siteName}`);
		return;
	}

	// Récupère et copie le contenu
	const element = document.querySelector(selector);

	if (element) {
		const text = element.innerText;
		navigator.clipboard.writeText(text.trim()).then(() => {
			console.log(`Contenu copié avec succès depuis ${siteName}`);

			// Notification visuelle optionnelle
			showCopyNotification(siteName);
		}).catch(err => {
			console.error('Erreur lors de la copie:', err);
		});
	} else {
		console.warn(`Élément non trouvé avec le sélecteur: ${selector}`);
	}

	// Affiche une notification temporaire
	function showCopyNotification(site) {
		const notification = document.createElement('div');
		notification.innerText = `✓ Offre ${site} copiée !`;
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: #28a745;
			color: white;
			padding: 15px 25px;
			border-radius: 5px;
			z-index: 99999;
			font-family: Arial, sans-serif;
			font-size: 14px;
			box-shadow: 0 4px 6px rgba(0,0,0,0.1);
		`;

		document.body.appendChild(notification);

		setTimeout(() => {
			notification.remove();
		}, 2500);

		// Incrémente les statistiques
		updateStats();
	}

	// Met à jour les statistiques de copie
	function updateStats() {
		const STORAGE_KEYS = {
			TOTAL_COPIES: 'totalCopies',
			TODAY_COPIES: 'todayCopies',
			LAST_DATE: 'lastDate'
		};

		// Note: chrome.storage n'est pas disponible dans le contexte de la page
		// Les stats sont gérées par le background script via message
	}
}

// Écoute pour mettre à jour les statistiques
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'UPDATE_STATS') {
		const STORAGE_KEYS = {
			TOTAL_COPIES: 'totalCopies',
			TODAY_COPIES: 'todayCopies',
			LAST_DATE: 'lastDate'
		};

		chrome.storage.local.get([
			STORAGE_KEYS.TOTAL_COPIES,
			STORAGE_KEYS.TODAY_COPIES,
			STORAGE_KEYS.LAST_DATE
		], (result) => {
			const today = new Date().toDateString();
			const lastDate = result[STORAGE_KEYS.LAST_DATE] || today;

			let totalCopies = (result[STORAGE_KEYS.TOTAL_COPIES] || 0) + 1;
			let todayCopies = (result[STORAGE_KEYS.TODAY_COPIES] || 0) + 1;

			// Réinitialise si nouveau jour
			if (lastDate !== today) {
				todayCopies = 1;
			}

			chrome.storage.local.set({
				[STORAGE_KEYS.TOTAL_COPIES]: totalCopies,
				[STORAGE_KEYS.TODAY_COPIES]: todayCopies,
				[STORAGE_KEYS.LAST_DATE]: today
			});
		});
	}
});