/**
 * monkeycmd - Main Application Controller
 * Wires together game engine, challenges, terminal, and UI
 */

import { Game, TimerModes } from './game.js';
import { generateChallenge, validateChallenge, formatKeyCombination, setOS } from './challenges.js';
import { TerminalEditor } from './terminal.js';

// Theme configuration - matches CSS data-theme values
const THEMES = [
    'default',
    'dracula',
    'nord',
    'matrix',
    'solarized-light',
    'solarized-dark',
    'monokai',
    'gruvbox',
    'one-dark',
    'tokyo-night',
    'catppuccin',
    'rose-pine',
    'synthwave',
    'ocean',
    'forest',
    'sunset'
];
const THEME_NAMES = {
    default: 'Dark',
    dracula: 'Dracula',
    nord: 'Nord',
    matrix: 'Matrix',
    'solarized-light': 'Solarized Light',
    'solarized-dark': 'Solarized Dark',
    monokai: 'Monokai',
    gruvbox: 'Gruvbox',
    'one-dark': 'One Dark',
    'tokyo-night': 'Tokyo Night',
    catppuccin: 'Catppuccin',
    'rose-pine': 'Rose Pine',
    synthwave: 'Synthwave',
    ocean: 'Ocean',
    forest: 'Forest',
    sunset: 'Sunset'
};
const STORAGE_KEY_THEME = 'monkeycmd-theme';
const STORAGE_KEY_BEST_CPM = 'monkeycmd-best-cpm';
const STORAGE_KEY_OS = 'monkeycmd-os';
const STORAGE_KEY_HINTS = 'monkeycmd-hints';
const STORAGE_KEY_CAT_NAVIGATION = 'monkeycmd-cat-navigation';
const STORAGE_KEY_CAT_SELECTION = 'monkeycmd-cat-selection';
const STORAGE_KEY_CAT_DELETION = 'monkeycmd-cat-deletion';

// OS configuration
const OS_TYPES = ['mac', 'windows', 'linux'];

// ============================================
// Easter Egg Terminal Commands
// Fun fake commands that "break" the UI
// ============================================
const TERMINAL_COMMANDS = {
    'rm -rf /': () => {
        // "Delete everything" - hide all UI elements one by one
        document.querySelectorAll('.header, .stats-container, .category-controls, .footer').forEach((el, i) => {
            setTimeout(() => el.style.display = 'none', i * 200);
        });
        return 'deleting everything...';
    },
    'rm header': () => {
        const header = document.querySelector('.header');
        if (header) header.style.display = 'none';
        return 'header deleted';
    },
    'rm footer': () => {
        const footer = document.querySelector('.footer');
        if (footer) footer.style.display = 'none';
        return 'footer deleted';
    },
    'rm stats': () => {
        const stats = document.querySelector('.stats-container');
        if (stats) stats.style.display = 'none';
        return 'stats deleted';
    },
    'sudo rm -rf /': () => {
        // Nuclear option - glitch effect then hide everything
        document.body.classList.add('glitch-effect');
        setTimeout(() => {
            document.body.innerHTML = '<div style="color: var(--accent-primary, #e2b714); font-family: monospace; padding: 40px; text-align: center; margin-top: 20vh;"><pre style="font-size: 24px;">SYSTEM DESTROYED</pre><p style="color: var(--text-secondary, #646669); margin-top: 20px;">refresh to restore.</p></div>';
        }, 500);
        return 'permission granted...';
    },
    'ls': () => {
        return 'header/  stats/  terminal/  footer/  settings/';
    },
    'ls -la': () => {
        return 'drwxr-xr-x  header/\ndrwxr-xr-x  stats/\ndrwxr-xr-x  terminal/\ndrwxr-xr-x  footer/\n-rw-r--r--  .secret';
    },
    'cat .secret': () => {
        return 'nice try! the real treasure is the shortcuts you learned along the way';
    },
    'cd': () => {
        return 'nice try, but this is a fake terminal ;)';
    },
    'pwd': () => {
        return '/home/monkey/keyboard-mastery';
    },
    'whoami': () => {
        return 'keyboard_ninja';
    },
    'exit': () => {
        window.close();
        return 'goodbye! (if this didnt work, browsers block window.close)';
    },
    'help': () => {
        return `
available commands:
-------------------
FILE SYSTEM:
  ls, ls -a, ls -la    list files
  cat [file]           read file contents
  rm [target]          remove UI element
  touch, mkdir, nano   (try them!)

SYSTEM:
  neofetch             system info
  top, ps aux          process list
  kill -9 1            reload page
  reboot, shutdown     restart/stop
  clear                clear terminal

DESTRUCTIVE:
  rm header/footer/stats   hide UI parts
  rm -rf /                 hide everything
  rm -rf *                 shrink everything away
  rm -rf node_modules      free 2.3GB of space
  sudo rm -rf /            nuclear option
  chmod 000 /              disable all buttons
  format c:                windows nostalgia
  :(){ :|:& };:            fork bomb (safe!)
  deltree                  DOS memories
  echo "hacked" > index.html  l33t h4x0r

GIT:
  git status           check your progress
  git commit           save your progress
  git push --force     flip the ui
  git reset --hard     restore ui

FUN:
  cowsay hi            moo
  fortune              random wisdom
  sl                   oops
  party                🎉
  konami               secret
  matrix               enter the matrix
  coffee, beer         refreshments
  hack, sudo hack      nice try
  sudo su              become root
  alias vim="emacs"    editor wars
  cat /etc/passwd      secrets?

OTHER:
  help                 show this
  restore              fix broken ui
  twitter              follow @deetschoening
  42                   the answer

tip: type any command and press enter!
`;
    },
    'restore': () => {
        // Reset all transforms, opacity, display, etc.
        document.querySelectorAll('.header, .stats-container, .terminal-container, .footer, .results-inline, .category-controls').forEach(el => {
            el.style.display = '';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.pointerEvents = '';
        });
        document.querySelectorAll('button, a, input').forEach(el => {
            el.style.pointerEvents = '';
            el.style.opacity = '';
        });
        document.body.style.transform = '';
        document.body.style.border = '';
        document.body.style.animation = '';
        document.body.style.filter = '';
        document.body.style.opacity = '';
        document.body.classList.remove('glitch-effect');
        document.title = 'monkeycmd - keyboard shortcut trainer';
        return 'ui restored! everything is back to normal.';
    },
    'clear': () => {
        return '';
    },
    'matrix': () => {
        document.body.classList.add('matrix-rain');
        setTimeout(() => {
            document.body.classList.remove('matrix-rain');
        }, 5000);
        return 'entering the matrix...';
    },
    'make me a sandwich': () => {
        return 'what? make it yourself';
    },
    'sudo make me a sandwich': () => {
        return 'okay.';
    },
    'vim': () => {
        return 'trapped! press Escape... wait, that resets the game. you are doomed.';
    },
    'emacs': () => {
        return 'M-x butterfly... just kidding, we dont have that kind of power';
    },
    'git push --force': () => {
        document.body.style.transform = 'rotate(180deg)';
        return 'force pushing to production... ui flipped!';
    },
    'git reset --hard': () => {
        document.body.style.transform = '';
        return 'hard reset complete';
    },

    // More destructive fun
    'rm -rf node_modules': () => {
        document.body.innerHTML = '<div style="padding: 40px; font-family: monospace; color: var(--text-primary); background: var(--bg-primary); min-height: 100vh;"><pre>Deleting node_modules...\n\n' +
        'node_modules/\n' +
        '├── mass-destruction/\n' +
        '├── definitely-not-malware/\n' +
        '├── leftpad/\n' +
        '└── 47,000 more packages...\n\n' +
        'Freed 2.3GB of disk space!\n\n' +
        '(refresh to restore)</pre></div>';
        return '';
    },

    'rm -rf *': () => {
        const elements = document.querySelectorAll('.header, .stats-container, .terminal-container, .footer, .results-inline');
        elements.forEach((el, i) => {
            setTimeout(() => {
                el.style.transition = 'all 0.3s';
                el.style.transform = 'scale(0)';
                el.style.opacity = '0';
            }, i * 100);
        });
        return 'removing everything...';
    },

    'chmod 000 /': () => {
        document.querySelectorAll('button, a, input').forEach(el => {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.3';
        });
        return 'permission denied for everything now. good luck! (type restore)';
    },

    'format c:': () => {
        if (navigator.userAgent.includes('Win')) {
            return 'nice try windows user 😏';
        }
        return 'this isnt windows... but nice try';
    },

    ':(){ :|:& };:': () => {
        return 'fork bomb detected! nice try but this is a sandbox 😎';
    },

    'deltree': () => 'what is this, DOS? try rm -rf instead',

    'echo "hacked" > index.html': () => {
        setTimeout(() => {
            document.body.innerHTML = '<h1 style="color: #0f0; font-family: monospace; padding: 40px;">HACKED</h1><p style="color: #0f0; font-family: monospace; padding: 0 40px;">just kidding. refresh to restore.</p>';
        }, 500);
        return 'writing to index.html...';
    },

    'cat /etc/passwd': () => 'root:x:0:0:root:/root:/bin/bash\\nnobody:x:65534:65534:nobody... just kidding, no secrets here!',

    'sudo su': () => {
        document.body.style.border = '3px solid red';
        return 'root@monkeycmd# you are now root! (but still cant break anything real)';
    },

    'alias vim="emacs"': () => 'you monster.',
    'alias emacs="vim"': () => 'you absolute monster.',

    // File system commands
    'ls -a': () => '.  ..  .secret  .config  header/  stats/  terminal/  footer/',
    'cat header': () => '<header>monkeycmd - master your shortcuts</header>',
    'cat footer': () => '<footer>made with love by deet</footer>',
    'cat terminal': () => 'error: terminal is currently in use by you!',
    'touch hacked.txt': () => {
        document.title = 'HACKED';
        return 'created hacked.txt... wait what?';
    },
    'nano': () => 'nano? in a browser? you wish.',
    'mkdir test': () => 'mkdir: cannot create directory: read-only file system (its a website lol)',

    // System commands
    'neofetch': () => `
  monkeycmd
  ---------
  OS: Browser ${navigator.userAgent.includes('Mac') ? 'macOS' : navigator.userAgent.includes('Win') ? 'Windows' : 'Linux'}
  Host: ${window.location.host}
  Uptime: ${Math.floor(performance.now() / 1000)}s
  Shell: monkeycmd-terminal
  Theme: ${document.body.getAttribute('data-theme') || 'default'}
  CPU: Your Brain @ thinking speed
`,
    'top': () => 'PID 1: monkeycmd (using 100% of your attention)',
    'ps aux': () => 'USER  PID  %CPU  monkeycmd  keyboard-trainer',
    'kill -9 1': () => { location.reload(); return 'killing monkeycmd...'; },
    'reboot': () => { setTimeout(() => location.reload(), 1000); return 'rebooting...'; },
    'shutdown': () => {
        document.body.style.transition = 'opacity 2s';
        document.body.style.opacity = '0';
        setTimeout(() => document.body.innerHTML = '', 2000);
        return 'shutting down...';
    },

    // Fun commands
    'cowsay hi': () => `
 ____
< hi >
 ----
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`,
    'fortune': () => {
        const fortunes = [
            'You will master Cmd+Delete today.',
            'A keyboard shortcut saved is a second earned.',
            'The terminal is mightier than the mouse.',
            'Your CPM will reach new heights.',
            'Option+Arrow is your new best friend.'
        ];
        return fortunes[Math.floor(Math.random() * fortunes.length)];
    },
    'sl': () => 'choo choo! 🚂💨 (you meant ls, didnt you?)',
    'please': () => 'thats more polite, but still no.',
    'sudo please': () => 'okay fine, what do you want?',
    'hello': () => 'hey there! ready to practice some shortcuts?',
    'ping google.com': () => 'PING google.com: 64 bytes from keyboard - time=0ms (instant, because youre good)',
    'curl localhost': () => '<!DOCTYPE html><html>...you are here...</html>',
    'npm install': () => 'installing keyboard-shortcuts@latest... done! (0 vulnerabilities)',
    'git status': () => 'On branch main\nYour typing skills are ahead of origin/main by 999 commits.',
    'git commit -m "got better"': () => '[main abc123] got better\n 1 file changed, +100 CPM',

    // Secret commands
    'konami': () => {
        document.body.style.transform = 'rotate(360deg)';
        document.body.style.transition = 'transform 1s';
        setTimeout(() => document.body.style.transform = '', 1000);
        return '↑↑↓↓←→←→BA - you found the secret!';
    },
    'party': () => {
        document.body.style.animation = 'rainbow 0.5s infinite';
        setTimeout(() => document.body.style.animation = '', 3000);
        return '🎉 party mode activated for 3 seconds!';
    },
    'hack': () => 'nice try, hackerman 😎',
    'sudo hack': () => {
        let output = '';
        for(let i = 0; i < 5; i++) {
            output += Math.random().toString(36).substring(2) + '\n';
        }
        return 'ACCESS GRANTED\n' + output + '...just kidding';
    },
    'discord': () => 'join the monkeycmd community! (jk theres no discord... yet)',
    'twitter': () => 'follow @deetschoening for updates!',
    'coffee': () => '☕ brewing... here you go!',
    'beer': () => '🍺 cheers! but maybe practice sober?',
    '42': () => 'the answer to life, the universe, and keyboard shortcuts.',
    '?': () => 'type "help" for available commands',
    '/help': () => 'type "help" (without the slash) for available commands'
};

