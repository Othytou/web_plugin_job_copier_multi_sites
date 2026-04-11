// popup.js
// Gestion de l'interface popup de l'extension

// Clés de stockage
const STORAGE_KEYS = {
	TOTAL_COPIES: 'totalCopies',
	TODAY_COPIES: 'todayCopies',
	LAST_DATE: 'lastDate'
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
	loadStats();
	setupEventListeners();
});

// Charge les statistiques depuis le storage
function loadStats() {
	chrome.storage.local.get([
		STORAGE_KEYS.TOTAL_COPIES,
		STORAGE_KEYS.TODAY_COPIES,
		STORAGE_KEYS.LAST_DATE
	], (result) => {
		const today = new Date().toDateString();
		const lastDate = result[STORAGE_KEYS.LAST_DATE] || today;

		// Réinitialise les stats du jour si on change de jour
		let todayCopies = result[STORAGE_KEYS.TODAY_COPIES] || 0;
		if (lastDate !== today) {
			todayCopies = 0;
			chrome.storage.local.set({
				[STORAGE_KEYS.TODAY_COPIES]: 0,
				[STORAGE_KEYS.LAST_DATE]: today
			});
		}

		// Affiche les stats
		document.getElementById('total-copies').textContent = result[STORAGE_KEYS.TOTAL_COPIES] || 0;
		document.getElementById('today-copies').textContent = todayCopies;
	});
}

// Configure les écouteurs d'événements
function setupEventListeners() {
	// Bouton de réinitialisation des stats
	document.getElementById('clear-stats').addEventListener('click', () => {
		if (confirm('Voulez-vous vraiment réinitialiser les statistiques ?')) {
			chrome.storage.local.set({
				[STORAGE_KEYS.TOTAL_COPIES]: 0,
				[STORAGE_KEYS.TODAY_COPIES]: 0,
				[STORAGE_KEYS.LAST_DATE]: new Date().toDateString()
			}, () => {
				loadStats();
				showNotification('Statistiques réinitialisées');
			});
		}
	});
}

// Affiche une notification temporaire
function showNotification(message) {
	// Crée un élément de notification
	const notification = document.createElement('div');
	notification.textContent = message;
	notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 2000);
}

// Écoute les messages du background script pour mettre à jour les stats
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'COPY_SUCCESS') {
		loadStats();
	}
});