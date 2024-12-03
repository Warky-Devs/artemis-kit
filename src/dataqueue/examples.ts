// // examples.ts
// import { EnhancedNestedQueue } from './queue';
// import { LocalStoragePersistence } from './persistence';
// import { useQueue, useActiveRecord } from './hooks';

// // Example 1: Basic Queue Usage
// interface TodoItem {
//   id: number;
//   title: string;
//   completed: boolean;
//   subTasks?: TodoItem[];
// }

// const todoQueue = new EnhancedNestedQueue<TodoItem>([], {
//   persistence: new LocalStoragePersistence('todos'),
//   middleware: [
//     {
//       beforeAction: (action) => {
//         console.log('Action:', action);
//         return action;
//       },
//       afterAction: (action, state) => {
//         console.log('New State:', state);
//       }
//     }
//   ]
// });

// // Example 2: React Component with Queue
// function TodoList() {
//   const { data, queue, buffer } = useQueue<TodoItem>([], {
//     persistence: new LocalStoragePersistence('todos')
//   });

//   const addTodo = (title: string) => {
//     const newTodo = buffer.create({
//       id: Date.now(),
//       title,
//       completed: false
//     });
//   };

//   const toggleTodo = (id: number) => {
//     const todo = data.find(t => t.id === id);
//     if (todo) {
//       buffer.update(id, { completed: !todo.completed });
//     }
//   };

//   return (
//     <div>
//       <button onClick={() => addTodo('New Task')}>Add Task</button>
//       {data.map(todo => (
//         <div key={todo.id}>
//           <input
//             type="checkbox"
//             checked={todo.completed}
//             onChange={() => toggleTodo(todo.id)}
//           />
//           {todo.title}
//         </div>
//       ))}
//     </div>
//   );
// }

// // Example 3: Active Record Pattern
// function TodoEditor({ todoId }: { todoId: number }) {
//   const { data, queue } = useQueue<TodoItem>([]);
//   const todo = data.find(t => t.id === todoId);
  
//   const {
//     record,
//     update,
//     save,
//     rollback,
//     isDirty
//   } = useActiveRecord(queue, todo!);

//   if (!record) return null;

//   return (
//     <div>
//       <input
//         value={record.data.title}
//         onChange={e => update({ title: e.target.value })}
//       />
//       <button onClick={save} disabled={!isDirty}>
//         Save
//       </button>
//       <button onClick={rollback} disabled={!isDirty}>
//         Cancel
//       </button>
//     </div>
//   );
// }

// // Example 4: Complex Nested Data
// interface Department {
//   id: number;
//   name: string;
//   employees: Employee[];
// }

// interface Employee {
//   id: number;
//   name: string;
//   roles: string[];
// }

// const departmentQueue = new EnhancedNestedQueue<Department>();

// // Adding nested data
// departmentQueue.add({
//   id: 1,
//   name: 'Engineering',
//   employees: [
//     { id: 1, name: 'John', roles: ['dev'] }
//   ]
// }, '');

// // Updating nested employee
// departmentQueue.update('0.employees.0', {
//   roles: ['dev', 'lead']
// });

// // Sorting employees by name
// departmentQueue.sort('name', {
//   path: '0.employees',
//   direction: 'asc'
// });

// // Example 5: Batch Operations
// async function batchUpdate() {
//   const buffer = departmentQueue.getBuffer();
  
//   // Load multiple records
//   const records = await Promise.all([
//     buffer.load({ id: 1, name: 'Dept 1', employees: [] }),
//     buffer.load({ id: 2, name: 'Dept 2', employees: [] })
//   ]);

//   // Update multiple records
//   records.forEach(record => {
//     buffer.update(record.id, { name: `Updated ${record.data.name}` });
//   });

//   // Flush all changes at once
//   await buffer.flush();
// }