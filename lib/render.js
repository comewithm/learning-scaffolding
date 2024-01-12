import FileInfo from "./file.js"
import path, { dirname } from 'path'
export default class PluginRender {

    constructor(id, fileModule, options) {
        // 插件名
        this.id = id
        this.fileModule = new FileInfo() || fileModule
        // 插件参数选项
        this.options = options
    }

    get injectFileName() {
        return 'src/main.jsx'
    }

    // 模板文件渲染
    // fileName: 'file:///D:/test-module/v2/node_modules/praywithheart-react-router-plugins/dist/cjs/generator.js'
    render(fileName, templateDir) {
        this.fileModule.render(path.join(dirname(fileName), templateDir))
    }

    // 注入import模块语句
    injectImport(file, imports) {
        this.fileModule.injectImport(file, imports)
    }

    transformCode(file, codeMod, options = {}) {
        this.fileModule.addJSShiftToCallbacks(file, codeMod, options)
    }

    addToPackageJSON(packageJsonInfo) {
        this.fileModule.injectToPackageJson(packageJsonInfo)
    }
}