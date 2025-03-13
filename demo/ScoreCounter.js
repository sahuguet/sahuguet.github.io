class ScoreCounter extends HTMLElement {
    static get observedAttributes() {
        return ['score', 'label'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._score = 0;
        
        // Listen for sentence recognition events
        window.addEventListener("sentence-recognized", () => this.incrementScore());
    }
    
    connectedCallback() {
        this._label = this.getAttribute('label') || 'Score';
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'score':
                this._score = parseInt(newValue) || 0;
                this.updateScore();
                break;
            case 'label':
                this._label = newValue || 'Score';
                this.updateLabel();
                break;
        }
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .score-container {
                    background: linear-gradient(145deg, #2E7D32, #43A047);
                    border-radius: 15px;
                    padding: 15px 25px;
                    color: #fff;
                    font-family: 'Arial', sans-serif;
                    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);
                    position: relative;
                    overflow: hidden;
                    min-width: 120px;
                    text-align: center;
                }
                .label {
                    font-size: 0.9em;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 5px;
                }
                .score {
                    font-size: 2.5em;
                    font-weight: bold;
                    text-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    position: relative;
                }
                .score-change {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #FFEB3B;
                    font-size: 1.2em;
                    opacity: 0;
                    transition: all 0.5s ease-out;
                    font-weight: bold;
                }
                .score-change.animate {
                    animation: scoreIncrease 0.8s ease-out;
                }
                @keyframes scoreIncrease {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                }
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .pulse {
                    animation: pulse 0.3s ease-in-out;
                }
            </style>
            <div class="score-container">
                <div class="label">${this._label}</div>
                <div class="score">${this._score}</div>
                <div class="score-change">+1</div>
            </div>
        `;
    }

    updateScore() {
        const scoreElement = this.shadowRoot.querySelector('.score');
        const scoreChangeElement = this.shadowRoot.querySelector('.score-change');
        
        // Update the score display
        scoreElement.textContent = this._score;
        
        // Add pulse animation to the score
        scoreElement.classList.add('pulse');
        
        // Trigger the score change animation
        scoreChangeElement.classList.remove('animate');
        void scoreChangeElement.offsetWidth; // Force reflow
        scoreChangeElement.classList.add('animate');
        
        // Remove pulse animation after it completes
        setTimeout(() => {
            scoreElement.classList.remove('pulse');
        }, 300);
    }

    updateLabel() {
        const labelElement = this.shadowRoot.querySelector('.label');
        labelElement.textContent = this._label;
    }

    incrementScore() {
        this._score++;
        this.updateScore();
    }

    // Public method to get current score
    getScore() {
        return this._score;
    }

    // Public method to reset score
    resetScore() {
        this._score = 0;
        this.updateScore();
    }
}

customElements.define("score-counter", ScoreCounter); 