class AudioPlayer extends HTMLElement {
    static get observedAttributes() {
        return ['pass-sound', 'fail-sound'];
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
        log("audio-player connectedCallback");
        this.render();
        // Initialize sounds from attributes or defaults
        this.initializeSound(this.passSound, this.getAttribute('pass-sound') || "audio/win.wav", "passSound");
        this.initializeSound(this.failSound, this.getAttribute('fail-sound') || "audio/fail.wav", "failSound");
    }

    initializeSound(audioElement, src, name) {
        audioElement.src = src;
        audioElement.load();
    /*    
        audioElement.addEventListener("canplaythrough", () => {
            log(`${name} canplaythrough event`);
            audioElement.muted = true; // Start muted
            audioElement.play().then(() => {
                setTimeout(() => {
                    log(`${name} unmuted`);
                    audioElement.muted = false; // Unmute after 2 seconds
                    
            });
        });
        */
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'pass-sound':
                this.initializeSound(this.passSound, newValue, "passSound");
                break;
            case 'fail-sound':
                this.initializeSound(this.failSound, newValue, "failSound");
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
        log("playPass");
        this.passSound.currentTime = 0; // Reset to start
        this.passSound.play().catch(e => console.warn("Error playing pass sound:", e));
    }
    
    playFail() {
        log("playFail");
        this.failSound.currentTime = 0; // Reset to start
        this.failSound.play().catch(e => console.warn("Error playing fail sound:", e));
    }
}

customElements.define("audio-player", AudioPlayer); 