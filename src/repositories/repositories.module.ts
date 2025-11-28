// ...existing code...
import { NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

import { PolicyRepository } from './policy.repository';
import { UserRepository } from './user.repository';

const repositories = [
    UserRepository, PolicyRepository
];

@NgModule({
  imports: [
    IonicStorageModule.forRoot({
      name: 'cam_db',
      driverOrder: ['localstorage', 'indexeddb', 'sqlite', 'websql']
    })
  ],
  providers: repositories
})
export class RepositoriesModule {}
// ...existing code...