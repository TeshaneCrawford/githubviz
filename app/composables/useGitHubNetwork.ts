import { ref, computed } from 'vue'
import type { RepositoryNetwork } from '~/types/github'

export const useGitHubNetwork = (repository: string) => {
  const network = ref<RepositoryNetwork | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchNetwork = async (depth: number = 1) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await useFetch(`/api/github/network?repository=${repository}&depth=${depth}`)
      network.value = data.value as RepositoryNetwork
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch network')
    } finally {
      loading.value = false
    }
  }

  const stats = computed(() => {
    if (!network.value) return null

    return {
      repositories: network.value.nodes.filter(n => n.type === 'repository').length,
      packages: network.value.nodes.filter(n => n.type === 'package').length,
      developers: network.value.nodes.filter(n => n.type === 'developer').length,
      connections: network.value.links.length,
    }
  })

  return {
    network,
    loading,
    error,
    stats,
    fetchNetwork,
  }
}
