import { CommonModule } from '@/common/index.module';
import { LarkBot } from '@/notification/lark/LarkBot';
import { ManagementNotificationProvider } from '@/notification/ManagementNotificationProvider';
import { NotificationService } from '@/notification/NotificationService';
import { UserNotificationProvider } from '@/notification/UserNotificationProvider';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CommonModule, ConfigModule],
  providers: [
    NotificationService,
    LarkBot,
    {
      provide: UserNotificationProvider,
      useExisting: LarkBot,
    },
    {
      provide: ManagementNotificationProvider,
      useExisting: LarkBot,
    },
  ],
})
export class NotificationModule {}
