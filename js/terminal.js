/**
 * Terminal Text Editor Simulator
 * A text input simulation with cursor, selection, and keyboard shortcut handling
 * Supports macOS, Windows, and Linux keyboard shortcuts
 */

/**
 * Detect the current operating system
 * @returns {'mac' | 'windows' | 'linux'} The detected OS
 */
function detectOS() {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();

    if (platform.includes('mac') || userAgent.includes('mac')) {
        return 'mac';
    } else if (platform.includes('win') || userAgent.includes('win')) {
        return 'windows';
    } else {
        return 'linux';
    }
}

export class TerminalEditor {
    constructor(containerElement) {
        if (!containerElement) {
            throw new Error('TerminalEditor requires a container element');
        }

        this.container = containerElement;
        this.text = '';
        this.cursorPosition = 0;
        this.selection = null; // { start: number, end: number } or null
        this.os = detectOS(); // Detect OS for proper shortcut handling

        this._setupDOM();
        this._setupEventListeners();
    }

    /**
     * Set up the DOM structure for the terminal
     */
    _setupDOM() {
        this.container.classList.add('terminal-editor');

        // Ensure tabindex for keyboard focus
        if (!this.container.hasAttribute('tabindex')) {
            this.container.setAttribute('tabindex', '0');
        }

        // Use existing element as display or create one
        this.displayElement = this.container.querySelector('.terminal-display');
        if (!this.displayElement) {
            // Check if container itself should be the display
            if (this.container.id === 'terminalArea' || this.container.classList.contains('terminal-text')) {
                this.displayElement = this.container;
            } else {
                this.displayElement = document.createElement('div');
                this.displayElement.classList.add('terminal-display');
                this.container.appendChild(this.displayElement);
            }
        }

        // Initial render
        this.render();
    }

    /**
     * Set up keyboard event listeners
     */
    _setupEventListeners() {
        this.container.addEventListener('keydown', (e) => this._handleKeyDown(e));

        // Focus handling for cursor visibility
        this.container.addEventListener('focus', () => {
            this.container.classList.add('focused');
        });

        this.container.addEventListener('blur', () => {
            this.container.classList.remove('focused');
        });
    }

