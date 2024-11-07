import { Octokit } from 'octokit'
import type { Repository, Developer, RepositoryNetwork, Dependency } from '~/types/github'

// Octokit instance
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
 }).rest

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export const fetchRepositoryNetwork = async (
  repoFullName: string,
  depth: number = 1
): Promise<RepositoryNetwork> => {
  const network: RepositoryNetwork = {
    nodes: [],
    links: [],
  }

  const visited = new Set<string>()

  async function traverse(fullName: string, currentDepth: number): Promise<void> {
    if (visited.has(fullName) || currentDepth > depth) return
    visited.add(fullName)

    try {
      const { data: repo } = await octokit.repos.get({
        owner: fullName.split('/')[0],
        repo: fullName.split('/')[1],
      })

      // Add repository node
      network.nodes.push({
        id: repo.full_name,
        name: repo.name,
        type: 'repository',
        data: repo as Repository,
      })

      try {
        const { data: deps } = await octokit.repos.getContent({
          owner: repo.owner.login,
          repo: repo.name,
          path: 'package.json',
        })

        if ('content' in deps) {
          const packageJson: PackageJson = JSON.parse(
            Buffer.from(deps.content, 'base64').toString()
          )
          const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
          }

          Object.entries(dependencies || {}).forEach(([name, version]) => {
            const dependency: Dependency = {
              name,
              version,
              type: 'runtime',
            }

            network.nodes.push({
              id: name,
              name,
              type: 'package',
              data: dependency,
            })

            network.links.push({
              source: repo.full_name,
              target: name,
              type: 'dependency',
              weight: 1,
            })
          })
        }
      } catch (error) {
        // Skip if package.json doesn't exist or can't be read
        console.warn(`Could not read package.json for ${fullName}:`, error)
      }

      const { data: contributors } = await octokit.repos.listContributors({
        owner: repo.owner.login,
        repo: repo.name,
      })

      for (const contributor of contributors.slice(0, 10)) {
        network.nodes.push({
          id: contributor.login,
          name: contributor.login,
          type: 'developer',
          data: contributor as unknown as Developer,
        })

        network.links.push({
          source: contributor.login,
          target: repo.full_name,
          type: 'contribution',
          weight: contributor.contributions,
        })
      }

      if (currentDepth < depth) {
        const { data: forks } = await octokit.repos.listForks({
          owner: repo.owner.login,
          repo: repo.name,
          per_page: 5,
        })

        for (const fork of forks) {
          network.links.push({
            source: repo.full_name,
            target: fork.full_name,
            type: 'fork',
            weight: 1,
          })

          await traverse(fork.full_name, currentDepth + 1)
        }
      }
    } catch (error) {
      console.error(`Error processing ${fullName}:`, error)
    }
  }

  await traverse(repoFullName, 0)
  return network
}
