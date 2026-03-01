# TypeMind 🧠

> AI-powered clarity for everything you type

TypeMind is an intelligent Chrome Extension that acts as your AI writing co-pilot across the web. It automatically detects text you type in Gmail, WhatsApp Web, GitHub, Notion, and any website — then provides instant AI-powered suggestions with one-click apply.

---

## ✨ Features

- **Real-time text detection** — automatically captures what you type across all websites
- **Grammar Fix** — corrects grammar, capitalization and punctuation instantly
- **Smart Replies** — generates professional reply suggestions for emails and messages
- **Rewrite** — rewrites your text for better clarity and flow
- **Code Fix** — wraps your code with error handling and best practices
- **One-click Apply** — injects AI suggestions directly back into the active input field
- **Draggable Panel** — move the floating bubble anywhere on screen
- **Smart Positioning** — panel always stays fully visible regardless of bubble position
- **Context Detection** — automatically detects Gmail, WhatsApp, GitHub, Notion, LinkedIn

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Extension | Chrome Extension Manifest V3 |
| Backend | Node.js + Express |
| AI | OpenAI API (GPT-4) |
| Version Control | Git + GitHub |

---

## 📁 Project Structure

```
typemind/
├── frontend/                  # React app + Chrome Extension
│   ├── src/
│   │   ├── components/
│   │   │   └── FloatingPanel.jsx    # Main UI panel
│   │   ├── hooks/
│   │   │   └── useTextDetector.js   # Text capture logic
│   │   ├── content/
│   │   │   └── index.jsx            # Content script entry
│   │   ├── utils/                   # Helper functions
│   │   └── styles/                  # Global styles
│   ├── public/
│   │   └── manifest.json            # Chrome Extension config
│   └── vite.config.js
├── backend/                   # Node.js + Express API
│   └── (Phase 4 - coming soon)
└── .gitignore
```

---

## 🚀 Development Roadmap

- [x] **Phase 1** — Floating React assistant panel UI
- [x] **Phase 2** — Chrome Extension manifest + content script
- [x] **Phase 3** — Real-time text detection from Gmail / WhatsApp / editors
- [ ] **Phase 4** — Backend API with Express
- [ ] **Phase 5** — OpenAI API integration
- [ ] **Phase 6** — Connect extension to backend
- [ ] **Phase 7** — Display AI suggestions with one-click apply

---

## ⚙️ Installation (Development)

### Prerequisites
- Node.js v18+
- Chrome Browser
- OpenAI API Key (Phase 5+)

### 1. Clone the repository
```bash
git clone https://github.com/YOURUSERNAME/typemind.git
cd typemind
```

### 2. Install frontend dependencies
```bash
cd frontend
npm install
```

### 3. Build the extension
```bash
npm run build
```

### 4. Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer Mode** (top right)
3. Click **Load unpacked**
4. Select the `frontend/dist` folder

### 5. Test it
Open Gmail, WhatsApp Web, or any website and start typing — the TypeMind bubble will appear in the bottom-right corner.

---

## 🧠 How It Works

```
User types in Gmail / WhatsApp / any website
              ↓
Content script detects the active input field
              ↓
Text is captured and shown in the TypeMind panel
              ↓
User selects a mode (Grammar / Reply / Rewrite / Code)
              ↓
AI analyzes the text and returns suggestions
              ↓
User clicks Apply → suggestion injected into the input field
```

---

## 🌐 Supported Websites

TypeMind works on all websites and has special detection for:

- 📧 Gmail (`mail.google.com`)
- 💬 WhatsApp Web (`web.whatsapp.com`)
- 💻 GitHub (`github.com`)
- 📝 Notion (`notion.so`)
- 💼 LinkedIn (`linkedin.com`)
- 🌍 Any website with text input fields

---

## 🤝 Contributing

This project is actively being built. Contributions, issues and feature requests are welcome!

---

## 📄 License

MIT License — feel free to use this project for learning and building.

---

## 👨‍💻 Author

Built with ❤️ while learning React, Chrome Extensions, and AI integration.
