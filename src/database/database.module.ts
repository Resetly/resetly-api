import { Global, Module, OnApplicationShutdown, Inject } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { Sql } from 'postgres';
import { AppConfigService } from '../config/config.service';
import * as schema from './schema';

export const DRIZZLE_CLIENT = Symbol('DRIZZLE_CLIENT');
export const SQL_CLIENT = Symbol('SQL_CLIENT');

export type DrizzleClient = PostgresJsDatabase<typeof schema>;

const createPostgresClient = (
  typeof postgres === 'function' ? postgres : (postgres as any).default
) as typeof postgres;

@Global()
@Module({
  providers: [
    {
      provide: SQL_CLIENT,
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService): Sql => {
        return createPostgresClient(configService.databaseUrl, {
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10,
        });
      },
    },
    {
      provide: DRIZZLE_CLIENT,
      inject: [SQL_CLIENT],
      useFactory: (sql: Sql): DrizzleClient => {
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: [DRIZZLE_CLIENT, SQL_CLIENT],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(SQL_CLIENT) private readonly sql: Sql) {}

  async onApplicationShutdown(): Promise<void> {
    await this.sql.end();
  }
}
