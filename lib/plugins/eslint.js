
const eslintPlugin = (inquirer) => {
    // 注入prompt
    inquirer.injectPluginToChoices({
        name: 'eslint',
        value: 'eslint',
        description: '是否支持eslint'
    })
    // 选择插件后的回调
    inquirer.onPromptComplete((answer, selectedPlugins) => {
        if(answer.plugins.includes('eslint')) {
            selectedPlugins['eslint'] = {}
        }
    })
}

export default eslintPlugin