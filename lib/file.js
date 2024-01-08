import path from 'path'
import {glob} from 'glob'
import {isBinaryFileSync} from 'isbinaryfile'
import {render} from 'ejs'
import vueCodeMod from 'vue-codemod'
import Creator from './creator.js'
import { isObject } from './util/index.js'
import fs from 'fs-extra'

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
    render(templateDir) {
        // templateDir: file:\D:\test-module\v2\node_modules\praywithheart-react-router-plugins\dist\cjs\template
        console.log('templateDir:', templateDir)

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
    injectDepToPackage(dependencies) {
        const pkg = Creator.packageJSON()
        for(const dep in dependencies) {
            const addDep = dependencies[dep]
            const pkgDep = pkg[dep] || {}
            // 
            if(isObject(addDep) && ['dependencies', 'devDependencies'].includes(dep)) {
                // merge
                pkg[dep] = Object.assign({}, pkgDep, addDep)
            } else {
                pkg[dep] = addDep
            }
        }
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

    // execute transformation, add imports and codes to the corresponding files
    async renderFiles() {
        // 1.npm插件中执行的方法一直存储在函数回调中，等待调用
        // 2.插件中插入的依赖也同样存储在this.imports中，还没有添加到对应的文件中({key:value})
        for (const callback of this.fileRenderCallbacks) {
            // 传入模版中的配置项暂时没有用上
            await callback(this.files, {})
        }

        Object.keys(this.files).forEach(file => {
            // 引入对应文件需要的依赖
            const imports = this.imports[file]
            if(imports?.length) {
                this.files[file] = runTransformation(
                    {path: file, source: this.files[file]},
                    // 处理imports语句在文件中的位置
                    injectImports,
                    {imports}
                )
            }
        })
    }

    writeFileToProject(projectDir) {
        Object.keys(this.files).forEach(file => {
            const filePath = path.join(projectDir, file)
            console.log('template file path:', filePath)
            // 文件不存在则创建
            fs.ensureDirSync(path.dirname(filePath))
            fs.writeFileSync(filePath, this.files[file])
        })
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