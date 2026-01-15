import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UsersService } from '../users/users.service';
import { JobStatus } from '../common/enums/job-status.enum';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Job)
        private jobsRepo: Repository<Job>,
        private usersService: UsersService,
    ) { }

    async createJob(userId: number, dto: CreateJobDto) {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const job = this.jobsRepo.create({
            ...dto,
            status: JobStatus.PENDING,
            createdBy: user,
        });

        return this.jobsRepo.save(job);
    }


    findAllJobs() {
        return this.jobsRepo.find();
    }

    findJobsByUser(userId: number) {
        return this.jobsRepo.find({
            where: { createdBy: { id: userId } },
        });
    }

    async updateStatus(jobId: number, status: JobStatus) {
        const job = await this.jobsRepo.findOne({ where: { id: jobId } });
        if (!job) {
            throw new NotFoundException('Job not found');
        }

        job.status = status;
        return this.jobsRepo.save(job);
    }
}