/**
 * Execute a terminal command (easter egg)
 * @param {string} command - The command string to execute
 * @returns {string} The command output
 */
function executeTerminalCommand(command) {
    const cmd = command.trim().toLowerCase();
    if (TERMINAL_COMMANDS[cmd]) {
        return TERMINAL_COMMANDS[cmd]();
    }
    // Check for partial matches or typos
    if (cmd.startsWith('rm ')) {
        return `cannot remove '${cmd.slice(3)}': No such file or directory`;
    }
    if (cmd.startsWith('cd ')) {
        return `cd: ${cmd.slice(3)}: No such directory`;
    }
    if (cmd.startsWith('cat ')) {
        return `cat: ${cmd.slice(4)}: No such file`;
    }
    if (cmd === '') {
        return '';
    }
    return `command not found: ${cmd}. type 'help' for available commands`;
}

// Detect if on mobile device
function isMobileDevice() {
    return window.matchMedia('(max-width: 768px)').matches ||
           'ontouchstart' in window ||
           navigator.maxTouchPoints > 0;
}

// Map command types to terminal actions for mobile keyboard
const MOBILE_COMMAND_ACTIONS = {
    'MOVE_WORD_LEFT': () => app.terminal.moveByWord('left'),
    'MOVE_WORD_RIGHT': () => app.terminal.moveByWord('right'),
    'JUMP_LINE_START': () => app.terminal.moveToLineStart(),
    'JUMP_LINE_END': () => app.terminal.moveToLineEnd(),
    'SELECT_WORD_LEFT': () => app.terminal.selectByWord('left'),
    'SELECT_WORD_RIGHT': () => app.terminal.selectByWord('right'),
    'SELECT_TO_LINE_START': () => app.terminal.selectToLineStart(),
    'SELECT_TO_LINE_END': () => app.terminal.selectToLineEnd(),
    'SELECT_ALL': () => app.terminal.selectAll(),
    'DELETE_WORD': () => app.terminal.deleteWord(),
    'DELETE_WORD_FORWARD': () => app.terminal.deleteWordForward(),
    'DELETE_TO_LINE_START': () => app.terminal.deleteToLineStart(),
    'DELETE_TO_LINE_END': () => app.terminal.deleteToLineEnd(),
};

// OS-specific key labels for mobile keyboard buttons
// Mac uses Unicode symbols: ⌥ (Option), ⌘ (Command), ⌫ (Delete), ⌃ (Control), ⇧ (Shift)
// Windows/Linux use text labels: Ctrl, Alt, Backspace, Home, End
const OS_KEY_LABELS = {
    mac: {
        'DELETE_WORD': '⌥ + ⌫',
        'DELETE_WORD_FORWARD': '⌥ + Fn⌫',
        'MOVE_WORD_LEFT': '⌥ + ←',
        'MOVE_WORD_RIGHT': '⌥ + →',
        'JUMP_LINE_START': '⌘ + ←',
        'JUMP_LINE_END': '⌘ + →',
        'DELETE_TO_LINE_START': '⌘ + ⌫',
        'DELETE_TO_LINE_END': '⌃ + K',
        'SELECT_WORD_LEFT': '⌥⇧ + ←',
        'SELECT_WORD_RIGHT': '⌥⇧ + →',
        'SELECT_TO_LINE_START': '⌘⇧ + ←',
        'SELECT_TO_LINE_END': '⌘⇧ + →',
        'SELECT_ALL': '⌘ + A',
    },
    windows: {
        'DELETE_WORD': 'Ctrl + ⌫',
        'DELETE_WORD_FORWARD': 'Ctrl + Del',
        'MOVE_WORD_LEFT': 'Ctrl + ←',
        'MOVE_WORD_RIGHT': 'Ctrl + →',
        'JUMP_LINE_START': 'Home',
        'JUMP_LINE_END': 'End',
        'DELETE_TO_LINE_START': 'Ctrl+Shift + ⌫',
        'DELETE_TO_LINE_END': 'Ctrl+Shift + Del',
        'SELECT_WORD_LEFT': 'Ctrl+Shift + ←',
        'SELECT_WORD_RIGHT': 'Ctrl+Shift + →',
        'SELECT_TO_LINE_START': 'Shift + Home',
        'SELECT_TO_LINE_END': 'Shift + End',
        'SELECT_ALL': 'Ctrl + A',
    },
    linux: {
        'DELETE_WORD': 'Alt + ⌫',
        'DELETE_WORD_FORWARD': 'Alt + D',
        'MOVE_WORD_LEFT': 'Ctrl + ←',
        'MOVE_WORD_RIGHT': 'Ctrl + →',
        'JUMP_LINE_START': 'Home',
        'JUMP_LINE_END': 'End',
        'DELETE_TO_LINE_START': 'Ctrl + U',
        'DELETE_TO_LINE_END': 'Ctrl + K',
        'SELECT_WORD_LEFT': 'Ctrl+Shift + ←',
        'SELECT_WORD_RIGHT': 'Ctrl+Shift + →',
        'SELECT_TO_LINE_START': 'Shift + Home',
        'SELECT_TO_LINE_END': 'Shift + End',
        'SELECT_ALL': 'Ctrl + A',
    },
};

