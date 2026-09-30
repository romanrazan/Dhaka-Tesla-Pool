import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/domain.enums';
import { User } from '../users/entities/user.entity';
import { PoolsService } from './pools.service';

@ApiBearerAuth()
@ApiTags('Pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly service: PoolsService) {}

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.detail(id, user);
  }

  @Roles(UserRole.DRIVER)
  @Get(':id/passengers')
  passengers(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.service.passengerManifest(id, user.id);
  }

  @Roles(UserRole.DRIVER)
  @Post(':id/accept')
  accept(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.transition(id, user.id, 'accept');
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/arrived')
  arrived(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.transition(id, user.id, 'arrived');
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/start')
  start(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.transition(id, user.id, 'start');
  }

  @Roles(UserRole.DRIVER)
  @Patch(':id/complete')
  complete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.transition(id, user.id, 'complete');
  }
}
