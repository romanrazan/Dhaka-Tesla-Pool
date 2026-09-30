import { Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/domain.enums';
import { User } from '../users/entities/user.entity';
import { VehiclesService } from './vehicles.service';

@ApiBearerAuth()
@ApiTags('Vehicles')
@Roles(UserRole.DRIVER)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('me')
  mine(@CurrentUser() user: User) {
    return this.vehiclesService.mine(user.id);
  }

  @Patch('me/online')
  online(@CurrentUser() user: User) {
    return this.vehiclesService.setOnline(user.id, true);
  }

  @Patch('me/offline')
  offline(@CurrentUser() user: User) {
    return this.vehiclesService.setOnline(user.id, false);
  }
}
