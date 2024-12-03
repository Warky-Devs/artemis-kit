// // hooks.ts
// import { useState, useEffect, useRef } from 'react';
// import { EnhancedNestedQueue } from './queue';
// import { QueueOptions, BufferOptions, ActiveRecord } from './types';

// export function useQueue<T extends object>(
//   initialData: T[],
//   options: QueueOptions<T> = {},
//   bufferOptions: BufferOptions = {}
// ) {
//   const [data, setData] = useState<T[]>(initialData);
//   const queueRef = useRef<EnhancedNestedQueue<T>>();

//   useEffect(() => {
//     if (!queueRef.current) {
//       queueRef.current = new EnhancedNestedQueue<T>(
//         initialData,
//         options,
//         bufferOptions
//       );
//     }

//     const unsubscribe = queueRef.current.subscribe((newData) => {
//       setData(newData);
//     });

//     return () => {
//       unsubscribe();
//       queueRef.current?.getBuffer().dispose();
//     };
//   }, []);

//   return {
//     data,
//     queue: queueRef.current!,
//     buffer: queueRef.current?.getBuffer()
//   };
// }

// export function useActiveRecord<T extends object>(
//   queue: EnhancedNestedQueue<T>,
//   record: T
// ) {
//   const [activeRecord, setActiveRecord] = useState<ActiveRecord<T>>();
//   const buffer = queue.getBuffer();

//   useEffect(() => {
//     buffer.load(record).then(setActiveRecord);

//     return () => {
//       if (activeRecord?.isDirty) {
//         buffer.flush();
//       }
//     };
//   }, [record]);

//   const updateRecord = (changes: Partial<T>) => {
//     if (activeRecord) {
//       const updated = buffer.update(activeRecord.id, changes);
//       setActiveRecord(updated);
//     }
//   };

//   const saveRecord = async () => {
//     if (activeRecord?.isDirty) {
//       await buffer.flush();
//     }
//   };

//   const rollbackRecord = () => {
//     if (activeRecord) {
//       buffer.rollback(activeRecord.id);
//       setActiveRecord(buffer.get(activeRecord.id));
//     }
//   };

//   return {
//     record: activeRecord,
//     update: updateRecord,
//     save: saveRecord,
//     rollback: rollbackRecord,
//     isDirty: activeRecord?.isDirty ?? false
//   };
// }