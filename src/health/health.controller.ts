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

    // Database health - check but don't fail if DB is down
    let dbStatus: 'up' | 'down' = 'up';
    let dbResponse: string | null = null;

    try {
      if (this.dataSource?.isInitialized) {
        await this.dataSource.query('SELECT 1');
        dbResponse = 'connected';
      } else {
        dbStatus = 'down';
        dbResponse = 'not initialized';
      }
    } catch (error) {
      dbStatus = 'down';
      dbResponse = error.message || 'connection failed';
    }

    // Overall status - always return ok for app health
    const overallStatus = 'ok';

    return {
      status: overallStatus,
      application: appHealth,
      database: {
        status: dbStatus,
        details: dbResponse,
      },
    };
  }
}
