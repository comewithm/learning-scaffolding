import inquirer from 'inquirer'
import {execa} from 'execa'
import chalk from 'chalk'
import { wrapLoading } from './util.js'

const getToolList = () => {
    return ['npm', 'yarn', 'pnpm'].map(value => ({name: value, value}))
}

export default class Creator {
    constructor(projectName, targetDir) {
        this.projectName = projectName;
        this.targetDir = targetDir;
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

    async download() {

    }

    async create() {
        // 1.安装工具选择npm yarn pnpm
        const tool = await this.chooseTool()
        if(!tool) return

        // 2.下载仓库模版
        await this.download()
    }
}