import axios from 'axios'

axios.interceptors.response.use((res) => {
    return res.data
})

export const getRepoList = async () => {
    return axios.get('https://api.github.com/orgs/zhurong-cli/repos')
}

export const getTagList = async (repo) => {
    return axios.get(`https://api.github.com/repos/zhurong-cli/${repo}/tags`)
}