export {mapAttrib, mapAttrib2}
interface CustomElementHelper {
    readonly oAttributes: string[]
    prototype: object
}

function mapAttrib<E extends HTMLElement, T>(o: object, attrName: string, fromAttrib: (attr: string | null)=>T, toAttrib: (value: T)=>string) {
    const descriptor = {
        set: function(this: E, value: T): void { this.setAttribute(attrName, toAttrib(value))},
        get: function(this: E): T { return fromAttrib(this.getAttribute(attrName))}
    }
    Object.defineProperty(o, attrName, descriptor);
}

function mapAttrib2<E extends HTMLElement, T>(o: CustomElementHelper, attrName: string, fromAttrib: (attr: string | null)=>T, toAttrib: (value: T)=>string) {
    const descriptor = {
        set: function(this: E, value: T): void { this.setAttribute(attrName, toAttrib(value))},
        get: function(this: E): T { return fromAttrib(this.getAttribute(attrName))}
    }
    o.oAttributes.push(attrName);
    Object.defineProperty(o.prototype, attrName, descriptor);
}