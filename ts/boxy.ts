export {
    BoxElement,
    Box, DefiniteBox,
    Immutable,
    defined, compare, sleep,
    selectMultiple, attrNames, 
    elementPowerset}

interface IntervalAbstract {
    lower?: number
    upper?: number
    width?: number
}

////////////////////////////////////////////////////////////////////////////////
// Begin utility stuff
function entriesSpecific<T>(t: T): [keyof T, unknown][] {
    return Object.entries(t) as [keyof T, unknown][];
}

function entriesDefined<T>(t: T): [keyof T, boolean][] {
    return entriesSpecific(t).map( ([k, v]) => [k, v !== undefined] )
}

type NotUndefined<T> = T extends undefined ? never : T;
function defined<T>(x: T): x is NotUndefined<T> {
    return x !== undefined;
}
function attrNames(e: Element) {
    return Array.from(e.attributes).map((a)=>a.localName);
}
function *elementPowerset<Element extends HTMLElement>(
    e: Element,
    attribs?: ReadonlyArray<string>): Generator<[number, Element]> {
    attribs = attribs || attrNames(e);
    const n = 2**attribs.length;
    for(let ix = 0; ix < n; ix++) {
        // Hit the typesystem over the head and tell it that
        // `document.createElement(e.tagName)` returns the same element type as `e`.
        const elt = document.createElement(e.tagName) as Element;
        for(let jx = 0; jx < attribs.length; jx++) {
            if(ix & (1 << jx)) {
                elt.setAttribute(attribs[jx], e.getAttribute(attribs[jx]) ?? '');
            }
        }
        yield [ix, elt];
    }
}

function selectMultiple(selectors: string[]): (Element | null)[] {
    return selectors.map( (s) => document.querySelector(s));
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise( (resolve, reject) => window.setTimeout(resolve, milliseconds));
}

function compare(a: number, b: number): -1 | 0 | 1 {
    if(a < b)
        return -1;
    if(a > b)
        return 1;
    return 0;
}

function formatNumber(x: number | undefined, places: number): string {
    if (x === undefined) {
        return "?";
    }
    return x.toFixed(places);
}
// End utility stuff
////////////////////////////////////////////////////////////////////////////////

class Interval implements IntervalAbstract {
    lower?: number
    upper?: number
    width?: number

    format(places: number): string {
        const f = (x?: number) => x === undefined ? "?" : x.toFixed(places);
        return `(${f(this.lower)}, ${f(this.upper)}), Δ=${f(this.width)}`;
    }

    static nSpecified(i: Interval): number {
        return entriesDefined(i).filter( ([,v]) => v).length
    }
    static isValid(i: Interval): boolean {
        let n = Interval.nSpecified(i);
        if(n == 2)
            return true
        if(n == 3 && defined(i.lower) && defined(i.upper) && defined(i.width))
            return i.lower + i.width == i.upper;
        return false;
    }
    static toDefinite(i: Interval): DefiniteInterval {
        if(Interval.nSpecified(i) < 2)
            throw new Error("interval is underspecified");
        if(!Interval.isValid(i))
            throw new Error("interval is invalid");
        if(defined(i.lower)) {
            if(defined(i.upper))
                return new DefiniteInterval(i.lower, i.upper)
            else if(defined(i.width))
                return new DefiniteInterval(i.lower, i.lower+i.width);
        } else if(defined(i.width) && defined(i.upper)) {
            return new DefiniteInterval(i.upper - i.width, i.upper);
        }
        throw new Error("interval is busted"); 
    }
    static asDefinite(i: Interval): DefiniteInterval | null {
        try {
            return Interval.toDefinite(i);
        } catch(ex) {
            return null;
        }
    }
    static assigningWidth(i: Interval, width: number): DefiniteInterval | null {
        if(defined(i.width))
            return null;
        if(defined(i.lower) && !defined(i.upper)) {
            return new DefiniteInterval(i.lower, i.lower + width)
        } else if(!defined(i.lower) && defined(i.upper)) {
            return new DefiniteInterval(i.upper - width, i.upper);
        }
        return null;
    }
}