// Map command names (from challenges.js) to command keys (used in mobile keyboard)
const COMMAND_NAME_TO_KEY = {
    'Delete Word': 'DELETE_WORD',
    'Delete Word Forward': 'DELETE_WORD_FORWARD',
    'Move Word Left': 'MOVE_WORD_LEFT',
    'Move Word Right': 'MOVE_WORD_RIGHT',
    'Jump to Line Start': 'JUMP_LINE_START',
    'Jump to Line End': 'JUMP_LINE_END',
    'Delete to Line Start': 'DELETE_TO_LINE_START',
    'Delete to Line End': 'DELETE_TO_LINE_END',
    'Kill Line Start': 'DELETE_TO_LINE_START',
    'Select Word Left': 'SELECT_WORD_LEFT',
    'Select Word Right': 'SELECT_WORD_RIGHT',
    'Select to Line Start': 'SELECT_TO_LINE_START',
    'Select to Line End': 'SELECT_TO_LINE_END',
    'Select All': 'SELECT_ALL',
};

// Set up mobile keyboard event listeners
function setupMobileKeyboard() {
    const mobileKeyboard = app.dom.mobileKeyboard || document.getElementById('mobileKeyboard');
    if (!mobileKeyboard) return;

    const buttons = mobileKeyboard.querySelectorAll('.shortcut-key');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const commandType = button.dataset.command;
            handleMobileCommand(commandType, button);
        });

        // Touch feedback for mobile
        button.addEventListener('touchstart', () => {
            button.classList.add('pressed');
        }, { passive: true });

        button.addEventListener('touchend', () => {
            button.classList.remove('pressed');
        }, { passive: true });
    });

    // Initial setup
    updateMobileKeyboardLabels();
    updateMobileKeyboardSections();
}

/**
 * Update mobile keyboard button labels based on current OS
 */
function updateMobileKeyboardLabels() {
    const mobileKeyboard = document.getElementById('mobileKeyboard');
    if (!mobileKeyboard) return;

    const os = app.currentOS || 'mac';
    const labels = OS_KEY_LABELS[os] || OS_KEY_LABELS.mac;

    const buttons = mobileKeyboard.querySelectorAll('.shortcut-key');
    buttons.forEach(button => {
        const command = button.dataset.command;
        const keyCombo = button.querySelector('.key-combo');
        if (keyCombo && labels[command]) {
            keyCombo.textContent = labels[command];
        }
    });
}

/**
 * Update mobile keyboard sections visibility based on enabled categories
 */
function updateMobileKeyboardSections() {
    const mobileKeyboard = document.getElementById('mobileKeyboard');
    if (!mobileKeyboard) return;

    const sections = mobileKeyboard.querySelectorAll('.mobile-keyboard-section');
    sections.forEach(section => {
        const sectionCategory = section.dataset.section;
        if (sectionCategory && app.enabledCategories) {
            section.style.display = app.enabledCategories[sectionCategory] ? '' : 'none';
        }
    });
}

/**
 * Highlight the correct shortcut button for the current challenge
 */
function highlightCorrectMobileButton() {
    const mobileKeyboard = document.getElementById('mobileKeyboard');
    if (!mobileKeyboard) return;

    // Remove previous highlights
    const buttons = mobileKeyboard.querySelectorAll('.shortcut-key');
    buttons.forEach(btn => btn.classList.remove('correct-hint'));

    // Only highlight if we have a current challenge
    if (!app.currentChallenge || !app.currentChallenge.command) return;

    const challengeCommand = app.currentChallenge.command;
    if (challengeCommand.name) {
        const commandKey = COMMAND_NAME_TO_KEY[challengeCommand.name];
        if (commandKey) {
            const matchingButton = mobileKeyboard.querySelector(`[data-command="${commandKey}"]`);
            if (matchingButton) {
                matchingButton.classList.add('correct-hint');
            }
        }
    }
}

function handleMobileCommand(commandType, button) {
    if (!commandType || !MOBILE_COMMAND_ACTIONS[commandType]) return;

    // Ignore if showing results
    if (app.isShowingResults) return;

    // Start game if not started
    if (!app.hasStarted) {
        startGame();
    }

    // Add pressed visual feedback
    if (button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 150);
    }

    // Execute the command
    MOBILE_COMMAND_ACTIONS[commandType]();

    // Check if command was correct and show visual feedback on the button
    setTimeout(() => checkMobileCommand(button), 10);
}

/**
 * Check if mobile command was correct and show visual feedback on the button
 * @param {HTMLElement} button - The mobile button that was tapped
 */
function checkMobileCommand(button) {
    if (!app.currentChallenge || !app.terminal) return;

    const terminalState = app.terminal.getState();
    const validation = validateChallenge(app.currentChallenge, {
        text: terminalState.text,
        cursorPosition: terminalState.cursorPosition,
        selection: terminalState.selection ?
            [terminalState.selection.start, terminalState.selection.end] : null
    });

    if (validation.success) {
        // Command was correct
        app.game.handleCommandAttempt(true);
        showFeedback(true);

        // Show correct visual feedback on the button
        if (button) {
            button.classList.add('correct');
            setTimeout(() => button.classList.remove('correct'), 500);
        }

        // Quick transition to next challenge
        setTimeout(() => {
            loadNextChallenge();
        }, 500);
    } else {
        // Check if user actually tried a command (text or cursor changed)
        const stateChanged =
            terminalState.text !== app.currentChallenge.text ||
            terminalState.cursorPosition !== app.currentChallenge.cursorPosition ||
            terminalState.selection !== null;

        if (stateChanged) {
            // User tried but got it wrong
            app.game.handleCommandAttempt(false);
            showFeedback(false);

            // Show wrong visual feedback on the button
            if (button) {
                button.classList.add('wrong');
                setTimeout(() => button.classList.remove('wrong'), 500);
            }

            // Reset terminal to challenge state for retry
            setTimeout(() => {
                setupChallengeInTerminal(app.currentChallenge);
            }, 300);
        }
    }

    // Update stats display
    updateStatsDisplay();
}

// Application state
const app = {
    game: null,
    terminal: null,
    currentChallenge: null,
    currentThemeIndex: 0,
    enabledCategories: { navigation: true, selection: true, deletion: true }, // All enabled by default
    currentOS: 'mac', // Default OS (mac, windows, linux)
    showHints: false, // Default OFF - keys are hidden (challenge mode)
    hasStarted: false,
    isShowingResults: false,
    commandsCorrect: 0,
    commandsWrong: 0,
    currentStreak: 0,
    lastCpm: 0,
    lastAccuracy: 0,
    bestCpm: 0,
    isNewBest: false,

    // Performance history for graph
    performanceHistory: [], // [{time: elapsed seconds, cpm: current CPM, accuracy: current accuracy}, ...]

    // Tab+Enter detection: track when Tab was last pressed
    lastTabPressTime: 0,
    tabEnterWindow: 500, // ms window to detect Tab+Enter combo

    // DOM references
    dom: {}
};

/**
 * Initialize DOM references
 */
function initDOMReferences() {
    app.dom = {
        // Timer buttons
        timerButtons: document.querySelectorAll('.timer-btn'),

        // Theme toggle
        themeToggle: document.getElementById('themeToggle'),

        // Stats display
        cpmDisplay: document.getElementById('cpmDisplay'),
        accuracyDisplay: document.getElementById('accuracyDisplay'),
        timeDisplay: document.getElementById('timeDisplay'),

        // Instruction area
        commandInstruction: document.getElementById('commandInstruction'),
        keyHint: document.getElementById('keyHint'),

        // Terminal
        terminalArea: document.getElementById('terminalArea'),
        terminalText: document.getElementById('terminalText'),

        // Status message
        statusMessage: document.getElementById('statusMessage'),

        // Inline results
        resultsInline: document.getElementById('resultsInline'),
        resultCpmMain: document.getElementById('resultCpmMain'),
        resultAccMain: document.getElementById('resultAccMain'),
        resultTimeMain: document.getElementById('resultTimeMain'),
        resultsChart: document.getElementById('resultsChart'),
        resultsPb: document.getElementById('resultsPb'),
        resultInfo: document.getElementById('resultInfo'),

        // Theme picker
        themeDropdown: document.getElementById('themeDropdown'),
        themeOptions: document.querySelectorAll('.theme-option'),

        // OS selector
        osButtons: document.querySelectorAll('.os-btn'),

        // Personal best elements
        bestCpmDisplay: document.getElementById('bestCpmDisplay'),
        newBestBadge: document.getElementById('newBestBadge'),

        // Settings toggles
        settingHints: document.getElementById('settingHints'),
        settingNavigation: document.getElementById('settingNavigation'),
        settingSelection: document.getElementById('settingSelection'),
        settingDeletion: document.getElementById('settingDeletion'),

        // Terminal container
        terminalContainer: document.getElementById('terminalContainer'),

        // Instruction overlay
        instructionOverlay: document.getElementById('instructionOverlay'),

        // Replay button (in terminal)
        replayBtnTerminal: document.getElementById('replayBtn'),

        // Hints warning in results
        hintsWarning: document.getElementById('hintsWarning'),

        // Instruction keys container (for key highlighting performance)
        instructionKeys: document.querySelector('.instruction-keys'),

        // Theme picker wrapper (cached for click-outside detection)
        themePickerWrapper: document.querySelector('.theme-picker-wrapper'),

        // Mobile keyboard
        mobileKeyboard: document.getElementById('mobileKeyboard')
    };
}

/**
 * Initialize game engine
 */
