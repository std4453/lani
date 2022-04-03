/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BaseItemPerson } from './BaseItemPerson';
import type { ChannelType } from './ChannelType';
import type { ChapterInfo } from './ChapterInfo';
import type { DayOfWeek } from './DayOfWeek';
import type { ExternalUrl } from './ExternalUrl';
import type { ImageOrientation } from './ImageOrientation';
import type { IsoType } from './IsoType';
import type { LocationType } from './LocationType';
import type { MediaSourceInfo } from './MediaSourceInfo';
import type { MediaStream } from './MediaStream';
import type { MediaUrl } from './MediaUrl';
import type { MetadataField } from './MetadataField';
import type { NameGuidPair } from './NameGuidPair';
import type { PlayAccess } from './PlayAccess';
import type { ProgramAudio } from './ProgramAudio';
import type { UserItemDataDto } from './UserItemDataDto';
import type { Video3DFormat } from './Video3DFormat';
import type { VideoType } from './VideoType';

/**
 * This is strictly used as a data transfer object from the api layer.
 * This holds information about a BaseItem in a format that is convenient for the client.
 */
export type BaseItemDto = {
    /**
     * Gets or sets the name.
     */
    Name?: string | null;
    OriginalTitle?: string | null;
    /**
     * Gets or sets the server identifier.
     */
    ServerId?: string | null;
    /**
     * Gets or sets the id.
     */
    Id?: string;
    /**
     * Gets or sets the etag.
     */
    Etag?: string | null;
    /**
     * Gets or sets the type of the source.
     */
    SourceType?: string | null;
    /**
     * Gets or sets the playlist item identifier.
     */
    PlaylistItemId?: string | null;
    /**
     * Gets or sets the date created.
     */
    DateCreated?: string | null;
    DateLastMediaAdded?: string | null;
    ExtraType?: string | null;
    AirsBeforeSeasonNumber?: number | null;
    AirsAfterSeasonNumber?: number | null;
    AirsBeforeEpisodeNumber?: number | null;
    CanDelete?: boolean | null;
    CanDownload?: boolean | null;
    HasSubtitles?: boolean | null;
    PreferredMetadataLanguage?: string | null;
    PreferredMetadataCountryCode?: string | null;
    /**
     * Gets or sets a value indicating whether [supports synchronize].
     */
    SupportsSync?: boolean | null;
    Container?: string | null;
    /**
     * Gets or sets the name of the sort.
     */
    SortName?: string | null;
    ForcedSortName?: string | null;
    /**
     * Gets or sets the video3 D format.
     */
    Video3DFormat?: Video3DFormat | null;
    /**
     * Gets or sets the premiere date.
     */
    PremiereDate?: string | null;
    /**
     * Gets or sets the external urls.
     */
    ExternalUrls?: Array<ExternalUrl> | null;
    /**
     * Gets or sets the media versions.
     */
    MediaSources?: Array<MediaSourceInfo> | null;
    /**
     * Gets or sets the critic rating.
     */
    CriticRating?: number | null;
    ProductionLocations?: Array<string> | null;
    /**
     * Gets or sets the path.
     */
    Path?: string | null;
    EnableMediaSourceDisplay?: boolean | null;
    /**
     * Gets or sets the official rating.
     */
    OfficialRating?: string | null;
    /**
     * Gets or sets the custom rating.
     */
    CustomRating?: string | null;
    /**
     * Gets or sets the channel identifier.
     */
    ChannelId?: string | null;
    ChannelName?: string | null;
    /**
     * Gets or sets the overview.
     */
    Overview?: string | null;
    /**
     * Gets or sets the taglines.
     */
    Taglines?: Array<string> | null;
    /**
     * Gets or sets the genres.
     */
    Genres?: Array<string> | null;
    /**
     * Gets or sets the community rating.
     */
    CommunityRating?: number | null;
    /**
     * Gets or sets the cumulative run time ticks.
     */
    CumulativeRunTimeTicks?: number | null;
    /**
     * Gets or sets the run time ticks.
     */
    RunTimeTicks?: number | null;
    /**
     * Gets or sets the play access.
     */
    PlayAccess?: PlayAccess | null;
    /**
     * Gets or sets the aspect ratio.
     */
    AspectRatio?: string | null;
    /**
     * Gets or sets the production year.
     */
    ProductionYear?: number | null;
    /**
     * Gets or sets a value indicating whether this instance is place holder.
     */
    IsPlaceHolder?: boolean | null;
    /**
     * Gets or sets the number.
     */
    Number?: string | null;
    ChannelNumber?: string | null;
    /**
     * Gets or sets the index number.
     */
    IndexNumber?: number | null;
    /**
     * Gets or sets the index number end.
     */
    IndexNumberEnd?: number | null;
    /**
     * Gets or sets the parent index number.
     */
    ParentIndexNumber?: number | null;
    /**
     * Gets or sets the trailer urls.
     */
    RemoteTrailers?: Array<MediaUrl> | null;
    /**
     * Gets or sets the provider ids.
     */
    ProviderIds?: Record<string, string> | null;
    /**
     * Gets or sets a value indicating whether this instance is HD.
     */
    IsHD?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is folder.
     */
    IsFolder?: boolean | null;
    /**
     * Gets or sets the parent id.
     */
    ParentId?: string | null;
    /**
     * Gets or sets the type.
     */
    Type?: string | null;
    /**
     * Gets or sets the people.
     */
    People?: Array<BaseItemPerson> | null;
    /**
     * Gets or sets the studios.
     */
    Studios?: Array<NameGuidPair> | null;
    GenreItems?: Array<NameGuidPair> | null;
    /**
     * If the item does not have a logo, this will hold the Id of the Parent that has one.
     */
    ParentLogoItemId?: string | null;
    /**
     * If the item does not have any backdrops, this will hold the Id of the Parent that has one.
     */
    ParentBackdropItemId?: string | null;
    /**
     * Gets or sets the parent backdrop image tags.
     */
    ParentBackdropImageTags?: Array<string> | null;
    /**
     * Gets or sets the local trailer count.
     */
    LocalTrailerCount?: number | null;
    /**
     * User data for this item based on the user it's being requested for.
     */
    UserData?: UserItemDataDto | null;
    /**
     * Gets or sets the recursive item count.
     */
    RecursiveItemCount?: number | null;
    /**
     * Gets or sets the child count.
     */
    ChildCount?: number | null;
    /**
     * Gets or sets the name of the series.
     */
    SeriesName?: string | null;
    /**
     * Gets or sets the series id.
     */
    SeriesId?: string | null;
    /**
     * Gets or sets the season identifier.
     */
    SeasonId?: string | null;
    /**
     * Gets or sets the special feature count.
     */
    SpecialFeatureCount?: number | null;
    /**
     * Gets or sets the display preferences id.
     */
    DisplayPreferencesId?: string | null;
    /**
     * Gets or sets the status.
     */
    Status?: string | null;
    /**
     * Gets or sets the air time.
     */
    AirTime?: string | null;
    /**
     * Gets or sets the air days.
     */
    AirDays?: Array<DayOfWeek> | null;
    /**
     * Gets or sets the tags.
     */
    Tags?: Array<string> | null;
    /**
     * Gets or sets the primary image aspect ratio, after image enhancements.
     */
    PrimaryImageAspectRatio?: number | null;
    /**
     * Gets or sets the artists.
     */
    Artists?: Array<string> | null;
    /**
     * Gets or sets the artist items.
     */
    ArtistItems?: Array<NameGuidPair> | null;
    /**
     * Gets or sets the album.
     */
    Album?: string | null;
    /**
     * Gets or sets the type of the collection.
     */
    CollectionType?: string | null;
    /**
     * Gets or sets the display order.
     */
    DisplayOrder?: string | null;
    /**
     * Gets or sets the album id.
     */
    AlbumId?: string | null;
    /**
     * Gets or sets the album image tag.
     */
    AlbumPrimaryImageTag?: string | null;
    /**
     * Gets or sets the series primary image tag.
     */
    SeriesPrimaryImageTag?: string | null;
    /**
     * Gets or sets the album artist.
     */
    AlbumArtist?: string | null;
    /**
     * Gets or sets the album artists.
     */
    AlbumArtists?: Array<NameGuidPair> | null;
    /**
     * Gets or sets the name of the season.
     */
    SeasonName?: string | null;
    /**
     * Gets or sets the media streams.
     */
    MediaStreams?: Array<MediaStream> | null;
    /**
     * Gets or sets the type of the video.
     */
    VideoType?: VideoType | null;
    /**
     * Gets or sets the part count.
     */
    PartCount?: number | null;
    MediaSourceCount?: number | null;
    /**
     * Gets or sets the image tags.
     */
    ImageTags?: Record<string, string> | null;
    /**
     * Gets or sets the backdrop image tags.
     */
    BackdropImageTags?: Array<string> | null;
    /**
     * Gets or sets the screenshot image tags.
     */
    ScreenshotImageTags?: Array<string> | null;
    /**
     * Gets or sets the parent logo image tag.
     */
    ParentLogoImageTag?: string | null;
    /**
     * If the item does not have a art, this will hold the Id of the Parent that has one.
     */
    ParentArtItemId?: string | null;
    /**
     * Gets or sets the parent art image tag.
     */
    ParentArtImageTag?: string | null;
    /**
     * Gets or sets the series thumb image tag.
     */
    SeriesThumbImageTag?: string | null;
    /**
     * Gets or sets the blurhashes for the image tags.
     * Maps image type to dictionary mapping image tag to blurhash value.
     */
    ImageBlurHashes?: {
        Primary?: Record<string, string>;
        Art?: Record<string, string>;
        Backdrop?: Record<string, string>;
        Banner?: Record<string, string>;
        Logo?: Record<string, string>;
        Thumb?: Record<string, string>;
        Disc?: Record<string, string>;
        Box?: Record<string, string>;
        Screenshot?: Record<string, string>;
        Menu?: Record<string, string>;
        Chapter?: Record<string, string>;
        BoxRear?: Record<string, string>;
        Profile?: Record<string, string>;
    } | null;
    /**
     * Gets or sets the series studio.
     */
    SeriesStudio?: string | null;
    /**
     * Gets or sets the parent thumb item id.
     */
    ParentThumbItemId?: string | null;
    /**
     * Gets or sets the parent thumb image tag.
     */
    ParentThumbImageTag?: string | null;
    /**
     * Gets or sets the parent primary image item identifier.
     */
    ParentPrimaryImageItemId?: string | null;
    /**
     * Gets or sets the parent primary image tag.
     */
    ParentPrimaryImageTag?: string | null;
    /**
     * Gets or sets the chapters.
     */
    Chapters?: Array<ChapterInfo> | null;
    /**
     * Gets or sets the type of the location.
     */
    LocationType?: LocationType | null;
    /**
     * Gets or sets the type of the iso.
     */
    IsoType?: IsoType | null;
    /**
     * Gets or sets the type of the media.
     */
    MediaType?: string | null;
    /**
     * Gets or sets the end date.
     */
    EndDate?: string | null;
    /**
     * Gets or sets the locked fields.
     */
    LockedFields?: Array<MetadataField> | null;
    /**
     * Gets or sets the trailer count.
     */
    TrailerCount?: number | null;
    /**
     * Gets or sets the movie count.
     */
    MovieCount?: number | null;
    /**
     * Gets or sets the series count.
     */
    SeriesCount?: number | null;
    ProgramCount?: number | null;
    /**
     * Gets or sets the episode count.
     */
    EpisodeCount?: number | null;
    /**
     * Gets or sets the song count.
     */
    SongCount?: number | null;
    /**
     * Gets or sets the album count.
     */
    AlbumCount?: number | null;
    ArtistCount?: number | null;
    /**
     * Gets or sets the music video count.
     */
    MusicVideoCount?: number | null;
    /**
     * Gets or sets a value indicating whether [enable internet providers].
     */
    LockData?: boolean | null;
    Width?: number | null;
    Height?: number | null;
    CameraMake?: string | null;
    CameraModel?: string | null;
    Software?: string | null;
    ExposureTime?: number | null;
    FocalLength?: number | null;
    ImageOrientation?: ImageOrientation | null;
    Aperture?: number | null;
    ShutterSpeed?: number | null;
    Latitude?: number | null;
    Longitude?: number | null;
    Altitude?: number | null;
    IsoSpeedRating?: number | null;
    /**
     * Gets or sets the series timer identifier.
     */
    SeriesTimerId?: string | null;
    /**
     * Gets or sets the program identifier.
     */
    ProgramId?: string | null;
    /**
     * Gets or sets the channel primary image tag.
     */
    ChannelPrimaryImageTag?: string | null;
    /**
     * The start date of the recording, in UTC.
     */
    StartDate?: string | null;
    /**
     * Gets or sets the completion percentage.
     */
    CompletionPercentage?: number | null;
    /**
     * Gets or sets a value indicating whether this instance is repeat.
     */
    IsRepeat?: boolean | null;
    /**
     * Gets or sets the episode title.
     */
    EpisodeTitle?: string | null;
    /**
     * Gets or sets the type of the channel.
     */
    ChannelType?: ChannelType | null;
    /**
     * Gets or sets the audio.
     */
    Audio?: ProgramAudio | null;
    /**
     * Gets or sets a value indicating whether this instance is movie.
     */
    IsMovie?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is sports.
     */
    IsSports?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is series.
     */
    IsSeries?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is live.
     */
    IsLive?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is news.
     */
    IsNews?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is kids.
     */
    IsKids?: boolean | null;
    /**
     * Gets or sets a value indicating whether this instance is premiere.
     */
    IsPremiere?: boolean | null;
    /**
     * Gets or sets the timer identifier.
     */
    TimerId?: string | null;
    /**
     * Gets or sets the current program.
     */
    CurrentProgram?: BaseItemDto | null;
};