    /**
     * Handle keydown events
     * Supports both Mac and Windows/Linux keyboard shortcuts
     */
    _handleKeyDown(e) {
        const { key, metaKey, altKey, ctrlKey, shiftKey } = e;
        const isMac = this.os === 'mac';
        const isWindows = this.os === 'windows';
        const isLinux = this.os === 'linux';

        // Determine if we should handle this key combination
        let handled = false;

        // Navigation keys
        if (key === 'ArrowLeft') {
            if (isMac && metaKey && shiftKey) {
                // Mac: Command + Shift + Left: Select to line start
                this.selectToLineStart();
                handled = true;
            } else if (isMac && metaKey) {
                // Mac: Command + Left: Move to line start
                this.moveToLineStart();
                handled = true;
            } else if (isMac && altKey && shiftKey) {
                // Mac: Option + Shift + Left: Select by word
                this.selectByWord('left');
                handled = true;
            } else if (isMac && altKey) {
                // Mac: Option + Left: Move by word
                this.moveByWord('left');
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey && shiftKey) {
                // Windows/Linux: Ctrl + Shift + Left: Select by word
                this.selectByWord('left');
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey) {
                // Windows/Linux: Ctrl + Left: Move by word
                this.moveByWord('left');
                handled = true;
            } else if (shiftKey) {
                // Shift + Left: Extend selection left
                this._extendSelection('left');
                handled = true;
            } else {
                // Plain left arrow
                this._moveCursorLeft();
                handled = true;
            }
        } else if (key === 'ArrowRight') {
            if (isMac && metaKey && shiftKey) {
                // Mac: Command + Shift + Right: Select to line end
                this.selectToLineEnd();
                handled = true;
            } else if (isMac && metaKey) {
                // Mac: Command + Right: Move to line end
                this.moveToLineEnd();
                handled = true;
            } else if (isMac && altKey && shiftKey) {
                // Mac: Option + Shift + Right: Select by word
                this.selectByWord('right');
                handled = true;
            } else if (isMac && altKey) {
                // Mac: Option + Right: Move by word
                this.moveByWord('right');
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey && shiftKey) {
                // Windows/Linux: Ctrl + Shift + Right: Select by word
                this.selectByWord('right');
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey) {
                // Windows/Linux: Ctrl + Right: Move by word
                this.moveByWord('right');
                handled = true;
            } else if (shiftKey) {
                // Shift + Right: Extend selection right
                this._extendSelection('right');
                handled = true;
            } else {
                // Plain right arrow
                this._moveCursorRight();
                handled = true;
            }
        } else if (key === 'Backspace') {
            if (isMac && metaKey) {
                // Mac: Command + Backspace: Delete to line start
                this.deleteToLineStart();
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey && shiftKey) {
                // Windows/Linux: Ctrl + Shift + Backspace: Delete to line start
                this.deleteToLineStart();
                handled = true;
            } else if (isMac && altKey) {
                // Mac: Option + Backspace: Delete word backward
                this.deleteWord();
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey) {
                // Windows/Linux: Ctrl + Backspace: Delete word backward
                this.deleteWord();
                handled = true;
            } else {
                // Regular backspace
                this._deleteCharacter('backward');
                handled = true;
            }
        } else if (key === 'Delete') {
            if ((isWindows || isLinux) && ctrlKey && shiftKey) {
                // Windows/Linux: Ctrl + Shift + Delete: Delete to line end
                this.deleteToLineEnd();
                handled = true;
            } else if (isMac && altKey) {
                // Mac: Option + Delete (Fn+Backspace): Delete word forward
                this.deleteWordForward();
                handled = true;
            } else if ((isWindows || isLinux) && ctrlKey) {
                // Windows/Linux: Ctrl + Delete: Delete word forward
                this.deleteWordForward();
                handled = true;
            } else {
                // Regular delete
                this._deleteCharacter('forward');
                handled = true;
            }
        } else if (key === 'Home') {
            if (shiftKey) {
                this.selectToLineStart();
            } else {
                this.moveToLineStart();
            }
            handled = true;
        } else if (key === 'End') {
            if (shiftKey) {
                this.selectToLineEnd();
            } else {
                this.moveToLineEnd();
            }
            handled = true;
        } else if (key.length === 1 && !metaKey && !ctrlKey) {
            // Regular character input
            this._insertCharacter(key);
            handled = true;
        } else if (key === 'Enter') {
            this._insertCharacter('\n');
            handled = true;
        } else if (ctrlKey && key.toLowerCase() === 'a') {
            if (isMac || isLinux) {
                // Mac/Linux: Control + A: Move to line start (terminal/Emacs style)
                this.moveToLineStart();
                handled = true;
            } else if (isWindows) {
                // Windows: Ctrl + A: Select all
                this.selectAll();
                handled = true;
            }
        } else if (ctrlKey && key.toLowerCase() === 'e') {
            // Control + E: Move to line end (terminal/Emacs style) - Mac/Linux only
            if (isMac || isLinux) {
                this.moveToLineEnd();
                handled = true;
            }
        } else if (ctrlKey && key.toLowerCase() === 'w') {
            // Control + W: Delete previous word (terminal style) - all platforms
            this.deleteWord();
            handled = true;
        } else if (ctrlKey && key.toLowerCase() === 'd') {
            // Control + D: Forward delete (terminal style)
            if (isMac || isLinux) {
                this._deleteCharacter('forward');
                handled = true;
            }
        } else if (ctrlKey && key.toLowerCase() === 'f') {
            // Control + F: Move forward one character (terminal/Emacs style) - Mac/Linux only
            if (isMac || isLinux) {
                this._moveCursorRight();
                handled = true;
            }
        } else if (ctrlKey && key.toLowerCase() === 'b') {
            // Control + B: Move backward one character (terminal/Emacs style) - Mac/Linux only
            if (isMac || isLinux) {
                this._moveCursorLeft();
                handled = true;
            }
        } else if (ctrlKey && key.toLowerCase() === 'k') {
            // Control + K: Kill to end of line (terminal/Emacs style) - all platforms
            this.deleteToLineEnd();
            handled = true;
        } else if (ctrlKey && key.toLowerCase() === 'u') {
            // Control + U: Kill to start of line (terminal style) - all platforms
            this.deleteToLineStart();
            handled = true;
        } else if (isMac && metaKey && key.toLowerCase() === 'a') {
            // Mac: Command + A: Select all
            this.selectAll();
            handled = true;
        } else if ((isLinux) && altKey && key.toLowerCase() === 'd') {
            // Linux: Alt + D: Delete word forward (bash style)
            this.deleteWordForward();
            handled = true;
        } else if (isLinux && altKey && key === 'Backspace') {
            // Linux: Alt + Backspace: Delete word backward
            this.deleteWord();
            handled = true;
        }

        if (handled) {
            e.preventDefault();
            e.stopPropagation();
            this.render();
        }
    }

