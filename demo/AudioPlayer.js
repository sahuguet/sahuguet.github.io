class AudioPlayer extends HTMLElement {
    static get observedAttributes() {
        return ['pass', 'fail'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        // Create audio elements
        this.passSound = new Audio();
        this.failSound = new Audio();
        
        // Add event listeners for custom events
        window.addEventListener("play-pass", () => this.playPass());
        window.addEventListener("play-fail", () => this.playFail());
    }
    
    connectedCallback() {
        this.render();
        // Initialize sounds from attributes or defaults
        this.passSound.src = this.getAttribute('pass') || "audio/win.wav";
        this.failSound.src = this.getAttribute('fail') || "audio/fail.wav";
        
        // Pre-load the audio files
        this.passSound.load();
        this.failSound.load();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'success-sound':
                this.successSound.src = newValue;
                this.successSound.load();
                break;
            case 'fail-sound':
                this.failSound.src = newValue;
                this.failSound.load();
                break;
        }
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none; /* Hidden by default */
                }
            </style>
        `;
    }
    
    playPass() {
        this.passSound.currentTime = 0; // Reset to start
        this.passSound.play().catch(e => console.warn("Error playing success sound:", e));
    }
    
    playFail() {
        this.failSound.currentTime = 0; // Reset to start
        this.failSound.play().catch(e => console.warn("Error playing fail sound:", e));
    }
}

customElements.define("audio-player", AudioPlayer); 