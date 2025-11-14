export interface Car {
  id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color?: string;
  image?: string;
  images?: string[];
  fuelType?: string;
  transmission?: string;
  description?: string;
  featured?: boolean;
  isSold?: boolean;
  soldAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminUser {
  id: number;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

interface ContactMessage {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  questionType?: string;
  subject?: string;
  message: string;
  handled?: boolean;
  handledAt?: Date;
  createdAt?: Date;
}

interface NewsletterSubscriber {
  id?: number;
  email: string;
  createdAt?: Date;
}

class CarDealerDB {
  private dbName = 'CarDealerDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error opening database');
        reject('Error opening database');
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('cars')) {
          const store = db.createObjectStore('cars', { keyPath: 'id', autoIncrement: true });
          store.createIndex('brand', 'brand', { unique: false });
          store.createIndex('price', 'price', { unique: false });
          store.createIndex('featured', 'featured', { unique: false });
        }

        if (!db.objectStoreNames.contains('contactMessages')) {
          db.createObjectStore('contactMessages', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('newsletterSubscribers')) {
          const store = db.createObjectStore('newsletterSubscribers', { keyPath: 'id', autoIncrement: true });
          store.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('admin')) {
          db.createObjectStore('admin', { keyPath: 'id' });
        }
      };
    });
  }

  // Car methods
  async addCar(car: Omit<Car, 'id'>): Promise<number> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cars'], 'readwrite');
      const store = transaction.objectStore('cars');
      const request = store.add({
        ...car,
        createdAt: new Date(),
        featured: car.featured || false
      });

      request.onsuccess = () => resolve(Number(request.result));
      request.onerror = () => reject('Error adding car');
    });
  }

  async getCars(limit: number = 10, offset: number = 0): Promise<Car[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(['cars'], 'readonly');
      const store = transaction.objectStore('cars');
      const request = store.openCursor();
      const results: Car[] = [];
      let advanced = offset > 0;
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          if (advanced) {
            advanced = false;
            cursor.advance(offset);
            return;
          }
          if (count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  async getCarById(id: number): Promise<Car | null> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(['cars'], 'readonly');
      const store = transaction.objectStore('cars');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async updateCar(id: number, partial: Partial<Car>): Promise<Car | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['cars'], 'readwrite');
      const store = tx.objectStore('cars');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const existing: Car | undefined = getReq.result as Car | undefined;
        if (!existing) {
          resolve(null);
          return;
        }
        const updated: Car = {
          ...existing,
          ...partial,
          id,
          updatedAt: new Date(),
        };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject('Error updating car');
      };

      getReq.onerror = () => reject('Error reading existing car');
    });
  }

  // Contact form methods
  async addContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt'>): Promise<number> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['contactMessages'], 'readwrite');
      const store = transaction.objectStore('contactMessages');
      const request = store.add({
        ...message,
        createdAt: new Date(),
        handled: message.handled ?? false
      });

      request.onsuccess = () => resolve(Number(request.result));
      request.onerror = () => reject('Error adding contact message');
    });
  }

  async getContactMessages(limit: number = 100, offset: number = 0): Promise<ContactMessage[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['contactMessages'], 'readonly');
      const store = tx.objectStore('contactMessages');
      const req = store.openCursor();
      const results: ContactMessage[] = [];
      let advanced = offset > 0;
      let count = 0;
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          if (advanced) {
            advanced = false;
            cursor.advance(offset);
            return;
          }
          if (count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };
      req.onerror = () => resolve([]);
    });
  }

  async updateContactMessage(id: number, partial: Partial<ContactMessage>): Promise<ContactMessage | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['contactMessages'], 'readwrite');
      const store = tx.objectStore('contactMessages');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing: ContactMessage | undefined = getReq.result as ContactMessage | undefined;
        if (!existing) {
          resolve(null);
          return;
        }
        const updated: ContactMessage = {
          ...existing,
          ...partial,
          id,
          handledAt: partial.handled ? new Date() : existing.handledAt,
        };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject('Error updating contact message');
      };
      getReq.onerror = () => reject('Error reading contact message');
    });
  }

  async deleteContactMessage(id: number): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['contactMessages'], 'readwrite');
      const store = tx.objectStore('contactMessages');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject('Error deleting contact message');
    });
  }

  // Newsletter methods
  async subscribeToNewsletter(email: string): Promise<number> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['newsletterSubscribers'], 'readwrite');
      const store = transaction.objectStore('newsletterSubscribers');
      const request = store.add({
        email,
        createdAt: new Date()
      });

      request.onsuccess = () => resolve(Number(request.result));
      request.onerror = (event) => {
        if ((event.target as IDBRequest).error?.name === 'ConstraintError') {
          reject('Email already subscribed');
        } else {
          reject('Error subscribing to newsletter');
        }
      };
    });
  }

  async getNewsletterSubscribers(limit: number = 100, offset: number = 0): Promise<NewsletterSubscriber[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['newsletterSubscribers'], 'readonly');
      const store = tx.objectStore('newsletterSubscribers');
      const req = store.openCursor();
      const results: NewsletterSubscriber[] = [];
      let advanced = offset > 0;
      let count = 0;
      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          if (advanced) {
            advanced = false;
            cursor.advance(offset);
            return;
          }
          if (count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        } else {
          resolve(results);
        }
      };
      req.onerror = () => resolve([]);
    });
  }

  async deleteNewsletterSubscriber(id: number): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['newsletterSubscribers'], 'readwrite');
      const store = tx.objectStore('newsletterSubscribers');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject('Error deleting newsletter subscriber');
    });
  }

  // Delete a car by ID
  async deleteCar(id: number): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['cars'], 'readwrite');
      const store = transaction.objectStore('cars');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject('Error deleting car');
    });
  }

  // Admin methods
  async getAdmin(): Promise<AdminUser | null> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(['admin'], 'readonly');
      const store = tx.objectStore('admin');
      const req = store.get(1);
      req.onsuccess = () => resolve((req.result as AdminUser) || null);
      req.onerror = () => resolve(null);
    });
  }

  async setAdmin(email: string, passwordHash: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['admin'], 'readwrite');
      const store = tx.objectStore('admin');
      const req = store.put({ id: 1, email, passwordHash, createdAt: new Date() } as AdminUser);
      req.onsuccess = () => resolve();
      req.onerror = () => reject('Error saving admin');
    });
  }

  async updateAdminPassword(passwordHash: string): Promise<void> {
    const admin = await this.getAdmin();
    if (!admin) throw new Error('No admin configured');
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['admin'], 'readwrite');
      const store = tx.objectStore('admin');
      const req = store.put({ ...admin, passwordHash });
      req.onsuccess = () => resolve();
      req.onerror = () => reject('Error updating admin');
    });
  }
}

// Create and export a singleton instance
export const db = new CarDealerDB();

export type { ContactMessage, NewsletterSubscriber, AdminUser };
