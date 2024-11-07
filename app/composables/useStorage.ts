import { useStorage as useVueUseStorage, StorageSerializers } from '@vueuse/core'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStorage<T = any>(
  key: string,
  initialValue: T,
  storage: Storage = sessionStorage
) {
  return useVueUseStorage<T>(
    key,
    initialValue,
    storage,
    { serializer: StorageSerializers.object }
  )
}