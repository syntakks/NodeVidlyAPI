// Async Await
function getUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = { id: id, githubUsername: 'mosh' }
            console.log('User: ', user)
            resolve(user)
        }, 2000)
    })
}

function getRepositories(username) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const repos = ['repo1', 'repo2','repo3']
            console.log('Repos: ', repos)
            resolve(repos)
        }, 2000)
    })
    
}

async function getReposForUser(id) {
    try {
        console.log('Get Repose For ID: ', id)
        console.log('Fetching user from DB...')
        const user = await getUser(id)
        console.log('Fetching repos for user...')
        const repos = await getRepositories(user.githubUsername)
    } catch (err) {
        console.log('Error: ', err.message)
    }
}

getReposForUser(1)