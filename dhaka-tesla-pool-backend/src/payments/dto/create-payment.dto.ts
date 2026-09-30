import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../common/enums/domain.enums';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  rideRequestId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
