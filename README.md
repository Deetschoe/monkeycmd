# CommandMonkey

A MonkeyType-inspired keyboard shortcut trainer. Practice macOS keyboard shortcuts for text navigation, selection, and deletion. Get faster at terminal commands and text editing with gamified practice sessions.

## Features

- **Commands Per Minute (CPM)** tracking
- **Timer modes**: 15, 30, or 60 seconds
- **Multiple themes**: Dark (default), Dracula, Nord, Matrix
- **No accounts required** - just open and practice
- **Terminal-style interface** with visual feedback

## Keyboard Shortcuts Covered

### Navigation
- `Option + Left/Right` - Move cursor by word
- `Command + Left/Right` - Jump to start/end of line
- `Control + A` - Move to start of line
- `Control + E` - Move to end of line

### Selection
- `Option + Shift + Left/Right` - Select word
- `Command + Shift + Left/Right` - Select to start/end of line

### Deletion
- `Option + Delete` - Delete previous word
- `Command + Delete` - Delete to start of line
- `Control + W` - Delete previous word (terminal-style)

## Getting Started

### Local Development

1. Clone the repository
2. Open `index.html` in your browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js (if you have npx)
   npx serve
   ```
3. Navigate to `http://localhost:8000`

### Deploy to Vercel

1. Create a GitHub repository
2. Push the project:
   ```bash
   cd CommandMonkey
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/CommandMonkey.git
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and import the repository
4. Deploy - no build configuration needed

## Project Structure

```
CommandMonkey/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles with theme support
├── js/
│   ├── main.js         # Application controller
│   ├── game.js         # Game engine (timer, scoring)
│   ├── challenges.js   # Challenge generator
│   └── terminal.js     # Terminal text editor simulator
├── favicon.svg         # Site icon
├── vercel.json         # Vercel deployment config
└── package.json        # Project metadata
```

## How to Play

1. Select your timer duration (15, 30, or 60 seconds)
2. Read the command instruction at the top
3. Use the keyboard shortcut shown to complete the command
4. The timer starts when you press your first shortcut
5. Complete as many commands as possible before time runs out
6. Press `Esc` to reset or `Tab + Enter` to restart

## Tech Stack

- Pure HTML, CSS, JavaScript (ES6 modules)
- No build tools or dependencies
- CSS custom properties for theming
- Responsive design

## License

MIT
# CommandMonkey
