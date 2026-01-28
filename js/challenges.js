/**
 * monkeycmd Challenge System
 * Generates keyboard shortcut challenges for terminal-like text manipulation
 * Supports macOS, Windows, and Linux keyboard shortcuts
 */

/**
 * Detect the current operating system
 * @returns {'mac' | 'windows' | 'linux'} The detected OS
 */
export function detectOS() {
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

// Current OS - can be overridden for testing
let currentOS = detectOS();

/**
 * Get the current OS setting
 * @returns {'mac' | 'windows' | 'linux'} Current OS
 */
export function getCurrentOS() {
  return currentOS;
}

/**
 * Set the OS for keyboard shortcuts (useful for testing or manual override)
 * @param {'mac' | 'windows' | 'linux'} os - The OS to use
 */
export function setOS(os) {
  if (['mac', 'windows', 'linux'].includes(os)) {
    currentOS = os;
  }
}

// Supported keyboard commands with OS-specific key combinations
export const COMMANDS = {
  DELETE_WORD: {
    name: "Delete Word",
    description: "Delete the previous word",
    mac: {
      keys: ["Option", "Delete"],
      keyCode: { altKey: true, key: "Backspace" }
    },
    windows: {
      keys: ["Ctrl", "Backspace"],
      keyCode: { ctrlKey: true, key: "Backspace" }
    },
    linux: {
      keys: ["Alt", "Backspace"],
      keyCode: { altKey: true, key: "Backspace" }
    }
  },
  DELETE_WORD_FORWARD: {
    name: "Delete Word Forward",
    description: "Delete the next word",
    mac: {
      keys: ["Fn", "Option", "Delete"],
      keyCode: { altKey: true, key: "Delete" }
    },
    windows: {
      keys: ["Ctrl", "Delete"],
      keyCode: { ctrlKey: true, key: "Delete" }
    },
    linux: {
      keys: ["Alt", "D"],
      keyCode: { altKey: true, key: "d" }
    }
  },
  MOVE_WORD_LEFT: {
    name: "Move Word Left",
    description: "Move cursor one word to the left",
    mac: {
      keys: ["Option", "Left"],
      keyCode: { altKey: true, key: "ArrowLeft" }
    },
    windows: {
      keys: ["Ctrl", "Left"],
      keyCode: { ctrlKey: true, key: "ArrowLeft" }
    },
    linux: {
      keys: ["Ctrl", "Left"],
      keyCode: { ctrlKey: true, key: "ArrowLeft" }
    }
  },
  MOVE_WORD_RIGHT: {
    name: "Move Word Right",
    description: "Move cursor one word to the right",
    mac: {
      keys: ["Option", "Right"],
      keyCode: { altKey: true, key: "ArrowRight" }
    },
    windows: {
      keys: ["Ctrl", "Right"],
      keyCode: { ctrlKey: true, key: "ArrowRight" }
    },
    linux: {
      keys: ["Ctrl", "Right"],
      keyCode: { ctrlKey: true, key: "ArrowRight" }
    }
  },
  JUMP_LINE_START: {
    name: "Jump to Line Start",
    description: "Jump cursor to start of line",
    mac: {
      keys: ["Command", "Left"],
      keyCode: { metaKey: true, key: "ArrowLeft" }
    },
    windows: {
      keys: ["Home"],
      keyCode: { key: "Home" }
    },
    linux: {
      keys: ["Home"],
      keyCode: { key: "Home" }
    }
  },
  JUMP_LINE_END: {
    name: "Jump to Line End",
    description: "Jump cursor to end of line",
    mac: {
      keys: ["Command", "Right"],
      keyCode: { metaKey: true, key: "ArrowRight" }
    },
    windows: {
      keys: ["End"],
      keyCode: { key: "End" }
    },
    linux: {
      keys: ["End"],
      keyCode: { key: "End" }
    }
  },
  DELETE_TO_LINE_START: {
    name: "Delete to Line Start",
    description: "Delete everything from cursor to start of line",
    mac: {
      keys: ["Command", "Delete"],
      keyCode: { metaKey: true, key: "Backspace" }
    },
    windows: {
      keys: ["Ctrl", "Shift", "Backspace"],
      keyCode: { ctrlKey: true, shiftKey: true, key: "Backspace" }
    },
    linux: {
      keys: ["Ctrl", "U"],
      keyCode: { ctrlKey: true, key: "u" }
    }
  },
  DELETE_TO_LINE_END: {
    name: "Delete to Line End",
    description: "Delete everything from cursor to end of line",
    mac: {
      keys: ["Control", "K"],
      keyCode: { ctrlKey: true, key: "k" }
    },
    windows: {
      keys: ["Ctrl", "Shift", "Delete"],
      keyCode: { ctrlKey: true, shiftKey: true, key: "Delete" }
    },
    linux: {
      keys: ["Ctrl", "K"],
      keyCode: { ctrlKey: true, key: "k" }
    }
  },
  CONTROL_DELETE_TO_START: {
    name: "Kill Line Start",
    description: "Delete from cursor to start of line (terminal style)",
    mac: {
      keys: ["Control", "U"],
      keyCode: { ctrlKey: true, key: "u" }
    },
    windows: {
      keys: ["Ctrl", "U"],
      keyCode: { ctrlKey: true, key: "u" }
    },
    linux: {
      keys: ["Ctrl", "U"],
      keyCode: { ctrlKey: true, key: "u" }
    }
  },
  SELECT_WORD_LEFT: {
    name: "Select Word Left",
    description: "Select the word to the left",
    mac: {
      keys: ["Option", "Shift", "Left"],
      keyCode: { altKey: true, shiftKey: true, key: "ArrowLeft" }
    },
    windows: {
      keys: ["Ctrl", "Shift", "Left"],
      keyCode: { ctrlKey: true, shiftKey: true, key: "ArrowLeft" }
    },
    linux: {
      keys: ["Ctrl", "Shift", "Left"],
      keyCode: { ctrlKey: true, shiftKey: true, key: "ArrowLeft" }
    }
  },
  SELECT_WORD_RIGHT: {
    name: "Select Word Right",
    description: "Select the word to the right",
    mac: {
      keys: ["Option", "Shift", "Right"],
      keyCode: { altKey: true, shiftKey: true, key: "ArrowRight" }
    },
    windows: {
      keys: ["Ctrl", "Shift", "Right"],
      keyCode: { ctrlKey: true, shiftKey: true, key: "ArrowRight" }
    },
    linux: {
      keys: ["Ctrl", "Shift", "Right"],
      keyCode: { ctrlKey: true, shiftKey: true, key: "ArrowRight" }
    }
  },
  SELECT_TO_LINE_START: {
    name: "Select to Line Start",
    description: "Select from cursor to start of line",
    mac: {
      keys: ["Command", "Shift", "Left"],
      keyCode: { metaKey: true, shiftKey: true, key: "ArrowLeft" }
    },
    windows: {
      keys: ["Shift", "Home"],
      keyCode: { shiftKey: true, key: "Home" }
    },
    linux: {
      keys: ["Shift", "Home"],
      keyCode: { shiftKey: true, key: "Home" }
    }
  },
  SELECT_TO_LINE_END: {
    name: "Select to Line End",
    description: "Select from cursor to end of line",
    mac: {
      keys: ["Command", "Shift", "Right"],
      keyCode: { metaKey: true, shiftKey: true, key: "ArrowRight" }
    },
    windows: {
      keys: ["Shift", "End"],
      keyCode: { shiftKey: true, key: "End" }
    },
    linux: {
      keys: ["Shift", "End"],
      keyCode: { shiftKey: true, key: "End" }
    }
  },
  SELECT_ALL: {
    name: "Select All",
    description: "Select all text",
    mac: {
      keys: ["Command", "A"],
      keyCode: { metaKey: true, key: "a" }
    },
    windows: {
      keys: ["Ctrl", "A"],
      keyCode: { ctrlKey: true, key: "a" }
    },
    linux: {
      keys: ["Ctrl", "A"],
      keyCode: { ctrlKey: true, key: "a" }
    }
  },
  SELECT_CHAR_LEFT: {
    name: "Select Character Left",
    description: "Extend selection one character to the left",
    mac: {
      keys: ["Shift", "Left"],
      keyCode: { shiftKey: true, key: "ArrowLeft" }
    },
    windows: {
      keys: ["Shift", "Left"],
      keyCode: { shiftKey: true, key: "ArrowLeft" }
    },
    linux: {
      keys: ["Shift", "Left"],
      keyCode: { shiftKey: true, key: "ArrowLeft" }
    }
  },
  SELECT_CHAR_RIGHT: {
    name: "Select Character Right",
    description: "Extend selection one character to the right",
    mac: {
      keys: ["Shift", "Right"],
      keyCode: { shiftKey: true, key: "ArrowRight" }
    },
    windows: {
      keys: ["Shift", "Right"],
      keyCode: { shiftKey: true, key: "ArrowRight" }
    },
    linux: {
      keys: ["Shift", "Right"],
      keyCode: { shiftKey: true, key: "ArrowRight" }
    }
  },
  CONTROL_LINE_START: {
    name: "Control Line Start",
    description: "Move cursor to start of line",
    mac: {
      keys: ["Control", "A"],
      keyCode: { ctrlKey: true, key: "a" }
    },
    windows: {
      keys: ["Home"],
      keyCode: { key: "Home" }
    },
    linux: {
      keys: ["Ctrl", "A"],
      keyCode: { ctrlKey: true, key: "a" }
    }
  },
  CONTROL_LINE_END: {
    name: "Control Line End",
    description: "Move cursor to end of line",
    mac: {
      keys: ["Control", "E"],
      keyCode: { ctrlKey: true, key: "e" }
    },
    windows: {
      keys: ["End"],
      keyCode: { key: "End" }
    },
    linux: {
      keys: ["Ctrl", "E"],
      keyCode: { ctrlKey: true, key: "e" }
    }
  },
  CONTROL_FORWARD: {
    name: "Move Forward",
    description: "Move cursor forward one character",
    mac: {
      keys: ["Control", "F"],
      keyCode: { ctrlKey: true, key: "f" }
    },
    windows: {
      keys: ["Right"],
      keyCode: { key: "ArrowRight" }
    },
    linux: {
      keys: ["Ctrl", "F"],
      keyCode: { ctrlKey: true, key: "f" }
    }
  },
  CONTROL_BACKWARD: {
    name: "Move Backward",
    description: "Move cursor backward one character",
    mac: {
      keys: ["Control", "B"],
      keyCode: { ctrlKey: true, key: "b" }
    },
    windows: {
      keys: ["Left"],
      keyCode: { key: "ArrowLeft" }
    },
    linux: {
      keys: ["Ctrl", "B"],
      keyCode: { ctrlKey: true, key: "b" }
    }
  }
};

/**
 * Get command with OS-specific keys
 * @param {string} commandType - The command type key
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to get keys for (defaults to current OS)
 * @returns {Object|null} Command object with OS-specific keys or null if not found
 */
export function getCommandForOS(commandType, os = currentOS) {
  const command = COMMANDS[commandType];
  if (!command) return null;

  const osConfig = command[os] || command.mac; // Fallback to mac if OS not found

  return {
    name: command.name,
    description: command.description,
    keys: osConfig.keys,
    keyCode: osConfig.keyCode
  };
}

// Pool of programming-related sample text
export const TEXT_POOL = [
  "const result = calculateSum(a, b)",
  "function handleClick(event) { return true }",
  "import React from 'react'",
  "let counter = 0",
  "console.log('Hello World')",
  "const users = await fetchData()",
  "export default function App()",
  "npm install lodash --save",
  "git commit -m 'Initial commit'",
  "docker run -p 3000:3000 myapp",
  "SELECT * FROM users WHERE id = 1",
  "python manage.py runserver",
  "curl https://api.example.com/data",
  "ssh user@remote-server.com",
  "chmod 755 script.sh",
  "grep -r 'pattern' ./src",
  "cd /var/www/html",
  "tar -xzvf archive.tar.gz",
  "vim ~/.bashrc",
  "brew install node",
  "const data = JSON.parse(response)",
  "return items.filter(x => x.active)",
  "class UserService extends BaseService",
  "interface Config { port: number }",
  "throw new Error('Invalid input')",
  "try { await connect() } catch (e) {}",
  "const [state, setState] = useState()",
  "addEventListener('click', handler)",
  "document.getElementById('root')",
  "process.env.NODE_ENV === 'production'"
];

/**
 * Generate a unique ID for challenges
 * @returns {string} Unique challenge ID
 */
function generateId() {
  return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get a random item from an array
 * @param {Array} array - The array to pick from
 * @returns {*} Random item from the array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Find word boundaries in text
 * @param {string} text - The text to analyze
 * @returns {Array<{start: number, end: number, word: string}>} Array of word positions
 */
function findWordBoundaries(text) {
  const words = [];
  const regex = /\S+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    words.push({
      start: match.index,
      end: match.index + match[0].length,
      word: match[0]
    });
  }

  return words;
}

/**
 * Find the word boundary to the left of the cursor
 * @param {string} text - The text
 * @param {number} cursorPos - Current cursor position
 * @returns {number} Position of word boundary to the left
 */
function findWordBoundaryLeft(text, cursorPos) {
  if (cursorPos === 0) return 0;

  let pos = cursorPos - 1;

  // Skip any whitespace first
  while (pos > 0 && /\s/.test(text[pos])) {
    pos--;
  }

  // Then find the start of the word
  while (pos > 0 && /\S/.test(text[pos - 1])) {
    pos--;
  }

  return pos;
}

/**
 * Find the word boundary to the right of the cursor
 * @param {string} text - The text
 * @param {number} cursorPos - Current cursor position
 * @returns {number} Position of word boundary to the right
 */
function findWordBoundaryRight(text, cursorPos) {
  if (cursorPos >= text.length) return text.length;

  let pos = cursorPos;

  // Skip current word characters first
  while (pos < text.length && /\S/.test(text[pos])) {
    pos++;
  }

  // Then skip any whitespace
  while (pos < text.length && /\s/.test(text[pos])) {
    pos++;
  }

  return pos;
}

/**
 * Generate a DELETE_WORD challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateDeleteWordChallenge(text, os = currentOS) {
  const words = findWordBoundaries(text);
  if (words.length < 2) return null;

  // Pick a word that's not at the start (so there's something to delete)
  const wordIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
  const targetWord = words[wordIndex];

  // Position cursor at the end of the word
  const cursorPosition = targetWord.end;
  const wordStart = findWordBoundaryLeft(text, cursorPosition);

  // Expected result: word deleted, cursor at word start
  const expectedText = text.slice(0, wordStart) + text.slice(cursorPosition);

  return {
    id: generateId(),
    instruction: `Delete the word '${targetWord.word}'`,
    text,
    cursorPosition,
    expectedResult: {
      text: expectedText,
      cursorPosition: wordStart
    },
    command: getCommandForOS('DELETE_WORD', os)
  };
}

/**
 * Generate a DELETE_WORD_FORWARD challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateDeleteWordForwardChallenge(text, os = currentOS) {
  const words = findWordBoundaries(text);
  if (words.length < 2) return null;

  // Pick a word that's not at the end (so there's something to delete forward)
  const wordIndex = Math.floor(Math.random() * (words.length - 1));
  const targetWord = words[wordIndex];

  // Position cursor at the start of the word
  const cursorPosition = targetWord.start;
  const wordEnd = findWordBoundaryRight(text, cursorPosition);

  // Expected result: word deleted, cursor stays at same position
  const expectedText = text.slice(0, cursorPosition) + text.slice(wordEnd);

  return {
    id: generateId(),
    instruction: `Delete the word '${targetWord.word}' forward`,
    text,
    cursorPosition,
    expectedResult: {
      text: expectedText,
      cursorPosition: cursorPosition
    },
    command: getCommandForOS('DELETE_WORD_FORWARD', os)
  };
}

/**
 * Generate a MOVE_WORD_LEFT challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateMoveWordLeftChallenge(text, os = currentOS) {
  const words = findWordBoundaries(text);
  if (words.length < 2) return null;

  // Start somewhere in the middle or end
  const wordIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
  const cursorPosition = words[wordIndex].end;
  const expectedPosition = findWordBoundaryLeft(text, cursorPosition);

  return {
    id: generateId(),
    instruction: "Move the cursor one word to the left",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: expectedPosition
    },
    command: getCommandForOS('MOVE_WORD_LEFT', os)
  };
}

/**
 * Generate a MOVE_WORD_RIGHT challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateMoveWordRightChallenge(text, os = currentOS) {
  const words = findWordBoundaries(text);
  if (words.length < 2) return null;

  // Start somewhere at the beginning or middle
  const wordIndex = Math.floor(Math.random() * (words.length - 1));
  const cursorPosition = words[wordIndex].start;
  const expectedPosition = findWordBoundaryRight(text, cursorPosition);

  return {
    id: generateId(),
    instruction: "Move the cursor one word to the right",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: expectedPosition
    },
    command: getCommandForOS('MOVE_WORD_RIGHT', os)
  };
}

/**
 * Generate a JUMP_LINE_START challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateJumpLineStartChallenge(text, os = currentOS) {
  // Place cursor somewhere in the middle or end
  const cursorPosition = Math.floor(Math.random() * (text.length - 1)) + 1;

  return {
    id: generateId(),
    instruction: "Move the cursor to the start of the line",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: 0
    },
    command: getCommandForOS('JUMP_LINE_START', os)
  };
}

/**
 * Generate a JUMP_LINE_END challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateJumpLineEndChallenge(text, os = currentOS) {
  // Place cursor somewhere at the start or middle
  const cursorPosition = Math.floor(Math.random() * (text.length - 1));

  return {
    id: generateId(),
    instruction: "Move the cursor to the end of the line",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: text.length
    },
    command: getCommandForOS('JUMP_LINE_END', os)
  };
}

/**
 * Generate a DELETE_TO_LINE_START challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateDeleteToLineStartChallenge(text, os = currentOS) {
  // Place cursor somewhere after the first few characters
  const minPos = Math.min(5, Math.floor(text.length / 4));
  const cursorPosition = Math.floor(Math.random() * (text.length - minPos)) + minPos;

  const expectedText = text.slice(cursorPosition);

  return {
    id: generateId(),
    instruction: "Delete everything before the cursor",
    text,
    cursorPosition,
    expectedResult: {
      text: expectedText,
      cursorPosition: 0
    },
    command: getCommandForOS('DELETE_TO_LINE_START', os)
  };
}

/**
 * Generate a DELETE_TO_LINE_END challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateDeleteToLineEndChallenge(text, os = currentOS) {
  // Place cursor somewhere before the last few characters
  const maxPos = text.length - Math.min(5, Math.floor(text.length / 4));
  const cursorPosition = Math.floor(Math.random() * maxPos);

  const expectedText = text.slice(0, cursorPosition);
  const command = getCommandForOS('DELETE_TO_LINE_END', os);

  return {
    id: generateId(),
    instruction: "Delete everything after the cursor",
    text,
    cursorPosition,
    expectedResult: {
      text: expectedText,
      cursorPosition: cursorPosition
    },
    command
  };
}

/**
 * Generate a CONTROL_DELETE_TO_START challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateControlDeleteToStartChallenge(text, os = currentOS) {
  // Place cursor somewhere after the first few characters
  const minPos = Math.min(5, Math.floor(text.length / 4));
  const cursorPosition = Math.floor(Math.random() * (text.length - minPos)) + minPos;

  const expectedText = text.slice(cursorPosition);

  return {
    id: generateId(),
    instruction: "Delete everything before the cursor (terminal style)",
    text,
    cursorPosition,
    expectedResult: {
      text: expectedText,
      cursorPosition: 0
    },
    command: getCommandForOS('CONTROL_DELETE_TO_START', os)
  };
}

/**
 * Generate a SELECT_WORD_LEFT challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectWordLeftChallenge(text, os = currentOS) {
  const words = findWordBoundaries(text);
  if (words.length < 2) return null;

  // Position cursor at end of a word (not the first one)
  const wordIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
  const cursorPosition = words[wordIndex].end;
  const selectionStart = findWordBoundaryLeft(text, cursorPosition);

  return {
    id: generateId(),
    instruction: "Select the word to the left of the cursor",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: selectionStart,
      selection: [selectionStart, cursorPosition]
    },
    command: getCommandForOS('SELECT_WORD_LEFT', os)
  };
}

/**
 * Generate a SELECT_WORD_RIGHT challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectWordRightChallenge(text, os = currentOS) {
  const words = findWordBoundaries(text);
  if (words.length < 2) return null;

  // Position cursor at start of a word (not the last one)
  const wordIndex = Math.floor(Math.random() * (words.length - 1));
  const cursorPosition = words[wordIndex].start;
  const selectionEnd = findWordBoundaryRight(text, cursorPosition);

  return {
    id: generateId(),
    instruction: "Select the word to the right of the cursor",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: selectionEnd,
      selection: [cursorPosition, selectionEnd]
    },
    command: getCommandForOS('SELECT_WORD_RIGHT', os)
  };
}

/**
 * Generate a SELECT_TO_LINE_START challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectToLineStartChallenge(text, os = currentOS) {
  // Place cursor somewhere in the middle or end
  const minPos = Math.min(5, Math.floor(text.length / 4));
  const cursorPosition = Math.floor(Math.random() * (text.length - minPos)) + minPos;

  return {
    id: generateId(),
    instruction: "Select from the cursor to the start of the line",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: 0,
      selection: [0, cursorPosition]
    },
    command: getCommandForOS('SELECT_TO_LINE_START', os)
  };
}

/**
 * Generate a SELECT_TO_LINE_END challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectToLineEndChallenge(text, os = currentOS) {
  // Place cursor somewhere at the start or middle
  const maxPos = text.length - Math.min(5, Math.floor(text.length / 4));
  const cursorPosition = Math.floor(Math.random() * maxPos);

  return {
    id: generateId(),
    instruction: "Select from the cursor to the end of the line",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: text.length,
      selection: [cursorPosition, text.length]
    },
    command: getCommandForOS('SELECT_TO_LINE_END', os)
  };
}

/**
 * Generate a SELECT_ALL challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectAllChallenge(text, os = currentOS) {
  // Place cursor somewhere in the middle
  const cursorPosition = Math.floor(Math.random() * text.length);
  const command = getCommandForOS('SELECT_ALL', os);

  return {
    id: generateId(),
    instruction: "Select all text",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: text.length,
      selection: [0, text.length]
    },
    command
  };
}

/**
 * Generate a SELECT_CHAR_LEFT challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectCharLeftChallenge(text, os = currentOS) {
  // Place cursor somewhere after the start
  const cursorPosition = Math.floor(Math.random() * (text.length - 1)) + 1;

  return {
    id: generateId(),
    instruction: "Select one character to the left",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: cursorPosition - 1,
      selection: [cursorPosition - 1, cursorPosition]
    },
    command: getCommandForOS('SELECT_CHAR_LEFT', os)
  };
}

/**
 * Generate a SELECT_CHAR_RIGHT challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateSelectCharRightChallenge(text, os = currentOS) {
  // Place cursor somewhere before the end
  const cursorPosition = Math.floor(Math.random() * (text.length - 1));

  return {
    id: generateId(),
    instruction: "Select one character to the right",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: cursorPosition + 1,
      selection: [cursorPosition, cursorPosition + 1]
    },
    command: getCommandForOS('SELECT_CHAR_RIGHT', os)
  };
}

/**
 * Generate a CONTROL_LINE_START challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateControlLineStartChallenge(text, os = currentOS) {
  const cursorPosition = Math.floor(Math.random() * (text.length - 1)) + 1;
  const command = getCommandForOS('CONTROL_LINE_START', os);

  return {
    id: generateId(),
    instruction: "Move to the start of the line (terminal style)",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: 0
    },
    command
  };
}

/**
 * Generate a CONTROL_LINE_END challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateControlLineEndChallenge(text, os = currentOS) {
  const cursorPosition = Math.floor(Math.random() * (text.length - 1));
  const command = getCommandForOS('CONTROL_LINE_END', os);

  return {
    id: generateId(),
    instruction: "Move to the end of the line (terminal style)",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: text.length
    },
    command
  };
}

/**
 * Generate a CONTROL_FORWARD challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateControlForwardChallenge(text, os = currentOS) {
  // Place cursor somewhere before the end
  const cursorPosition = Math.floor(Math.random() * (text.length - 1));
  const command = getCommandForOS('CONTROL_FORWARD', os);

  return {
    id: generateId(),
    instruction: "Move forward one character",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: cursorPosition + 1
    },
    command
  };
}

/**
 * Generate a CONTROL_BACKWARD challenge
 * @param {string} text - The text to work with
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to generate for
 * @returns {Object} Challenge object
 */
function generateControlBackwardChallenge(text, os = currentOS) {
  // Place cursor somewhere after the start
  const cursorPosition = Math.floor(Math.random() * (text.length - 1)) + 1;
  const command = getCommandForOS('CONTROL_BACKWARD', os);

  return {
    id: generateId(),
    instruction: "Move backward one character",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: cursorPosition - 1
    },
    command
  };
}

