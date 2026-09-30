import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { DhakaZone } from '../../common/enums/domain.enums';

export class EstimateFareDto {
  @ApiProperty({ enum: DhakaZone, example: DhakaZone.BANANI })
  @IsEnum(DhakaZone)
  pickupZone: DhakaZone;

  @ApiProperty({ enum: DhakaZone, example: DhakaZone.MOHAKHALI })
  @IsEnum(DhakaZone)
  destinationZone: DhakaZone;

  @ApiProperty({ minimum: 1, maximum: 3, default: 1 })
  @IsInt()
  @Min(1)
  @Max(3)
  requestedSeats: number;
}
