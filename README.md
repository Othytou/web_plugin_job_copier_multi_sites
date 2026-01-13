# 📋 Job Copier Multi-Sites job_copier_multi-sites

A Chrome/Brave extension to quickly copy job descriptions from multiple job boards with a single keyboard shortcut.

## 📋 Current Features

- ✅ **Multi-site support** (Indeed, LinkedIn, Welcome to the Jungle, HelloWork, Free-Work)
- ✅ **Keyboard shortcut** (`Ctrl+Shift+M` / `Cmd+Shift+M` on Mac)
- ✅ **Visual copy button** on supported pages
- ✅ **Copy confirmation notification**
- ✅ **Automatic site detection**
- ✅ **SPA navigation support** (MutationObserver)

## 🎯 Supported Job Boards

| Site | Status | Selector |
|------|--------|----------|
| Indeed | ✅ Configured | `.jobsearch-JobComponent-description` |
| LinkedIn | ⏳ To configure | _Empty_ |
| Welcome to the Jungle | ⏳ To configure | _Empty_ |
| HelloWork | ⏳ To configure | _Empty_ |
| Free-Work | ⏳ To configure | _Empty_ |

## 🚀 Planned Features

- ⏳ Custom selector configuration via popup
- ⏳ Statistics on copied jobs
- ⏳ Create a resume 

## 📦 Installation

### Manual Installation (Developer Mode)

1. Clone or download this repository
2. Create an `icons/` folder and add your icons (16x16, 48x48, 128x128 pixels in PNG format)
3. Open Chrome/Brave and go to `chrome://extensions/`
4. Enable **Developer mode** (top right corner)
5. Click **"Load unpacked"**
6. Select the extension folder

## 🎮 Usage

### Method 1: Keyboard Shortcut
1. Navigate to any job offer on a supported site
2. Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac)
3. The job description is automatically copied to your clipboard ✨

### Method 2: Visual Button
1. A floating button appears on supported job pages
2. Click the **"📋 Copier l'offre"** button
3. Visual confirmation when copied!

## 🏗️ Project Structure

```
job_copier_multi_sites/
├── manifest.json       # Extension configuration
├── background.js       # Background service worker (keyboard commands)
├── content.js          # Content script (DOM manipulation, copy button)
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic
├── styles.css          # Popup styles
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🛠️ Technologies Used

- JavaScript (Vanilla)
- Chrome Extension Manifest V3
- Chrome Scripting API
- MutationObserver API for SPA detection
- Clipboard API

## 🔧 Configuration

To add CSS selectors for missing sites:

1. Open the site (e.g., LinkedIn)
2. Right-click on the job description → **Inspect**
3. Find the main container class/selector
4. Update in `background.js` and `content.js`:

```javascript
siteSelectors: {
  'LinkedIn': '.jobs-description__content', // Example
  // Add your selector here
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add selectors for missing sites
- Report bugs
- Suggest new features
- Submit pull requests

### How to Contribute Selectors

If you find the correct selector for a missing site:
1. Fork the repository
2. Add the selector in both `background.js` and `content.js`
3. Test it works correctly
4. Submit a pull request with the site name and selector

## 📝 License

MIT

## ⚠️ Disclaimer

This extension is designed for personal productivity. It does not collect any data and works entirely locally. Copying job descriptions should respect the terms of service of each job board.

---

**Built to streamline your job application process** 🎯