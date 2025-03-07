class ArrowKeyWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Widget HTML
        this.shadowRoot.innerHTML = `
            <style>
                /* Floating Widget Styles */
                #arrow-widget {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.7);
                    padding: 10px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                }

                .arrow-btn {
                    width: 40px;
                    height: 40px;
                    margin: 5px;
                    font-size: 18px;
                    text-align: center;
                    line-height: 40px;
                    background: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }

                .arrow-btn:hover {
                    background: lightgray;
                }

                #middle-row {
                    display: flex;
                    justify-content: center;
                    gap: 5px;
                }
            </style>

            <div id="arrow-widget">
                <button class="arrow-btn" data-key="ArrowUp">↑</button>
                <div id="middle-row">
                    <button class="arrow-btn" data-key="ArrowLeft">←</button>
                    <button class="arrow-btn" data-key="ArrowDown">↓</button>
                    <button class="arrow-btn" data-key="ArrowRight">→</button>
                </div>
            </div>
        `;

        // Attach event listeners
        this.shadowRoot.querySelectorAll('.arrow-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                this.simulateKey(event.target.getAttribute('data-key'));
            });
        });
    }

    simulateKey(key) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
    }
}

// Define the custom element
customElements.define('arrow-key-widget', ArrowKeyWidget);
