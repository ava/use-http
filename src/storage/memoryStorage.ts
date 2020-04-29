import { Cache } from '../types'

let inMemoryStorage: any = {}
const getMemoryStorage = ({ cacheLife }: { cacheLife: number }): Cache => {
  const remove = async (...responseIDs: string[]) => {
    for (const responseID of responseIDs) {
      delete inMemoryStorage[responseID]
      delete inMemoryStorage[`${responseID}:ts`]
    }
  }

  const isExpired = (responseID: string) => {
    const expiration = inMemoryStorage[`${responseID}:ts`]
    const expired = expiration > 0 && expiration < Date.now()
    if (expired) remove(responseID)
    return expired || !inMemoryStorage[responseID]
  }

  const get = (responseID: string) => {
    if (isExpired(responseID)) return
    return inMemoryStorage[responseID] as Response
  }

  const set = (responseID: string, res: Response) => {
    inMemoryStorage[responseID] = res
    inMemoryStorage[`${responseID}:ts`] = cacheLife > 0 ? Date.now() + cacheLife : 0
  }

  const has = (responseID: string) => !isExpired(responseID)

  const clear = async () => {
    inMemoryStorage = {}
  }

  return Object.defineProperties(inMemoryStorage, {
    get: { value: get, writable: false, configurable: true },
    set: { value: set, writable: false, configurable: true },
    has: { value: has, writable: false, configurable: true },
    delete: { value: remove, writable: false, configurable: true },
    clear: { value: clear, writable: false, configurable: true }
  })
}

export default getMemoryStorage
