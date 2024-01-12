import path from 'path'
import {glob} from 'glob'
import {isBinaryFileSync} from 'isbinaryfile'
import {render} from 'ejs'
import vueCodeMod from 'vue-codemod'
import fs from 'fs-extra'
import { getNormalizedFileDir } from './util/config.js'
import PackageJSON from './package.js'

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
        this.packageJSON = new PackageJSON(),
        // 待执行的文件渲染函数
        this.fileRenderCallbacks = []

        FileInfo.instance = this
        return this
    }

    addFileRenderToCallbacks(callback) {
        this.fileRenderCallbacks.push(callback)
    }

    async initFiles(projectDir) {
        const projectFiles = await glob('**/*', {cwd: projectDir, nodir: true})

        projectFiles.forEach(async (file) => {
            const filePath = path.join(projectDir, file)
            let content = ''
            if(isBinaryFileSync(filePath)) {
                content = await fs.readFile(filePath)
            } else {
                content = await fs.readFile(filePath, 'utf8')
            }
            const curFileName = file.split('\\').join('/')
            this.files[curFileName] = content
        })
    }

    // 插件中的模板文件目录(相对路径 => 绝对路径)
    render(templateDir) {
        // templateDir: file:\D:\test-module\v2\node_modules\praywithheart-react-router-plugins\dist\cjs\template
        // we need is the npm package's template directory
        console.log('templateDir:', templateDir)

        const callback = async (files, options) => {
            // ['src\\router.js']
            const templateFiles = await getAllFileFromTemplate(templateDir)
            templateFiles.forEach(async(templateFile) => {
                files[templateFile] = await ejsRenderFile(
                    path.join(templateDir, templateFile),
                    options
                )
            })
        }
        this.addFileRenderToCallbacks(callback)
    }
    /**
     * unused function
     * @param {*} file imports key
     * @param {*} newImports imports value
     */
    injectImport(file, newImports) {
        this.imports[file] = this.imports[file] || []
        this.imports[file].push(newImports)
    }

    // add dependencies
    injectToPackageJson({...packageJsonInfo}) {
        const {
            dependencies,
            devDependencies,
            script
        } = packageJsonInfo

        if(dependencies) {
            this.packageJSON.addDependencies(dependencies)
        }
        if(devDependencies) {
            this.packageJSON.addDevDependencies(devDependencies)
        }
        if(script) {
            this.packageJSON.addScript(script)
        }

    }
    // resource code transformation
    addJSShiftToCallbacks(file, codeMod, options = {}) {
        // 执行脚本转换
        const callback = (files) => {
            const source = files[file]
            files[file] = runTransformation(
                {path: file, source},
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
    }

    // 写入项目文件中
    writeFileToProject(projectDir) {
        Object.keys(this.files).forEach(file => {
            const filePath = path.join(projectDir, file)
            console.log('template file path:', filePath, file)
            // 文件不存在则创建
            fs.ensureDirSync(path.dirname(filePath))
            fs.writeFileSync(filePath, this.files[file])
        })
    }
}

export async function getAllFileFromTemplate(fileDir) {
    const normalizedFileDir = getNormalizedFileDir(fileDir)
    const templateInnerFiles = await glob('**/*', {cwd: normalizedFileDir, nodir: true})
    const templateOuterFiles = await glob('.*', {cwd: normalizedFileDir, nodir: true})
    return [...templateOuterFiles, ...templateInnerFiles]
}

export function ejsRenderFile(filePath, options) {
    filePath = getNormalizedFileDir(filePath)
    if(isBinaryFileSync(filePath)) {
        return fs.readFileSync(filePath)
    }

    const file = fs.readFileSync(filePath, 'utf8')
    return render(file, options)
}