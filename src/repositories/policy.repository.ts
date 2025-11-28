// ...existing code...
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Policy } from '../models/policy.model';

@Injectable({ providedIn: 'root' })
export class PolicyRepository {
  private _storage: Storage | null = null;
  private readonly PREFIX = 'policies-';

  constructor(private storage: Storage) {
    this.init();
  }

  private async init(): Promise<void> {
    if (!this._storage) {
      this._storage = await this.storage.create();
    }
  }

  private key(status: string): string {
    return `${this.PREFIX}${status}`;
  }

  async save(status: string, policy: Policy): Promise<void> {
    await this.init();
    const key = this.key(status);
    const storedPolicies: Policy[] | null = (await this._storage!.get(key)) ?? null;

    const policyCopy: any = Object.assign({}, policy);
    policyCopy.downloaded = true;

    if (storedPolicies !== null) {
      const foundPolicy = storedPolicies.find(item => item.name === policyCopy.name);
      if (foundPolicy) {
        return;
      }
      storedPolicies.push(policyCopy);
      await this._storage!.set(key, storedPolicies);
      return;
    }

    const policies: Policy[] = [policyCopy];
    await this._storage!.set(key, policies);
  }

  async saveCollection(status: string, policies: Policy[]): Promise<void> {
    await this.init();
    const key = this.key(status);
    await this._storage!.set(key, policies);
  }

  async get(status: string): Promise<Policy[] | null> {
    await this.init();
    const key = this.key(status);
    return (await this._storage!.get(key)) ?? null;
  }

  async remove(status: string): Promise<any> {
    await this.init();
    const key = this.key(status);
    return this._storage!.remove(key);
  }

  async removeByPolicy(status: string, policy: Policy): Promise<boolean> {
    await this.init();
    const key = this.key(status);
    const storedPolicies: Policy[] | null = (await this._storage!.get(key)) ?? null;

    if (!storedPolicies) {
      return Promise.reject(false);
    }

    const foundPolicy = storedPolicies.find(item => item.name === policy.name);
    if (!foundPolicy) {
      return Promise.reject(false);
    }

    const filtered = storedPolicies.filter(item => item.name !== foundPolicy.name);
    await this._storage!.set(key, filtered);
    return true;
  }
}
// ...existing code...