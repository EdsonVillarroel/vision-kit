import {
  Controller, Post, Param, UseGuards,
  UploadedFile, UseInterceptors, BadRequestException, Req,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { InventoryService } from '../inventory/inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('upload')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private storageService: StorageService,
    private usersService: UsersService,
    private inventoryService: InventoryService,
  ) {}

  @ApiOperation({ summary: 'Subir avatar de usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Post('avatar/:userId')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  async uploadAvatar(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (req.user.id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenException('Solo puedes subir tu propio avatar');
    }
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Formato no permitido. Usa JPEG, PNG o WebP');
    }

    const url = await this.storageService.uploadAvatar(userId, file.buffer, file.mimetype);

    // Guardar la URL en el perfil del usuario
    await this.usersService.update(userId, { avatarUrl: url });

    return { url };
  }

  @ApiOperation({ summary: 'Subir imagen de producto — roles: admin, manager' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @Post('product-image/:productId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Formato no permitido. Usa JPEG, PNG o WebP');
    }

    const url = await this.storageService.uploadProductImage(productId, file.buffer, file.mimetype);

    return { url };
  }
}
