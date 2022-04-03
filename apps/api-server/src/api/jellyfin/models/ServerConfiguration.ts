/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ImageSavingConvention } from './ImageSavingConvention';
import type { MetadataOptions } from './MetadataOptions';
import type { NameValuePair } from './NameValuePair';
import type { PathSubstitution } from './PathSubstitution';
import type { RepositoryInfo } from './RepositoryInfo';
import type { Version } from './Version';

/**
 * Represents the server configuration.
 */
export type ServerConfiguration = {
    /**
     * Gets or sets the number of days we should retain log files.
     */
    LogFileRetentionDays?: number;
    /**
     * Gets or sets a value indicating whether this instance is first run.
     */
    IsStartupWizardCompleted?: boolean;
    /**
     * Gets or sets the cache path.
     */
    CachePath?: string | null;
    /**
     * Gets or sets the last known version that was ran using the configuration.
     */
    PreviousVersion?: Version | null;
    /**
     * Gets or sets the stringified PreviousVersion to be stored/loaded,
     * because System.Version itself isn't xml-serializable.
     */
    PreviousVersionStr?: string | null;
    /**
     * Gets or sets a value indicating whether to enable automatic port forwarding.
     */
    EnableUPnP?: boolean;
    /**
     * Gets or sets a value indicating whether to enable prometheus metrics exporting.
     */
    EnableMetrics?: boolean;
    /**
     * Gets or sets the public mapped port.
     */
    PublicPort?: number;
    /**
     * Gets or sets a value indicating whether the http port should be mapped as part of UPnP automatic port forwarding.
     */
    UPnPCreateHttpPortMap?: boolean;
    /**
     * Gets or sets client udp port range.
     */
    UDPPortRange?: string | null;
    /**
     * Gets or sets a value indicating whether IPV6 capability is enabled.
     */
    EnableIPV6?: boolean;
    /**
     * Gets or sets a value indicating whether IPV4 capability is enabled.
     */
    EnableIPV4?: boolean;
    /**
     * Gets or sets a value indicating whether detailed ssdp logs are sent to the console/log.
     * "Emby.Dlna": "Debug" must be set in logging.default.json for this property to work.
     */
    EnableSSDPTracing?: boolean;
    /**
     * Gets or sets a value indicating whether an IP address is to be used to filter the detailed ssdp logs that are being sent to the console/log.
     * If the setting "Emby.Dlna": "Debug" msut be set in logging.default.json for this property to work.
     */
    SSDPTracingFilter?: string | null;
    /**
     * Gets or sets the number of times SSDP UDP messages are sent.
     */
    UDPSendCount?: number;
    /**
     * Gets or sets the delay between each groups of SSDP messages (in ms).
     */
    UDPSendDelay?: number;
    /**
     * Gets or sets a value indicating whether address names that match MediaBrowser.Model.Configuration.ServerConfiguration.VirtualInterfaceNames should be Ignore for the purposes of binding.
     */
    IgnoreVirtualInterfaces?: boolean;
    /**
     * Gets or sets a value indicating the interfaces that should be ignored. The list can be comma separated. <seealso cref="P:MediaBrowser.Model.Configuration.ServerConfiguration.IgnoreVirtualInterfaces" />.
     */
    VirtualInterfaceNames?: string | null;
    /**
     * Gets or sets the time (in seconds) between the pings of SSDP gateway monitor.
     */
    GatewayMonitorPeriod?: number;
    /**
     * Gets a value indicating whether multi-socket binding is available.
     */
    readonly EnableMultiSocketBinding?: boolean;
    /**
     * Gets or sets a value indicating whether all IPv6 interfaces should be treated as on the internal network.
     * Depending on the address range implemented ULA ranges might not be used.
     */
    TrustAllIP6Interfaces?: boolean;
    /**
     * Gets or sets the ports that HDHomerun uses.
     */
    HDHomerunPortRange?: string | null;
    /**
     * Gets or sets PublishedServerUri to advertise for specific subnets.
     */
    PublishedServerUriBySubnet?: Array<string> | null;
    /**
     * Gets or sets a value indicating whether Autodiscovery tracing is enabled.
     */
    AutoDiscoveryTracing?: boolean;
    /**
     * Gets or sets a value indicating whether Autodiscovery is enabled.
     */
    AutoDiscovery?: boolean;
    /**
     * Gets or sets the public HTTPS port.
     */
    PublicHttpsPort?: number;
    /**
     * Gets or sets the HTTP server port number.
     */
    HttpServerPortNumber?: number;
    /**
     * Gets or sets the HTTPS server port number.
     */
    HttpsPortNumber?: number;
    /**
     * Gets or sets a value indicating whether to use HTTPS.
     */
    EnableHttps?: boolean;
    EnableNormalizedItemByNameIds?: boolean;
    /**
     * Gets or sets the filesystem path of an X.509 certificate to use for SSL.
     */
    CertificatePath?: string | null;
    /**
     * Gets or sets the password required to access the X.509 certificate data in the file specified by MediaBrowser.Model.Configuration.ServerConfiguration.CertificatePath.
     */
    CertificatePassword?: string | null;
    /**
     * Gets or sets a value indicating whether this instance is port authorized.
     */
    IsPortAuthorized?: boolean;
    /**
     * Gets or sets a value indicating whether quick connect is available for use on this server.
     */
    QuickConnectAvailable?: boolean;
    /**
     * Gets or sets a value indicating whether access outside of the LAN is permitted.
     */
    EnableRemoteAccess?: boolean;
    /**
     * Gets or sets a value indicating whether [enable case sensitive item ids].
     */
    EnableCaseSensitiveItemIds?: boolean;
    DisableLiveTvChannelUserDataName?: boolean;
    /**
     * Gets or sets the metadata path.
     */
    MetadataPath?: string | null;
    MetadataNetworkPath?: string | null;
    /**
     * Gets or sets the preferred metadata language.
     */
    PreferredMetadataLanguage?: string | null;
    /**
     * Gets or sets the metadata country code.
     */
    MetadataCountryCode?: string | null;
    /**
     * Gets or sets characters to be replaced with a ' ' in strings to create a sort name.
     */
    SortReplaceCharacters?: Array<string> | null;
    /**
     * Gets or sets characters to be removed from strings to create a sort name.
     */
    SortRemoveCharacters?: Array<string> | null;
    /**
     * Gets or sets words to be removed from strings to create a sort name.
     */
    SortRemoveWords?: Array<string> | null;
    /**
     * Gets or sets the minimum percentage of an item that must be played in order for playstate to be updated.
     */
    MinResumePct?: number;
    /**
     * Gets or sets the maximum percentage of an item that can be played while still saving playstate. If this percentage is crossed playstate will be reset to the beginning and the item will be marked watched.
     */
    MaxResumePct?: number;
    /**
     * Gets or sets the minimum duration that an item must have in order to be eligible for playstate updates..
     */
    MinResumeDurationSeconds?: number;
    /**
     * Gets or sets the minimum minutes of a book that must be played in order for playstate to be updated.
     */
    MinAudiobookResume?: number;
    /**
     * Gets or sets the remaining minutes of a book that can be played while still saving playstate. If this percentage is crossed playstate will be reset to the beginning and the item will be marked watched.
     */
    MaxAudiobookResume?: number;
    /**
     * Gets or sets the delay in seconds that we will wait after a file system change to try and discover what has been added/removed
     * Some delay is necessary with some items because their creation is not atomic.  It involves the creation of several
     * different directories and files.
     */
    LibraryMonitorDelay?: number;
    /**
     * Gets or sets a value indicating whether [enable dashboard response caching].
     * Allows potential contributors without visual studio to modify production dashboard code and test changes.
     */
    EnableDashboardResponseCaching?: boolean;
    /**
     * Gets or sets the image saving convention.
     */
    ImageSavingConvention?: ImageSavingConvention;
    MetadataOptions?: Array<MetadataOptions> | null;
    SkipDeserializationForBasicTypes?: boolean;
    ServerName?: string | null;
    BaseUrl?: string | null;
    UICulture?: string | null;
    SaveMetadataHidden?: boolean;
    ContentTypes?: Array<NameValuePair> | null;
    RemoteClientBitrateLimit?: number;
    EnableFolderView?: boolean;
    EnableGroupingIntoCollections?: boolean;
    DisplaySpecialsWithinSeasons?: boolean;
    /**
     * Gets or sets the subnets that are deemed to make up the LAN.
     */
    LocalNetworkSubnets?: Array<string> | null;
    /**
     * Gets or sets the interface addresses which Jellyfin will bind to. If empty, all interfaces will be used.
     */
    LocalNetworkAddresses?: Array<string> | null;
    CodecsUsed?: Array<string> | null;
    PluginRepositories?: Array<RepositoryInfo> | null;
    EnableExternalContentInSuggestions?: boolean;
    /**
     * Gets or sets a value indicating whether the server should force connections over HTTPS.
     */
    RequireHttps?: boolean;
    EnableNewOmdbSupport?: boolean;
    /**
     * Gets or sets the filter for remote IP connectivity. Used in conjuntion with <seealso cref="P:MediaBrowser.Model.Configuration.ServerConfiguration.IsRemoteIPFilterBlacklist" />.
     */
    RemoteIPFilter?: Array<string> | null;
    /**
     * Gets or sets a value indicating whether <seealso cref="P:MediaBrowser.Model.Configuration.ServerConfiguration.RemoteIPFilter" /> contains a blacklist or a whitelist. Default is a whitelist.
     */
    IsRemoteIPFilterBlacklist?: boolean;
    ImageExtractionTimeoutMs?: number;
    PathSubstitutions?: Array<PathSubstitution> | null;
    UninstalledPlugins?: Array<string> | null;
    /**
     * Gets or sets a value indicating whether slow server responses should be logged as a warning.
     */
    EnableSlowResponseWarning?: boolean;
    /**
     * Gets or sets the threshold for the slow response time warning in ms.
     */
    SlowResponseThresholdMs?: number;
    /**
     * Gets or sets the cors hosts.
     */
    CorsHosts?: Array<string> | null;
    /**
     * Gets or sets the known proxies.
     */
    KnownProxies?: Array<string> | null;
    /**
     * Gets or sets the number of days we should retain activity logs.
     */
    ActivityLogRetentionDays?: number | null;
    /**
     * Gets or sets the how the library scan fans out.
     */
    LibraryScanFanoutConcurrency?: number;
    /**
     * Gets or sets the how many metadata refreshes can run concurrently.
     */
    LibraryMetadataRefreshConcurrency?: number;
    /**
     * Gets or sets a value indicating whether older plugins should automatically be deleted from the plugin folder.
     */
    RemoveOldPlugins?: boolean;
};
