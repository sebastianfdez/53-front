export class CustomInput extends HTMLInputElement {
    constructor() {
        super();
        console.log(this.tabIndex);
    }
    connectedCallBack() {
    }
}
