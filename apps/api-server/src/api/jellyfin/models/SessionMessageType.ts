/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The different kinds of messages that are used in the WebSocket api.
 */
export enum SessionMessageType {
    FORCE_KEEP_ALIVE = 'ForceKeepAlive',
    GENERAL_COMMAND = 'GeneralCommand',
    USER_DATA_CHANGED = 'UserDataChanged',
    SESSIONS = 'Sessions',
    PLAY = 'Play',
    SYNC_PLAY_COMMAND = 'SyncPlayCommand',
    SYNC_PLAY_GROUP_UPDATE = 'SyncPlayGroupUpdate',
    PLAYSTATE = 'Playstate',
    RESTART_REQUIRED = 'RestartRequired',
    SERVER_SHUTTING_DOWN = 'ServerShuttingDown',
    SERVER_RESTARTING = 'ServerRestarting',
    LIBRARY_CHANGED = 'LibraryChanged',
    USER_DELETED = 'UserDeleted',
    USER_UPDATED = 'UserUpdated',
    SERIES_TIMER_CREATED = 'SeriesTimerCreated',
    TIMER_CREATED = 'TimerCreated',
    SERIES_TIMER_CANCELLED = 'SeriesTimerCancelled',
    TIMER_CANCELLED = 'TimerCancelled',
    REFRESH_PROGRESS = 'RefreshProgress',
    SCHEDULED_TASK_ENDED = 'ScheduledTaskEnded',
    PACKAGE_INSTALLATION_CANCELLED = 'PackageInstallationCancelled',
    PACKAGE_INSTALLATION_FAILED = 'PackageInstallationFailed',
    PACKAGE_INSTALLATION_COMPLETED = 'PackageInstallationCompleted',
    PACKAGE_INSTALLING = 'PackageInstalling',
    PACKAGE_UNINSTALLED = 'PackageUninstalled',
    ACTIVITY_LOG_ENTRY = 'ActivityLogEntry',
    SCHEDULED_TASKS_INFO = 'ScheduledTasksInfo',
    ACTIVITY_LOG_ENTRY_START = 'ActivityLogEntryStart',
    ACTIVITY_LOG_ENTRY_STOP = 'ActivityLogEntryStop',
    SESSIONS_START = 'SessionsStart',
    SESSIONS_STOP = 'SessionsStop',
    SCHEDULED_TASKS_INFO_START = 'ScheduledTasksInfoStart',
    SCHEDULED_TASKS_INFO_STOP = 'ScheduledTasksInfoStop',
    KEEP_ALIVE = 'KeepAlive',
}