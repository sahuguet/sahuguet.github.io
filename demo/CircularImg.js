class CircularImage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const url = this.getAttribute('url') || '';
        const size = this.getAttribute('size') || '100';
        const alt = this.getAttribute('alt') || '';
        const fit = this.hasAttribute('contain') ? 'contain' : 'cover';
        const borderColor = this.getAttribute('border-color') || '#333';

        this.shadowRoot.innerHTML = `
                    <style>
                        .circular {
                            width: ${size}px;
                            height: ${size}px;
                            border-radius: 50%;
                            overflow: hidden;
                            border: 1px solid ${borderColor};
                            display: inline-block;
                        }
                        .circular img {
                            width: 100%;
                            height: 100%;
                            object-fit: ${fit};
                        }
                    </style>
                    <div class="circular">
                        <img src="${url}" alt="${alt}">
                    </div>
                `;
    }
}

customElements.define('circular-image', CircularImage);