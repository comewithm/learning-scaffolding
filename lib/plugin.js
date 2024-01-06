import inquirer from 'inquirer'
import PluginRender from './render.js'
import { loadModule } from './util.js'

export default class PluginApi {
    constructor() {
        this.promptPlugins = {
            name: 'plugins',
            type: 'checkbox',
            message: '请选择需要的插件',
            choices: []
        }
        // 插件的回调集合(无论是否开启当前插件，都会添加进去，回调里面会进行判断)
        this.promptCompleteCallbacks = []
        // checkbox中选择的插件集合(还没有选择是否启用插件)
        this.selectedPrompts = []
        // 真正开启使用的插件
        this.selectedPlugins = {}

        // 解析的插件配置和执行方法
        this.resolvedPlugins = []
    }

    // 插件初始化
    async initPlugins(plugins) {
        const modules = await Promise.all(plugins)
        modules.forEach(module => {
            module.default(this)
        })
    }
    // 插件注入
    injectPluginToChoices(choice) {
        this.promptPlugins.choices.push(choice)
    }
    // checkbox中选择的插件集合
    injectPluginToPrompt(prompt) {
        this.selectedPrompts.push(prompt)
    }
    // 获取prompt中启用的插件集合
    async resolvePluginPrompt() {
        const prompts = [this.promptPlugins, ...this.selectedPrompts]
        const answers = await inquirer.prompt(prompts)
        this.promptCompleteCallbacks.forEach(callback => {
            callback(answers, this.selectedPlugins)
        })
        console.log("answer: ", answers)
    }

    // prompt选择后的插件回调
    onPromptComplete(callback) {
        this.promptCompleteCallbacks.push(callback)
    }
    // 获取外部插件
    getRootPlugins(rootPlugins) {
        const selectedPluginsArray = Object.keys(this.selectedPlugins)
        rootPlugins.plugins
            .filter(plugin => !selectedPluginsArray.includes(plugin))
            .forEach(plugin => {
                this.selectedPlugins[plugin] = {}
            })
    }

    async resolvePlugins(projectDir) {
        // plugins names
        // { router: { routerMode: 'hash' }, eslint: {} }
        Object.entries(this.selectedPlugins).forEach(([plugin, options]) => {
            // load plugins
            const apply = loadModule(plugin, projectDir)
            this.resolvedPlugins.push({
                id: plugin,
                apply,
                options
            })
        })
    }

    async applyPlugins(fileModule) {
        for (const plugin of this.resolvedPlugins) {
            const {id, apply, options} = plugin
            const pluginRender = new PluginRender(id, fileModule, options)
            await apply(pluginRender, options)
        }
    }
}