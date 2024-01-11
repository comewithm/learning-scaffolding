import ora from 'ora'
import path from 'path'
import { Module } from 'module'

export const wrapLoading = async (fn, message, ...args) => {
    const spinner = ora(message)
    // 记载动画
    spinner.start()

    try {
        // 执行
        const result = await fn(...args)
        spinner.succeed('install succeed!!!')
        return true
    } catch (error) {
        spinner.fail('Request failed')
        console.log("error:", error)
        return false
    }
}

export const loadModule = (request, contextDir) => {

    const absolutePath = path.resolve(contextDir, 'package.json')

    return Module.createRequire(absolutePath)(request)
}
