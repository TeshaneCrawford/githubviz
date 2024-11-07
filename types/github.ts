export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  created_at: string
  updated_at: string
  language: string | null
  owner: {
    login: string
    id: number
    avatar_url: string
  }
}

export interface Developer {
  id: number
  login: string
  avatar_url: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

export interface Dependency {
  name: string
  version: string
  type: 'runtime' | 'development' | 'peer'
}

export interface RepositoryNetwork {
  nodes: Array<{
    id: string | undefined
    name: string | undefined
    type: 'repository' | 'package' | 'developer'
    data: Repository | Developer | Dependency
  }>
  links: Array<{
    source: string | undefined
    target: string
    type: 'dependency' | 'contribution' | 'fork'
    weight: number
  }>
}