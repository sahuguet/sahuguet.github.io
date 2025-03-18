class ConfettiPlayer extends HTMLElement {
    static get observedAttributes() {
        return ['colors', 'spread', 'delay'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        // Load js-confetti library dynamically
        this.loadConfettiLibrary().then(() => {
            this.confetti = new JSConfetti();
        });

        // Add event listener for custom event
        window.addEventListener("play-confetti", () => this.playConfetti());
    }

    async loadConfettiLibrary() {
        if (window.JSConfetti) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    connectedCallback() {
        this.render();
        // Initialize default values
        this.colors = this.parseColors(this.getAttribute('colors')) || ['#00ff00', '#ff0000', '#0000ff'];
        this.spread = parseInt(this.getAttribute('spread')) || 70;
        this.delay = parseInt(this.getAttribute('delay')) || 0;
    }

    parseColors(colorsAttr) {
        if (!colorsAttr) return null;
        try {
            return colorsAttr.split(',').map(color => color.trim());
        } catch (e) {
            console.warn('Invalid colors attribute format');
            return null;
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch(name) {
            case 'colors':
                this.colors = this.parseColors(newValue) || this.colors;
                break;
            case 'spread':
                this.spread = parseInt(newValue) || this.spread;
                break;
            case 'delay':
                this.delay = parseInt(newValue) || this.delay;
                break;
        }
    }
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                }
            </style>
        `;
    }
    
    async playConfetti() {
        // log("playConfetti");
        if (!this.confetti) {
            await this.loadConfettiLibrary();
            this.confetti = new JSConfetti();
        }

        // Add delay if specified
        if (this.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }

        this.confetti.addConfetti({
            confettiColors: this.colors,
            confettiRadius: 5,
            confettiNumber: 50,
            spread: this.spread
        });
    }
}

customElements.define("confetti-player", ConfettiPlayer); 