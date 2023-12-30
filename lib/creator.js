import inquirer from 'inquirer'
import {execa} from 'execa'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { getConfiguration, loadModule, wrapLoading } from './util.js'
import { fileURLToPath } from 'url'
import PluginApi from './plugin.js'
import FileInfo from './file.js'

const getToolList = () => {
    return ['npm', 'yarn', 'pnpm'].map(value => ({name: value, value}))
}

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default class Creator {
    constructor(projectName, targetDir) {
        // 项目名称
        this.projectName = projectName;
        // 项目文件夹路径
        this.projectDir = targetDir;
        // 本地模版文件的路径
        this.templateDir = null
        // 插件模块
        this.pluginModule = new PluginApi()
        // 文件渲染模块
        this.fileModule = new FileInfo()

        this.tool = 'npm'

        this.pkg = null

    }

    async chooseTool() {
        const {tool} = await inquirer.prompt({
            name: 'tool',
            type: 'list',
            message: '请选择项目依赖安装的工具',
            choices: getToolList()
        })

        try {
            await execa(tool, ['--version'])
        } catch (error) {
            // 选择的工具没有安装
            const {installSelectedTool} = await inquirer.prompt({
                name: 'installSelectedTool',
                type: 'confirm',
                message: `未安装${chalk.red(tool)}, 是否全局安装${chalk.red(tool)}?`
            })
            if(installSelectedTool) {
                await wrapLoading(execa, `${tool}安装...`, 'npm', ['install', '-g', `${tool}`])
            } else {
                return
            }
        }
        this.tool = tool
        return tool
    }

    async selectDownloadRepo() {
        // 框架
        const {selectedRepo} = await inquirer.prompt({
            name: 'selectedRepo',
            type: 'list',
            message: '选择开发框架',
            choices: ['React', 'Vue'].map(choice => ({name: choice, value: choice}))
        })
        // ts or js
        const {selectedLanguage} = await inquirer.prompt({
            name: 'selectedLanguage',
            type: 'list',
            message: '选择开发脚本语言',
            choices: ['Typescript', 'Javascript'].map(choice => ({name: choice, value: choice}))
        })

        // confirm the template
        let template = 'template-' + selectedRepo.toLowerCase()
        if(selectedLanguage === 'Typescript') {
            template += '-ts'
        }
        return template
    }

    async downloadTemplate() {
        // 获取模版名称
        const template = await this.selectDownloadRepo()
        // 本地模版路径
        this.templateDir = path.resolve(dirname, '../template', template)
        // 指定下载的文件夹路径
        console.log('targetDir', this.templateDir, this.projectDir)
        // 模版复制到指定下载路径
        await fs.copy(this.templateDir, this.projectDir)
    }

    async downloadPlugins() {
        const pkgPath = path.join(this.projectDir, 'package.json')
        this.pkg = await fs.readJSON(pkgPath)
        const pkg = this.pkg
        const pluginDeps = Object.keys(this.pluginModule.selectedPlugins)
        if(pluginDeps.length) {
            pluginDeps.forEach((dep) => {
                pkg.devDependencies[dep] = 'latest'
            })
            // tool
            const command = this.tool === 'npm' ? 'install' : 'add'
            const outputConfig = {cwd: this.projectDir, studio: 'inherit'}
            await wrapLoading(execa, `plugins安装...`, this.tool, [command, ...pluginDeps, '-D'], outputConfig)
        }
    }

    async selectPlugins() {
        // 内部plugins选择
        const plugins = ['router', 'eslint'].map(file => import(`./plugins/${file}.js`))
        await this.pluginModule.initPlugins(plugins)
        await this.pluginModule.resolvePluginPrompt()
        // 外部plugins获取
        const rootConfig = getConfiguration()
        this.pluginModule.getRootPlugins(rootConfig)

        console.log("selectedPlugins: ", this.pluginModule.selectedPlugins)
    }

    

    async create() {
        // 1.安装工具选择npm yarn pnpm
        const tool = await this.chooseTool()
        if(!tool) return

        // 2.下载仓库模版
        await this.downloadTemplate()
        // 3.插件处理
        await this.selectPlugins()
        // todo: 4.插件下载(不是单一的依赖库)
        await this.downloadPlugins()
        // 4.1插件解析
        await this.pluginModule.resolvePlugins(this.projectDir)
        // 4.2插件执行
        await this.pluginModule.applyPlugins(this.fileModule)

        // 4.1根据插件中设置的属性, 用ejs渲染模版
        // 4.2执行插件中的方法，设置导入模块语句
        // 4.3转换脚本处理
        // 4.4添加依赖到package.json
    }
}