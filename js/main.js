/**
 * CommandMonkey - Main Application Controller
 * Wires together game engine, challenges, terminal, and UI
 */

import { Game, TimerModes } from './game.js';
import { generateChallenge, validateChallenge, formatKeyCombination } from './challenges.js';
import { TerminalEditor } from './terminal.js';

// Theme configuration - matches CSS data-theme values
const THEMES = ['default', 'dracula', 'nord', 'matrix'];
const THEME_NAMES = {
    default: 'Dark',
    dracula: 'Dracula',
    nord: 'Nord',
    matrix: 'Matrix'
};
const STORAGE_KEY_THEME = 'commandmonkey-theme';

// Application state
const app = {
    game: null,
    terminal: null,
    currentChallenge: null,
    currentThemeIndex: 0,
    hasStarted: false,
    isShowingResults: false,
    commandsCorrect: 0,
    commandsWrong: 0,

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

        // Theme modal
        themeModal: document.getElementById('themeModal'),
        themeGrid: document.getElementById('themeGrid'),
        themeModalClose: document.getElementById('themeModalClose')
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
}

/**
 * Cycle to next theme
 */
function cycleTheme() {
    app.currentThemeIndex = (app.currentThemeIndex + 1) % THEMES.length;
    const newTheme = THEMES[app.currentThemeIndex];
    applyTheme(newTheme);
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

    // Theme toggle
    if (app.dom.themeToggle) {
        app.dom.themeToggle.addEventListener('click', cycleTheme);
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

    // Global keyboard events
    document.addEventListener('keydown', handleGlobalKeydown);

    // Focus terminal on page load
    if (app.dom.terminalArea) {
        app.dom.terminalArea.focus();
    }
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
 * Handle global keyboard events
 */
function handleGlobalKeydown(event) {
    // Tab + Enter to restart
    if (event.key === 'Enter' && event.getModifierState('Tab')) {
        event.preventDefault();
        hideResultsModal();
        resetGame();
        return;
    }

    // Escape to reset
    if (event.key === 'Escape') {
        event.preventDefault();
        hideResultsModal();
        resetGame();
        return;
    }

    // If showing results, any key dismisses
    if (app.isShowingResults && !['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
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
        loadNextChallenge();
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
    if (app.dom.terminalArea) {
        const feedbackClass = isCorrect ? 'feedback-success' : 'feedback-error';
        app.dom.terminalArea.classList.add(feedbackClass);

        setTimeout(() => {
            app.dom.terminalArea.classList.remove(feedbackClass);
        }, 200);
    }
}

/**
 * Start the game
 */
function startGame() {
    app.hasStarted = true;
    hideStatusMessage();
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

    // Reset game engine
    app.game.reset();

    // Show status message
    showStatusMessage('Press any shortcut to start');

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
}

/**
 * Handle game end
 */
function handleGameEnd(results) {
    app.hasStarted = false;
    app.isShowingResults = true;
    showResultsModal(results);
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
 * Update CPM display
 */
function updateCPMDisplay() {
    if (app.dom.cpmDisplay && app.game) {
        const cpm = app.game.getCPM();
        app.dom.cpmDisplay.textContent = Math.round(cpm);
    }
}

/**
 * Update all stats displays
 */
function updateStatsDisplay() {
    updateCPMDisplay();

    if (app.dom.accuracyDisplay && app.game) {
        const accuracy = app.game.getAccuracy();
        app.dom.accuracyDisplay.textContent = `${Math.round(accuracy)}%`;
    }
}

/**
 * Load and display the first challenge
 */
function loadFirstChallenge() {
    app.currentChallenge = generateChallenge();
    displayChallenge(app.currentChallenge);
}

/**
 * Load and display the next challenge
 */
function loadNextChallenge() {
    app.currentChallenge = generateChallenge();
    displayChallenge(app.currentChallenge);
}

/**
 * Display a challenge in the UI
 */
function displayChallenge(challenge) {
    if (!challenge) return;

    // Update instruction text
    if (app.dom.commandInstruction) {
        app.dom.commandInstruction.textContent = challenge.instruction || '';
    }

    // Update key hint with formatted keys
    if (app.dom.keyHint) {
        const keys = challenge.command.keys;
        app.dom.keyHint.innerHTML = keys.map(key => `<kbd>${key}</kbd>`).join(' + ');
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
function showResultsModal(results) {
    if (!app.dom.resultsModal) return;

    // Update final stats
    if (app.dom.resultCpm) {
        app.dom.resultCpm.textContent = Math.round(results.cpm || 0);
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
 * Hide results modal
 */
function hideResultsModal() {
    if (app.dom.resultsModal) {
        app.dom.resultsModal.setAttribute('hidden', '');
        app.dom.resultsModal.classList.remove('active');
    }
    app.isShowingResults = false;
}

/**
 * Initialize the application
 */
function init() {
    initDOMReferences();
    initGame();
    initTerminal();
    loadSavedTheme();
    setupEventListeners();

    // Set default timer mode (30 seconds)
    const defaultButton = document.querySelector('.timer-btn[data-time="30"]');
    if (defaultButton) {
        selectTimerMode(30, defaultButton);
    }

    // Load first challenge and show start prompt
    loadFirstChallenge();
    showStatusMessage('Press any shortcut to start');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing purposes
export { app, init, resetGame, cycleTheme };
