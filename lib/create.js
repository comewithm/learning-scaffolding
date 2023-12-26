import fs from 'fs-extra'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import Creator from './creator.js'

export default async (name, options) => {
    // console.log('create.js:', name, options)

    // 执行创建命令

    // 当前命令行选择的目录 (current working directory)
    const cwd = process.cwd()
    // 需要创建的目录地址
    const targetDir = path.join(cwd, name)
    console.log('targetDir', targetDir, options)
    // 目录是否存在
    if(fs.existsSync(targetDir)) {
        // 已存在 是否强制创建
        if(options.force) {
            await fs.remove(targetDir)
        } else {
            console.log("options", options)
            // 是否确定要覆盖
            const {action} = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: 'Target directory already exists Pick an action:',
                    choices: [
                        {
                            name: 'Overwrite',
                            value: true
                        },
                        {
                            name: 'Cancel',
                            value: false
                        }
                    ]
                }
            ])

            if(!action) {
                return
            } 
            console.log(`\r\nRemoving...`)
            await fs.remove(targetDir)
        }
    }

    // 创建项目
    const creator = new Creator(name, targetDir)

    // 开始创建项目
    creator.create()
}