import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/domain.enums';
import { User } from '../users/entities/user.entity';
import { RideHistoryService } from './ride-history.service';

@ApiBearerAuth()
@ApiTags('Ride history')
@Roles(UserRole.PASSENGER)
@Controller('ride-history')
export class RideHistoryController {
  constructor(private readonly service: RideHistoryService) {}

  @Get('my')
  mine(@CurrentUser() user: User) {
    return this.service.listMine(user.id);
  }
}
