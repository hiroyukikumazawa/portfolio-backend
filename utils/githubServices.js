const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getCommitsFromUser(repoOwner, repoName, username) {
    const repoUrl = `https://github.com/${repoOwner}/${repoName}.git`;
    const localRepoPath = path.join('/home/hiroyuki/github', `${repoOwner}--${repoName}`);

    const cloneStatus = cloneRepoIfNotExist(repoUrl, localRepoPath);
    if (!cloneStatus) {
        console.error(`Cloning error in repo ${repoName}`);
        return null;
    }

    const pullStatus = pullLatestCommit(localRepoPath);
    if (!pullStatus) {
        console.error(`Pulling error in repo ${repoName}`);
        return null;
    }

    const userCommits = getMergedCommitsFromUser(localRepoPath, username);
    console.log(userCommits)
    return userCommits;
}

function cloneRepoIfNotExist(repoUrl, localRepoPath) {
    // Check if the directory exists
    if (!fs.existsSync(localRepoPath)) {
        try {
            execSync(`git clone ${repoUrl} ${localRepoPath}`, { stdio: 'inherit' });
        } catch (error) {
            console.error('Error cloning repo:', error.message);
            return false;
        }
    }
    return true;
}

function pullLatestCommit(localRepoPath) {
    try {
        execSync('git pull', { cwd: localRepoPath, stdio: 'inherit' });
    } catch (error) {
        console.error('Error pulling latest commit:', error.message);
        return false;
    }
    return true;
}

function getMergedCommitsFromUser(localRepoPath, username) {
    try {
        // Get all merge commits where the specified user is the author
        const mergeCommits = execSync(
            `git log --author="${username}" --pretty=format:"%h %s"`,
            { cwd: localRepoPath, encoding: 'utf-8' }
        );
        const commits = mergeCommits
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const [commitHash, ...message] = line.split(' ');
                return {
                    commit: commitHash,
                    message: message.join(' ')
                };
            });

        return commits;
    } catch (error) {
        console.error('Error fetching PRs:', error.message);
        return [];
    }
}

module.exports = { getCommitsFromUser };
