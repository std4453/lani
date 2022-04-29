import { CommonModule } from '@/common/index.module';
import config from '@/config';
import { LarkBot } from '@/notification/lark/LarkBot';
import { ManagementNotificationProvider } from '@/notification/ManagementNotificationProvider';
import { NotificationService } from '@/notification/NotificationService';
import { UserNotificationProvider } from '@/notification/UserNotificationProvider';
import { Module, ModuleMetadata, Provider } from '@nestjs/common';

function getModuleMetadata(): ModuleMetadata {
  const {
    notifications: { management, user },
  } = config;

  const managementProvider = management.enabled ? management.kind : undefined;
  const userProvider = user.enabled ? user.kind : undefined;

  const useLark = managementProvider === 'lark' || userProvider === 'lark';

  const managementNotificationProvider: Provider | undefined =
    management.enabled
      ? {
          provide: ManagementNotificationProvider,
          useExisting: { lark: LarkBot }[management.kind],
        }
      : undefined;
  const userNotificationProvider: Provider | undefined = user.enabled
    ? {
        provide: UserNotificationProvider,
        useExisting: { lark: LarkBot }[user.kind],
      }
    : undefined;

  return {
    imports: [CommonModule],
    providers: [
      // impl
      useLark && LarkBot,

      // stub
      managementNotificationProvider,
      userNotificationProvider,

      // usage
      NotificationService,
    ].filter((i): i is Exclude<typeof i, undefined | false> => Boolean(i)),
  };
}

@Module(getModuleMetadata())
export class NotificationModule {}