class DefiniteInterval {
    lower: number;
    upper: number;
    constructor(lower: number, upper: number) {
        this.lower = lower;
        this.upper = upper;
    }
    get width() { return this.upper - this.lower; }
}

class DefiniteBox {
    left: number;
    right: number;
    bottom: number;
    top: number;
    constructor(left: number, right: number, bottom: number, top: number) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
    }
    get width() { return this.right - this.left; }
    get height() { return this.top - this.bottom; }
    get aspectX_overY() { return this.width / this.height; }
}

class Box {
    #x: Interval;
    #y: Interval;
    #aspectX_overY?: number;
    constructor() {
        this.#x = new Interval();
        this.#y = new Interval();
    }
    set left(left: number) {
        this.#x.lower = left;
    }
    set right(right: number) {
        this.#x.upper = right;
    }
    set width(width: number) {
        this.#x.width = width;
    }
    set bottom(bottom: number) {
        this.#y.lower = bottom;
    }
    set top(top: number) {
        this.#y.upper = top;
    }
    set height(height: number) {
        this.#y.width = height;
    }
    set aspectX_overY(aspect: number | undefined) {
        this.#aspectX_overY = aspect;
    }
    static format(box: Box, places: number): string {
        return `
    x: ${box.#x.format(places)}
    y: ${box.#y.format(places)}
    aspectX_overY: ${formatNumber(box.#aspectX_overY, places)}`
    }
    static toDefinite(that: Box): DefiniteBox | null {
        let x = Interval.asDefinite(that.#x),
            y = Interval.asDefinite(that.#y);
        if(!defined(that.#aspectX_overY)) {
            if(x !== null && y !== null) {
                return new DefiniteBox(x.lower, x.upper, y.lower, y.upper);
            }
        } else if(x !== null && y == null) {
            let yy = Interval.assigningWidth(that.#y, x.width / that.#aspectX_overY);
            if(yy != null) {
                return new DefiniteBox(x.lower, x.upper, yy.lower, yy.upper);
            }
        } else if(x == null && y !== null) {
            let xx = Interval.assigningWidth(that.#x, y.width * that.#aspectX_overY)
            if(xx != null) {
                return new DefiniteBox(xx.lower, xx.upper, y.lower, y.upper);
            }
        }
        return null;
    }
}

type Immutable<T> = {
    readonly [K in keyof T]: T[K]
};

class BoxElement extends HTMLElement {
    static InvalidBoxCallback(elt: BoxElement, box: Box) {
        console.error("Element with invalid box specification", elt, Box.format(box, 3))
    }
    #box: DefiniteBox | null;
    constructor() {
        super()
        this.#box = null;
        //this.connectedCallback();
    }
    connectedCallback() {
        this.attributeChangedCallback();
    }
    attributeChangedCallback() {
        const spec = this.#boxSpec;
        this.#box = Box.toDefinite(this.#boxSpec);
        if(this.#box === null) {
            BoxElement.InvalidBoxCallback(this, spec);
        }
    }
    get #boxSpec(): Box {
        const builder = new Box();
        const parseFloat = (x: string | null): number => (x == null) ? NaN : Number.parseFloat(x);
        for(let attrName of BoxElement.#attribs) {
            let value = parseFloat(this.getAttribute(attrName));
            if(!Number.isNaN(value)) {
                builder[attrName] = value;
            }
        }
        return builder
    }
    get valid(): boolean {
        return this.#box != null;
    }
    get box(): Immutable<DefiniteBox> | null {
        return this.#box;
    }
    static readonly #attribs: ReadonlyArray<keyof Box> = [
        'left', 'right',
        'bottom', 'top',
        'width', 'height',
        'aspectX_overY'
    ]
    static get observedAttributes() {
        return  this.#attribs;
    }
}
window.customElements.define('box-elt', BoxElement);