/**
 * CommandMonkey - Main Application Controller
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
const STORAGE_KEY_THEME = 'commandmonkey-theme';
const STORAGE_KEY_CATEGORY = 'commandmonkey-category';
const STORAGE_KEY_BEST_CPM = 'commandmonkey-best-cpm';
const STORAGE_KEY_OS = 'commandmonkey-os';

// OS configuration
const OS_TYPES = ['mac', 'windows', 'linux'];

// Application state
const app = {
    game: null,
    terminal: null,
    currentChallenge: null,
    currentThemeIndex: 0,
    currentCategory: 'all', // Default category
    currentOS: 'mac', // Default OS (mac, windows, linux)
    hasStarted: false,
    isShowingResults: false,
    commandsCorrect: 0,
    commandsWrong: 0,
    currentStreak: 0,
    lastCpm: 0,
    lastAccuracy: 0,
    bestCpm: 0,
    isNewBest: false,

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

        // Results modal
        resultsModal: document.getElementById('resultsModal'),
        resultCpm: document.getElementById('resultCpm'),
        resultAccuracy: document.getElementById('resultAccuracy'),
        resultCommands: document.getElementById('resultCommands'),
        resultCorrect: document.getElementById('resultCorrect'),
        resultWrong: document.getElementById('resultWrong'),
        resultTime: document.getElementById('resultTime'),
        restartBtn: document.getElementById('restartBtn'),
        modalClose: document.getElementById('modalClose'),

        // Theme picker
        themeDropdown: document.getElementById('themeDropdown'),
        themeOptions: document.querySelectorAll('.theme-option'),

        // Category selector
        categoryButtons: document.querySelectorAll('.category-btn'),

        // OS selector
        osButtons: document.querySelectorAll('.os-btn'),

        // Personal best elements
        bestCpmDisplay: document.getElementById('bestCpmDisplay'),
        newBestBadge: document.getElementById('newBestBadge'),
        personalBestIndicator: document.getElementById('personalBestIndicator'),

        // Terminal container
        terminalContainer: document.getElementById('terminalContainer'),

        // Instruction overlay
        instructionOverlay: document.getElementById('instructionOverlay'),

        // Replay button (in terminal)
        replayBtnTerminal: document.getElementById('replayBtn')
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
 * Check and update personal best
 */
