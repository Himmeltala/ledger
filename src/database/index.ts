export namespace Database {
  export function create(): Promise<IDBDatabase> {
    const promise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(Const.DB_TALLYPAD);

      req.onsuccess = function(event) {
        // @ts-ignore
        const db = event.target.result;
        resolve(db);
      };

      req.onerror = function() {
        reject(new Error("创建数据库失败！"));
      };

      req.onupgradeneeded = function(event) {
        // @ts-ignore
        const db = event.target.result as IDBDatabase;
        const dbRecord = db.createObjectStore(Const.DB_RECORD, { keyPath: "id" });
        const dbComments = db.createObjectStore(Const.DB_COMMENTS, { keyPath: "id" });
        const dbConfig = db.createObjectStore(Const.DB_CONFIG, { keyPath: "id" });

        dbRecord.add({ id: "2024", items: { "1": { balance: [], surplus: 0, budget: 0 } } });
        dbComments.add({ id: Const.DB_KEY_COMMENTS, items: [{ value: "生活费", cost: 1800, type: "支" }] });
        dbConfig.add({ id: Const.DB_KEY_CONFIG, Y: "2024", M: "1", budget: 5000, isChart: true });
      };
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function add(db: IDBDatabase, table: string, data: any, key?: any) {
    const promise = new Promise((resolve, reject) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      const req = store.add(data, key);

      req.onsuccess = function() {
        resolve(db);
      };

      req.onerror = function() {
        reject(new Error("插入数据错误！"));
      };
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function drop(db: IDBDatabase, table: string, key: any) {
    const promise = new Promise((resolve, reject) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      const req = store.delete(key);

      req.onsuccess = function() {
        resolve(db);
      };

      req.onerror = function() {
        reject(new Error("删除数据错误！"));
      };
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function put(db: IDBDatabase, table: string, data: any, key: any) {
    const promise = new Promise((resolve, reject) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      const req = store.get(key);

      req.onsuccess = function() {
        store.put(data).onsuccess = function() {
          resolve(db);
        };
      };

      req.onerror = function() {
        reject(new Error("更新数据错误！"));
      };
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function get<T>(db: IDBDatabase, table: string, key?: any) {
    const promise = new Promise<T>((resolve, reject) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);

      if (key) {
        const req = store.get(key);

        req.onsuccess = function() {
          const result = req.result;
          if (result) {
            resolve(result);
          } else {
            resolve(null);
          }
        };

        req.onerror = function() {
          reject(null);
        };
      } else {
        const req = store.openCursor();
        const arr: T[] = [];

        req.onsuccess = function(event) {
          // @ts-ignore
          const cursor = event.target.result;
          if (cursor) {
            arr.push(cursor.value);
            cursor.continue();
          } else {
            // @ts-ignore
            resolve(arr);
          }
        };

        req.onerror = function() {
          reject(null);
        };
      }
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function keys(db: IDBDatabase, table: string) {
    const promise = new Promise<string[]>((resolve, reject) => {
      const transaction = db.transaction([table], "readonly");
      const req = transaction.objectStore(table).getAllKeys();

      req.onsuccess = function(event) {
        // @ts-ignore
        resolve(event.target.result);
      };

      req.onerror = function() {
        reject(null);
      };
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function del(dbname: string) {
    const promise = new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(dbname);

      req.onsuccess = function() {
        resolve(null);
      };

      req.onerror = function() {
        reject(null);
      };

      req.onblocked = function() {
        reject(null);
      };
    });

    promise.catch(error => {
      console.error(error);
    });

    return promise;
  }

  export function clear(db: IDBDatabase, table: string) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([table], "readwrite");
      const store = transaction.objectStore(table);
      const req = store.clear();

      req.onsuccess = function() {
        resolve("");
      };
      req.onerror = function() {
        reject("");
      };
    });
  }

  export function leadIn(db: IDBDatabase, data: any, table: string) {
    const transaction = db.transaction([table], "readwrite");
    const store = transaction.objectStore(table);

    const req = store.add(data);

    req.onsuccess = function() {
      console.log("Data added: ", data);
    };

    req.onerror = function() {
      console.error("Error adding data: ");
    };
  }
}
