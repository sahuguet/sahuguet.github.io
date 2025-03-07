class SpeechSpeedSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
                    <style>
                        :host {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            font-family: Arial, sans-serif;
                        }
                        .icon {
                            font-size: 1.5em;
                        }
                        input[type="range"] {
                            -webkit-appearance: none;
                            width: 150px;
                            height: 5px;
                            background: #ddd;
                            border-radius: 5px;
                            outline: none;
                            transition: background 0.3s;
                        }
                        input[type="range"]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            width: 15px;
                            height: 15px;
                            background: #007bff;
                            border-radius: 50%;
                            cursor: pointer;
                        }
                        .speed-value {
                            min-width: 40px;
                            text-align: center;
                            font-size: 1em;
                            font-weight: bold;
                        }
                    </style>
                    <span class="icon">🐢</span>
                    <input type="range" min="0.1" max="1.5" step="0.1" value="">
                    <span class="speed-value">1.0x</span>
                    <span class="icon">🐇</span>
                `;

        this.slider = this.shadowRoot.querySelector('input');
        this.speedValue = this.shadowRoot.querySelector('.speed-value');

        this.slider.addEventListener('change', () => this.updateSpeed());
    }

    connectedCallback() {
        // We set the widget value to the value passed in the tag attribute, if any.
        let defaultSpeed = this.getAttribute("default", 1.0);
        this.slider.value = defaultSpeed;
        this.speedValue.textContent = `${defaultSpeed}x`;
    }

    updateSpeed() {
        const speed = this.slider.value;
        this.speedValue.textContent = `${speed}x`;
        // Dispatch a custom event to notify of the speed change
        this.dispatchEvent(new CustomEvent('speed-change', {
            detail: { speed: parseFloat(speed) },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('speech-speed-slider', SpeechSpeedSlider);