    /**
     * Set the text content
     */
    setText(text) {
        this.text = text;
        this.cursorPosition = Math.min(this.cursorPosition, text.length);
        this.selection = null;
        this.render();
    }

    /**
     * Get the current text content
     */
    getText() {
        return this.text;
    }

    /**
     * Set cursor position
     */
    moveCursor(position) {
        this.cursorPosition = Math.max(0, Math.min(position, this.text.length));
        this.selection = null;
        this.render();
    }

    /**
     * Move cursor by word
     */
    moveByWord(direction) {
        const newPosition = this._findWordBoundary(this.cursorPosition, direction);
        this.cursorPosition = newPosition;
        this.selection = null;
        this.render();
    }

    /**
     * Move cursor to line start (or text start for single-line content)
     */
    moveToLineStart() {
        const lineStart = this._findLineStart(this.cursorPosition);
        this.cursorPosition = lineStart;
        this.selection = null;
        this.render();
    }

    /**
     * Move cursor to line end (or text end for single-line content)
     */
    moveToLineEnd() {
        const lineEnd = this._findLineEnd(this.cursorPosition);
        this.cursorPosition = lineEnd;
        this.selection = null;
        this.render();
    }

    /**
     * Select by word
     */
    selectByWord(direction) {
        const anchorPos = this.selection ? this.selection.anchor : this.cursorPosition;
        const newPosition = this._findWordBoundary(this.cursorPosition, direction);

        this.cursorPosition = newPosition;
        this._updateSelection(anchorPos, newPosition);
        this.render();
    }

    /**
     * Select to line start
     */
    selectToLineStart() {
        const anchorPos = this.selection ? this.selection.anchor : this.cursorPosition;
        const lineStart = this._findLineStart(this.cursorPosition);

        this.cursorPosition = lineStart;
        this._updateSelection(anchorPos, lineStart);
        this.render();
    }

    /**
     * Select to line end
     */
    selectToLineEnd() {
        const anchorPos = this.selection ? this.selection.anchor : this.cursorPosition;
        const lineEnd = this._findLineEnd(this.cursorPosition);

        this.cursorPosition = lineEnd;
        this._updateSelection(anchorPos, lineEnd);
        this.render();
    }

    /**
     * Delete word before cursor
     */
    deleteWord() {
        if (this.selection) {
            this._deleteSelection();
        } else {
            const wordStart = this._findWordBoundary(this.cursorPosition, 'left');
            this.text = this.text.slice(0, wordStart) + this.text.slice(this.cursorPosition);
            this.cursorPosition = wordStart;
        }
        this.render();
    }

    /**
     * Delete from cursor to line start
     */
    deleteToLineStart() {
        if (this.selection) {
            this._deleteSelection();
        } else {
            const lineStart = this._findLineStart(this.cursorPosition);
            this.text = this.text.slice(0, lineStart) + this.text.slice(this.cursorPosition);
            this.cursorPosition = lineStart;
        }
        this.render();
    }

