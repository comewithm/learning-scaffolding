import ora from 'ora'
import { getRepoList, getTagList } from './http.js'
import inquirer from 'inquirer'
import downloadGitRepo from 'download-git-repo'
import util from 'util'
import path from 'path'
import chalk from 'chalk'

// 添加加载动画
const wrapLoading = async (fn, message, ...args) => {
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

class Generator {
    name;
    targetDir;
    downloadGitRepo;
    constructor(name, targetDir) {
        this.name = name
        this.targetDir = targetDir

        this.downloadGitRepo = util.promisify(downloadGitRepo)
    }

    // 核心创建逻辑
    async create() {
        const repo = await this.getRepo()

        const tag = await this.getTag(repo)

        await this.download(repo, tag)

        console.log('user chose repo:', repo)
        console.log('user chose tag:', tag)

        console.log(`\r\nSuccessfully create project ${chalk.cyan(this.name)}`)
        console.log(`\r\ncd ${chalk.cyan(this.name)}`)
        console.log(`npm run dev\r\n`)
    }

    async getRepo() {
        // 远程拉取项目模版
        const repoList = await wrapLoading(getRepoList, 'waiting fetch the template')
        // console.log('repoList:', repoList)
        if(!repoList) {
            return
        }
        // filter template needed
        const repos = repoList.map(item => item.name)

        // user select template needed
        const {repo} = await inquirer.prompt({
            name: 'repo',
            type: 'list',
            choices: repos,
            message: 'Please choose a template to create project'
        })
        // return template
        return repo
    }

    async getTag(repo) {
        // pull tag list based on repo
        const tags = await wrapLoading(getTagList, 'waiting fetch tag', repo)
        if(!tags) {
            return
        }

        const tagsList = tags.map(item => item.name)

        // user chose to download the tag in need
        const {tag} = await inquirer.prompt({
            name: 'tag',
            type: 'list',
            choices: tagsList,
            message: 'Please choose a tag to create project'
        })
        return tag
    }

    async download(repo, tag) {
        // concat the download url
        const requestUrl = `zhurong-cli/${repo}${tag ? '#' + tag : ''}`

        // call the download function
        await wrapLoading(
            this.downloadGitRepo,
            'waiting download template',
            // param1: request url
            requestUrl,
            // param2: create project directory
            path.resolve(process.cwd(), this.targetDir)
        )
    }
}

export default Generator