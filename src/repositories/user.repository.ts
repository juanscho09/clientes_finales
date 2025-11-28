// ...existing code...
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private _storage: Storage | null = null;
  private readonly USER_KEY = 'user';
  private readonly DEVICE_KEY = 'device';

  constructor(private storage: Storage) {
    this.init();
  }

  private async init(): Promise<void> {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  async save(user: User): Promise<void> {
    await this.init();
    return this._storage!.set(this.USER_KEY, user);
  }

  async get(): Promise<User | null> {
    await this.init();
    const u = await this._storage!.get(this.USER_KEY);
    return u ? (u as User) : null;
  }

  async remove(): Promise<any> {
    await this.init();
    return this._storage!.remove(this.USER_KEY);
  }

  async setDevice(device: any): Promise<void> {
    await this.init();
    return this._storage!.set(this.DEVICE_KEY, device);
  }

  async getDevice(): Promise<any> {
    await this.init();
    const device = (await this._storage!.get(this.DEVICE_KEY)) ?? null;
    if (!device) {
      const defaultDevice = { platform: null, token: null };
      await this._storage!.set(this.DEVICE_KEY, defaultDevice);
      return defaultDevice;
    }
    return device;
  }
}
// ...existing code...