// Map of command types to their generator functions
const CHALLENGE_GENERATORS = {
  DELETE_WORD: generateDeleteWordChallenge,
  DELETE_WORD_FORWARD: generateDeleteWordForwardChallenge,
  MOVE_WORD_LEFT: generateMoveWordLeftChallenge,
  MOVE_WORD_RIGHT: generateMoveWordRightChallenge,
  JUMP_LINE_START: generateJumpLineStartChallenge,
  JUMP_LINE_END: generateJumpLineEndChallenge,
  DELETE_TO_LINE_START: generateDeleteToLineStartChallenge,
  DELETE_TO_LINE_END: generateDeleteToLineEndChallenge,
  CONTROL_DELETE_TO_START: generateControlDeleteToStartChallenge,
  SELECT_WORD_LEFT: generateSelectWordLeftChallenge,
  SELECT_WORD_RIGHT: generateSelectWordRightChallenge,
  SELECT_TO_LINE_START: generateSelectToLineStartChallenge,
  SELECT_TO_LINE_END: generateSelectToLineEndChallenge,
  SELECT_ALL: generateSelectAllChallenge,
  SELECT_CHAR_LEFT: generateSelectCharLeftChallenge,
  SELECT_CHAR_RIGHT: generateSelectCharRightChallenge,
  CONTROL_LINE_START: generateControlLineStartChallenge,
  CONTROL_LINE_END: generateControlLineEndChallenge,
  CONTROL_FORWARD: generateControlForwardChallenge,
  CONTROL_BACKWARD: generateControlBackwardChallenge
};

