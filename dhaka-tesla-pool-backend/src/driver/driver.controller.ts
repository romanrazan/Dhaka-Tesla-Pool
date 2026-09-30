import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/domain.enums';
import { PoolsService } from '../pools/pools.service';
import { User } from '../users/entities/user.entity';

@ApiBearerAuth()
@ApiTags('Driver')
@Roles(UserRole.DRIVER)
@Controller('driver')
export class DriverController {
  constructor(private readonly pools: PoolsService) {}

  @Get('dashboard/summary')
  dashboardSummary(@CurrentUser() user: User) {
    return this.pools.dashboardSummaryForDriver(user.id);
  }

  @Get('requests')
  requests(@CurrentUser() user: User) {
    return this.pools.availableRequestsForDriver(user.id);
  }

  @Post('requests/:id/accept')
  acceptRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.pools.acceptRideRequest(user.id, id);
  }

  @Get('pools/active')
  active(@CurrentUser() user: User) {
    return this.pools.activeForDriver(user.id);
  }

  @Get('history')
  history(@CurrentUser() user: User) {
    return this.pools.historyForDriver(user.id);
  }
}
