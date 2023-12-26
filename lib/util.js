import ora from 'ora'

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