// Command type arrays by category - exported for external use
export const NAVIGATION_COMMANDS = [
  'MOVE_WORD_LEFT',
  'MOVE_WORD_RIGHT',
  'JUMP_LINE_START',
  'JUMP_LINE_END',
  'CONTROL_LINE_START',
  'CONTROL_LINE_END',
  'CONTROL_FORWARD',
  'CONTROL_BACKWARD'
];

export const SELECTION_COMMANDS = [
  'SELECT_WORD_LEFT',
  'SELECT_WORD_RIGHT',
  'SELECT_TO_LINE_START',
  'SELECT_TO_LINE_END',
  'SELECT_ALL',
  'SELECT_CHAR_LEFT',
  'SELECT_CHAR_RIGHT'
];

export const DELETION_COMMANDS = [
  'DELETE_WORD',
  'DELETE_WORD_FORWARD',
  'DELETE_TO_LINE_START',
  'DELETE_TO_LINE_END',
  'CONTROL_DELETE_TO_START'
];

// All commands combined
export const ALL_COMMANDS = [...NAVIGATION_COMMANDS, ...SELECTION_COMMANDS, ...DELETION_COMMANDS];

// Command categories for filtering challenges
export const COMMAND_CATEGORIES = {
  all: {
    id: 'all',
    name: 'All Commands',
    description: 'Practice all keyboard shortcuts',
    commandTypes: null // null means all commands
  },
  navigation: {
    id: 'navigation',
    name: 'Navigation',
    description: 'Move faster through text',
    commandTypes: NAVIGATION_COMMANDS
  },
  selection: {
    id: 'selection',
    name: 'Selection',
    description: 'Select text like a pro',
    commandTypes: SELECTION_COMMANDS
  },
  deletion: {
    id: 'deletion',
    name: 'Deletion',
    description: 'Delete with precision',
    commandTypes: DELETION_COMMANDS
  }
};

