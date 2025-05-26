import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { Address } from './entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Address, User])],
    controllers: [AddressesController],
    providers: [AddressesService],
    exports: [TypeOrmModule],
})
export class AddressesModule {}
