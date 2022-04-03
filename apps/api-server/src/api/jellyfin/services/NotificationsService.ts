/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminNotificationDto } from '../models/AdminNotificationDto';
import type { NameIdPair } from '../models/NameIdPair';
import type { NotificationResultDto } from '../models/NotificationResultDto';
import type { NotificationsSummaryDto } from '../models/NotificationsSummaryDto';
import type { NotificationTypeInfo } from '../models/NotificationTypeInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NotificationsService {

    /**
     * Gets a user's notifications.
     * @param userId
     * @returns NotificationResultDto Notifications returned.
     * @throws ApiError
     */
    public static getNotifications(
        userId: string,
    ): CancelablePromise<NotificationResultDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Notifications/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sets notifications as read.
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static setRead(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Notifications/{userId}/Read',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a user's notification summary.
     * @param userId
     * @returns NotificationsSummaryDto Summary of user's notifications returned.
     * @throws ApiError
     */
    public static getNotificationsSummary(
        userId: string,
    ): CancelablePromise<NotificationsSummaryDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Notifications/{userId}/Summary',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sets notifications as unread.
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static setUnread(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Notifications/{userId}/Unread',
            path: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Sends a notification to all admins.
     * @param requestBody The notification request.
     * @returns void
     * @throws ApiError
     */
    public static createAdminNotification(
        requestBody: AdminNotificationDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Notifications/Admin',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets notification services.
     * @returns NameIdPair All notification services returned.
     * @throws ApiError
     */
    public static getNotificationServices(): CancelablePromise<Array<NameIdPair>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Notifications/Services',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets notification types.
     * @returns NotificationTypeInfo All notification types returned.
     * @throws ApiError
     */
    public static getNotificationTypes(): CancelablePromise<Array<NotificationTypeInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Notifications/Types',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}