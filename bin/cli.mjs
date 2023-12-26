#! /usr/bin/env node

import path, {dirname} from 'path'
import {fileURLToPath} from 'url'
import fs from 'fs'
import {program} from 'commander'
import chalk from 'chalk'
import figlet from 'figlet'

import create from '../lib/create.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJsonContent = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8');
const packageJson = JSON.parse(packageJsonContent)

program
    // 定义命令和参数
    .command('create <app-name>')
    .description('create a new project')
    .option('-f, --force', 'overwrite target directory if it exists')
    .action((name, options) => {
        // 打印执行结果
        // console.log('name:', name, 'options', options)
        create(name, options)
    });

program
    .command('config [value]')
    .description('inspect and modify the config')
    .option('-g --get <path>', 'get value from option')
    .option('-s --set <path> <value>')
    .option('-d --delete <path>', 'delete option from config')
    .action((value, options) => {
        console.log("config:", value, options)
    })

program
    .version(`v$${packageJson.version}`)
    .usage('<command> [option]')

program
    .on('--help', () => {
        // logo
        console.log('\r\n' + chalk.cyan(
            figlet.textSync('pray', {
                font: 'Standard',
                horizontalLayout: 'full',
                verticalLayout: 'full',
                // width: 80,
                whitespaceBreak: true,
                
            })
        ))

        console.log(
            `\r\nRun ${chalk.cyan(`pray <command> --help`)} for detail usage of given command\r\n`
        )
    });

// 解析用户执行命令传入参数
program.parse(process.argv)

/*
$ pray
Usage: cli <command> [option]

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  create [options] <app-name>  create a new project
  config [options] [value]     inspect and modify the config
  help [command]               display help for command

*/