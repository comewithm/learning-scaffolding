import userhome from 'userhome'
import fs from 'fs-extra'

export const configPath = userhome('.pray-cli.json')

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