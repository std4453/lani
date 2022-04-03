/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientCapabilitiesDto } from '../models/ClientCapabilitiesDto';
import type { GeneralCommand } from '../models/GeneralCommand';
import type { GeneralCommandType } from '../models/GeneralCommandType';
import type { MessageCommand } from '../models/MessageCommand';
import type { NameIdPair } from '../models/NameIdPair';
import type { PlayCommand } from '../models/PlayCommand';
import type { PlaystateCommand } from '../models/PlaystateCommand';
import type { SessionInfo } from '../models/SessionInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SessionService {

    /**
     * Get all password reset providers.
     * @returns NameIdPair Password reset providers retrieved.
     * @throws ApiError
     */
    public static getPasswordResetProviders(): CancelablePromise<Array<NameIdPair>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Auth/PasswordResetProviders',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get all auth providers.
     * @returns NameIdPair Auth providers retrieved.
     * @throws ApiError
     */
    public static getAuthProviders(): CancelablePromise<Array<NameIdPair>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Auth/Providers',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a list of sessions.
     * @param controllableByUserId Filter by sessions that a given user is allowed to remote control.
     * @param deviceId Filter by device Id.
     * @param activeWithinSeconds Optional. Filter by sessions that were active in the last n seconds.
     * @returns SessionInfo List of sessions returned.
     * @throws ApiError
     */
    public static getSessions(
        controllableByUserId?: string | null,
        deviceId?: string | null,
        activeWithinSeconds?: number | null,
    ): CancelablePromise<Array<SessionInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Sessions',
            query: {
                'controllableByUserId': controllableByUserId,
                'deviceId': deviceId,
                'activeWithinSeconds': activeWithinSeconds,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Issues a full general command to a client.
     * @param sessionId The session id.
     * @param requestBody The MediaBrowser.Model.Session.GeneralCommand.
     * @returns void
     * @throws ApiError
     */
    public static sendFullGeneralCommand(
        sessionId: string,
        requestBody: GeneralCommand,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/Command',
            path: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Issues a general command to a client.
     * @param sessionId The session id.
     * @param command The command to send.
     * @returns void
     * @throws ApiError
     */
    public static sendGeneralCommand(
        sessionId: string,
        command: GeneralCommandType,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/Command/{command}',
            path: {
                'sessionId': sessionId,
                'command': command,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Issues a command to a client to display a message to the user.
     * @param sessionId The session id.
     * @param requestBody The MediaBrowser.Model.Session.MessageCommand object containing Header, Message Text, and TimeoutMs.
     * @returns void
     * @throws ApiError
     */
    public static sendMessageCommand(
        sessionId: string,
        requestBody: MessageCommand,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/Message',
            path: {
                'sessionId': sessionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Instructs a session to play an item.
     * @param sessionId The session id.
     * @param playCommand The type of play command to issue (PlayNow, PlayNext, PlayLast). Clients who have not yet implemented play next and play last may play now.
     * @param itemIds The ids of the items to play, comma delimited.
     * @param startPositionTicks The starting position of the first item.
     * @param mediaSourceId Optional. The media source id.
     * @param audioStreamIndex Optional. The index of the audio stream to play.
     * @param subtitleStreamIndex Optional. The index of the subtitle stream to play.
     * @param startIndex Optional. The start index.
     * @returns void
     * @throws ApiError
     */
    public static play(
        sessionId: string,
        playCommand: PlayCommand,
        itemIds: Array<string>,
        startPositionTicks?: number | null,
        mediaSourceId?: string | null,
        audioStreamIndex?: number | null,
        subtitleStreamIndex?: number | null,
        startIndex?: number | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/Playing',
            path: {
                'sessionId': sessionId,
            },
            query: {
                'playCommand': playCommand,
                'itemIds': itemIds,
                'startPositionTicks': startPositionTicks,
                'mediaSourceId': mediaSourceId,
                'audioStreamIndex': audioStreamIndex,
                'subtitleStreamIndex': subtitleStreamIndex,
                'startIndex': startIndex,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Issues a playstate command to a client.
     * @param sessionId The session id.
     * @param command The MediaBrowser.Model.Session.PlaystateCommand.
     * @param seekPositionTicks The optional position ticks.
     * @param controllingUserId The optional controlling user id.
     * @returns void
     * @throws ApiError
     */
    public static sendPlaystateCommand(
        sessionId: string,
        command: PlaystateCommand,
        seekPositionTicks?: number | null,
        controllingUserId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/Playing/{command}',
            path: {
                'sessionId': sessionId,
                'command': command,
            },
            query: {
                'seekPositionTicks': seekPositionTicks,
                'controllingUserId': controllingUserId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Issues a system command to a client.
     * @param sessionId The session id.
     * @param command The command to send.
     * @returns void
     * @throws ApiError
     */
    public static sendSystemCommand(
        sessionId: string,
        command: GeneralCommandType,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/System/{command}',
            path: {
                'sessionId': sessionId,
                'command': command,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Adds an additional user to a session.
     * @param sessionId The session id.
     * @param userId The user id.
     * @returns void
     * @throws ApiError
     */
    public static addUserToSession(
        sessionId: string,
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/User/{userId}',
            path: {
                'sessionId': sessionId,
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Removes an additional user from a session.
     * @param sessionId The session id.
     * @param userId The user id.
     * @returns void
     * @throws ApiError
     */
    public static removeUserFromSession(
        sessionId: string,
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Sessions/{sessionId}/User/{userId}',
            path: {
                'sessionId': sessionId,
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Instructs a session to browse to an item or view.
     * @param sessionId The session Id.
     * @param itemType The type of item to browse to.
     * @param itemId The Id of the item.
     * @param itemName The name of the item.
     * @returns void
     * @throws ApiError
     */
    public static displayContent(
        sessionId: string,
        itemType: string,
        itemId: string,
        itemName: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/{sessionId}/Viewing',
            path: {
                'sessionId': sessionId,
            },
            query: {
                'itemType': itemType,
                'itemId': itemId,
                'itemName': itemName,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates capabilities for a device.
     * @param id The session id.
     * @param playableMediaTypes A list of playable media types, comma delimited. Audio, Video, Book, Photo.
     * @param supportedCommands A list of supported remote control commands, comma delimited.
     * @param supportsMediaControl Determines whether media can be played remotely..
     * @param supportsSync Determines whether sync is supported.
     * @param supportsPersistentIdentifier Determines whether the device supports a unique identifier.
     * @returns void
     * @throws ApiError
     */
    public static postCapabilities(
        id?: string | null,
        playableMediaTypes?: Array<string> | null,
        supportedCommands?: Array<GeneralCommandType> | null,
        supportsMediaControl: boolean = false,
        supportsSync: boolean = false,
        supportsPersistentIdentifier: boolean = true,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Capabilities',
            query: {
                'id': id,
                'playableMediaTypes': playableMediaTypes,
                'supportedCommands': supportedCommands,
                'supportsMediaControl': supportsMediaControl,
                'supportsSync': supportsSync,
                'supportsPersistentIdentifier': supportsPersistentIdentifier,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates capabilities for a device.
     * @param requestBody The MediaBrowser.Model.Session.ClientCapabilities.
     * @param id The session id.
     * @returns void
     * @throws ApiError
     */
    public static postFullCapabilities(
        requestBody: ClientCapabilitiesDto,
        id?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Capabilities/Full',
            query: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that a session has ended.
     * @returns void
     * @throws ApiError
     */
    public static reportSessionEnded(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Logout',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that a session is viewing an item.
     * @param itemId The item id.
     * @param sessionId The session id.
     * @returns void
     * @throws ApiError
     */
    public static reportViewing(
        itemId: string,
        sessionId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Sessions/Viewing',
            query: {
                'sessionId': sessionId,
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}