    /**
     * Delete from cursor to line end
     */
    deleteToLineEnd() {
        if (this.selection) {
            this._deleteSelection();
        } else {
            const lineEnd = this._findLineEnd(this.cursorPosition);
            this.text = this.text.slice(0, this.cursorPosition) + this.text.slice(lineEnd);
            // Cursor stays at current position
        }
        this.render();
    }

    /**
     * Delete word after cursor (forward word delete)
     */
    deleteWordForward() {
        if (this.selection) {
            this._deleteSelection();
        } else {
            const wordEnd = this._findWordBoundary(this.cursorPosition, 'right');
            this.text = this.text.slice(0, this.cursorPosition) + this.text.slice(wordEnd);
            // Cursor stays at current position
        }
        this.render();
    }

    /**
     * Select all text
     */
    selectAll() {
        if (this.text.length === 0) {
            this.selection = null;
        } else {
            this.selection = {
                start: 0,
                end: this.text.length,
                anchor: 0
            };
            this.cursorPosition = this.text.length;
        }
        this.render();
    }

    /**
     * Get current state for validation
     */
    getState() {
        return {
            text: this.text,
            cursorPosition: this.cursorPosition,
            selection: this.selection ? {
                start: this.selection.start,
                end: this.selection.end
            } : null
        };
    }

    /**
     * Set state programmatically
     */
    setState(state) {
        if (state.text !== undefined) {
            this.text = state.text;
        }
        if (state.cursorPosition !== undefined) {
            this.cursorPosition = Math.max(0, Math.min(state.cursorPosition, this.text.length));
        }
        if (state.selection !== undefined) {
            if (state.selection) {
                this.selection = {
                    start: state.selection.start,
                    end: state.selection.end,
                    anchor: state.selection.anchor || state.selection.start
                };
            } else {
                this.selection = null;
            }
        }
        this.render();
    }

    /**
     * Compare current state to expected state
     */
    compareState(expectedState) {
        const current = this.getState();
        const result = {
            matches: true,
            differences: []
        };

        // Compare text
        if (expectedState.text !== undefined && current.text !== expectedState.text) {
            result.matches = false;
            result.differences.push({
                field: 'text',
                expected: expectedState.text,
                actual: current.text
            });
        }

        // Compare cursor position
        if (expectedState.cursorPosition !== undefined &&
            current.cursorPosition !== expectedState.cursorPosition) {
            result.matches = false;
            result.differences.push({
                field: 'cursorPosition',
                expected: expectedState.cursorPosition,
                actual: current.cursorPosition
            });
        }

        // Compare selection
        if (expectedState.selection !== undefined) {
            const selectionMatches = this._compareSelections(current.selection, expectedState.selection);
            if (!selectionMatches) {
                result.matches = false;
                result.differences.push({
                    field: 'selection',
                    expected: expectedState.selection,
                    actual: current.selection
                });
            }
        }

        return result;
    }

