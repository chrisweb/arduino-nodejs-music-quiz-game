
export interface IValuesToStoreObject {
    [key: string]: string | number;
}

export class LocalStorageLibrary {

    protected _localStorage: Storage;

    constructor() {

        // https://developer.mozilla.org/en/docs/Web/API/Window/localStorage
        this._localStorage = window.localStorage;

    }

    public set(key: string, value: any) {

        this._localStorage.setItem(key, value);

    }

    public get(key: string): any {

        return this._localStorage.getItem(key);

    }

    public setMultiple(values: IValuesToStoreObject) {

        for (var key in values) {

            this._localStorage.setItem(key, values[key].toString());

        };

    }

}