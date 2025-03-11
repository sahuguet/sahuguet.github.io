class RepeatSentenceComponent extends HTMLElement {
    constructor() {
        super();

        // Attach Shadow DOM (optional)
        const shadow = this.attachShadow({ mode: "open" });
        

        const style = document.createElement('style');
        const slot = document.createElement('slot');
        slot.style.display = 'none';
        const div =    document.createElement('div');
        div.style.display = 'flex';
        const speak = document.createElement('ez-speak');
        const rec = document.createElement('speech-recognition');

        console.log(shadow);
        console.log(rec);
        shadow.appendChild(style);
        div.appendChild(speak);
        div.appendChild(rec);
        shadow.appendChild(div);
        shadow.appendChild(slot);
        
        slot.addEventListener('slotchange', () => {
            const sentence = slot.assignedNodes().map(node => node.textContent).join('').trim();
            console.log("sentence", sentence);
            rec.setAttribute('sentence', sentence);
            speak.textContent = sentence;
          });

    }

}

customElements.define("repeat-sentence", RepeatSentenceComponent);