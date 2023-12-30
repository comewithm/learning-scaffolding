import FileInfo from "./file"

export default class PluginRender {

    constructor(id, fileModule, options) {
        // 插件名
        this.id = id
        this.fileModule = new FileInfo() || fileModule
        // 插件参数选项
        this.options = options
    }
    // 模板文件渲染
    render(templateDir) {
        this.fileModule.render(id, templateDir)
    }

    // 注入import模块语句
    injectImport() {

    }
}