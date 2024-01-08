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
        spinner.succeed()
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


export const injectImports = (file, api, { imports }) => {
    const j = api.jscodeshift
    const root = j(file.source)
    // 找到文件中的依赖引入元素
    const declarations = root.find(j.ImportDeclaration)

    const importNodes = (curImport) => {
        const curRoot = j(`${curImport}\n`)
        const nodes = curRoot.nodes()
        console.log('curRoot: ', curRoot, nodes)
        return nodes[0].program.body
    }

    const importAstNodes = imports.map(importNodes)

    console.log('importAstNodes', importAstNodes)

    if (declarations.length) {
        declarations.at(-1).insertAfter(importAstNodes[0])
    } else {
        root.get().node.program.body.unshift(...importAstNodes[0])
    }

    return root.toSource()
}