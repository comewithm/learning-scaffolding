

const routerPlugin = (inquirer) => {
    inquirer.injectPluginToChoices({
        name: 'router',
        value: 'router',
        description: '是否支持路由'
    })

    inquirer.injectPluginToPrompt({
        name: 'routerMode',
        message: '请选择路由模式',
        type: 'list',
        choices: ['hash', 'history'].map(choice => ({name: choice, value: choice})),
        default: 'history'
    })

    inquirer.onPromptComplete((answer, selectedPlugins) => {
        if(answer.plugins.includes('router')) {
            // 自定义插件
            selectedPlugins['router'] = {
                routerMode: answer.routerMode
            }
        }
    })
}

export default routerPlugin