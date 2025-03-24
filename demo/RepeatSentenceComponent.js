class RepeatSentenceComponent extends HTMLElement {
    static get observedAttributes() {
        return ['lang', 'voice'];
    }

    constructor() {
        super();

        // Attach Shadow DOM (optional)
        const shadow = this.attachShadow({ mode: "open" });
        
        const style = document.createElement('style');
        const slot = document.createElement('slot');
        slot.style.display = 'none';
        const div = document.createElement('div');

        div.setAttribute('class', 'repeat-sentence');
        div.style.display = 'flex';
        this.speak = document.createElement('ez-speak');
        this.rec = document.createElement('speech-recognition');

        // Set initial attributes if present
        if (this.hasAttribute('lang')) {
            const lang = this.getAttribute('lang');
            this.speak.setAttribute('lang', lang);
        }

        if (this.hasAttribute('voice')) {
            const voice = this.getAttribute('voice');
            this.speak.setAttribute('voice', voice);
        }

        shadow.appendChild(style);
        div.appendChild(this.speak);
        div.appendChild(this.rec);
        shadow.appendChild(div);
        shadow.appendChild(slot);
        
        slot.addEventListener('slotchange', () => {
            const sentence = slot.assignedNodes().map(node => node.textContent).join('').trim();
            this.rec.setAttribute('sentence', sentence);
            this.speak.textContent = sentence;
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        switch (name) {
            case 'lang':
                this.speak.setAttribute('lang', newValue);
                break;
            case 'voice':
                this.speak.setAttribute('voice', newValue);
                break;
        }
    }
}

customElements.define("repeat-sentence", RepeatSentenceComponent);