function initGame() {
    app.game = new Game({ duration: TimerModes.MEDIUM });

    // Subscribe to game events
    app.game.on('timerTick', handleTimerTick);
    app.game.on('gameEnd', handleGameEnd);
    app.game.on('commandSuccess', () => {
        app.commandsCorrect++;
    });
    app.game.on('commandFail', () => {
        app.commandsWrong++;
    });
}

/**
 * Initialize terminal editor
 */
function initTerminal() {
    if (app.dom.terminalArea) {
        app.terminal = new TerminalEditor(app.dom.terminalArea);

        // Set up Enter callback for easter egg commands
        app.terminal.setEnterCallback((text) => {
            // Only process as command when game is not active
            if (!app.hasStarted && !app.isShowingResults) {
                if (text.trim()) {
                    handleEasterEggCommand();
                }
                return true; // Prevent newline insertion
            }
            return false; // Allow normal Enter behavior during game
        });

        // Listen for keyboard events on terminal
        app.dom.terminalArea.addEventListener('keydown', handleTerminalKeydown);
    }
}

/**
 * Load personal best from localStorage
 */
function loadPersonalBest() {
    const savedBest = localStorage.getItem(STORAGE_KEY_BEST_CPM);
    if (savedBest) {
        app.bestCpm = parseInt(savedBest, 10);
        updateBestCpmDisplay();
    }
}

/**
 * Update best CPM display
 */
function updateBestCpmDisplay() {
    if (app.dom.bestCpmDisplay) {
        if (app.bestCpm > 0) {
            app.dom.bestCpmDisplay.textContent = app.bestCpm;
            app.dom.bestCpmDisplay.classList.add('has-best');
        } else {
            app.dom.bestCpmDisplay.textContent = '-';
            app.dom.bestCpmDisplay.classList.remove('has-best');
        }
    }
}

/**
 * Check if using all categories (not practice mode)
 * Returns true if all categories are enabled, false if any specific category is disabled
 */
function isUsingAllCategories() {
    return areAllCategoriesEnabled();
}

/**
 * Check if score is valid for personal best
 * Returns true if hints are OFF and all categories are enabled
 */
function isValidForPersonalBest() {
    return !app.showHints && areAllCategoriesEnabled();
}

/**
 * Check and update personal best
 * Only counts toward personal best if hints are OFF and using all categories
 */
function checkPersonalBest(cpm) {
    // Don't count if hints are enabled (cheating) or filtered categories
    if (!isValidForPersonalBest()) {
        return false;
    }

    if (cpm > app.bestCpm) {
        app.bestCpm = cpm;
        app.isNewBest = true;
        localStorage.setItem(STORAGE_KEY_BEST_CPM, cpm.toString());
        updateBestCpmDisplay();
        showNewBestAnimation();
        return true;
    }
    return false;
}

/**
 * Show new best animation
 */
function showNewBestAnimation() {
    if (app.dom.newBestBadge) {
        app.dom.newBestBadge.classList.add('show');

        // Remove after a delay
        setTimeout(() => {
            app.dom.newBestBadge.classList.remove('show');
        }, 3000);
    }
}

/**
 * Load and apply saved theme from localStorage
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme && THEMES.includes(savedTheme)) {
        app.currentThemeIndex = THEMES.indexOf(savedTheme);
        applyTheme(savedTheme);
    } else {
        applyTheme(THEMES[0]);
    }
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme === 'default' ? '' : theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);

    // Update theme toggle button text
    if (app.dom.themeToggle) {
        const icon = app.dom.themeToggle.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = THEME_NAMES[theme] || 'themes';
        }
    }

    // Update active state in dropdown
    updateThemePickerActiveState(theme);
}

/**
 * Update the active state in theme picker dropdown
 */
function updateThemePickerActiveState(theme) {
    if (app.dom.themeOptions) {
        app.dom.themeOptions.forEach(option => {
            const optionTheme = option.getAttribute('data-theme');
            if (optionTheme === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
}

/**
 * Toggle theme dropdown visibility
 */
function toggleThemeDropdown() {
    const dropdown = app.dom.themeDropdown;
    const trigger = app.dom.themeToggle;

    if (!dropdown || !trigger) return;

    const isOpen = dropdown.classList.contains('open');

    if (isOpen) {
        closeThemeDropdown();
    } else {
        openThemeDropdown();
    }
}

/**
 * Open theme dropdown
 */
function openThemeDropdown() {
    const dropdown = app.dom.themeDropdown;
    const trigger = app.dom.themeToggle;

    if (!dropdown || !trigger) return;

    dropdown.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');

    // Focus first option for keyboard navigation
    const firstOption = dropdown.querySelector('.theme-option');
    if (firstOption) {
        firstOption.focus();
    }

    // Add click outside listener
    setTimeout(() => {
        document.addEventListener('click', handleClickOutsideThemePicker);
        document.addEventListener('keydown', handleThemePickerKeydown);
    }, 0);
}

/**
 * Close theme dropdown
 */
function closeThemeDropdown() {
    const dropdown = app.dom.themeDropdown;
    const trigger = app.dom.themeToggle;

    if (!dropdown || !trigger) return;

    dropdown.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');

    // Remove listeners
    document.removeEventListener('click', handleClickOutsideThemePicker);
    document.removeEventListener('keydown', handleThemePickerKeydown);
}

/**
 * Handle click outside theme picker to close it
 * Uses cached DOM reference for better performance
 */
function handleClickOutsideThemePicker(event) {
    const wrapper = app.dom.themePickerWrapper;
    if (wrapper && !wrapper.contains(event.target)) {
        closeThemeDropdown();
    }
}

/**
 * Handle keyboard navigation in theme picker
 */
function handleThemePickerKeydown(event) {
    const dropdown = app.dom.themeDropdown;
    if (!dropdown || !dropdown.classList.contains('open')) return;

    const options = Array.from(dropdown.querySelectorAll('.theme-option'));
    const currentIndex = options.findIndex(opt => opt === document.activeElement);

    switch (event.key) {
        case 'Escape':
            event.preventDefault();
            closeThemeDropdown();
            app.dom.themeToggle?.focus();
            break;

        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
            options[nextIndex]?.focus();
            break;

        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
            options[prevIndex]?.focus();
            break;

        case 'Tab':
            // Let Tab close the dropdown naturally
            closeThemeDropdown();
            break;
    }
}

/**
 * Handle theme selection from dropdown
 * Keeps dropdown open so users can preview multiple themes before deciding
 * Dropdown closes only when clicking outside or pressing Escape
 */
function selectTheme(theme) {
    if (THEMES.includes(theme)) {
        app.currentThemeIndex = THEMES.indexOf(theme);
        applyTheme(theme);
        // Don't close dropdown - let user preview multiple themes
        // Dropdown closes when clicking outside or pressing Escape
    }
}

/**
 * Cycle to next theme (kept for keyboard shortcut if needed)
 */
function cycleTheme() {
    app.currentThemeIndex = (app.currentThemeIndex + 1) % THEMES.length;
    const newTheme = THEMES[app.currentThemeIndex];
    applyTheme(newTheme);
}

/**
 * Load saved OS preference from localStorage
 */
function loadSavedOS() {
    const savedOS = localStorage.getItem(STORAGE_KEY_OS);
    if (savedOS && OS_TYPES.includes(savedOS)) {
        app.currentOS = savedOS;
    } else {
        // Auto-detect OS from user agent
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('win')) {
            app.currentOS = 'windows';
        } else if (platform.includes('linux')) {
            app.currentOS = 'linux';
        } else {
            app.currentOS = 'mac'; // Default to Mac (includes macOS)
        }
    }
    applyOS(app.currentOS);
    // Sync the OS with the challenges module
    setOS(app.currentOS);
    // Sync the OS with the terminal editor
    if (app.terminal) {
        app.terminal.setOS(app.currentOS);
    }
}

/**
 * Apply OS selection to the document
 */
function applyOS(os) {
    // Set data attribute on body for CSS styling and JS reference
    document.body.setAttribute('data-os', os);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_OS, os);

    // Update button active states
    updateOSButtonActiveState(os);

    // Update app state
    app.currentOS = os;

    // Update logo icon for the selected OS
    updateLogoForOS(os);
}

/**
 * Update logo icon based on selected OS
 */
function updateLogoForOS(os) {
    const logoIcon = document.querySelector('.logo-icon');
    if (!logoIcon) return;

    // Update logo with OS-specific icon and terminal symbol
    if (os === 'mac') {
        logoIcon.innerHTML = '<img src="mac.svg" class="logo-os-icon" alt="Mac">_';
    } else if (os === 'windows') {
        logoIcon.innerHTML = '<img src="windows.svg" class="logo-os-icon" alt="Windows">_';
    } else if (os === 'linux') {
        logoIcon.innerHTML = '<img src="linux.svg" class="logo-os-icon" alt="Linux">_';
    }
}

/**
 * Update OS button active states
 */
function updateOSButtonActiveState(os) {
    if (app.dom.osButtons) {
        app.dom.osButtons.forEach(button => {
            const buttonOS = button.getAttribute('data-os');
            if (buttonOS === os) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

/**
 * Handle OS selection
 */
function selectOS(os, button) {
    if (!OS_TYPES.includes(os)) return;

    applyOS(os);

    // Update the OS in the challenges module
    setOS(os);

    // Update the OS in the terminal editor
    if (app.terminal) {
        app.terminal.setOS(os);
    }

    // Update mobile keyboard labels for new OS
    updateMobileKeyboardLabels();

    // Reload the current challenge to show the new OS shortcuts
    if (app.currentChallenge) {
        loadFirstChallenge();
    }

    // Keep focus on terminal
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Timer mode buttons
    app.dom.timerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const duration = parseInt(button.dataset.time, 10);
            selectTimerMode(duration, button);
        });
    });

    // Theme toggle dropdown
    if (app.dom.themeToggle) {
        app.dom.themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleThemeDropdown();
        });
    }

    // Theme option selection
    if (app.dom.themeOptions) {
        app.dom.themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = option.getAttribute('data-theme');
                selectTheme(theme);
            });
        });
    }

    // Category toggles in settings
    if (app.dom.settingNavigation) {
        app.dom.settingNavigation.addEventListener('change', () => {
            setCategoryEnabled('navigation', app.dom.settingNavigation.checked);
        });
    }
    if (app.dom.settingSelection) {
        app.dom.settingSelection.addEventListener('change', () => {
            setCategoryEnabled('selection', app.dom.settingSelection.checked);
        });
    }
    if (app.dom.settingDeletion) {
        app.dom.settingDeletion.addEventListener('change', () => {
            setCategoryEnabled('deletion', app.dom.settingDeletion.checked);
        });
    }

    // OS selector buttons
    if (app.dom.osButtons) {
        app.dom.osButtons.forEach(button => {
            button.addEventListener('click', () => {
                const os = button.dataset.os;
                selectOS(os, button);
            });
        });
    }

    // Hints toggle - should instantly update display
    if (app.dom.settingHints) {
        app.dom.settingHints.addEventListener('change', () => {
            const enabled = app.dom.settingHints.checked;
            setShowHints(enabled);

            // Instantly update the current hint display with inline styles
            if (app.dom.keyHint) {
                app.dom.keyHint.classList.remove('revealed');
                if (enabled) {
                    app.dom.keyHint.classList.remove('hints-hidden');
                    app.dom.keyHint.style.filter = '';
                    app.dom.keyHint.style.opacity = '';
                    app.dom.keyHint.style.pointerEvents = '';
                } else {
                    // CRITICAL: Apply blur when hints are turned off
                    app.dom.keyHint.classList.add('hints-hidden');
                    app.dom.keyHint.style.filter = 'blur(8px)';
                    app.dom.keyHint.style.opacity = '0.2';
                    app.dom.keyHint.style.pointerEvents = 'auto';
                }
            }
        });
    }

    // Click to reveal blurred key hint (only works when hints are hidden)
    if (app.dom.keyHint) {
        app.dom.keyHint.addEventListener('click', () => {
            app.dom.keyHint.classList.add('revealed');
        });
    }

    // Replay button in terminal
    if (app.dom.replayBtnTerminal) {
        app.dom.replayBtnTerminal.addEventListener('click', () => {
            hideResultsModal();
            resetGame();
        });
    }

    // Logo click to reset
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            hideResultsModal();
            resetGame();
        });
        // Also handle keyboard activation (Enter/Space) for accessibility
        logo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hideResultsModal();
                resetGame();
            }
        });
    }

    // Global keyboard events
    document.addEventListener('keydown', handleGlobalKeydown);

    // Focus terminal on page load
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }

    // Set up terminal focus handling
    setupTerminalFocusHandling();

    // Ripple effects DISABLED - too flashy
    // setupRippleEffects();

    // Set up key press feedback
    setupKeyPressFeedback();
}

