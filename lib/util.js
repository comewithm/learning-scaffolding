import ora from 'ora'
import userhome from 'userhome'
import fs from 'fs-extra'
import path from 'path'
import { Module } from 'module'

export const configPath = userhome('.pray-cli.json')

export const wrapLoading = async (fn, message, ...args) => {
    const spinner = ora(message)
    // 记载动画
    spinner.start()

    try {
        // 执行
        const result = await fn(...args)
        spinner.succeed()
        return result
    } catch (error) {
        spinner.fail('Request failed')
    }
}


export const getConfiguration = () => {
    console.log('path: ', configPath)
    // C:\Users\galaxyeye\.pray-cli.json
    const isExist = fs.existsSync(configPath)
    if(!isExist) {
        // 创建文件
        createJson(configPath)
    } 
    return fs.readJsonSync(configPath)
}

function createJson(configPath) {
    const jsonData = {
        plugins: [
            // 自定义插件名称(npm包名) 
            // 或者插件的处理全部放在当前cli项目中,但这样会导致cli包体积变大，
            // 不能很好的扩展插件
        ]
    }

    const jsonString = JSON.stringify(jsonData, null, 2)

    fs.writeFileSync(configPath, jsonString, 'utf-8', (err) => {
        if(err) {
            console.error('Error writing JSON file: ', err)
        }
        console.log(`JSON file created successfully in ${configPath}`)
    })
}

export const loadModule = (request, contextDir) => {
    return Module.createRequire(
        path.resolve(
            contextDir,
            'package.json'
        )
    )(request)
}