/**
 * Get all available command categories
 * @returns {Object[]} Array of category objects
 */
export function getCategories() {
  return Object.values(COMMAND_CATEGORIES);
}

/**
 * Get a specific category by ID
 * @param {string} categoryId - The category ID
 * @returns {Object|null} Category object or null if not found
 */
export function getCategory(categoryId) {
  return COMMAND_CATEGORIES[categoryId] || null;
}

/**
 * Get command types for a category
 * @param {string} categoryId - The category ID
 * @returns {string[]} Array of command type keys
 */
export function getCategoryCommandTypes(categoryId) {
  const category = COMMAND_CATEGORIES[categoryId];
  if (!category || category.commandTypes === null) {
    return Object.keys(CHALLENGE_GENERATORS);
  }
  return category.commandTypes;
}

/**
 * Generate a random challenge
 * @param {string} [commandType] - Optional specific command type to generate
 * @param {string} [customText] - Optional custom text to use
 * @param {string|Object} [categoryOrEnabledCategories] - Optional category ID (string) for backwards compatibility,
 *        or an object with enabled categories: { navigation: true, selection: true, deletion: true }
 * @param {'mac' | 'windows' | 'linux'} [os] - Optional OS to generate for (defaults to current OS)
 * @returns {Object} Challenge object
 */
