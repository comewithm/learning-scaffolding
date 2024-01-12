import { isObject } from "./util"

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
        if(isObject(dependencies)) {
            this.pkg['devDependencies'] = this.pkg['devDependencies'] || {}
            this.pkg['devDependencies'] = {
                ...this.pkg['devDependencies'],
                ...devDependencies
            }
        }
    }

    addScript(script) {
        if(isObject(dependencies)) {
            this.pkg['script'] = {
                ...this.pkg['script'],
                ...script
            }
        }
    }
}