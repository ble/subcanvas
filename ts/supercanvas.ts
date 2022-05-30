function getPaddingAndBorder(elt: HTMLElement) {
    const style = window.getComputedStyle(elt, null);
    const unpx = (value: string) => {
        const pattern = /^(\d+)px/;
        const m = value.match(pattern);
        if(m) {
            return Number.parseInt(m[1]);
        }
        return NaN;
    }
    const helper = (prefix: string) => ({
        left: unpx(style.getPropertyValue(`${prefix}-left-width`)),
        //right: style.getPropertyValue(`${prefix}-right`),
        top: unpx(style.getPropertyValue(`${prefix}-top-width`)),
        //bottom: style.getPropertyValue(`${prefix}-bottom`)
    });
    const g = (s: string) => unpx(style.getPropertyValue(s));
    return {
        padding: {
            left: g('padding-left'),
            top: g('padding-top'),
        },
        border: {
            left: g('border-left-width'),
            top: g('border-top-width'),
        }
    };
}

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

class VirtualizedMouseEvent extends MouseEvent {
    actualX: number;
    actualY: number;
    virtualX: number;
    virtualY: number;
    constructor(actualX: number, actualY: number, virtualX: number, virtualY: number, me: MouseEvent) {
        super(me.type, me);
        this.actualX = actualX;
        this.actualY = actualY;
        this.virtualX = virtualX;
        this.virtualY = virtualY;
    }
}
class SuperCanvas extends HTMLElement {
    static template: HTMLTemplateElement = document.createElement("template");
    static {
        this.template.innerHTML = (
`<canvas></canvas>
<div class="magic"></div>
<style>
    canvas { border: 1px white solid; image-rendering: crisp-edges; }
    .magic { display: none; }
</style>`)
    }
    canvas: HTMLCanvasElement;
    magic: Element;
    constructor() {
        super()
        let shadowRoot = this.attachShadow({mode: 'open'})
        shadowRoot.appendChild(SuperCanvas.template.content.cloneNode(true));
        this.canvas = shadowRoot.querySelector("canvas") as HTMLCanvasElement;
        this.magic = shadowRoot.querySelector(".magic") as Element;
        this.magic.canvas = this.canvas;
        console.log(this.magic, "magic!");
    }
    #sizeCanvas() {
        this.canvas.setAttribute('width', this.widthpx.toString());
        this.canvas.setAttribute('height', this.heightpx.toString());
    }
    get widthpx(): number { return Math.abs(this.rightpx - this.leftpx) }
    get heightpx(): number { return Math.abs(this.toppx - this.bottompx) }

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
    
    #activeVirtualMouseEventTypes: Set<string> = new Set();
    enableVirtualMouseEvents(types: ReadonlyArray<string>) {
        for(let type of types) {
            if(!this.#activeVirtualMouseEventTypes.has(type)) {
                this.canvas.addEventListener(type, (e) => this.virtualizeMouseEvent(e));
            }
            this.#activeVirtualMouseEventTypes.add(type);
        }
    }

    virtualizeMouseEvent(evt: Event) {
        const e: MouseEvent = evt as MouseEvent;
        const offset = getPaddingAndBorder(e.currentTarget as HTMLElement)
        let x = e.offsetX - offset.border.left - offset.padding.left,
            y = e.offsetY - offset.border.top - offset.padding.top,
            vx = this.leftpx + (this.rightpx - this.leftpx) * (x / this.widthpx),
            vy = this.toppx + (this.bottompx - this.toppx) * (y / this.heightpx);
        const v = new VirtualizedMouseEvent(x, y, vx, vy, e);
        this.magic.dispatchEvent(v);
        evt.stopPropagation();
    }

    removeVirtualizedMouseListener(type: string, listener: EventListenerOrEventListenerObject) {

    }
}


import { mapAttrib2 } from './ce_helper.js';
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'leftpx', (attr)=>Number.parseInt(attr ?? '0'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'rightpx', (attr)=>Number.parseInt(attr ?? '250'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'bottompx', (attr)=>Number.parseInt(attr ?? '0'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'toppx', (attr)=>Number.parseInt(attr ?? '250'), (n)=>n.toString())

window.customElements.define('super-canvas', SuperCanvas);



