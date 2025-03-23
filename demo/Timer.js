class Timer extends HTMLElement {
    static get observedAttributes() {
        return ['duration', 'auto-start'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isRunning = false;
        this.remainingTime = 0;
        this.timerId = null;
        log("Timer constructor");
    }

    connectedCallback() {
        // Get initial duration from attribute (in seconds)
        this.remainingTime = parseInt(this.getAttribute('duration')) || 60;
        this.autoStart = this.hasAttribute('auto-start');
        
        this.render();
        this.setupEventListeners();

        if (this.autoStart) {
            this.startTimer();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .timer-container {
                    background: linear-gradient(145deg, #1976D2, #2196F3);
                    border-radius: 15px;
                    padding: 20px 30px;
                    color: white;
                    font-family: 'Arial', sans-serif;
                    font-size: 2em;
                    font-weight: bold;
                    cursor: pointer;
                    user-select: none;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
                }
                .timer-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
                }
                .timer-container:active {
                    transform: translateY(0);
                }
                .timer-container.paused {
                    background: linear-gradient(145deg, #666, #888);
                }
                .timer-container.expired {
                    animation: pulse 1s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .timer-label {
                    font-size: 0.4em;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            </style>
            <div class="timer-container">
                <div class="timer-label">Time Remaining</div>
                <div class="timer-display">${this.formatTime(this.remainingTime)}</div>
            </div>
        `;
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('.timer-container').addEventListener('click', () => {
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        });
    }

    startTimer() {
        if (!this.isRunning && this.remainingTime > 0) {
            this.isRunning = true;
            this.shadowRoot.querySelector('.timer-container').classList.remove('paused');
            this.tick();
        }
    }

    pauseTimer() {
        this.isRunning = false;
        this.shadowRoot.querySelector('.timer-container').classList.add('paused');
        if (this.timerId) {
            clearTimeout(this.timerId);
        }
    }

    tick() {
        if (!this.isRunning) return;

        if (this.remainingTime > 0) {
            this.timerId = setTimeout(() => {
                this.remainingTime--;
                this.updateDisplay();
                this.tick();
            }, 1000);
        } else {
            this.timerExpired();
        }
    }

    timerExpired() {
        this.isRunning = false;
        const container = this.shadowRoot.querySelector('.timer-container');
        container.classList.add('expired');

        // Dispatch events for sound and visual effects
        window.dispatchEvent(new CustomEvent('play-timer-expired'));
        window.dispatchEvent(new CustomEvent('play-confetti'));

        // Flash effect on the screen
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.5);
            animation: flash 0.5s ease-out;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(flash);

        setTimeout(() => {
            document.body.removeChild(flash);
        }, 500);
    }

    updateDisplay() {
        const display = this.shadowRoot.querySelector('.timer-display');
        if (display) {
            display.textContent = this.formatTime(this.remainingTime);
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'duration' && oldValue !== newValue) {
            this.remainingTime = parseInt(newValue) || 60;
            this.updateDisplay();
        }
    }

    // Public methods for controlling the timer
    reset() {
        this.pauseTimer();
        this.remainingTime = parseInt(this.getAttribute('duration')) || 60;
        this.updateDisplay();
        this.shadowRoot.querySelector('.timer-container').classList.remove('expired');
    }
}

customElements.define('countdown-timer', Timer); 