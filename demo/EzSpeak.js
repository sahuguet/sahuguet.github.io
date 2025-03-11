class EzSpeak extends HTMLElement {

    render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          cursor: pointer;
          display: inline-block;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: #f9f9f9;
          transition: background 0.3s;
        }
        :host(:hover) {
          background: #e0e0e0;
        }
        .highlight {
          font-weight: bold;
          font-color: red;
        }
      </style>
      <div><slot></slot></div>
    `;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.synth = window.speechSynthesis;
    this.render();
  }


  connectedCallback() {
    this.shadowRoot.addEventListener("click", () => this.speak());
  }


  speak() {
    if (!this.synth) return;
    const slot = this.shadowRoot.querySelector("slot");
    const nodes = slot.assignedNodes();
    const text = nodes.map(node => node.outerHTML || node.textContent).join(" ").trim();
    if (!text) return;
    console.log("To be TTS-ed", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getAttribute("lang") || "fr-FR";
    utterance.rate = parseFloat(this.getAttribute("rate")) || 0.4;
    const voiceName = this.getAttribute("voice") || "Thomas";

    if (voiceName) {
      const voices = this.synth.getVoices();
      const voice = voices.find(v => v.name === voiceName);
      if (voice) utterance.voice = voice;
    }

    utterance.onboundary = (event) => {
        console.log('Boundary event:', event.name, event.charIndex, event.charLength);
      if (event.name === 'word') {
        console.log('Word boundary:', event.charIndex, event.charLength);
        this.highlightText(event.charIndex, event.charIndex + event.charLength);
      }
    };

    utterance.onend = () => {
      this.innerHTML = text; // Reset content after speech
    };

    console.log("Speaking:", utterance);
    this.synth.speak(utterance);
  }

  highlightText(start, end) {
    const slot = this.shadowRoot.querySelector("slot");
    const assignedNodes = slot.assignedNodes({ flatten: true });  // Get assigned nodes
    const text = assignedNodes
        .filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE)
        .map(node => node.textContent.trim())
        .join(' ');
    const before = text.slice(0, start);
    const word = `<b>${text.slice(start, end)}</b>`;
    const after = text.slice(end);
    const html = (before + word + after).toString();
    const new_div = document.createElement("div");
    new_div.innerHTML = `${html}`;
    this.replaceChildren(new_div);
  }
}

customElements.define("ez-speak", EzSpeak);
