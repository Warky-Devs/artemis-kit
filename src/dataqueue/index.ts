export {NestedQueue,EnhancedNestedQueue} from './queue'

import {InMemoryPersistence,IndexedDBPersistence,LocalStoragePersistence} from './persistence'
const NestedQueuePersistence = {
    InMemoryPersistence,
    IndexedDBPersistence,
    LocalStoragePersistence
}
export {NestedQueuePersistence}