/**
 * Set up terminal focus handling for visual feedback
 */
function setupTerminalFocusHandling() {
    const terminalArea = app.dom.terminalArea;
    const terminalContainer = app.dom.terminalContainer;

    if (terminalArea && terminalContainer) {
        terminalArea.addEventListener('focus', () => {
            terminalContainer.classList.add('focused');
        });

        terminalArea.addEventListener('blur', () => {
            terminalContainer.classList.remove('focused');
        });
    }
}

/**
 * Set up ripple effect on buttons - DISABLED (too flashy)
 */
function setupRippleEffects() {
    // Ripple effects disabled - keeping app clean and minimal
}

/**
 * Create ripple effect on button click - DISABLED (too flashy)
 */
function createRipple(event) {
    // Ripple effect disabled - keeping app clean and minimal
}

/**
 * Set up key press feedback on kbd elements
 */
function setupKeyPressFeedback() {
    document.addEventListener('keydown', highlightPressedKeys);
    document.addEventListener('keyup', unhighlightPressedKeys);
}


// Key mapping for highlighting - defined once, not on every keypress
const KEY_MAP = {
    'Meta': ['Cmd', 'Command', 'Meta'],
    'Control': ['Ctrl', 'Control'],
    'Alt': ['Option', 'Alt'],
    'Shift': ['Shift'],
    'Backspace': ['Delete', 'Backspace'],
    'Delete': ['Delete', 'Fn+Delete'],
    'ArrowLeft': ['Left', 'ArrowLeft', 'left arrow'],
    'ArrowRight': ['Right', 'ArrowRight', 'right arrow'],
    'ArrowUp': ['Up', 'ArrowUp', 'up arrow'],
    'ArrowDown': ['Down', 'ArrowDown', 'down arrow'],
    'Enter': ['Enter', 'Return'],
    'Tab': ['Tab'],
    'Escape': ['Esc', 'Escape']
};

/**
 * Highlight kbd elements matching pressed keys
 * Uses cached DOM references from app.dom for better performance
 */
function highlightPressedKeys(event) {
    const keyNames = KEY_MAP[event.key] || [event.key, event.key.toUpperCase(), event.key.toLowerCase()];

    // Use cached DOM reference if available, fallback to query
    const instructionKeys = app.dom.instructionKeys;
    const keyHint = app.dom.keyHint;

    // Get kbd elements from cached parents (more efficient than querying all)
    const kbdElements = [];
    if (instructionKeys) {
        kbdElements.push(...instructionKeys.querySelectorAll('kbd'));
    }
    if (keyHint) {
        kbdElements.push(...keyHint.querySelectorAll('kbd'));
    }

    kbdElements.forEach(kbd => {
        const kbdText = kbd.textContent.trim();
        if (keyNames.some(name => kbdText.toLowerCase().includes(name.toLowerCase()))) {
            kbd.classList.add('key-pressed');
        }
    });
}

/**
 * Remove highlight from kbd elements
 * Uses cached DOM references for better performance
 */
function unhighlightPressedKeys(event) {
    // Use cached DOM reference if available
    const instructionKeys = app.dom.instructionKeys;
    const keyHint = app.dom.keyHint;

    // Get pressed kbd elements from cached parents
    const kbdElements = [];
    if (instructionKeys) {
        kbdElements.push(...instructionKeys.querySelectorAll('kbd.key-pressed'));
    }
    if (keyHint) {
        kbdElements.push(...keyHint.querySelectorAll('kbd.key-pressed'));
    }

    kbdElements.forEach(kbd => {
        kbd.classList.remove('key-pressed');
    });
}

/**
 * Handle timer mode selection
 */
function selectTimerMode(duration, button) {
    // Don't allow changes during active game
    if (app.hasStarted) return;

    // Update active button state
    app.dom.timerButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update game settings
    app.game.setDuration(duration);

    // Update display
    updateTimeDisplay(duration);
}

/**
 * Set category enabled state
 */
function setCategoryEnabled(category, enabled) {
    // Don't allow changes during active game
    if (app.hasStarted) return;

    // Update app state
    app.enabledCategories[category] = enabled;

    // Save to localStorage
    const storageKey = {
        navigation: STORAGE_KEY_CAT_NAVIGATION,
        selection: STORAGE_KEY_CAT_SELECTION,
        deletion: STORAGE_KEY_CAT_DELETION
    }[category];
    if (storageKey) {
        localStorage.setItem(storageKey, enabled ? 'true' : 'false');
    }

    // Load a new challenge with the updated categories
    loadFirstChallenge();

    // Update mobile keyboard sections visibility based on new categories
    updateMobileKeyboardSections();

    // Keep focus on terminal
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }
}

/**
 * Load saved category settings from localStorage
 */
function loadSavedCategories() {
    // Load each category setting (default to true if not set)
    const savedNavigation = localStorage.getItem(STORAGE_KEY_CAT_NAVIGATION);
    const savedSelection = localStorage.getItem(STORAGE_KEY_CAT_SELECTION);
    const savedDeletion = localStorage.getItem(STORAGE_KEY_CAT_DELETION);

    app.enabledCategories.navigation = savedNavigation !== 'false';
    app.enabledCategories.selection = savedSelection !== 'false';
    app.enabledCategories.deletion = savedDeletion !== 'false';

    // Update toggle states
    if (app.dom.settingNavigation) {
        app.dom.settingNavigation.checked = app.enabledCategories.navigation;
    }
    if (app.dom.settingSelection) {
        app.dom.settingSelection.checked = app.enabledCategories.selection;
    }
    if (app.dom.settingDeletion) {
        app.dom.settingDeletion.checked = app.enabledCategories.deletion;
    }
}

/**
 * Check if all categories are enabled (for personal best tracking)
 */
function areAllCategoriesEnabled() {
    return app.enabledCategories.navigation &&
           app.enabledCategories.selection &&
           app.enabledCategories.deletion;
}

/**
 * Load saved hints setting from localStorage
 */
