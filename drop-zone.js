import { css, html, LitElement } from 'lit-element';

class DropZone extends LitElement {
    static get properties() {
        return {
            acceptedMimeTypes: { type: Array },
            maxSizeFile: { type: Number }
        }
    }

    static get styles() {
        return css`
            .dropzone {
                box-sizing: border-box;
                display: none;
                position: fixed;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                z-index: 99999;            
                background: rgba(255, 255, 255, 0.9);
                border: 11px dashed #60a7dc;
                justify-content: center;
                align-items: center;
                font-size: 26px;
            }
        `;
    }

    constructor() {
        super();
        this.acceptedMimeTypes = ['application/pdf', 'application/json'];
        this.maxSizeFile = 1000000;
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('dragenter', () => {
            this._showDropZone();
        });
    }

    disconnectedCallback() {
        window.addEventListener('dragenter', () => {
            this._showDropZone();
        });

        super.disconnectedCallback();
    }

    _allowDrag(e) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }

    _handleDrop(e) {
        e.preventDefault();
        this._process(e.dataTransfer.files);
        this._hideDropZone(e);
    }

    _hideDropZone(e) {
        e.target.style.display = 'none';
    }

    _showDropZone() {
        let dropZone = this.shadowRoot.getElementById('dropzone');
        dropZone.style.display = 'flex';
    }

    _process(files) {
        const acceptedFiles = new Array();
        const invalidSizeFiles = new Array();
        const invalidTypeFiles = new Array();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (this.acceptedMimeTypes.includes(file.type)) {
                if (this.maxSizeFile >= file.size) {
                    acceptedFiles.push(file);
                } else {
                    invalidSizeFiles.push(file);
                }
            } else {
                invalidTypeFiles.push(file);
            }
        }

        this._handleValidFiles(acceptedFiles);
        this._handleInvalidFiles(invalidSizeFiles, invalidTypeFiles);
    }

    _handleValidFiles(files) {
        this.dispatchEvent(new CustomEvent('on-process', {
            detail: files,
            composed: true
        }));
    }

    _handleInvalidFiles(invalidSizeFiles, invalidTypeFiles) {
        this.dispatchEvent(new CustomEvent('on-error', {
            detail: {
                invalidSizeFiles, invalidTypeFiles
            },
            composed: true
        }))
    }

    render() {
        return html`
            <div id="dropzone" class="dropzone" @dragleave=${this._hideDropZone} @drop=${this._handleDrop}
                @dragenter=${this._allowDrag} @dragover=${this._allowDrag}>
                Arraste e solte o arquivo para o processamento
            </div>
            <slot></slot>
        `;
    }
}

customElements.define('drop-zone', DropZone);