
// // Example server reporting plugin
// const createServerReportingPlugin = (endpoint: string): LoggerPlugin => ({
//     name: 'ServerReportingPlugin',
//     onLog: async (entry: LogEntry): Promise<void> => {
//       // Only send errors and warnings to the server
//       if (entry.level === 'ERROR' || entry.level === 'WARN') {
//         try {
//           const response = await fetch(endpoint, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(entry)
//           });
          
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//         } catch (error) {
//           console.error('Failed to send log to server:', error);
//         }
//       }
//     }
//   });
  
//   // Example local storage plugin
//   const createLocalStoragePlugin = (maxEntries: number = 100): LoggerPlugin => {
//     const STORAGE_KEY = 'app_logs';
    
//     return {
//       name: 'LocalStoragePlugin',
//       onLog: async (entry: LogEntry): Promise<void> => {
//         try {
//           const storedLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
//           const updatedLogs = [entry, ...storedLogs].slice(0, maxEntries);
//           localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
//         } catch (error) {
//           console.error('Failed to store log in localStorage:', error);
//         }
//       }
//     };
//   };