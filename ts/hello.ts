export { install }

//console.log(window);

class Subcanvas extends HTMLElement {
    constructor() {
        super();
        console.log("here I am");
        let shadowRoot = this.attachShadow({mode: "open"});
        let style = document.createElement('style');
        style.textContent = `canvas { border: 1px black solid; }`;
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(document.createElement("canvas"));
    }

    connectedCallback() {
        console.log("CONNECTED!");
    }

}
window.customElements.define("ble-subcanvas", Subcanvas)
function install(w: Window) {
    //
    console.log("oh nooooo!")
}