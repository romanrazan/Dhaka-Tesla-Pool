import {
  Body,
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
import { CreateRideRequestDto } from './dto/create-ride-request.dto';
import { RideRequestsService } from './ride-requests.service';

@ApiBearerAuth()
@ApiTags('Ride requests')
@Roles(UserRole.PASSENGER)
@Controller('ride-requests')
export class RideRequestsController {
  constructor(private readonly service: RideRequestsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRideRequestDto) {
    return this.service.create(user.id, dto);
  }

  @Get('my')
  mine(@CurrentUser() user: User) {
    return this.service.listMine(user.id);
  }

  @Get('dashboard/summary')
  dashboardSummary(@CurrentUser() user: User) {
    return this.service.dashboardSummary(user.id);
  }

  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.detail(id, user.id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.cancel(id, user.id);
  }
}
