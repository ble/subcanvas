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
class SuperCanvas extends HTMLElement {
    canvas: HTMLCanvasElement;
    constructor() {
        super()
        let shadowRoot = this.attachShadow({mode: 'open'})
        let style = document.createElement('style');
        style.textContent = `canvas { border: 1px black solid; image-rendering: crisp-edges; }`;
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
    
    addVirtualizedMouseListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        this.canvas.addEventListener(type, this.virtualizeMouse(listener), options);
    }

    virtualizeMouse(listener: EventListener): EventListener;
    virtualizeMouse(listener: EventListenerObject): EventListenerObject;
    virtualizeMouse(listener: EventListenerOrEventListenerObject): EventListenerOrEventListenerObject;
    virtualizeMouse(listener: EventListenerOrEventListenerObject): EventListenerOrEventListenerObject {
        if("handleEvent" in listener){
            return {handleEvent: this.virtualizeMouse(listener.handleEvent)}
        }
        return (evt: Event) => {
            const e: MouseEvent = evt as MouseEvent;
            const offset = getPaddingAndBorder(e.currentTarget as HTMLElement)
            let x = e.offsetX - offset.border.left - offset.padding.left,
                y = e.offsetY - offset.border.top - offset.padding.top;

            //console.log([e.offsetX - offset.border.left - offset.padding.left, e.offsetY - offset.border.top - offset.padding.top])
            let ctx = this.canvas.getContext("2d");
            ctx?.rect(x, y, 1, 1);
            ctx?.fill();
            listener(evt);
        }
    }
    removeVirtualizedMouseListener(type: string, listener: EventListenerOrEventListenerObject) {

    }
}
window.customElements.define('super-canvas', SuperCanvas);

import { mapAttrib2 } from './ce_helper.js';
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'leftpx', (attr)=>Number.parseInt(attr ?? '0'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'rightpx', (attr)=>Number.parseInt(attr ?? '250'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'bottompx', (attr)=>Number.parseInt(attr ?? '0'), (n)=>n.toString())
mapAttrib2<SuperCanvas, number>(SuperCanvas, 'toppx', (attr)=>Number.parseInt(attr ?? '250'), (n)=>n.toString())

let z = new SuperCanvas();



