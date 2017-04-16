
export interface IValuesToStoreObject {
    [key: string]: string | null;
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

    public remove(key: string): void {

        this._localStorage.removeItem(key);

    }

    public setMultiple(values: IValuesToStoreObject) {

        for (var key in values) {
            this._localStorage.setItem(key, values[key].toString());
        };

    }

    public getMultiple(values: IValuesToStoreObject): IValuesToStoreObject {

        for (var key in values) {
            values[key] = this._localStorage.getItem(key);
        };

        return values;

    }

    public removeMultiple(values: IValuesToStoreObject): void {

        for (var key in values) {
            this._localStorage.removeItem(key);
        }

    }

}