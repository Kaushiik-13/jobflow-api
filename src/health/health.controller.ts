import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async checkHealth() {
    // Application health
    const appHealth = {
      status: 'up',
      uptime: process.uptime(), // seconds
    };

    // Database health
    let dbStatus: 'up' | 'down' = 'up';

    
    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      dbStatus = 'down';
    }

    // Overall status
    const overallStatus = dbStatus === 'up' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      application: appHealth,
      database: {
        status: dbStatus,
      },
    };
  }
}
