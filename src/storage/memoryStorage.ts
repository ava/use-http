import { Cache } from '../types'

const inMemoryStorage = new Map<string, Response | number>()
const getMemoryStorage = ({ cacheLife }: { cacheLife: number }): Cache => ({
  async get(name: string) {
    const item = inMemoryStorage.get(name) as Response | undefined
    if (!item) return

    const expiration = inMemoryStorage.get(`${name}:ts`)
    if (expiration && expiration > 0 && expiration < Date.now()) {
      inMemoryStorage.delete(name)
      inMemoryStorage.delete(`${name}:ts`)
      return
    }

    return item
  },
  async set(name: string, data: Response) {
    inMemoryStorage.set(name, data)
    inMemoryStorage.set(`${name}:ts`, cacheLife > 0 ? Date.now() + cacheLife : 0)
  },
  async has(name: string) {
    return inMemoryStorage.has(name)
  },
  async delete(name: string) {
    inMemoryStorage.delete(name)
    inMemoryStorage.delete(`${name}:ts`)
  },
  async clear() {
    return inMemoryStorage.clear()
  } 
})

export default getMemoryStorage
