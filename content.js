// content.js
// Script qui s'exécute sur les sites d'offres d'emploi

// Configuration
const config = {
	siteSelectors: {
		'Indeed': '.jobsearch-JobComponent-description',
		'LinkedIn': '', // À compléter
		'Welcome to the Jungle': '', // À compléter
		'HelloWork': '', // À compléter
		'Free-Work': '' // À compléter
	},

	scrappUrls: [
		'indeed.com',
		'linkedin.com',
		'welcometothejungle.com',
		'hellowork.com',
		'free-work.com'
	]
};

// Vérifie si on est sur un site supporté
function isOnSupportedSite() {
	return config.scrappUrls.some(url => window.location.href.includes(url));
}

// Détecte le site actuel
function detectCurrentSite() {
	const url = window.location.href;

	if (url.includes('indeed.com')) return 'Indeed';
	if (url.includes('linkedin.com')) return 'LinkedIn';
	if (url.includes('welcometothejungle.com')) return 'Welcome to the Jungle';
	if (url.includes('hellowork.com')) return 'HelloWork';
	if (url.includes('free-work.com')) return 'Free-Work';

	return null;
}

// Récupère le sélecteur pour le site actuel
function getCurrentSelector() {
	const siteName = detectCurrentSite();
	return siteName ? config.siteSelectors[siteName] : null;
}

// Ajoute un bouton de copie dans la page
function addCopyButton() {
	if (!isOnSupportedSite()) return;

	const selector = getCurrentSelector();
	if (!selector) return;

	const contentElement = document.querySelector(selector);

	if (contentElement && !document.getElementById('job-copy-btn')) {
		const btn = document.createElement('button');
		btn.id = 'job-copy-btn';
		btn.innerHTML = '📋 Copier l\'offre';
		btn.style.cssText = `
			position: fixed;
			bottom: 20px;
			right: 20px;
			z-index: 9999;
			padding: 12px 24px;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			border: none;
			border-radius: 8px;
			cursor: pointer;
			font-family: Arial, sans-serif;
			font-size: 14px;
			font-weight: 600;
			box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
			transition: all 0.3s ease;
		`;

		btn.addEventListener('mouseenter', () => {
			btn.style.transform = 'translateY(-2px)';
			btn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
		});

		btn.addEventListener('mouseleave', () => {
			btn.style.transform = 'translateY(0)';
			btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
		});

		btn.addEventListener('click', () => {
			const el = document.querySelector(selector);
			if (el) {
				navigator.clipboard.writeText(el.innerText.trim());
				btn.innerHTML = '✓ Copié !';
				btn.style.background = '#28a745';

				setTimeout(() => {
					btn.innerHTML = '📋 Copier l\'offre';
					btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
				}, 2000);
			}
		});

		document.body.appendChild(btn);
	}
}

// Observer pour les sites en SPA (Single Page Application)
function observePageChanges() {
	if (!isOnSupportedSite()) return;

	const observer = new MutationObserver(() => {
		addCopyButton();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
}

// Initialisation
console.log(`Job Copier chargé sur ${detectCurrentSite() || 'site non supporté'}`);

if (isOnSupportedSite()) {
	// Attendre que le DOM soit complètement chargé
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			addCopyButton();
			observePageChanges();
		});
	} else {
		addCopyButton();
		observePageChanges();
	}
}