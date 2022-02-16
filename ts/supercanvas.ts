interface SuperCanvas {
    get leftpx(): number;
    set leftpx(x: number);
    get rightpx(): number;
    set rightpx(x: number);
    get bottompx(): number;
    set bottompx(x: number);
    get toppx(): number;
    set toppx(x: number);
}
class SuperCanvas extends HTMLElement {
    canvas: HTMLCanvasElement;
    constructor() {
        super()
        let shadowRoot = this.attachShadow({mode: 'open'})
        let style = document.createElement('style');
        style.textContent = `canvas { border: 1px black solid; }`;
        shadowRoot.appendChild(style);
        this.canvas = document.createElement("canvas");
        shadowRoot.appendChild(this.canvas);
    }
    #sizeCanvas() {
        this.canvas.setAttribute('width', this.widthpx.toString());
        this.canvas.setAttribute('height', this.heightpx.toString());
    }
    get widthpx(): number { return this.rightpx - this.leftpx }
    get heightpx(): number { return this.toppx - this.bottompx }

    connectedCallback() {
        this.#sizeCanvas();
    }

    attributeChangedCallback() {
        this.#sizeCanvas();
    }

    static readonly oAttributes: string[] = ['leftpx', 'rightpx', 'bottompx', 'toppx'];
    static get observedAttributes() {
        return SuperCanvas.oAttributes;
    }
}
window.customElements.define('super-canvas', SuperCanvas);
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'leftpx', (attr)=>Number.parseInt(attr ?? '0'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'rightpx', (attr)=>Number.parseInt(attr ?? '250'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'bottompx', (attr)=>Number.parseInt(attr ?? '0'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'toppx', (attr)=>Number.parseInt(attr ?? '250'), (n)=>n.toString())

let z = new SuperCanvas();



