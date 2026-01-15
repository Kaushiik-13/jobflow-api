import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) { }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  create(user: Partial<User>) {
    return this.usersRepo.save(user);
  }

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async updateRole(email: string, role: Role) {
    const user = await this.usersRepo.findOne({ where: { email: email } });
    if (!user) {
      throw new Error('User not found');
    }

    user.role = role;
    return this.usersRepo.save(user);
  }

}