    /**
     * Render the terminal display
     */
    render() {
        let html = '';

        if (this.selection && this.selection.start !== this.selection.end) {
            // Render with selection
            const selStart = Math.min(this.selection.start, this.selection.end);
            const selEnd = Math.max(this.selection.start, this.selection.end);

            const beforeSelection = this._escapeHtml(this.text.slice(0, selStart));
            const selectedText = this._escapeHtml(this.text.slice(selStart, selEnd));
            const afterSelection = this._escapeHtml(this.text.slice(selEnd));

            // Determine cursor position within the selection context
            if (this.cursorPosition <= selStart) {
                // Cursor before selection
                const beforeCursor = this._escapeHtml(this.text.slice(0, this.cursorPosition));
                const cursorToSelStart = this._escapeHtml(this.text.slice(this.cursorPosition, selStart));
                html = `${beforeCursor}<span class="cursor"></span>${cursorToSelStart}<span class="selection">${selectedText}</span>${afterSelection}`;
            } else if (this.cursorPosition >= selEnd) {
                // Cursor after selection
                const afterSelToCursor = this._escapeHtml(this.text.slice(selEnd, this.cursorPosition));
                const afterCursor = this._escapeHtml(this.text.slice(this.cursorPosition));
                html = `${beforeSelection}<span class="selection">${selectedText}</span>${afterSelToCursor}<span class="cursor"></span>${afterCursor}`;
            } else {
                // Cursor within selection (at start or end based on anchor)
                html = `${beforeSelection}<span class="selection">${selectedText}</span>${afterSelection}`;
                // Add cursor at its position
                if (this.cursorPosition === selStart) {
                    html = `${beforeSelection}<span class="cursor"></span><span class="selection">${selectedText}</span>${afterSelection}`;
                } else {
                    html = `${beforeSelection}<span class="selection">${selectedText}</span><span class="cursor"></span>${afterSelection}`;
                }
            }
        } else {
            // Render without selection (just cursor)
            const beforeCursor = this._escapeHtml(this.text.slice(0, this.cursorPosition));
            const cursorChar = this.text[this.cursorPosition];
            const afterCursor = this._escapeHtml(this.text.slice(this.cursorPosition + 1));

            if (cursorChar !== undefined) {
                const escapedCursorChar = this._escapeHtml(cursorChar);
                html = `${beforeCursor}<span class="cursor">${escapedCursorChar}</span>${afterCursor}`;
            } else {
                // Cursor at end of text
                html = `${beforeCursor}<span class="cursor">&nbsp;</span>`;
            }
        }

        // Handle empty text
        if (this.text === '' && !this.selection) {
            html = '<span class="cursor">&nbsp;</span>';
        }

        // Replace newlines with line breaks for display
        html = html.replace(/\n/g, '<br>');

        this.displayElement.innerHTML = html;
    }

    /**
     * Focus the terminal
     */
    focus() {
        this.container.focus();
    }

    /**
     * Blur the terminal
     */
    blur() {
        this.container.blur();
    }

    /**
     * Get the current OS setting
     * @returns {'mac' | 'windows' | 'linux'} Current OS
     */
    getOS() {
        return this.os;
    }

    /**
     * Set the OS for keyboard shortcuts (useful for testing)
     * @param {'mac' | 'windows' | 'linux'} os - The OS to use
     */
    setOS(os) {
        if (['mac', 'windows', 'linux'].includes(os)) {
            this.os = os;
        }
    }

    // ========== Private Helper Methods ==========

    /**
     * Find word boundary in given direction
     * Uses whitespace-based word boundaries to match standard text editor behavior
     */
    _findWordBoundary(position, direction) {
        if (direction === 'left') {
            if (position === 0) return 0;

            let pos = position - 1;

            // Skip any whitespace first
            while (pos > 0 && /\s/.test(this.text[pos])) {
                pos--;
            }

            // Then find the start of the word (go back until whitespace or start)
            while (pos > 0 && /\S/.test(this.text[pos - 1])) {
                pos--;
            }

            return pos;
        } else {
            if (position >= this.text.length) return this.text.length;

            let pos = position;

            // Skip current word characters first (non-whitespace)
            while (pos < this.text.length && /\S/.test(this.text[pos])) {
                pos++;
            }

            // Then skip any whitespace
            while (pos < this.text.length && /\s/.test(this.text[pos])) {
                pos++;
            }

            return pos;
        }
    }

    /**
     * Find start of current line
     */
    _findLineStart(position) {
        let pos = position;
        while (pos > 0 && this.text[pos - 1] !== '\n') {
            pos--;
        }
        return pos;
    }

    /**
     * Find end of current line
     */
    _findLineEnd(position) {
        let pos = position;
        while (pos < this.text.length && this.text[pos] !== '\n') {
            pos++;
        }
        return pos;
    }

    /**
     * Move cursor left by one character
     */
    _moveCursorLeft() {
        if (this.selection) {
            // Move to start of selection
            this.cursorPosition = Math.min(this.selection.start, this.selection.end);
            this.selection = null;
        } else if (this.cursorPosition > 0) {
            this.cursorPosition--;
        }
    }