function loadSavedHints() {
    const savedHints = localStorage.getItem(STORAGE_KEY_HINTS);
    // Default to false (OFF) if not set - challenge mode is default
    if (savedHints === 'true') {
        app.showHints = true;
    } else {
        app.showHints = false;
    }
    // Apply the setting
    applyHintsSetting(app.showHints);
    // Update toggle state
    if (app.dom.settingHints) {
        app.dom.settingHints.checked = app.showHints;
    }
}

/**
 * Set show hints preference
 */
function setShowHints(enabled) {
    app.showHints = enabled;
    localStorage.setItem(STORAGE_KEY_HINTS, enabled ? 'true' : 'false');
    applyHintsSetting(enabled);

    // Update mobile keyboard hint highlighting
    highlightCorrectMobileButton();

    // Keep focus on terminal
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }
}

/**
 * Apply hints setting to the UI
 * When hints are ON: keys are fully visible
 * When hints are OFF: keys are hidden (challenge mode)
 */
function applyHintsSetting(enabled) {
    // Set data attribute on body for CSS styling
    document.body.setAttribute('data-hints', enabled ? 'on' : 'off');

    // Also update the hints-hidden class on keyHint element
    if (app.dom.keyHint) {
        app.dom.keyHint.classList.remove('revealed');
        if (enabled) {
            app.dom.keyHint.classList.remove('hints-hidden');
            // Clear inline blur style when hints are enabled
            app.dom.keyHint.style.filter = '';
            app.dom.keyHint.style.opacity = '';
            app.dom.keyHint.style.pointerEvents = '';
        } else {
            // CRITICAL: Keep hints hidden with blur
            app.dom.keyHint.classList.add('hints-hidden');
            // Apply inline blur as backup (ensures blur even if CSS fails)
            app.dom.keyHint.style.filter = 'blur(8px)';
            app.dom.keyHint.style.opacity = '0.2';
            app.dom.keyHint.style.pointerEvents = 'auto'; // Allow click to reveal
        }
    }
}

/**
 * Handle global keyboard events
 */
function handleGlobalKeydown(event) {
    // Track Tab presses for Tab+Enter detection
    // Tab doesn't work as a modifier (getModifierState doesn't detect it)
    // So we track when Tab was pressed and check if Enter follows within a window
    if (event.key === 'Tab') {
        app.lastTabPressTime = Date.now();
        // Don't prevent default here - let Tab work normally for accessibility
        // But if we're in the game, prevent Tab from moving focus
        if (app.hasStarted || app.isShowingResults) {
            event.preventDefault();
        }
        return;
    }

    // Tab + Enter to restart (Enter pressed within window after Tab)
    if (event.key === 'Enter') {
        const timeSinceTab = Date.now() - app.lastTabPressTime;
        if (timeSinceTab < app.tabEnterWindow) {
            event.preventDefault();
            app.lastTabPressTime = 0; // Reset to prevent repeated triggers
            hideResultsModal();
            resetGame();
            return;
        }
    }

    // Escape to reset - works at any time
    if (event.key === 'Escape') {
        event.preventDefault();
        hideResultsModal();
        resetGame();
        return;
    }

    // If showing results, any key dismisses (except modifiers and Tab which we handle above)
    if (app.isShowingResults && !['Shift', 'Control', 'Alt', 'Meta', 'Tab'].includes(event.key)) {
        hideResultsModal();
        resetGame();
        return;
    }
}

/**
 * Handle terminal keyboard events - check for command execution
 */
function handleTerminalKeydown(event) {
    const { key, metaKey, altKey, ctrlKey, shiftKey } = event;

    // Ignore pure modifier key presses
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) {
        return;
    }

    // Start game on first shortcut if not started
    if (!app.hasStarted && !app.isShowingResults) {
        // Check if this is a valid shortcut (has modifier keys)
        if (metaKey || altKey || ctrlKey) {
            startGame();
        }
    }

    // If game is active, check the command after a short delay
    // (to let the terminal process the keypress first)
    if (app.hasStarted) {
        setTimeout(() => checkCommand(), 10);
    }
}

/**
 * Handle easter egg command execution
 * Executes the current terminal text as a fake command
 */
function handleEasterEggCommand() {
    if (!app.terminal) return;

    const currentText = app.terminal.getText();
    if (!currentText.trim()) return;

    const output = executeTerminalCommand(currentText);

    // Show the command output briefly
    showCommandOutput(output);
}

/**
 * Show command output in terminal area temporarily
 * @param {string} output - The command output to display
 */
function showCommandOutput(output) {
    if (!app.terminal) return;

    // Store original challenge
    const originalChallenge = app.currentChallenge;

    if (output === '') {
        // Clear command - just reset to challenge
        app.terminal.setText('');
        app.terminal.moveCursor(0);
        setTimeout(() => {
            if (originalChallenge) {
                setupChallengeInTerminal(originalChallenge);
            }
        }, 100);
        return;
    }

    // Show output in terminal
    app.terminal.setText(output);
    app.terminal.moveCursor(output.length);

    // After a delay, restore the challenge
    setTimeout(() => {
        if (originalChallenge && !app.hasStarted) {
            setupChallengeInTerminal(originalChallenge);
        }
    }, 2000);
}

/**
 * Check if the current command was executed correctly
 */
function checkCommand() {
    if (!app.currentChallenge || !app.terminal) return;

    const terminalState = app.terminal.getState();
    const validation = validateChallenge(app.currentChallenge, {
        text: terminalState.text,
        cursorPosition: terminalState.cursorPosition,
        selection: terminalState.selection ?
            [terminalState.selection.start, terminalState.selection.end] : null
    });

    if (validation.success) {
        // Command was correct
        app.game.handleCommandAttempt(true);
        showFeedback(true);

        // Quick transition to next challenge
        setTimeout(() => {
            loadNextChallenge();
        }, 500);
    } else {
        // Check if user actually tried a command (text or cursor changed)
        const stateChanged =
            terminalState.text !== app.currentChallenge.text ||
            terminalState.cursorPosition !== app.currentChallenge.cursorPosition ||
            terminalState.selection !== null;

        if (stateChanged) {
            // User tried but got it wrong
            app.game.handleCommandAttempt(false);
            showFeedback(false);
            // Reset terminal to challenge state for retry
            setTimeout(() => {
                setupChallengeInTerminal(app.currentChallenge);
            }, 300);
        }
    }

    // Update stats display
    updateStatsDisplay();
}

/**
 * Show visual feedback for correct/incorrect input
 */
function showFeedback(isCorrect) {
    const terminalContainer = app.dom.terminalArea?.closest('.terminal-container');

    if (isCorrect) {
        // Update streak (tracking only, no flashy display)
        app.currentStreak++;
        // Streak display disabled - too flashy
        // updateStreakDisplay();

        // Celebration animation DISABLED - too flashy
        // if (terminalContainer) {
        //     terminalContainer.classList.add('celebration-success');
        //     createParticleBurst(terminalContainer);
        //     setTimeout(() => {
        //         terminalContainer.classList.remove('celebration-success');
        //     }, 500);
        // }
    } else {
        // Reset streak on error
        app.currentStreak = 0;
        // updateStreakDisplay();
    }

    if (app.dom.terminalArea) {
        const feedbackClass = isCorrect ? 'feedback-success' : 'feedback-error';
        app.dom.terminalArea.classList.add(feedbackClass);

        setTimeout(() => {
            app.dom.terminalArea.classList.remove(feedbackClass);
        }, 200);
    }
}

/**
 * Create particle burst effect for success celebration - DISABLED (too flashy)
 */
function createParticleBurst(container) {
    // Particle effects disabled - keeping app clean and minimal
}

/**
 * Update streak display and classes - DISABLED (too flashy)
 */
function updateStreakDisplay() {
    // Streak display effects disabled - keeping app clean and minimal
    // We still track the streak internally for stats, just don't show flashy effects
}

/**
 * Record a performance data point for the graph
 */
function recordPerformancePoint() {
    if (!app.game || !app.hasStarted) return;

    const stats = app.game.getStats();
    const elapsedSeconds = Math.round(stats.elapsedTime / 1000);
    const cpm = Math.round(app.game.getCPM());
    const accuracy = Math.round(app.game.getAccuracy());

    app.performanceHistory.push({
        time: elapsedSeconds,
        cpm: cpm,
        accuracy: accuracy
    });
}

/**
 * Generate SVG performance graph
 * @param {Array} history - Array of {time, cpm, accuracy} objects
 * @param {number} duration - Total game duration in seconds
 * @returns {string} SVG markup
 */
