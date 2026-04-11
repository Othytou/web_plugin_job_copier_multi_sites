import asyncio
from playwright.async_api import async_playwright

async def html_to_pdf(html_content, output_path):
    async with async_playwright() as p:
        # Lancement du navigateur (headless par défaut)
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Chargement du contenu HTML
        await page.set_content(html_content)
        
        # Génération du PDF
        # Note: 'print_background' est souvent nécessaire pour garder les couleurs/CSS
        await page.pdf(path=output_path, format="A4", print_background=True)
        
        await browser.close()

# Contenu HTML
html_content = '''
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; color: #333; }
        h1 { color: #007bff; }
    </style>
</head>
<body>
    <h1>Hello, world!</h1>
    <p>Ceci est un test de conversion PDF avec Playwright.</p>
</body>
</html>
'''

if __name__ == "__main__":
    # La méthode moderne et recommandée pour lancer une coroutine
    asyncio.run(html_to_pdf(html_content, 'output_playwright.pdf'))