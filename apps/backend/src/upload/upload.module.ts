import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { StorageModule } from '../storage/storage.module';
import { UsersModule } from '../users/users.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    MulterModule.register({ storage: undefined }), // memory storage (buffer en req.file)
    StorageModule,
    UsersModule,
    InventoryModule,
  ],
  controllers: [UploadController],
})
export class UploadModule {}