function generatePerformanceGraph(history, duration) {
    if (!history || history.length === 0) {
        return '<div class="graph-empty">No data</div>';
    }

    const width = 400;
    const height = 80;
    const padding = { top: 10, right: 10, bottom: 20, left: 35 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Find max CPM for scaling (minimum 10 to avoid division issues)
    const maxCpm = Math.max(10, ...history.map(p => p.cpm));

    // Generate points for CPM line
    const cpmPoints = history.map((point, i) => {
        const x = padding.left + (point.time / duration) * graphWidth;
        const y = padding.top + graphHeight - (point.cpm / maxCpm) * graphHeight;
        return `${x},${y}`;
    }).join(' ');

    // Generate points for accuracy line
    const accPoints = history.map((point, i) => {
        const x = padding.left + (point.time / duration) * graphWidth;
        const y = padding.top + graphHeight - (point.accuracy / 100) * graphHeight;
        return `${x},${y}`;
    }).join(' ');

    // Y-axis labels for CPM
    const yLabels = [0, Math.round(maxCpm / 2), maxCpm];

    return `
        <svg class="perf-graph" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
            <!-- Grid lines -->
            <line class="graph-grid" x1="${padding.left}" y1="${padding.top}" x2="${padding.left + graphWidth}" y2="${padding.top}" />
            <line class="graph-grid" x1="${padding.left}" y1="${padding.top + graphHeight/2}" x2="${padding.left + graphWidth}" y2="${padding.top + graphHeight/2}" />
            <line class="graph-grid" x1="${padding.left}" y1="${padding.top + graphHeight}" x2="${padding.left + graphWidth}" y2="${padding.top + graphHeight}" />

            <!-- Y-axis labels -->
            <text class="graph-label" x="${padding.left - 5}" y="${padding.top + 4}" text-anchor="end">${yLabels[2]}</text>
            <text class="graph-label" x="${padding.left - 5}" y="${padding.top + graphHeight/2 + 4}" text-anchor="end">${yLabels[1]}</text>
            <text class="graph-label" x="${padding.left - 5}" y="${padding.top + graphHeight + 4}" text-anchor="end">${yLabels[0]}</text>

            <!-- X-axis labels -->
            <text class="graph-label" x="${padding.left}" y="${height - 2}" text-anchor="start">0s</text>
            <text class="graph-label" x="${padding.left + graphWidth}" y="${height - 2}" text-anchor="end">${duration}s</text>

            <!-- Accuracy line (secondary, behind CPM) -->
            <polyline class="graph-line-acc" points="${accPoints}" />

            <!-- CPM line (primary) -->
            <polyline class="graph-line-cpm" points="${cpmPoints}" />

            <!-- Legend -->
            <line class="graph-line-cpm" x1="${padding.left + graphWidth - 80}" y1="${padding.top + 2}" x2="${padding.left + graphWidth - 65}" y2="${padding.top + 2}" />
            <text class="graph-legend" x="${padding.left + graphWidth - 62}" y="${padding.top + 6}">cpm</text>
            <line class="graph-line-acc" x1="${padding.left + graphWidth - 40}" y1="${padding.top + 2}" x2="${padding.left + graphWidth - 25}" y2="${padding.top + 2}" />
            <text class="graph-legend" x="${padding.left + graphWidth - 22}" y="${padding.top + 6}">acc</text>
        </svg>
    `;
}

/**
 * Render the performance graph in the results modal
 */
function renderPerformanceGraph(duration) {
    if (app.dom.resultsChart) {
        app.dom.resultsChart.innerHTML = generatePerformanceGraph(app.performanceHistory, duration);
    }
}

/**
 * Start the game
 */
function startGame() {
    app.hasStarted = true;
    app.performanceHistory = []; // Reset performance history
    hideStatusMessage();

    // Remove ready state classes
    const instructionArea = document.querySelector('.instruction-area');
    const terminalContainer = app.dom.terminalArea?.closest('.terminal-container');

    if (instructionArea) {
        instructionArea.classList.remove('ready');
    }
    if (terminalContainer) {
        terminalContainer.classList.remove('ready');
    }

    app.game.start();
}

/**
 * Reset the game to initial state
 */
function resetGame() {
    app.hasStarted = false;
    app.isShowingResults = false;
    app.commandsCorrect = 0;
    app.commandsWrong = 0;
    app.currentStreak = 0;
    app.lastCpm = 0;
    app.lastAccuracy = null; // null indicates no attempts yet
    app.isNewBest = false;
    app.performanceHistory = []; // Reset performance history

    // Reset accuracy display to "-" before game starts
    if (app.dom.accuracyDisplay) {
        app.dom.accuracyDisplay.textContent = '-';
    }

    // Reset game engine
    app.game.reset();

    // Reset streak display
    updateStreakDisplay();

    // Reset timer warning classes
    const timerStat = app.dom.timeDisplay?.closest('.stat-item');
    if (timerStat) {
        timerStat.classList.remove('timer-warning', 'timer-critical');
    }

    // Show status message with ready class
    showStatusMessage('Press any shortcut to start');

    // Add ready state to instruction area and terminal
    const instructionArea = document.querySelector('.instruction-area');
    const terminalContainer = app.dom.terminalArea?.closest('.terminal-container');

    if (instructionArea) {
        instructionArea.classList.add('ready');
    }
    if (terminalContainer) {
        terminalContainer.classList.add('ready');
    }

    // Load first challenge
    loadFirstChallenge();

    // Reset stats display
    updateTimeDisplay(app.game.getTimeRemaining());
    updateStatsDisplay();

    // Focus terminal
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }
}

/**
 * Handle timer tick
 */
function handleTimerTick({ timeRemaining }) {
    updateTimeDisplay(timeRemaining);
    updateCPMDisplay();

    // Record performance data point for graph
    recordPerformancePoint();

    // Timer urgency animations
    const timerStat = app.dom.timeDisplay?.closest('.stat-item');
    if (timerStat) {
        timerStat.classList.remove('timer-warning', 'timer-critical');

        if (timeRemaining <= 3) {
            timerStat.classList.add('timer-critical');
        } else if (timeRemaining <= 5) {
            timerStat.classList.add('timer-warning');
        }
    }
}

/**
 * Handle game end
 */
function handleGameEnd(results) {
    app.hasStarted = false;
    app.isShowingResults = true;

    // Check for personal best
    const finalCpm = Math.round(results.cpm || 0);
    const isNewBest = checkPersonalBest(finalCpm);

    showResultsModal(results, isNewBest);
}

/**
 * Update time display
 */
function updateTimeDisplay(seconds) {
    if (app.dom.timeDisplay) {
        app.dom.timeDisplay.textContent = seconds;
    }
}

/**
 * Update CPM display with animation
 */
function updateCPMDisplay() {
    if (app.dom.cpmDisplay && app.game) {
        const cpm = Math.round(app.game.getCPM());
        const oldCpm = app.lastCpm || 0;

        if (cpm !== oldCpm) {
            app.lastCpm = cpm;

            // Animate the number change
            animateNumberChange(app.dom.cpmDisplay, oldCpm, cpm);
        }
    }
}

/**
 * Animate number change - SIMPLIFIED (just update directly, no dramatic animation)
 */
function animateNumberChange(element, fromValue, toValue, duration = 200) {
    if (!element) return;

    // Simply update the value - no bouncing/scaling animation
    element.textContent = toValue;
}

/**
 * Update all stats displays - SIMPLIFIED (no dramatic animations)
 */
function updateStatsDisplay() {
    updateCPMDisplay();

    if (app.dom.accuracyDisplay && app.game) {
        // Only show accuracy percentage when game has started and there are actual attempts
        const stats = app.game.getStats();
        if (app.hasStarted && stats.commandsAttempted > 0) {
            const accuracy = Math.round(app.game.getAccuracy());
            if (accuracy !== app.lastAccuracy) {
                app.lastAccuracy = accuracy;
                // Simply update the text - no animation
                app.dom.accuracyDisplay.textContent = `${accuracy}%`;
            }
        } else if (!app.hasStarted) {
            // Before game starts, show "-"
            app.dom.accuracyDisplay.textContent = '-';
        }
    }
}

/**
 * Load and display the first challenge
 */
function loadFirstChallenge() {
    app.currentChallenge = generateChallenge(null, null, app.enabledCategories, app.currentOS);
    displayChallenge(app.currentChallenge);

    // Update mobile keyboard to show relevant shortcuts and highlight correct answer
    updateMobileKeyboardSections();
}

/**
 * Load and display the next challenge
 */
function loadNextChallenge() {
    app.currentChallenge = generateChallenge(null, null, app.enabledCategories, app.currentOS);
    displayChallenge(app.currentChallenge);
}

/**
 * Display a challenge in the UI
 */
function displayChallenge(challenge) {
    if (!challenge) return;

    const instructionArea = document.querySelector('.instruction-area');

    // Add challenge enter animation
    if (instructionArea && app.hasStarted) {
        instructionArea.classList.remove('challenge-enter');
        // Force reflow to restart animation
        void instructionArea.offsetWidth;
        instructionArea.classList.add('challenge-enter');

        // Remove animation class after it completes
        setTimeout(() => {
            instructionArea.classList.remove('challenge-enter');
        }, 300);
    }

    // Update instruction text
    if (app.dom.commandInstruction) {
        app.dom.commandInstruction.textContent = challenge.instruction || '';
    }

    // Update key hint with formatted keys (simple text for overlay)
    if (app.dom.keyHint) {
        const keys = challenge.command.keys;
        app.dom.keyHint.textContent = keys.join(' + ');
        // When hints are ON: no blur, fully visible
        // When hints are OFF: add hidden class (challenge mode) with inline blur as backup
        app.dom.keyHint.classList.remove('revealed', 'blurred');
        if (!app.showHints) {
            // CRITICAL: Keep hints hidden with blur
            app.dom.keyHint.classList.add('hints-hidden');
            // Apply inline blur as backup (ensures blur even if CSS fails)
            app.dom.keyHint.style.filter = 'blur(8px)';
            app.dom.keyHint.style.opacity = '0.2';
            app.dom.keyHint.style.pointerEvents = 'auto'; // Allow click to reveal
        } else {
            app.dom.keyHint.classList.remove('hints-hidden');
            // Clear inline blur style when hints are enabled
            app.dom.keyHint.style.filter = '';
            app.dom.keyHint.style.opacity = '';
            app.dom.keyHint.style.pointerEvents = '';
        }
    }

    // Set up terminal with challenge
    setupChallengeInTerminal(challenge);

    // Highlight the correct mobile keyboard button for this challenge
    highlightCorrectMobileButton();
}

