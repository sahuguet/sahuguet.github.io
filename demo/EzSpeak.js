// Speech synthesis singleton
class SpeechSynthesisSingleton {
  constructor() {
    if (SpeechSynthesisSingleton.instance) {
      return SpeechSynthesisSingleton.instance;
    }
    this.synth = window.speechSynthesis;
    SpeechSynthesisSingleton.instance = this;
  }

  static getInstance() {
    if (!SpeechSynthesisSingleton.instance) {
      SpeechSynthesisSingleton.instance = new SpeechSynthesisSingleton();
    }
    return SpeechSynthesisSingleton.instance;
  }

  speak(utterance) {
    this.synth.speak(utterance);
  }

  cancel() {
    this.synth.cancel();
  }

  getVoices() {
    return this.synth.getVoices();
  }
}

class EzSpeak extends HTMLElement {

  DEFAULT_SPEED = 0.75;

    render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          cursor: pointer;
          display: inline-block;
          padding: 5px;
          border: 0px solid #ccc;
          align-items: center;
          border-radius: 5px;
          // background: #f9f9f9;
          // transition: background 0.3s;
        }
        :host(:hover) {
          background: #e0e0e0;
        }
        .highlight {
          font-weight: bold;
          font-color: red;
        }
        .button {
        font-size: 1.5em;
        }

        button:disabled {
  opacity: 1;  /* Ensures normal opacity */
          color: inherit;  /* Keeps the text color */
          background: inherit;  /* Keeps the original background */
          cursor: not-allowed; /* Optional: shows it's unclickable */
        }
      </style>
      <button class="button"><slot></slot></button>
    `;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.synth = SpeechSynthesisSingleton.getInstance();
    this.render();

    // When we receive a global event, we change the rate.
    window.addEventListener("rate-change", (event) => {
      const rate = event.detail.rate;
      this.rate = parseFloat(rate);
      // log("New speed -> ", this.rate);
    });
  }




  connectedCallback() {
    this.shadowRoot.addEventListener("click", () => this.speak());
    this.rate = parseFloat(this.getAttribute("rate")) || this.DEFAULT_SPEED;
  }


  speak() {
    if (!this.synth) return;

    this.shadowRoot.querySelector("button").disabled = true;
    const slot = this.shadowRoot.querySelector("slot");
    const nodes = slot.assignedNodes();
    const text = nodes.map(node => node.outerHTML || node.textContent).join(" ").trim();
    if (!text) return;
    console.log("To be TTS-ed", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getAttribute("lang") || "fr-FR";
    console.log(this.rate);
    utterance.rate = this.rate;
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
      this.shadowRoot.querySelector("button").disabled = false;

    };

    console.log("Speaking:", utterance);
    console.log(this.synth);
    this.synth.cancel();
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
