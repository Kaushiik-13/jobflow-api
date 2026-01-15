import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  
  constructor(private readonly usersService:UsersService){}


  @Get()
  @Roles(Role.ADMIN)
  getAllUsers() {
    return { message: 'Only admin can access this' };
  }

  @Patch(':email/role')
  @Roles(Role.ADMIN)
  updateUserRole(
    @Param('email') email: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(email, dto.role);
  }
}
