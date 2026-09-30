import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/domain.enums';
import { User } from './entities/user.entity';

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase();
    if (await this.users.exists({ where: { email } })) {
      throw new ConflictException('An account with this email already exists');
    }
    return this.users.save(
      this.users.create({ ...input, email, phone: input.phone ?? null }),
    );
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
