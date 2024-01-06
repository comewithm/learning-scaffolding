import path from 'path'
import {glob} from 'glob'
import {isBinaryFileSync} from 'isbinaryfile'
import {render} from 'ejs'
import vueCodeMod from 'vue-codemod'

const {runTransformation} = vueCodeMod
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
        // todo: need test
        const pluginDir = path.dirname(require.resolve(pluginName))
        console.log('pluginDir:', pluginDir)
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
    /**
     * 
     * @param {*} file imports key
     * @param {*} newImports imports value
     */
    injectImport(file, newImports) {
        this.imports[file] = this.imports[file] || []
        this.imports[file].push(newImports)
    }

    // add dependencies
    injectDepToPackage() {

    }
    // resource code transformation
    addJSShiftToCallbacks(file, codeMod, options = {}) {
        // 执行脚本转换
        const callback = (files) => {
            files[file] = runTransformation(
                {path: file, source: files[file]},
                codeMod,
                options
            )
        }
        this.addFileRenderToCallbacks(callback)
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