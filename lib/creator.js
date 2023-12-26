import inquirer from 'inquirer'
import {execa} from 'execa'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'
import { wrapLoading } from './util.js'
import { fileURLToPath } from 'url'

const getToolList = () => {
    return ['npm', 'yarn', 'pnpm'].map(value => ({name: value, value}))
}

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default class Creator {
    constructor(projectName, targetDir) {
        this.projectName = projectName;
        this.projectDir = targetDir;
        // 本地模版文件的路径
        this.templateDir = null
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

    async download() {
        // 获取模版名称
        const template = await this.selectDownloadRepo()
        // 本地模版路径
        this.templateDir = path.resolve(dirname, '../template', template)
        // 指定下载的文件夹路径
        console.log('targetDir', this.templateDir, this.projectDir)
        // 模版复制到指定下载路径
        await fs.copy(this.templateDir, this.projectDir)
    }

    async create() {
        // 1.安装工具选择npm yarn pnpm
        const tool = await this.chooseTool()
        if(!tool) return

        // 2.下载仓库模版
        await this.download()
        // todo: 3.插件处理
    }
}