export function generateChallenge(commandType = null, customText = null, categoryOrEnabledCategories = null, os = currentOS) {
  const text = customText || getRandomItem(TEXT_POOL);

  // Get available command types based on category configuration
  let availableCommands;
  if (commandType) {
    availableCommands = [commandType];
  } else if (categoryOrEnabledCategories) {
    // Check if it's the new format (object with enabled categories) or old format (string category ID)
    if (typeof categoryOrEnabledCategories === 'object' && categoryOrEnabledCategories !== null) {
      // New format: { navigation: true, selection: true, deletion: true }
      const enabledCategories = categoryOrEnabledCategories;

      // Default to all categories enabled if object is empty or all false
      const categories = {
        navigation: enabledCategories.navigation ?? true,
        selection: enabledCategories.selection ?? true,
        deletion: enabledCategories.deletion ?? true
      };

      // Build list of available commands based on enabled categories
      availableCommands = [];
      if (categories.navigation) {
        availableCommands = availableCommands.concat(NAVIGATION_COMMANDS);
      }
      if (categories.selection) {
        availableCommands = availableCommands.concat(SELECTION_COMMANDS);
      }
      if (categories.deletion) {
        availableCommands = availableCommands.concat(DELETION_COMMANDS);
      }

      // If nothing enabled, default to all
      if (availableCommands.length === 0) {
        availableCommands = ALL_COMMANDS;
      }
    } else {
      // Old format: string category ID (backwards compatibility)
      availableCommands = getCategoryCommandTypes(categoryOrEnabledCategories);
    }
  } else {
    availableCommands = Object.keys(CHALLENGE_GENERATORS);
  }

  const selectedCommand = commandType || getRandomItem(availableCommands);

  const generator = CHALLENGE_GENERATORS[selectedCommand];
  if (!generator) {
    throw new Error(`Unknown command type: ${selectedCommand}`);
  }

  const challenge = generator(text, os);

  // If generation failed (e.g., text too short), try with different text
  if (!challenge) {
    const newText = getRandomItem(TEXT_POOL);
    return generator(newText, os);
  }

  return challenge;
}

