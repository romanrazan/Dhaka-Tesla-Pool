import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/domain.enums';
import { EstimateFareDto } from './dto/estimate-fare.dto';
import { FareService } from './fare.service';

@ApiBearerAuth()
@ApiTags('Fares')
@Roles(UserRole.PASSENGER)
@Controller('fares')
export class FareController {
  constructor(private readonly fareService: FareService) {}

  @Post('estimate')
  estimate(@Body() dto: EstimateFareDto) {
    return this.fareService.estimate(
      dto.pickupZone,
      dto.destinationZone,
      dto.requestedSeats,
    );
  }
}
