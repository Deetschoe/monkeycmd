/**
 * CommandMonkey Game Engine
 * A typing practice game for keyboard shortcuts
 */

// Game state constants
const GameState = {
  IDLE: 'idle',
  ACTIVE: 'active',
  FINISHED: 'finished'
};

// Available timer durations in seconds
const TimerModes = {
  SHORT: 15,
  MEDIUM: 30,
  LONG: 60
};

/**
 * Simple event emitter for game events
 */
class EventEmitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} [event] - Optional event name
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * Main Game class for CommandMonkey
 */
class Game extends EventEmitter {
  /**
   * Create a new game instance
   * @param {Object} options - Game options
   * @param {number} [options.duration=30] - Game duration in seconds
   */
  constructor(options = {}) {
    super();

    // Timer configuration
    this.duration = options.duration || TimerModes.MEDIUM;
    this.timeRemaining = this.duration;
    this.timerInterval = null;

    // Game state
    this.state = GameState.IDLE;
    this.currentChallenge = null;

    // Statistics
    this.stats = {
      commandsAttempted: 0,
      commandsCompleted: 0,
      startTime: null,
      endTime: null
    };

    // Bind methods to preserve context
    this.tick = this.tick.bind(this);
  }

  /**
   * Get the current game state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Check if game is in idle state
   * @returns {boolean}
   */
  isIdle() {
    return this.state === GameState.IDLE;
  }

  /**
   * Check if game is active
   * @returns {boolean}
   */
  isActive() {
    return this.state === GameState.ACTIVE;
  }

  /**
   * Check if game is finished
   * @returns {boolean}
   */
  isFinished() {
    return this.state === GameState.FINISHED;
  }

  /**
   * Set the timer duration
   * @param {number} seconds - Duration in seconds
   */
  setDuration(seconds) {
    if (this.state !== GameState.IDLE) {
      console.warn('Cannot change duration while game is active');
      return;
    }

    if (typeof seconds !== 'number' || seconds < 1) {
      console.warn('Duration must be a positive number');
      return;
    }

    this.duration = seconds;
    this.timeRemaining = seconds;
  }

  /**
   * Get the current duration setting
   * @returns {number} Duration in seconds
   */
  getDuration() {
    return this.duration;
  }

  /**
   * Get remaining time
   * @returns {number} Seconds remaining
   */
  getTimeRemaining() {
    return this.timeRemaining;
  }

  /**
   * Get formatted time string (MM:SS)
   * @returns {string} Formatted time
   */
  getFormattedTime() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Start the game timer
   * Called automatically on first valid command input
   */
  start() {
    if (this.state !== GameState.IDLE) {
      return;
    }

    this.state = GameState.ACTIVE;
    this.stats.startTime = Date.now();
    this.timeRemaining = this.duration;

    // Start the countdown timer
    this.timerInterval = setInterval(this.tick, 1000);

    this.emit('gameStart', {
      duration: this.duration,
      timestamp: this.stats.startTime
    });
  }

  /**
   * Timer tick - called every second
   */
  tick() {
    if (this.state !== GameState.ACTIVE) {
      return;
    }

    this.timeRemaining--;

    this.emit('timerTick', {
      timeRemaining: this.timeRemaining,
      formattedTime: this.getFormattedTime()
    });

    if (this.timeRemaining <= 0) {
      this.end();
    }
  }

  /**
   * End the game
   */
  end() {
    if (this.state === GameState.FINISHED) {
      return;
    }

    // Stop the timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.state = GameState.FINISHED;
    this.stats.endTime = Date.now();

    const results = this.getResults();

    this.emit('gameEnd', results);

    return results;
  }

  /**
   * Set the current challenge
   * @param {Object} challenge - Challenge object with command details
   */
  setCurrentChallenge(challenge) {
    this.currentChallenge = challenge;
  }

  /**
   * Get the current challenge
   * @returns {Object|null} Current challenge
   */
  getCurrentChallenge() {
    return this.currentChallenge;
  }

  /**
   * Handle a command attempt
   * Starts the game on first valid attempt if idle
   * @param {boolean} success - Whether the command was successful
   * @param {Object} [details] - Additional details about the attempt
   */
  handleCommandAttempt(success, details = {}) {
    // Start game on first attempt if idle
    if (this.state === GameState.IDLE) {
      this.start();
    }

    if (this.state !== GameState.ACTIVE) {
      return;
    }

    this.stats.commandsAttempted++;

    if (success) {
      this.stats.commandsCompleted++;
      this.emit('commandSuccess', {
        challenge: this.currentChallenge,
        stats: this.getStats(),
        ...details
      });
    } else {
      this.emit('commandFail', {
        challenge: this.currentChallenge,
        stats: this.getStats(),
        ...details
      });
    }
  }

  /**
   * Calculate Commands Per Minute
   * @returns {number} CPM rounded to 1 decimal place
   */
  getCPM() {
    const elapsedSeconds = this.getElapsedTime() / 1000;

    if (elapsedSeconds === 0) {
      return 0;
    }

    const cpm = (this.stats.commandsCompleted / elapsedSeconds) * 60;
    return Math.round(cpm * 10) / 10;
  }

  /**
   * Calculate accuracy percentage
   * @returns {number} Accuracy percentage rounded to 1 decimal place
   */
  getAccuracy() {
    if (this.stats.commandsAttempted === 0) {
      return 100;
    }

    const accuracy = (this.stats.commandsCompleted / this.stats.commandsAttempted) * 100;
    return Math.round(accuracy * 10) / 10;
  }

  /**
   * Get elapsed time in milliseconds
   * @returns {number} Elapsed time
   */
  getElapsedTime() {
    if (!this.stats.startTime) {
      return 0;
    }

    const endTime = this.stats.endTime || Date.now();
    return endTime - this.stats.startTime;
  }

  /**
   * Get current statistics
   * @returns {Object} Current stats
   */
  getStats() {
    return {
      commandsAttempted: this.stats.commandsAttempted,
      commandsCompleted: this.stats.commandsCompleted,
      cpm: this.getCPM(),
      accuracy: this.getAccuracy(),
      timeRemaining: this.timeRemaining,
      elapsedTime: this.getElapsedTime()
    };
  }

  /**
   * Get final results (available after game ends)
   * @returns {Object} Final game results
   */
  getResults() {
    return {
      duration: this.duration,
      commandsAttempted: this.stats.commandsAttempted,
      commandsCompleted: this.stats.commandsCompleted,
      cpm: this.getCPM(),
      accuracy: this.getAccuracy(),
      totalTime: this.getElapsedTime(),
      startTime: this.stats.startTime,
      endTime: this.stats.endTime
    };
  }

  /**
   * Reset the game to initial state
   */
  reset() {
    // Stop any running timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // Reset state
    this.state = GameState.IDLE;
    this.timeRemaining = this.duration;
    this.currentChallenge = null;

    // Reset statistics
    this.stats = {
      commandsAttempted: 0,
      commandsCompleted: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Pause the game (stops timer but preserves state)
   * @returns {boolean} Whether pause was successful
   */
  pause() {
    if (this.state !== GameState.ACTIVE) {
      return false;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    return true;
  }

  /**
   * Resume a paused game
   * @returns {boolean} Whether resume was successful
   */
  resume() {
    if (this.state !== GameState.ACTIVE || this.timerInterval) {
      return false;
    }

    this.timerInterval = setInterval(this.tick, 1000);
    return true;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.removeAllListeners();
  }
}

// Export as ES6 module
export { Game, GameState, TimerModes, EventEmitter };
export default Game;
