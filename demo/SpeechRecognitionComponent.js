function _min(d0, d1, d2, bx, ay) {
    return d0 < d1 || d2 < d1
        ? d0 > d2
            ? d2 + 1
            : d0 + 1
        : bx === ay
            ? d1
            : d1 + 1;
}

function levenshtein(a, b) {
    if (a === b) {
        return 0;
    }

    if (a.length > b.length) {
        var tmp = a;
        a = b;
        b = tmp;
    }

    var la = a.length;
    var lb = b.length;

    while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
        la--;
        lb--;
    }

    var offset = 0;

    while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
        offset++;
    }

    la -= offset;
    lb -= offset;

    if (la === 0 || lb < 3) {
        return lb;
    }

    var x = 0;
    var y;
    var d0;
    var d1;
    var d2;
    var d3;
    var dd;
    var dy;
    var ay;
    var bx0;
    var bx1;
    var bx2;
    var bx3;

    var vector = [];

    for (y = 0; y < la; y++) {
        vector.push(y + 1);
        vector.push(a.charCodeAt(offset + y));
    }

    var len = vector.length - 1;

    for (; x < lb - 3;) {
        bx0 = b.charCodeAt(offset + (d0 = x));
        bx1 = b.charCodeAt(offset + (d1 = x + 1));
        bx2 = b.charCodeAt(offset + (d2 = x + 2));
        bx3 = b.charCodeAt(offset + (d3 = x + 3));
        dd = (x += 4);
        for (y = 0; y < len; y += 2) {
            dy = vector[y];
            ay = vector[y + 1];
            d0 = _min(dy, d0, d1, bx0, ay);
            d1 = _min(d0, d1, d2, bx1, ay);
            d2 = _min(d1, d2, d3, bx2, ay);
            dd = _min(d2, d3, dd, bx3, ay);
            vector[y] = dd;
            d3 = d2;
            d2 = d1;
            d1 = d0;
            d0 = dy;
        }
    }

    for (; x < lb;) {
        bx0 = b.charCodeAt(offset + (d0 = x));
        dd = ++x;
        for (y = 0; y < len; y += 2) {
            dy = vector[y];
            vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
            d0 = dy;
        }
    }

    return dd;
};
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
            log("SpeechRecognition is supported in this browser.");
        } else {
            log("ERROR", "SpeechRecognition is not supported in this browser.");
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
    DEBUG = false;

    static get observedAttributes() {
        return ['sentence'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'sentence') {
        // log("sentence changed from", oldValue, "to", newValue);
        this.updateSentence(newValue);
    }
}
  

    constructor() {
        super();
        this.success = false; // if the sentence has been recognized.
        // Attach Shadow DOM (optional)
        this.attachShadow({ mode: "open" });
        this.speechTimeout = null;
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
            log("ERROR", "SpeechRecognition is not supported in this browser.");
        }

        this.mic = this.shadowRoot.querySelector("#mic");
        this.mic.addEventListener("click", () => this.startRecognition());
    }

    setupListeners() {
        this.recognition.setupListeners({
            onaudiostart: () => { if (this.DEBUG) log("Audio capturing started.") },
            onsoundstart: () => { if (this.DEBUG) log("Sound detected.") },
            onspeechstart: () => { if (this.DEBUG) log("Speech detected.") },
            onspeechend: () => { if (this.DEBUG) log("Speech has ended.") },
            onsoundend: () => { if (this.DEBUG) log("Sound has stopped.") },
            onaudioend: () => { if (this.DEBUG) log("Audio capturing ended.") },
            // onresult: (event) => this.handleResult(event),
            onnomatch: () => log("No speech match found."),
            onerror: (event) => log(`Speech recognition error: ${event.error}`),
            onend: () => {
                if (this.speechTimeout) {
                    log("Speech timeout cleared");
                    clearTimeout(this.speechTimeout);
                }
                log("Speech recognition service has stopped.");
            }
        });
    }

    startRecognition() {
        if (!this.recognition) {
            log("ERROR", "Speech recognition not supported.");
            return;
        }
        this.recognition.setupListeners({onresult: (event) => this.handleResult(event)});
        this.recognition.start();
        this.speechTimeout = setTimeout(() => {
            this.recognition.stop();
            this.mic.style.backgroundColor = this.IDLE; // Reset to grey
            this.resultTooltip.style.opacity = "0";

        }, 8000);
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
        // log(event.results[0][0].transcript);
        // log(event.results);
        const transcript = this.normalizeText(event.results[0][0].transcript);
        const transcripts = Object.entries(event.results[0]).map(([key, value]) => this.normalizeText(value.transcript));
  
        const target = this.normalizeText(this.sentence);

        log("Recognized:", transcript);
        log("Target:", target);

        log("Lev distance:", levenshtein(transcript, target) / target.length);

        if (transcripts.includes(target)) {
            //log("Match found!");
            this.mic.style.backgroundColor = this.MATCH;
            // Dispatch success sound and confetti events
            window.dispatchEvent(new CustomEvent("play-pass"));
            window.dispatchEvent(new CustomEvent("play-confetti"));
            // log("Success sound and confetti events dispatched");
            if (this.success === false) {
                this.success = true;
                const event = new CustomEvent("sentence-recognized", {
                    detail: { sentence: this.sentence },
                    bubbles: true,
                    composed: true
                });
                this.dispatchEvent(event);
                // log("Event dispatched:", event);
            }
        } else {
            // log("No match found.");
            this.mic.style.backgroundColor = this.NOMATCH;
            // Dispatch fail sound event
            window.dispatchEvent(new CustomEvent("play-fail"));
            // log("Fail sound event dispatched");
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
    log(message);
}
}

// Define custom element
customElements.define("speech-recognition", SpeechRecognitionComponent);