/**
 * Generate multiple challenges
 * @param {number} count - Number of challenges to generate
 * @param {Object} [options] - Options for generation
 * @param {string[]} [options.commandTypes] - Specific command types to include
 * @param {boolean} [options.unique] - Ensure unique command types (if possible)
 * @param {'mac' | 'windows' | 'linux'} [options.os] - OS to generate for
 * @returns {Object[]} Array of challenge objects
 */
export function generateChallenges(count, options = {}) {
  const { commandTypes = null, unique = false, os = currentOS } = options;
  const challenges = [];
  const availableTypes = commandTypes || Object.keys(CHALLENGE_GENERATORS);
  const usedTypes = new Set();

  for (let i = 0; i < count; i++) {
    let commandType;

    if (unique && usedTypes.size < availableTypes.length) {
      // Pick an unused type
      const unusedTypes = availableTypes.filter(t => !usedTypes.has(t));
      commandType = getRandomItem(unusedTypes);
      usedTypes.add(commandType);
    } else {
      commandType = getRandomItem(availableTypes);
    }

    challenges.push(generateChallenge(commandType, null, null, os));
  }

  return challenges;
}

/**
 * Validate user's result against expected result
 * @param {Object} challenge - The challenge object
 * @param {Object} userResult - The user's result
 * @param {string} userResult.text - The text after user action
 * @param {number} userResult.cursorPosition - Cursor position after action
 * @param {[number, number]} [userResult.selection] - Selection range if any
 * @returns {Object} Validation result with success flag and details
 */