    /**
     * Move cursor right by one character
     */
    _moveCursorRight() {
        if (this.selection) {
            // Move to end of selection
            this.cursorPosition = Math.max(this.selection.start, this.selection.end);
            this.selection = null;
        } else if (this.cursorPosition < this.text.length) {
            this.cursorPosition++;
        }
    }

    /**
     * Extend selection in given direction
     */
    _extendSelection(direction) {
        const anchorPos = this.selection ? this.selection.anchor : this.cursorPosition;

        if (direction === 'left' && this.cursorPosition > 0) {
            this.cursorPosition--;
        } else if (direction === 'right' && this.cursorPosition < this.text.length) {
            this.cursorPosition++;
        }

        this._updateSelection(anchorPos, this.cursorPosition);
    }

    /**
     * Update selection based on anchor and current position
     */
    _updateSelection(anchor, current) {
        if (anchor === current) {
            this.selection = null;
        } else {
            this.selection = {
                start: Math.min(anchor, current),
                end: Math.max(anchor, current),
                anchor: anchor
            };
        }
    }

    /**
     * Insert a character at cursor position
     */
    _insertCharacter(char) {
        if (this.selection) {
            this._deleteSelection();
        }

        this.text = this.text.slice(0, this.cursorPosition) + char + this.text.slice(this.cursorPosition);
        this.cursorPosition++;
    }

    /**
     * Delete a character
     */
    _deleteCharacter(direction) {
        if (this.selection) {
            this._deleteSelection();
            return;
        }

        if (direction === 'backward' && this.cursorPosition > 0) {
            this.text = this.text.slice(0, this.cursorPosition - 1) + this.text.slice(this.cursorPosition);
            this.cursorPosition--;
        } else if (direction === 'forward' && this.cursorPosition < this.text.length) {
            this.text = this.text.slice(0, this.cursorPosition) + this.text.slice(this.cursorPosition + 1);
        }
    }

    /**
     * Delete selected text
     */
    _deleteSelection() {
        if (!this.selection) return;

        const start = Math.min(this.selection.start, this.selection.end);
        const end = Math.max(this.selection.start, this.selection.end);

        this.text = this.text.slice(0, start) + this.text.slice(end);
        this.cursorPosition = start;
        this.selection = null;
    }

    /**
     * Compare two selection objects
     */
    _compareSelections(sel1, sel2) {
        if (sel1 === null && sel2 === null) return true;
        if (sel1 === null || sel2 === null) return false;
        return sel1.start === sel2.start && sel1.end === sel2.end;
    }

    /**
     * Escape HTML special characters
     */
    _escapeHtml(text) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, char => escapeMap[char]);
    }
}

/**
 * CSS styles for the terminal editor
 * Call this function to inject default styles if not using external CSS
 */
export function injectTerminalStyles() {
    if (document.getElementById('terminal-editor-styles')) {
        return; // Already injected
    }

    const styles = document.createElement('style');
    styles.id = 'terminal-editor-styles';
    styles.textContent = `
        .terminal-editor {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
            font-size: 14px;
            line-height: 1.5;
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 12px;
            border-radius: 4px;
            min-height: 100px;
            white-space: pre-wrap;
            word-wrap: break-word;
            outline: none;
            border: 2px solid transparent;
            transition: border-color 0.2s;
        }

        .terminal-editor:focus,
        .terminal-editor.focused {
            border-color: #007acc;
        }

        .terminal-display {
            min-height: 1.5em;
        }

        .terminal-editor .cursor {
            background-color: #d4d4d4;
            color: #1e1e1e;
            animation: blink 1s step-end infinite;
        }

        .terminal-editor:not(.focused) .cursor {
            animation: none;
            background-color: #666;
        }

        .terminal-editor .selection {
            background-color: #264f78;
            color: #ffffff;
        }

        @keyframes blink {
            0%, 50% {
                opacity: 1;
            }
            51%, 100% {
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(styles);
}

// Default export
export default TerminalEditor;
