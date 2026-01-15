import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(RolesGuard)
export class JobsController {
  constructor(private jobsService: JobsService) { }

  // USER: create job
  @Post()
  @Roles(Role.USER)
  createJob(@Req() req, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(req.user.userId, dto);
  }

  // USER: own jobs
  @Get('my')
  @Roles(Role.USER)
  getMyJobs(@Req() req) {
    return this.jobsService.findJobsByUser(req.user.userId);
  }

  // ADMIN: all jobs
  @Get()
  @Roles(Role.ADMIN)
  getAllJobs() {
    return this.jobsService.findAllJobs();
  }

  // ADMIN: update status
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  updateJobStatus(
    @Param('id') id: number,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(id, dto.status);
  }

  @Get('debug/auth')
  @UseGuards(JwtAuthGuard)
  debugAuth(@Req() req) {
    return req.user;
  }
}
