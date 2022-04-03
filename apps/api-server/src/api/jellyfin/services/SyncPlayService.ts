/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BufferRequestDto } from '../models/BufferRequestDto';
import type { GroupInfoDto } from '../models/GroupInfoDto';
import type { IgnoreWaitRequestDto } from '../models/IgnoreWaitRequestDto';
import type { JoinGroupRequestDto } from '../models/JoinGroupRequestDto';
import type { MovePlaylistItemRequestDto } from '../models/MovePlaylistItemRequestDto';
import type { NewGroupRequestDto } from '../models/NewGroupRequestDto';
import type { NextItemRequestDto } from '../models/NextItemRequestDto';
import type { PingRequestDto } from '../models/PingRequestDto';
import type { PlayRequestDto } from '../models/PlayRequestDto';
import type { PreviousItemRequestDto } from '../models/PreviousItemRequestDto';
import type { QueueRequestDto } from '../models/QueueRequestDto';
import type { ReadyRequestDto } from '../models/ReadyRequestDto';
import type { RemoveFromPlaylistRequestDto } from '../models/RemoveFromPlaylistRequestDto';
import type { SeekRequestDto } from '../models/SeekRequestDto';
import type { SetPlaylistItemRequestDto } from '../models/SetPlaylistItemRequestDto';
import type { SetRepeatModeRequestDto } from '../models/SetRepeatModeRequestDto';
import type { SetShuffleModeRequestDto } from '../models/SetShuffleModeRequestDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SyncPlayService {

    /**
     * Notify SyncPlay group that member is buffering.
     * @param requestBody The player status.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayBuffering(
        requestBody: BufferRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Buffering',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Join an existing SyncPlay group.
     * @param requestBody The group to join.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayJoinGroup(
        requestBody: JoinGroupRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Join',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Leave the joined SyncPlay group.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayLeaveGroup(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Leave',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets all SyncPlay groups.
     * @returns GroupInfoDto Groups returned.
     * @throws ApiError
     */
    public static syncPlayGetGroups(): CancelablePromise<Array<GroupInfoDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/SyncPlay/List',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to move an item in the playlist in SyncPlay group.
     * @param requestBody The new position for the item.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayMovePlaylistItem(
        requestBody: MovePlaylistItemRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/MovePlaylistItem',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Create a new SyncPlay group.
     * @param requestBody The settings of the new group.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayCreateGroup(
        requestBody: NewGroupRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/New',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request next item in SyncPlay group.
     * @param requestBody The current item information.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayNextItem(
        requestBody: NextItemRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/NextItem',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request pause in SyncPlay group.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayPause(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Pause',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Update session ping.
     * @param requestBody The new ping.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayPing(
        requestBody: PingRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Ping',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request previous item in SyncPlay group.
     * @param requestBody The current item information.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayPreviousItem(
        requestBody: PreviousItemRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/PreviousItem',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to queue items to the playlist of a SyncPlay group.
     * @param requestBody The items to add.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayQueue(
        requestBody: QueueRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Queue',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Notify SyncPlay group that member is ready for playback.
     * @param requestBody The player status.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayReady(
        requestBody: ReadyRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Ready',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to remove items from the playlist in SyncPlay group.
     * @param requestBody The items to remove.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayRemoveFromPlaylist(
        requestBody: RemoveFromPlaylistRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/RemoveFromPlaylist',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request seek in SyncPlay group.
     * @param requestBody The new playback position.
     * @returns void
     * @throws ApiError
     */
    public static syncPlaySeek(
        requestBody: SeekRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Seek',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request SyncPlay group to ignore member during group-wait.
     * @param requestBody The settings to set.
     * @returns void
     * @throws ApiError
     */
    public static syncPlaySetIgnoreWait(
        requestBody: IgnoreWaitRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/SetIgnoreWait',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to set new playlist in SyncPlay group.
     * @param requestBody The new playlist to play in the group.
     * @returns void
     * @throws ApiError
     */
    public static syncPlaySetNewQueue(
        requestBody: PlayRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/SetNewQueue',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to change playlist item in SyncPlay group.
     * @param requestBody The new item to play.
     * @returns void
     * @throws ApiError
     */
    public static syncPlaySetPlaylistItem(
        requestBody: SetPlaylistItemRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/SetPlaylistItem',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to set repeat mode in SyncPlay group.
     * @param requestBody The new repeat mode.
     * @returns void
     * @throws ApiError
     */
    public static syncPlaySetRepeatMode(
        requestBody: SetRepeatModeRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/SetRepeatMode',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request to set shuffle mode in SyncPlay group.
     * @param requestBody The new shuffle mode.
     * @returns void
     * @throws ApiError
     */
    public static syncPlaySetShuffleMode(
        requestBody: SetShuffleModeRequestDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/SetShuffleMode',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request stop in SyncPlay group.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayStop(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Stop',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Request unpause in SyncPlay group.
     * @returns void
     * @throws ApiError
     */
    public static syncPlayUnpause(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/SyncPlay/Unpause',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}