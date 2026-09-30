import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/domain.enums';
import { User } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@ApiBearerAuth()
@ApiTags('Payments')
@Roles(UserRole.PASSENGER)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePaymentDto) {
    return this.service.create(user.id, dto);
  }

  @Get('my')
  mine(@CurrentUser() user: User) {
    return this.service.listMine(user.id);
  }
}