function checkPersonalBest(cpm) {
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
 */
function handleClickOutsideThemePicker(event) {
    const wrapper = document.querySelector('.theme-picker-wrapper');
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
 */
function selectTheme(theme) {
    if (THEMES.includes(theme)) {
        app.currentThemeIndex = THEMES.indexOf(theme);
        applyTheme(theme);
        closeThemeDropdown();

        // Return focus to terminal
        if (app.dom.terminalArea) {
            app.dom.terminalArea.focus();
        }
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

    // Category buttons
    if (app.dom.categoryButtons) {
        app.dom.categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                selectCategory(category, button);
            });
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

    // Click to reveal blurred key hint
    if (app.dom.keyHint) {
        app.dom.keyHint.addEventListener('click', () => {
            app.dom.keyHint.classList.add('revealed');
        });
    }

    // Restart button
    if (app.dom.restartBtn) {
        app.dom.restartBtn.addEventListener('click', () => {
            hideResultsModal();
            resetGame();
        });
    }

    // Modal close button
    if (app.dom.modalClose) {
        app.dom.modalClose.addEventListener('click', () => {
            hideResultsModal();
            resetGame();
        });
    }

    // Replay button in terminal
    if (app.dom.replayBtnTerminal) {
        app.dom.replayBtnTerminal.addEventListener('click', () => {
            hideResultsModal();
            resetGame();
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

/**
 * Highlight kbd elements matching pressed keys
 */
function highlightPressedKeys(event) {
    const keyMap = {
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

    const keyNames = keyMap[event.key] || [event.key, event.key.toUpperCase(), event.key.toLowerCase()];
    const kbdElements = document.querySelectorAll('.instruction-keys kbd, .key-hint kbd');

    kbdElements.forEach(kbd => {
        const kbdText = kbd.textContent.trim();
        if (keyNames.some(name => kbdText.toLowerCase().includes(name.toLowerCase()))) {
            kbd.classList.add('key-pressed');
        }
    });
}

/**
 * Remove highlight from kbd elements
 */
function unhighlightPressedKeys(event) {
    const kbdElements = document.querySelectorAll('.instruction-keys kbd.key-pressed, .key-hint kbd.key-pressed');
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
 * Handle category selection
 */
function selectCategory(category, button) {
    // Don't allow changes during active game
    if (app.hasStarted) return;

    // Update active button state
    app.dom.categoryButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update app state
    app.currentCategory = category;

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY_CATEGORY, category);

    // Load a new challenge with the selected category
    loadFirstChallenge();

    // Keep focus on terminal
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }
}

/**
 * Load saved category from localStorage
 */
function loadSavedCategory() {
    const savedCategory = localStorage.getItem(STORAGE_KEY_CATEGORY);
    if (savedCategory) {
        app.currentCategory = savedCategory;
        // Update button state
        app.dom.categoryButtons.forEach(btn => {
            if (btn.dataset.category === savedCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
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

        // Delay before next challenge so user can see what happened
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
 * Start the game
 */
function startGame() {
    app.hasStarted = true;
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
    app.lastAccuracy = 100;
    app.isNewBest = false;

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
        const accuracy = Math.round(app.game.getAccuracy());
        const oldAccuracy = app.lastAccuracy || 100;

        if (accuracy !== oldAccuracy) {
            app.lastAccuracy = accuracy;
            // Simply update the text - no animation
            app.dom.accuracyDisplay.textContent = `${accuracy}%`;
        }
    }
}

/**
 * Load and display the first challenge
 */
function loadFirstChallenge() {
    app.currentChallenge = generateChallenge(null, null, app.currentCategory, app.currentOS);
    displayChallenge(app.currentChallenge);
}

/**
 * Load and display the next challenge
 */
function loadNextChallenge() {
    app.currentChallenge = generateChallenge(null, null, app.currentCategory, app.currentOS);
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
        // Reset to blurred state for each new challenge
        app.dom.keyHint.classList.remove('revealed');
        app.dom.keyHint.classList.add('blurred');
    }

    // Set up terminal with challenge
    setupChallengeInTerminal(challenge);
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
 * Show results modal with final stats
 */
function showResultsModal(results, isNewBest = false) {
    if (!app.dom.resultsModal) return;

    // Update final stats
    if (app.dom.resultCpm) {
        app.dom.resultCpm.textContent = Math.round(results.cpm || 0);
    }

    // Show personal best indicator if new best
    if (app.dom.personalBestIndicator) {
        if (isNewBest) {
            app.dom.personalBestIndicator.classList.add('show');
        } else {
            app.dom.personalBestIndicator.classList.remove('show');
        }
    }

    if (app.dom.resultAccuracy) {
        app.dom.resultAccuracy.textContent = `${Math.round(results.accuracy || 0)}%`;
    }

    if (app.dom.resultCommands) {
        app.dom.resultCommands.textContent = results.commandsCompleted || 0;
    }

    if (app.dom.resultCorrect) {
        app.dom.resultCorrect.textContent = app.commandsCorrect || 0;
    }

    if (app.dom.resultWrong) {
        app.dom.resultWrong.textContent = app.commandsWrong || 0;
    }

    if (app.dom.resultTime) {
        app.dom.resultTime.textContent = `${results.duration}s`;
    }

    // Show modal
    app.dom.resultsModal.removeAttribute('hidden');
    app.dom.resultsModal.classList.add('active');
}

/**
 * Hide results modal with closing animation
 */
function hideResultsModal() {
    if (app.dom.resultsModal) {
        // Add closing animation class
        app.dom.resultsModal.classList.add('closing');
        app.dom.resultsModal.classList.remove('active');

        // Wait for animation to complete before hiding
        setTimeout(() => {
            app.dom.resultsModal.setAttribute('hidden', '');
            app.dom.resultsModal.classList.remove('closing');
        }, 200);
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
    console.log('%c' + asciiMonkey, 'color: #e2b714; font-family: monospace; font-size: 12px;');

    // App name with styled badge
    console.log(
        '%c CommandMonkey %c Master your keyboard shortcuts! ',
        'background: #e2b714; color: #323437; font-size: 16px; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
        'background: #646669; color: #d1d0c5; font-size: 14px; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );

    // Keyboard art
    console.log('%c' + keyboard, 'color: #646669; font-family: monospace; font-size: 10px;');

    // Fun fact
    console.log(
        '%c Fun Fact: %cThe average developer saves 8 days per year by mastering keyboard shortcuts!',
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
    loadSavedCategory();
    loadPersonalBest();
    setupEventListeners();

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
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing purposes
export { app, init, resetGame, cycleTheme, selectTheme, selectCategory, selectOS };
