/**
 * CommandMonkey Challenge System
 * Generates keyboard shortcut challenges for terminal-like text manipulation
 */

// Supported macOS keyboard commands
export const COMMANDS = {
  DELETE_WORD: {
    name: "Delete Word",
    keys: ["Option", "Delete"],
    description: "Delete the previous word"
  },
  MOVE_WORD_LEFT: {
    name: "Move Word Left",
    keys: ["Option", "Left"],
    description: "Move cursor one word to the left"
  },
  MOVE_WORD_RIGHT: {
    name: "Move Word Right",
    keys: ["Option", "Right"],
    description: "Move cursor one word to the right"
  },
  JUMP_LINE_START: {
    name: "Jump to Line Start",
    keys: ["Command", "Left"],
    description: "Jump cursor to start of line"
  },
  JUMP_LINE_END: {
    name: "Jump to Line End",
    keys: ["Command", "Right"],
    description: "Jump cursor to end of line"
  },
  DELETE_TO_LINE_START: {
    name: "Delete to Line Start",
    keys: ["Command", "Delete"],
    description: "Delete everything from cursor to start of line"
  },
  SELECT_WORD_LEFT: {
    name: "Select Word Left",
    keys: ["Option", "Shift", "Left"],
    description: "Select the word to the left"
  },
  SELECT_WORD_RIGHT: {
    name: "Select Word Right",
    keys: ["Option", "Shift", "Right"],
    description: "Select the word to the right"
  },
  SELECT_TO_LINE_START: {
    name: "Select to Line Start",
    keys: ["Command", "Shift", "Left"],
    description: "Select from cursor to start of line"
  },
  SELECT_TO_LINE_END: {
    name: "Select to Line End",
    keys: ["Command", "Shift", "Right"],
    description: "Select from cursor to end of line"
  },
  CONTROL_LINE_START: {
    name: "Control Line Start",
    keys: ["Control", "A"],
    description: "Move cursor to start of line"
  },
  CONTROL_LINE_END: {
    name: "Control Line End",
    keys: ["Control", "E"],
    description: "Move cursor to end of line"
  }
};

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
 * @returns {Object} Challenge object
 */
function generateDeleteWordChallenge(text) {
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
    command: COMMANDS.DELETE_WORD
  };
}

/**
 * Generate a MOVE_WORD_LEFT challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateMoveWordLeftChallenge(text) {
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
    command: COMMANDS.MOVE_WORD_LEFT
  };
}

/**
 * Generate a MOVE_WORD_RIGHT challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateMoveWordRightChallenge(text) {
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
    command: COMMANDS.MOVE_WORD_RIGHT
  };
}

/**
 * Generate a JUMP_LINE_START challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateJumpLineStartChallenge(text) {
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
    command: COMMANDS.JUMP_LINE_START
  };
}

/**
 * Generate a JUMP_LINE_END challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateJumpLineEndChallenge(text) {
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
    command: COMMANDS.JUMP_LINE_END
  };
}

/**
 * Generate a DELETE_TO_LINE_START challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateDeleteToLineStartChallenge(text) {
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
    command: COMMANDS.DELETE_TO_LINE_START
  };
}

/**
 * Generate a SELECT_WORD_LEFT challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateSelectWordLeftChallenge(text) {
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
    command: COMMANDS.SELECT_WORD_LEFT
  };
}

/**
 * Generate a SELECT_WORD_RIGHT challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateSelectWordRightChallenge(text) {
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
    command: COMMANDS.SELECT_WORD_RIGHT
  };
}

/**
 * Generate a SELECT_TO_LINE_START challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateSelectToLineStartChallenge(text) {
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
    command: COMMANDS.SELECT_TO_LINE_START
  };
}

/**
 * Generate a SELECT_TO_LINE_END challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateSelectToLineEndChallenge(text) {
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
    command: COMMANDS.SELECT_TO_LINE_END
  };
}

/**
 * Generate a CONTROL_LINE_START challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateControlLineStartChallenge(text) {
  const cursorPosition = Math.floor(Math.random() * (text.length - 1)) + 1;

  return {
    id: generateId(),
    instruction: "Move to the start of the line using Control+A",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: 0
    },
    command: COMMANDS.CONTROL_LINE_START
  };
}

/**
 * Generate a CONTROL_LINE_END challenge
 * @param {string} text - The text to work with
 * @returns {Object} Challenge object
 */
function generateControlLineEndChallenge(text) {
  const cursorPosition = Math.floor(Math.random() * (text.length - 1));

  return {
    id: generateId(),
    instruction: "Move to the end of the line using Control+E",
    text,
    cursorPosition,
    expectedResult: {
      text,
      cursorPosition: text.length
    },
    command: COMMANDS.CONTROL_LINE_END
  };
}

// Map of command types to their generator functions
const CHALLENGE_GENERATORS = {
  DELETE_WORD: generateDeleteWordChallenge,
  MOVE_WORD_LEFT: generateMoveWordLeftChallenge,
  MOVE_WORD_RIGHT: generateMoveWordRightChallenge,
  JUMP_LINE_START: generateJumpLineStartChallenge,
  JUMP_LINE_END: generateJumpLineEndChallenge,
  DELETE_TO_LINE_START: generateDeleteToLineStartChallenge,
  SELECT_WORD_LEFT: generateSelectWordLeftChallenge,
  SELECT_WORD_RIGHT: generateSelectWordRightChallenge,
  SELECT_TO_LINE_START: generateSelectToLineStartChallenge,
  SELECT_TO_LINE_END: generateSelectToLineEndChallenge,
  CONTROL_LINE_START: generateControlLineStartChallenge,
  CONTROL_LINE_END: generateControlLineEndChallenge
};

/**
 * Generate a random challenge
 * @param {string} [commandType] - Optional specific command type to generate
 * @param {string} [customText] - Optional custom text to use
 * @returns {Object} Challenge object
 */
export function generateChallenge(commandType = null, customText = null) {
  const text = customText || getRandomItem(TEXT_POOL);

  // If no command type specified, pick a random one
  const commandKeys = Object.keys(CHALLENGE_GENERATORS);
  const selectedCommand = commandType || getRandomItem(commandKeys);

  const generator = CHALLENGE_GENERATORS[selectedCommand];
  if (!generator) {
    throw new Error(`Unknown command type: ${selectedCommand}`);
  }

  const challenge = generator(text);

  // If generation failed (e.g., text too short), try with different text
  if (!challenge) {
    const newText = getRandomItem(TEXT_POOL);
    return generator(newText);
  }

  return challenge;
}

/**
 * Generate multiple challenges
 * @param {number} count - Number of challenges to generate
 * @param {Object} [options] - Options for generation
 * @param {string[]} [options.commandTypes] - Specific command types to include
 * @param {boolean} [options.unique] - Ensure unique command types (if possible)
 * @returns {Object[]} Array of challenge objects
 */
export function generateChallenges(count, options = {}) {
  const { commandTypes = null, unique = false } = options;
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

    challenges.push(generateChallenge(commandType));
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
 * Get command details by type
 * @param {string} commandType - The command type key
 * @returns {Object|null} Command details or null if not found
 */
export function getCommand(commandType) {
  return COMMANDS[commandType] || null;
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
  TEXT_POOL,
  generateChallenge,
  generateChallenges,
  validateChallenge,
  getCommandTypes,
  getCommand,
  formatKeyCombination
};
