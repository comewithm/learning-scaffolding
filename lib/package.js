import { isObject } from "./util/index.js"

export default class PackageJSON {
    constructor() {
        this.pkg = {}
    }

    setPkg(pkg) {
        this.pkg = pkg
    }

    addDependencies(dependencies) {
        if(isObject(dependencies)) {
            this.pkg['dependencies'] = this.pkg['dependencies'] || {}
            this.pkg['dependencies'] = {
                ...this.pkg['dependencies'],
                ...dependencies
            }
        }
    }

    addDevDependencies(devDependencies) {
        if(isObject(devDependencies)) {
            this.pkg['devDependencies'] = this.pkg['devDependencies'] || {}
            this.pkg['devDependencies'] = {
                ...this.pkg['devDependencies'],
                ...devDependencies
            }
        }
    }

    addScript(scripts) {
        if(isObject(scripts)) {
            this.pkg['scripts'] = {
                ...this.pkg['scripts'],
                ...scripts
            }
        }
    }
}