/**
 * Set up the terminal with challenge text and cursor
 */
function setupChallengeInTerminal(challenge) {
    if (app.terminal) {
        app.terminal.setState({
            text: challenge.text,
            cursorPosition: challenge.cursorPosition,
            selection: null
        });
    }
}

/**
 * Show the status message
 */
function showStatusMessage(message) {
    if (app.dom.statusMessage) {
        app.dom.statusMessage.style.display = 'block';
        app.dom.statusMessage.textContent = message;
    }
}

/**
 * Hide the status message
 */
function hideStatusMessage() {
    if (app.dom.statusMessage) {
        app.dom.statusMessage.style.display = 'none';
    }
}

/**
 * Get the display name for the current category
 */
/**
 * Get display name for enabled categories
 */
function getEnabledCategoriesDisplayName() {
    const enabled = [];
    if (app.enabledCategories.navigation) enabled.push('Navigation');
    if (app.enabledCategories.selection) enabled.push('Selection');
    if (app.enabledCategories.deletion) enabled.push('Deletion');

    if (enabled.length === 3) {
        return 'All Commands';
    } else if (enabled.length === 0) {
        return 'None'; // Shouldn't happen but fallback
    } else {
        return enabled.join(' + ');
    }
}

/**
 * Show results with final stats (inline results screen)
 */
function showResultsModal(results, isNewBest = false) {
    if (!app.dom.resultsInline) return;

    const isPracticeMode = !areAllCategoriesEnabled();
    const validForPersonalBest = isValidForPersonalBest();

    // Update final stats
    if (app.dom.resultCpmMain) {
        app.dom.resultCpmMain.textContent = Math.round(results.cpm || 0);
    }

    if (app.dom.resultAccMain) {
        app.dom.resultAccMain.textContent = `${Math.round(results.accuracy || 0)}%`;
    }

    if (app.dom.resultTimeMain) {
        app.dom.resultTimeMain.textContent = results.duration + 's';
    }

    // Show personal best indicator if new best
    if (app.dom.resultsPb) {
        if (isNewBest && validForPersonalBest) {
            app.dom.resultsPb.removeAttribute('hidden');
        } else {
            app.dom.resultsPb.setAttribute('hidden', '');
        }
    }

    // Update result info with test details
    if (app.dom.resultInfo) {
        const categoryName = getEnabledCategoriesDisplayName().toLowerCase();
        let infoText = `${results.duration}s - ${categoryName}`;
        if (!validForPersonalBest) {
            if (app.showHints && isPracticeMode) {
                infoText += ' (hints on)';
            } else if (app.showHints) {
                infoText += ' (hints on)';
            }
        }
        app.dom.resultInfo.textContent = infoText;
    }

    // Render performance graph
    renderPerformanceGraph(results.duration);

    // Show/hide hints warning
    if (app.dom.hintsWarning) {
        if (app.showHints) {
            app.dom.hintsWarning.hidden = false;
        } else {
            app.dom.hintsWarning.hidden = true;
        }
    }

    // Hide terminal and show results
    if (app.dom.terminalContainer) {
        app.dom.terminalContainer.style.display = 'none';
    }
    if (app.dom.statusMessage) {
        app.dom.statusMessage.style.display = 'none';
    }

    // Hide mobile keyboard during results
    const mobileKeyboard = document.getElementById('mobileKeyboard');
    if (mobileKeyboard) {
        mobileKeyboard.style.display = 'none';
    }

    // Show inline results
    app.dom.resultsInline.removeAttribute('hidden');
}

/**
 * Hide results and restore terminal
 */
function hideResultsModal() {
    // Hide inline results
    if (app.dom.resultsInline) {
        app.dom.resultsInline.setAttribute('hidden', '');
    }

    // Restore terminal visibility
    if (app.dom.terminalContainer) {
        app.dom.terminalContainer.style.display = '';
    }

    // Restore mobile keyboard visibility (CSS media queries will control actual display)
    const mobileKeyboard = document.getElementById('mobileKeyboard');
    if (mobileKeyboard) {
        mobileKeyboard.style.display = '';
    }

    app.isShowingResults = false;
}

/**
 * Display ASCII art easter egg in the console for developers
 */
function showConsoleEasterEgg() {
    const asciiMonkey = `
    .--.  .-"     "-.  .--.
   / .. \\/  .-. .-.  \\/ .. \\
  | |  '|  /   Y   \\  |'  | |
  | \\   \\  \\ 0 | 0 /  /   / |
   \\ '- ,\\.-"""""""-./, -' /
    ''-' /_   ^ ^   _\\ '-''
        |  \\._   _./  |
        \\   \\ '~' /   /
         '._ '-=-' _.'
            '-----'
    `;

    const keyboard = `
  +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+
  |  Q  |  W  |  E  |  R  |  T  |  Y  |  U  |  I  |  O  |  P  |
  +-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+
    |  A  |  S  |  D  |  F  |  G  |  H  |  J  |  K  |  L  |
    +-----+-----+-----+-----+-----+-----+-----+-----+-----+
      |  Z  |  X  |  C  |  V  |  B  |  N  |  M  |
      +-----+-----+-----+-----+-----+-----+-----+
  +-----------------------------------------------+
  |              SPACEBAR                         |
  +-----------------------------------------------+
    `;

    // Main ASCII art logo with monkey

    // App name with styled badge
    console.log(
        '%c monkeycmd %c Master your terminal! ',
        'background: #e2b714; color: #323437; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
        'background: #646669; color: #d1d0c5; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );

    // Keyboard art
    console.log('%c' + keyboard, 'color: #646669; font-family: monospace; font-size: 10px;');

    // Fun facts - random one shown each time
    const funFacts = [
        "The average developer saves 8 days per year by mastering keyboard shortcuts!",
        "Vim users have been known to exit their program in under 3 keystrokes... sometimes.",
        "The QWERTY layout was designed in 1873 to prevent typewriter jams, not for speed.",
        "Professional typists can reach speeds of 120+ WPM using keyboard shortcuts.",
        "The Ctrl+C and Ctrl+V shortcuts were invented by Larry Tesler in 1973.",
        "Keyboard shortcuts can reduce mouse usage by up to 60% in daily work.",
        "The average person types 41 words per minute, but shortcuts make you feel like 100.",
        "Emacs users joke that it's a great OS, just lacking a decent text editor.",
        "The first computer keyboard was invented in 1964 for the MIT Whirlwind computer.",
        "Studies show keyboard shortcuts reduce task completion time by an average of 25%."
    ];
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    console.log(
        '%c Fun Fact: %c' + randomFact,
        'color: #e2b714; font-weight: bold;',
        'color: #d1d0c5;'
    );

    // Pro tips section
    console.log('%c Pro Tips:', 'color: #e2b714; font-size: 12px; font-weight: bold; margin-top: 8px;');
    console.log('%c   - Press %cEscape%c to restart anytime', 'color: #646669;', 'color: #d1d0c5; background: #2c2e31; padding: 1px 4px; border-radius: 2px;', 'color: #646669;');
    console.log('%c   - Click the blurred hint to reveal the shortcut', 'color: #646669;');
    console.log('%c   - Build streaks for extra satisfaction!', 'color: #646669;');

    // Easter egg hint
    console.log(
        '%c Secret: %cGet a 10x streak and watch the magic happen...',
        'color: #e2b714; font-style: italic;',
        'color: #646669; font-style: italic;'
    );

    // Signature
    console.log('%c Made with love and lots of keyboard shortcuts', 'color: #2c2e31; font-size: 10px; margin-top: 8px;');
}

/**
 * Initialize the application
 */
function init() {
    initDOMReferences();
    initGame();
    initTerminal();
    loadSavedTheme();
    loadSavedOS();
    loadSavedCategories();
    loadSavedHints();
    loadPersonalBest();
    setupEventListeners();
    setupMobileKeyboard();

    // Update mobile keyboard labels for current OS
    updateMobileKeyboardLabels();

    // Set default timer mode (30 seconds)
    const defaultButton = document.querySelector('.timer-btn[data-time="30"]');
    if (defaultButton) {
        selectTimerMode(30, defaultButton);
    }

    // Load first challenge and show start prompt
    loadFirstChallenge();
    showStatusMessage('Press any shortcut to start');

    // Show console easter egg for curious developers
    showConsoleEasterEgg();

    // Remove preload class to enable transitions after initial render
    // Use requestAnimationFrame to ensure the browser has painted the initial state
    requestAnimationFrame(() => {
        document.body.classList.remove('preload');
    });

    // FINAL BLUR ENFORCEMENT: Ensure hints are properly hidden on page load
    // This runs after all initialization to guarantee blur is applied
    if (!app.showHints && app.dom.keyHint) {
        app.dom.keyHint.classList.add('hints-hidden');
        app.dom.keyHint.style.filter = 'blur(8px)';
        app.dom.keyHint.style.opacity = '0.2';
        app.dom.keyHint.style.pointerEvents = 'auto';
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing purposes
export { app, init, resetGame, cycleTheme, selectTheme, setCategoryEnabled, selectOS };