export function validateChallenge(challenge, userResult) {
  const { expectedResult } = challenge;
  const result = {
    success: true,
    textMatch: true,
    cursorMatch: true,
    selectionMatch: true,
    details: []
  };

  // Check text
  if (userResult.text !== expectedResult.text) {
    result.success = false;
    result.textMatch = false;
    result.details.push({
      type: 'text',
      expected: expectedResult.text,
      received: userResult.text
    });
  }

  // Check cursor position
  if (userResult.cursorPosition !== expectedResult.cursorPosition) {
    result.success = false;
    result.cursorMatch = false;
    result.details.push({
      type: 'cursor',
      expected: expectedResult.cursorPosition,
      received: userResult.cursorPosition
    });
  }

  // Check selection if expected
  if (expectedResult.selection) {
    const userSelection = userResult.selection || [userResult.cursorPosition, userResult.cursorPosition];
    const [expectedStart, expectedEnd] = expectedResult.selection;
    const [userStart, userEnd] = userSelection;

    if (userStart !== expectedStart || userEnd !== expectedEnd) {
      result.success = false;
      result.selectionMatch = false;
      result.details.push({
        type: 'selection',
        expected: expectedResult.selection,
        received: userSelection
      });
    }
  }

  return result;
}

/**
 * Get all available command types
 * @returns {string[]} Array of command type keys
 */
export function getCommandTypes() {
  return Object.keys(COMMANDS);
}

/**
 * Get command details by type (returns OS-specific version)
 * @param {string} commandType - The command type key
 * @param {'mac' | 'windows' | 'linux'} [os] - The OS to get keys for
 * @returns {Object|null} Command details or null if not found
 */
export function getCommand(commandType, os = currentOS) {
  return getCommandForOS(commandType, os);
}

/**
 * Format key combination for display
 * @param {string[]} keys - Array of key names
 * @returns {string} Formatted key combination
 */
export function formatKeyCombination(keys) {
  return keys.join(' + ');
}

// Default export with all main functions
export default {
  COMMANDS,
  COMMAND_CATEGORIES,
  NAVIGATION_COMMANDS,
  SELECTION_COMMANDS,
  DELETION_COMMANDS,
  ALL_COMMANDS,
  TEXT_POOL,
  generateChallenge,
  generateChallenges,
  validateChallenge,
  getCommandTypes,
  getCommand,
  getCommandForOS,
  formatKeyCombination,
  getCategories,
  getCategory,
  getCategoryCommandTypes,
  detectOS,
  getCurrentOS,
  setOS
};
