import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FinanceModule } from './finance/finance.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CustomersModule } from './customers/customers.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectStagesModule } from './project-stages/project-stages.module';
import { ProjectBudgetsModule } from './project-budgets/project-budgets.module';
import { WorkersModule } from './workers/workers.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { InventoryModule } from './inventory/inventory.module';
import { ContractsModule } from './contracts/contracts.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { QuotesModule } from './quotes/quotes.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    FinanceModule, SuppliersModule, CustomersModule, ProjectsModule, ProjectStagesModule, ProjectBudgetsModule, WorkersModule, WorkLogsModule, AuthModule, UsersModule, CostCentersModule, InventoryModule, ContractsModule, QuotesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule { }
