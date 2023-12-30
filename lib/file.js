import path from 'path'
import {glob} from 'glob'
import {isBinaryFileSync} from 'isbinaryfile'
import {render} from 'ejs'

export default class FileInfo {

    constructor() {
        // 单例
        if(FileInfo.instance) {
            return FileInfo.instance
        }

        // 最终生成的文件
        this.files = {}
        // 导入模块语句
        this.imports = {}
        // 待执行的文件渲染函数
        this.fileRenderCallbacks = []

        FileInfo.instance = this
        return this
    }

    addFileRenderToCallbacks(callback) {
        this.fileRenderCallbacks.push(callback)
    }
    // 插件中的模板文件目录(相对路径 => 绝对路径)
    render(pluginName, templateDir) {
        const pluginDir = path.dirname(require.resolve(pluginName))
        templateDir = path.resolve(pluginDir, templateDir)

        const callback = async (files, options) => {
            const templateFiles = await getAllFileFromTemplate(templateDir)
            templateFiles.forEach(async(templateFile) => {
                files[templateFile] = await ejsRenderFile(
                    path.resolve(templateDir, templateFile),
                    options
                )
            })
        }
        this.addFileRenderToCallbacks(callback)
    }

    

    injectImport() {

    }

    // add dependencies
    injectDepToPackage() {

    }
    // resource code transformation
    addJSShiftToCallbacks() {

    }
}

export async function getAllFileFromTemplate(fileDir) {
    const templateInnerFiles = await glob('**/*', {cwd: fileDir, nodir: true})
    const templateOuterFiles = await glob('.*', {cwd: fileDir, nodir: true})
    return [...templateOuterFiles, ...templateInnerFiles]
}

export async function ejsRenderFile(filePath, options) {
    if(isBinaryFileSync(filePath)) {
        return fs.readFileSync(filePath)
    }

    const file = fs.readFileSync(filePath, 'utf8')
    return render(file, options)
}