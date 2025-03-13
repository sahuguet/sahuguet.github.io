// Speech Recognition singleton
class SpeechRecognitionSingleton {
    constructor() {
        if (SpeechRecognitionSingleton.instance) {
            return SpeechRecognitionSingleton.instance;
        }

        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 3;
        } else {
            console.error("SpeechRecognition is not supported in this browser.");
            return null;
        }

        SpeechRecognitionSingleton.instance = this;
    }

    static getInstance() {
        if (!SpeechRecognitionSingleton.instance) {
            SpeechRecognitionSingleton.instance = new SpeechRecognitionSingleton();
        }
        return SpeechRecognitionSingleton.instance;
    }

    setLanguage(lang) {
        this.recognition.lang = lang;
    }

    start() {
        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
    }

    setupListeners(callbacks) {
        const events = [
            'audiostart', 'soundstart', 'speechstart', 
            'speechend', 'soundend', 'audioend', 
            'result', 'nomatch', 'error', 'end'
        ];

        events.forEach(event => {
            if (callbacks[`on${event}`]) {
                this.recognition[`on${event}`] = callbacks[`on${event}`];
            }
        });
    }
}

class SpeechRecognitionComponent extends HTMLElement {
    IDLE = "lightgrey"
    LISTENING = "yellow";
    MATCH = "green";
    NOMATCH = "red";

    static get observedAttributes() {
        return ['sentence'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'sentence') {
        log("sentence changed from", oldValue, "to", newValue);
        this.updateSentence(newValue);
    }
}
  

    constructor() {
        super();
        this.success = false; // if the sentence has been recognized.
        // Attach Shadow DOM (optional)
        this.attachShadow({ mode: "open" });

        // Create start button
        //this.startButton = document.createElement("button");
        //this.startButton.textContent = "Start Speech Recognition";
        this.shadowRoot.innerHTML = `
<style>
    .container {
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            align-items: left;
                            text-align: left;
                            font-family: Arial, sans-serif;
                            margin: 5px;
                        }
    .button {
        font-size: 14px;
        padding: 5px;
        width: 30px;
        height: 30px;
        border: 1px solid #ccc;
        border-radius: 50%;
        cursor: pointer;
        background-color: ${this.IDLE};
        transition: background-color 0.3s;
    }
                            .tooltip {
                            position: absolute;
                            bottom: 20px;
                            left: 20%;
                            transform: translateX(-50%);
                            background-color: black;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 5px;
                            font-size: 14px;
                            white-space: nowrap;
                            opacity: 0;
                            transition: opacity 0.3s ease-in-out;
                            pointer-events: none;
                        }
                        .container:hover .tooltip {
                            opacity: 1;
                        }
                        .result-tooltip {
                            position: absolute;
                            top: 20px;
                            left: 20%;
                            transform: translateX(-50%);
                            background-color: #222;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 5px;
                            font-size: 14px;
                            white-space: nowrap;
                            visibility: hidden;
                            opacity: 0;
                            transition: opacity 0.5s ease-in-out;
                        }
</style>

     <div class="container">
    <div class="tooltip"></div>
    <button class="button" id="mic" title="Click to start recording ...">
        <svg id="mic-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 1 0 6 0V5a3 3 0 0 0-3-3zm5 10a5 5 0 1 1-10 0V5a5 5 0 1 1 10 0v7zM5 11h2v1a5 5 0 0 0 10 0v-1h2v1a7 7 0 0 1-6 6.92V21h3v2H8v-2h3v-2.08A7 7 0 0 1 5 12v-1z"/>
        </svg>
    </button>
    <div class="result-tooltip">N/A</div>
    </div>
    `;
}

    updateSentence(sentence) {
        this.sentence = sentence;
        this.tooltip.textContent = `Say: "${this.sentence}"`;
    }

    connectedCallback() {
        this.sentence = this.getAttribute('sentence') || "Bonjour";
        this.tooltip = this.shadowRoot.querySelector('.tooltip');
        this.tooltip.textContent = `Say: "${this.sentence}"`;
        this.resultTooltip = this.shadowRoot.querySelector('.result-tooltip');

        // Initialize Speech Recognition using singleton
        this.recognition = SpeechRecognitionSingleton.getInstance();
        if (this.recognition) {
            this.recognition.setLanguage("fr-FR");
            this.setupListeners();
        } else {
            console.error("SpeechRecognition is not supported in this browser.");
        }

        this.mic = this.shadowRoot.querySelector("#mic");
        this.mic.addEventListener("click", () => this.startRecognition());
    }

    setupListeners() {
        this.recognition.setupListeners({
            onaudiostart: () => console.log("Audio capturing started."),
            onsoundstart: () => console.log("Sound detected."),
            onspeechstart: () => console.log("Speech detected."),
            onspeechend: () => console.log("Speech has ended."),
            onsoundend: () => console.log("Sound has stopped."),
            onaudioend: () => console.log("Audio capturing ended."),
            // onresult: (event) => this.handleResult(event),
            onnomatch: () => console.log("No speech match found."),
            onerror: (event) => console.log(`Speech recognition error: ${event.error}`),
            onend: () => console.log("Speech recognition service has stopped.")
        });
    }

    startRecognition() {
        if (!this.recognition) {
            console.log("Speech recognition not supported.");
            return;
        }
        this.recognition.setupListeners({onresult: (event) => this.handleResult(event)});
        this.recognition.start();
        this.mic.style.backgroundColor = this.LISTENING;
    }

    normalizeText(text) {
                return text
                    .toLowerCase()
                    .normalize("NFD") // Decomposes accents (é → e)
                    .replace(/[\u0300-\u036f]/g, "") // Removes accent marks
                    .replace(/[\-]/g, " ") // Removes punctuation
                    .replace(/[.,?!'"\-]/g, "") // Removes punctuation
                    .trim();
            }

    handleResult(event) {
        log(event.results[0][0].transcript);
        log(event.results);
        const transcript = this.normalizeText(event.results[0][0].transcript);
        const transcripts = Object.entries(event.results[0]).map(([key, value]) => this.normalizeText(value.transcript));
  
        const target = this.normalizeText(this.sentence);

        log("Recognized:", transcript);
        log("Target:", target);

        if (transcripts.includes(target)) {
            log("Match found!");
            this.mic.style.backgroundColor = this.MATCH;
            // Dispatch success sound and confetti events
            window.dispatchEvent(new CustomEvent("play-pass"));
            window.dispatchEvent(new CustomEvent("play-confetti"));
            log("Success sound and confetti events dispatched");
            if (this.success === false) {
                this.success = true;
                const event = new CustomEvent("sentence-recognized", {
                    detail: { sentence: this.sentence },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
                log("Event dispatched:", event);
            }
        } else {
            log("No match found.");
            this.mic.style.backgroundColor = this.NOMATCH;
            // Dispatch fail sound event
            window.dispatchEvent(new CustomEvent("play-fail"));
            log("Fail sound event dispatched");
        }
        this.recognition.stop();

        // Show recognized text in tooltip
        this.resultTooltip.textContent = `You said: "${event.results[0][0].transcript}"`;
        this.resultTooltip.style.visibility = "visible";
        this.resultTooltip.style.opacity = "1";

        // Hide result and reset after 3 seconds
        setTimeout(() => {
            this.mic.style.backgroundColor = this.IDLE; // Reset to grey
            this.resultTooltip.style.opacity = "0";
        }, 1000);
    }


log(message) {
    log(message);
    console.log(message);
}
}

// Define custom element
customElements.define("speech-recognition", SpeechRecognitionComponent);
