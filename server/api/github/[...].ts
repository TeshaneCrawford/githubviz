import type { H3Event } from 'h3';
import { defineEventHandler, createError, getQuery } from 'h3'
import { createCachedHandler, CACHE_KEYS, CACHE_TTL } from '../../utils/cache'
import { fetchRepositoryNetwork } from '../../utils/github'
import type { RepositoryNetwork } from '~/types/github'


export const getRepositoryNetwork = createCachedHandler<RepositoryNetwork>(
  async (event: H3Event) => {
    const query = getQuery(event)
    const repository = query.repository as string
    const depth = query.depth ? parseInt(query.depth as string, 10) : 1

    if (!repository) {
      throw createError({
        statusCode: 400,
        message: 'Repository parameter is required',
      })
    }

    return await fetchRepositoryNetwork(repository, depth)
  },
  `${CACHE_KEYS.REPO_NETWORK}`,
  CACHE_TTL.MEDIUM
)

export default defineEventHandler(async (event: H3Event) => {
  const method = event.method
  const segments = event.context.params?._.split('/') ?? []

  switch (segments[0]) {
    case 'network':
      if (method === 'GET') {
        return await getRepositoryNetwork(event)
      }
      break
    default:
      throw createError({
        statusCode: 404,
        message: 'Not Found',
      })
  }
})