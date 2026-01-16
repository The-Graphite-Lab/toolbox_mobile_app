import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum ComplexityTier {
  T1 = "T1",
  T2 = "T2",
  T3 = "T3",
  T4 = "T4",
  T5 = "T5"
}

export enum ActiveStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum ResponseEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED"
}

export enum CostMetricType {
  FLAT_RATE = "FLAT_RATE",
  PER_EXECUTION = "PER_EXECUTION",
  OTHER = "OTHER"
}

export enum DashboardType {
  STANDARD = "STANDARD",
  WEBPAGE = "WEBPAGE"
}

export enum RivetTransactionType {
  MONTHLY_ALLOWANCE = "MONTHLY_ALLOWANCE",
  TEMPLATED_ASSEMBLY = "TEMPLATED_ASSEMBLY",
  CUSTOM_ASSEMBLY = "CUSTOM_ASSEMBLY",
  TOOL_USAGE = "TOOL_USAGE",
  ADJUSTMENT = "ADJUSTMENT",
  RIVET_PURCHASE = "RIVET_PURCHASE"
}

export enum RivetReferenceType {
  TEMPLATED_ASSEMBLY = "TEMPLATED_ASSEMBLY",
  CLIENT_ASSEMBLY = "CLIENT_ASSEMBLY",
  USAGE_PACK = "USAGE_PACK",
  TOOL_USAGE = "TOOL_USAGE"
}

export enum PremiumBillingType {
  PER_USAGE = "PER_USAGE",
  SESSION_BLOCKS = "SESSION_BLOCKS"
}

export enum ClientAssemblyStatus {
  REQUESTED = "REQUESTED",
  LIVE = "LIVE",
  REJECTED = "REJECTED"
}

export enum ClientType {
  LEAD = "LEAD",
  CLIENT = "CLIENT",
  PARTNER = "PARTNER",
  PROSPECT = "PROSPECT"
}

type EagerUsagePlanStructure = {
  readonly unitsPerPack?: number | null;
  readonly rivetsPerPack?: number | null;
}

type LazyUsagePlanStructure = {
  readonly unitsPerPack?: number | null;
  readonly rivetsPerPack?: number | null;
}

export declare type UsagePlanStructure = LazyLoading extends LazyLoadingDisabled ? EagerUsagePlanStructure : LazyUsagePlanStructure

export declare const UsagePlanStructure: (new (init: ModelInit<UsagePlanStructure>) => UsagePlanStructure)

type EagerUsers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Users, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly name?: string | null;
  readonly phone?: string | null;
  readonly type?: string | null;
  readonly hasAgreedToTerms?: boolean | null;
  readonly status?: string | null;
  readonly profilePic?: string | null;
  readonly membershipType?: string | null;
  readonly notificationSettings?: string | null;
  readonly permissions?: string | null;
  readonly onboardingDone?: boolean | null;
  readonly onboardingResponses?: string | null;
  readonly proxyUserID?: string | null;
  readonly proxyClientID?: string | null;
  readonly ClientID?: string | null;
  readonly Projects?: (UserProjects | null)[] | null;
  readonly AssignedClients?: (UserClients | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUsers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Users, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly name?: string | null;
  readonly phone?: string | null;
  readonly type?: string | null;
  readonly hasAgreedToTerms?: boolean | null;
  readonly status?: string | null;
  readonly profilePic?: string | null;
  readonly membershipType?: string | null;
  readonly notificationSettings?: string | null;
  readonly permissions?: string | null;
  readonly onboardingDone?: boolean | null;
  readonly onboardingResponses?: string | null;
  readonly proxyUserID?: string | null;
  readonly proxyClientID?: string | null;
  readonly ClientID?: string | null;
  readonly Projects: AsyncCollection<UserProjects>;
  readonly AssignedClients: AsyncCollection<UserClients>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Users = LazyLoading extends LazyLoadingDisabled ? EagerUsers : LazyUsers

export declare const Users: (new (init: ModelInit<Users>) => Users) & {
  copyOf(source: Users, mutator: (draft: MutableModel<Users>) => MutableModel<Users> | void): Users;
}

type EagerApps = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Apps, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly url?: string | null;
  readonly authType?: string | null;
  readonly type?: string | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyApps = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Apps, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly url?: string | null;
  readonly authType?: string | null;
  readonly type?: string | null;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Apps = LazyLoading extends LazyLoadingDisabled ? EagerApps : LazyApps

export declare const Apps: (new (init: ModelInit<Apps>) => Apps) & {
  copyOf(source: Apps, mutator: (draft: MutableModel<Apps>) => MutableModel<Apps> | void): Apps;
}

type EagerIngestionTasks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IngestionTasks, 'id'>;
  };
  readonly id: string;
  readonly bundle?: string | null;
  readonly taskType?: string | null;
  readonly entityType?: string | null;
  readonly status?: string | null;
  readonly status_updatedAt?: string | null;
  readonly errorType?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly AppID: string;
  readonly ConnectionID: string;
  readonly ClientID: string;
  readonly AppID_ClientID_ConnectionID_EntityType?: string | null;
}

type LazyIngestionTasks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IngestionTasks, 'id'>;
  };
  readonly id: string;
  readonly bundle?: string | null;
  readonly taskType?: string | null;
  readonly entityType?: string | null;
  readonly status?: string | null;
  readonly status_updatedAt?: string | null;
  readonly errorType?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly AppID: string;
  readonly ConnectionID: string;
  readonly ClientID: string;
  readonly AppID_ClientID_ConnectionID_EntityType?: string | null;
}

export declare type IngestionTasks = LazyLoading extends LazyLoadingDisabled ? EagerIngestionTasks : LazyIngestionTasks

export declare const IngestionTasks: (new (init: ModelInit<IngestionTasks>) => IngestionTasks) & {
  copyOf(source: IngestionTasks, mutator: (draft: MutableModel<IngestionTasks>) => MutableModel<IngestionTasks> | void): IngestionTasks;
}

type EagerIngestionTaskErrorHandlers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IngestionTaskErrorHandlers, 'id'>;
  };
  readonly id: string;
  readonly status?: string | null;
  readonly errorType?: string | null;
  readonly status_updatedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly ClientID: string;
  readonly AppID: string;
  readonly ConnectionID: string;
}

type LazyIngestionTaskErrorHandlers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IngestionTaskErrorHandlers, 'id'>;
  };
  readonly id: string;
  readonly status?: string | null;
  readonly errorType?: string | null;
  readonly status_updatedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly ClientID: string;
  readonly AppID: string;
  readonly ConnectionID: string;
}

export declare type IngestionTaskErrorHandlers = LazyLoading extends LazyLoadingDisabled ? EagerIngestionTaskErrorHandlers : LazyIngestionTaskErrorHandlers

export declare const IngestionTaskErrorHandlers: (new (init: ModelInit<IngestionTaskErrorHandlers>) => IngestionTaskErrorHandlers) & {
  copyOf(source: IngestionTaskErrorHandlers, mutator: (draft: MutableModel<IngestionTaskErrorHandlers>) => MutableModel<IngestionTaskErrorHandlers> | void): IngestionTaskErrorHandlers;
}

type EagerConnections = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Connections, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly appName: string;
  readonly status?: string | null;
  readonly ClientID: string;
  readonly AppID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyConnections = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Connections, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly appName: string;
  readonly status?: string | null;
  readonly ClientID: string;
  readonly AppID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Connections = LazyLoading extends LazyLoadingDisabled ? EagerConnections : LazyConnections

export declare const Connections: (new (init: ModelInit<Connections>) => Connections) & {
  copyOf(source: Connections, mutator: (draft: MutableModel<Connections>) => MutableModel<Connections> | void): Connections;
}

type EagerMasterPermissions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MasterPermissions, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly permissions?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMasterPermissions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MasterPermissions, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly permissions?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MasterPermissions = LazyLoading extends LazyLoadingDisabled ? EagerMasterPermissions : LazyMasterPermissions

export declare const MasterPermissions: (new (init: ModelInit<MasterPermissions>) => MasterPermissions) & {
  copyOf(source: MasterPermissions, mutator: (draft: MutableModel<MasterPermissions>) => MutableModel<MasterPermissions> | void): MasterPermissions;
}

type EagerClients = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Clients, 'id'>;
  };
  readonly id: string;
  readonly uniqueIdentifier?: string | null;
  readonly name: string;
  readonly lowercaseName?: string | null;
  readonly employeeRange?: string | null;
  readonly industries?: (string | null)[] | null;
  readonly csm?: string | null;
  readonly street1?: string | null;
  readonly street2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zip?: string | null;
  readonly country?: string | null;
  readonly latitude?: string | null;
  readonly longitude?: string | null;
  readonly annualRevenue?: number | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly website?: string | null;
  readonly logo?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly software?: (string | null)[] | null;
  readonly membership?: string | null;
  readonly membershipStartDate?: string | null;
  readonly primaryColor?: string | null;
  readonly secondaryColor?: string | null;
  readonly StripeCustomerID?: string | null;
  readonly TwilioSubUserID?: string | null;
  readonly SendGridSubUserID?: string | null;
  readonly SendGridIntegrationVersion?: number | null;
  readonly MembershipID?: string | null;
  readonly HarvestClientID?: string | null;
  readonly onboardingDone?: boolean | null;
  readonly accountType?: string | null;
  readonly isLead?: string | null;
  readonly ParentClientID?: string | null;
  readonly rivetBalance?: number | null;
  readonly rivetBalanceUpdatedAt?: string | null;
  readonly onRivetsModel?: boolean | null;
  readonly clientType?: ClientType | keyof typeof ClientType | null;
  readonly AssignedUsers?: (UserClients | null)[] | null;
}

type LazyClients = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Clients, 'id'>;
  };
  readonly id: string;
  readonly uniqueIdentifier?: string | null;
  readonly name: string;
  readonly lowercaseName?: string | null;
  readonly employeeRange?: string | null;
  readonly industries?: (string | null)[] | null;
  readonly csm?: string | null;
  readonly street1?: string | null;
  readonly street2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zip?: string | null;
  readonly country?: string | null;
  readonly latitude?: string | null;
  readonly longitude?: string | null;
  readonly annualRevenue?: number | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly website?: string | null;
  readonly logo?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly software?: (string | null)[] | null;
  readonly membership?: string | null;
  readonly membershipStartDate?: string | null;
  readonly primaryColor?: string | null;
  readonly secondaryColor?: string | null;
  readonly StripeCustomerID?: string | null;
  readonly TwilioSubUserID?: string | null;
  readonly SendGridSubUserID?: string | null;
  readonly SendGridIntegrationVersion?: number | null;
  readonly MembershipID?: string | null;
  readonly HarvestClientID?: string | null;
  readonly onboardingDone?: boolean | null;
  readonly accountType?: string | null;
  readonly isLead?: string | null;
  readonly ParentClientID?: string | null;
  readonly rivetBalance?: number | null;
  readonly rivetBalanceUpdatedAt?: string | null;
  readonly onRivetsModel?: boolean | null;
  readonly clientType?: ClientType | keyof typeof ClientType | null;
  readonly AssignedUsers: AsyncCollection<UserClients>;
}

export declare type Clients = LazyLoading extends LazyLoadingDisabled ? EagerClients : LazyClients

export declare const Clients: (new (init: ModelInit<Clients>) => Clients) & {
  copyOf(source: Clients, mutator: (draft: MutableModel<Clients>) => MutableModel<Clients> | void): Clients;
}

type EagerClientContactMethods = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactMethods, 'id'>;
  };
  readonly id: string;
  readonly value: string;
  readonly type: string;
  readonly ClientID: string;
  readonly verified?: string | null;
  readonly verificationMethod?: string | null;
  readonly verifiedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientContactMethods = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactMethods, 'id'>;
  };
  readonly id: string;
  readonly value: string;
  readonly type: string;
  readonly ClientID: string;
  readonly verified?: string | null;
  readonly verificationMethod?: string | null;
  readonly verifiedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientContactMethods = LazyLoading extends LazyLoadingDisabled ? EagerClientContactMethods : LazyClientContactMethods

export declare const ClientContactMethods: (new (init: ModelInit<ClientContactMethods>) => ClientContactMethods) & {
  copyOf(source: ClientContactMethods, mutator: (draft: MutableModel<ClientContactMethods>) => MutableModel<ClientContactMethods> | void): ClientContactMethods;
}

type EagerClientAddresses = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientAddresses, 'id'>;
  };
  readonly id: string;
  readonly street1?: string | null;
  readonly street2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zip?: string | null;
  readonly country?: string | null;
  readonly latitude?: string | null;
  readonly longitude?: string | null;
  readonly type?: string | null;
  readonly ClientID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientAddresses = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientAddresses, 'id'>;
  };
  readonly id: string;
  readonly street1?: string | null;
  readonly street2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zip?: string | null;
  readonly country?: string | null;
  readonly latitude?: string | null;
  readonly longitude?: string | null;
  readonly type?: string | null;
  readonly ClientID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientAddresses = LazyLoading extends LazyLoadingDisabled ? EagerClientAddresses : LazyClientAddresses

export declare const ClientAddresses: (new (init: ModelInit<ClientAddresses>) => ClientAddresses) & {
  copyOf(source: ClientAddresses, mutator: (draft: MutableModel<ClientAddresses>) => MutableModel<ClientAddresses> | void): ClientAddresses;
}

type EagerClientContactActivityEvents = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactActivityEvents, 'id'>;
  };
  readonly id: string;
  readonly ClientContactID: string;
  readonly ActivityTypeID: string;
  readonly description?: string | null;
  readonly links?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientContactActivityEvents = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactActivityEvents, 'id'>;
  };
  readonly id: string;
  readonly ClientContactID: string;
  readonly ActivityTypeID: string;
  readonly description?: string | null;
  readonly links?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientContactActivityEvents = LazyLoading extends LazyLoadingDisabled ? EagerClientContactActivityEvents : LazyClientContactActivityEvents

export declare const ClientContactActivityEvents: (new (init: ModelInit<ClientContactActivityEvents>) => ClientContactActivityEvents) & {
  copyOf(source: ClientContactActivityEvents, mutator: (draft: MutableModel<ClientContactActivityEvents>) => MutableModel<ClientContactActivityEvents> | void): ClientContactActivityEvents;
}

type EagerClientContactActivityTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactActivityTypes, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientContactActivityTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactActivityTypes, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientContactActivityTypes = LazyLoading extends LazyLoadingDisabled ? EagerClientContactActivityTypes : LazyClientContactActivityTypes

export declare const ClientContactActivityTypes: (new (init: ModelInit<ClientContactActivityTypes>) => ClientContactActivityTypes) & {
  copyOf(source: ClientContactActivityTypes, mutator: (draft: MutableModel<ClientContactActivityTypes>) => MutableModel<ClientContactActivityTypes> | void): ClientContactActivityTypes;
}

type EagerClientContacts = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContacts, 'id'>;
  };
  readonly id: string;
  readonly ClientID: string;
  readonly name: string;
  readonly memo?: string | null;
  readonly occupation?: string | null;
  readonly birthday?: string | null;
  readonly anniversary?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly TypeID?: string | null;
}

type LazyClientContacts = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContacts, 'id'>;
  };
  readonly id: string;
  readonly ClientID: string;
  readonly name: string;
  readonly memo?: string | null;
  readonly occupation?: string | null;
  readonly birthday?: string | null;
  readonly anniversary?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly TypeID?: string | null;
}

export declare type ClientContacts = LazyLoading extends LazyLoadingDisabled ? EagerClientContacts : LazyClientContacts

export declare const ClientContacts: (new (init: ModelInit<ClientContacts>) => ClientContacts) & {
  copyOf(source: ClientContacts, mutator: (draft: MutableModel<ClientContacts>) => MutableModel<ClientContacts> | void): ClientContacts;
}

type EagerClientContactTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactTypes, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly instructions?: string | null;
  readonly ClientID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientContactTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientContactTypes, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly instructions?: string | null;
  readonly ClientID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientContactTypes = LazyLoading extends LazyLoadingDisabled ? EagerClientContactTypes : LazyClientContactTypes

export declare const ClientContactTypes: (new (init: ModelInit<ClientContactTypes>) => ClientContactTypes) & {
  copyOf(source: ClientContactTypes, mutator: (draft: MutableModel<ClientContactTypes>) => MutableModel<ClientContactTypes> | void): ClientContactTypes;
}

type EagerClientEmailTemplates = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientEmailTemplates, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly ClientID: string;
  readonly description?: string | null;
  readonly mergeTags?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientEmailTemplates = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientEmailTemplates, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly ClientID: string;
  readonly description?: string | null;
  readonly mergeTags?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientEmailTemplates = LazyLoading extends LazyLoadingDisabled ? EagerClientEmailTemplates : LazyClientEmailTemplates

export declare const ClientEmailTemplates: (new (init: ModelInit<ClientEmailTemplates>) => ClientEmailTemplates) & {
  copyOf(source: ClientEmailTemplates, mutator: (draft: MutableModel<ClientEmailTemplates>) => MutableModel<ClientEmailTemplates> | void): ClientEmailTemplates;
}

type EagerClientTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly clientName?: string | null;
  readonly toolName?: string | null;
  readonly enabled?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly clientName?: string | null;
  readonly toolName?: string | null;
  readonly enabled?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientTools = LazyLoading extends LazyLoadingDisabled ? EagerClientTools : LazyClientTools

export declare const ClientTools: (new (init: ModelInit<ClientTools>) => ClientTools) & {
  copyOf(source: ClientTools, mutator: (draft: MutableModel<ClientTools>) => MutableModel<ClientTools> | void): ClientTools;
}

type EagerClientGroups = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientGroups, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly type?: string | null;
  readonly typeID?: string | null;
  readonly typeTypeID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly options?: string | null;
  readonly enabled?: boolean | null;
  readonly ClientID: string;
}

type LazyClientGroups = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientGroups, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly type?: string | null;
  readonly typeID?: string | null;
  readonly typeTypeID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly options?: string | null;
  readonly enabled?: boolean | null;
  readonly ClientID: string;
}

export declare type ClientGroups = LazyLoading extends LazyLoadingDisabled ? EagerClientGroups : LazyClientGroups

export declare const ClientGroups: (new (init: ModelInit<ClientGroups>) => ClientGroups) & {
  copyOf(source: ClientGroups, mutator: (draft: MutableModel<ClientGroups>) => MutableModel<ClientGroups> | void): ClientGroups;
}

type EagerClientGroupAssignments = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientGroupAssignments, 'id'>;
  };
  readonly id: string;
  readonly ClientGroupID: string;
  readonly EntityID: string;
  readonly EntityType: string;
  readonly EntitySubType?: string | null;
  readonly EntityTypeSubType: string;
  readonly EntityIDTypeSubType: string;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientGroupAssignments = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientGroupAssignments, 'id'>;
  };
  readonly id: string;
  readonly ClientGroupID: string;
  readonly EntityID: string;
  readonly EntityType: string;
  readonly EntitySubType?: string | null;
  readonly EntityTypeSubType: string;
  readonly EntityIDTypeSubType: string;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientGroupAssignments = LazyLoading extends LazyLoadingDisabled ? EagerClientGroupAssignments : LazyClientGroupAssignments

export declare const ClientGroupAssignments: (new (init: ModelInit<ClientGroupAssignments>) => ClientGroupAssignments) & {
  copyOf(source: ClientGroupAssignments, mutator: (draft: MutableModel<ClientGroupAssignments>) => MutableModel<ClientGroupAssignments> | void): ClientGroupAssignments;
}

type EagerDataSources = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DataSources, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly ClientID: string;
  readonly source?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly createdBy?: string | null;
  readonly description?: string | null;
  readonly fields?: string | null;
  readonly path?: string | null;
}

type LazyDataSources = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DataSources, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly ClientID: string;
  readonly source?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly createdBy?: string | null;
  readonly description?: string | null;
  readonly fields?: string | null;
  readonly path?: string | null;
}

export declare type DataSources = LazyLoading extends LazyLoadingDisabled ? EagerDataSources : LazyDataSources

export declare const DataSources: (new (init: ModelInit<DataSources>) => DataSources) & {
  copyOf(source: DataSources, mutator: (draft: MutableModel<DataSources>) => MutableModel<DataSources> | void): DataSources;
}

type EagerInterfaces = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Interfaces, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly componentType?: string | null;
  readonly requiredFields?: string | null;
  readonly availableFields?: string | null;
  readonly actions?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInterfaces = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Interfaces, 'id'>;
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly componentType?: string | null;
  readonly requiredFields?: string | null;
  readonly availableFields?: string | null;
  readonly actions?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Interfaces = LazyLoading extends LazyLoadingDisabled ? EagerInterfaces : LazyInterfaces

export declare const Interfaces: (new (init: ModelInit<Interfaces>) => Interfaces) & {
  copyOf(source: Interfaces, mutator: (draft: MutableModel<Interfaces>) => MutableModel<Interfaces> | void): Interfaces;
}

type EagerInterfaceInstances = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<InterfaceInstances, 'id'>;
  };
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly metadata?: string | null;
  readonly InterfaceID: string;
  readonly ClientID: string;
  readonly DataSource?: string | null;
  readonly OutputDataSourceID: string;
  readonly ClientGroupID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInterfaceInstances = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<InterfaceInstances, 'id'>;
  };
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly metadata?: string | null;
  readonly InterfaceID: string;
  readonly ClientID: string;
  readonly DataSource?: string | null;
  readonly OutputDataSourceID: string;
  readonly ClientGroupID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type InterfaceInstances = LazyLoading extends LazyLoadingDisabled ? EagerInterfaceInstances : LazyInterfaceInstances

export declare const InterfaceInstances: (new (init: ModelInit<InterfaceInstances>) => InterfaceInstances) & {
  copyOf(source: InterfaceInstances, mutator: (draft: MutableModel<InterfaceInstances>) => MutableModel<InterfaceInstances> | void): InterfaceInstances;
}

type EagerSoftwares = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Softwares, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly logo?: string | null;
  readonly identifiers?: (SoftwareIdentifier | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySoftwares = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Softwares, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly logo?: string | null;
  readonly identifiers: AsyncCollection<SoftwareIdentifier>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Softwares = LazyLoading extends LazyLoadingDisabled ? EagerSoftwares : LazySoftwares

export declare const Softwares: (new (init: ModelInit<Softwares>) => Softwares) & {
  copyOf(source: Softwares, mutator: (draft: MutableModel<Softwares>) => MutableModel<Softwares> | void): Softwares;
}

type EagerClientSoftwares = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientSoftwares, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly SoftwareID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientSoftwares = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientSoftwares, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly SoftwareID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientSoftwares = LazyLoading extends LazyLoadingDisabled ? EagerClientSoftwares : LazyClientSoftwares

export declare const ClientSoftwares: (new (init: ModelInit<ClientSoftwares>) => ClientSoftwares) & {
  copyOf(source: ClientSoftwares, mutator: (draft: MutableModel<ClientSoftwares>) => MutableModel<ClientSoftwares> | void): ClientSoftwares;
}

type EagerUsage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Usage, 'id'>;
  };
  readonly id: string;
  readonly ClientID?: string | null;
  readonly ToolID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly metadata?: string | null;
  readonly units?: number | null;
}

type LazyUsage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Usage, 'id'>;
  };
  readonly id: string;
  readonly ClientID?: string | null;
  readonly ToolID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly metadata?: string | null;
  readonly units?: number | null;
}

export declare type Usage = LazyLoading extends LazyLoadingDisabled ? EagerUsage : LazyUsage

export declare const Usage: (new (init: ModelInit<Usage>) => Usage) & {
  copyOf(source: Usage, mutator: (draft: MutableModel<Usage>) => MutableModel<Usage> | void): Usage;
}

type EagerTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Tools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly uniqueIdentifier?: string | null;
  readonly name: string;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly s3Icon?: string | null;
  readonly isZapierTool?: boolean | null;
  readonly hasUI?: boolean | null;
  readonly hasAPI?: boolean | null;
  readonly alecartePrice?: number | null;
  readonly alecartePeriod?: string | null;
  readonly pricePerExecution?: number | null;
  readonly landingPageURL?: string | null;
  readonly costMetricType?: CostMetricType | keyof typeof CostMetricType | null;
  readonly costValue?: number | null;
  readonly costPeriod?: string | null;
  readonly permissions?: string | null;
  readonly userOptions?: string | null;
  readonly clientOptions?: string | null;
  readonly isPremium?: boolean | null;
  readonly premiumBillingType?: PremiumBillingType | keyof typeof PremiumBillingType | null;
  readonly usagePlanStructure?: UsagePlanStructure | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Tools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly uniqueIdentifier?: string | null;
  readonly name: string;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly s3Icon?: string | null;
  readonly isZapierTool?: boolean | null;
  readonly hasUI?: boolean | null;
  readonly hasAPI?: boolean | null;
  readonly alecartePrice?: number | null;
  readonly alecartePeriod?: string | null;
  readonly pricePerExecution?: number | null;
  readonly landingPageURL?: string | null;
  readonly costMetricType?: CostMetricType | keyof typeof CostMetricType | null;
  readonly costValue?: number | null;
  readonly costPeriod?: string | null;
  readonly permissions?: string | null;
  readonly userOptions?: string | null;
  readonly clientOptions?: string | null;
  readonly isPremium?: boolean | null;
  readonly premiumBillingType?: PremiumBillingType | keyof typeof PremiumBillingType | null;
  readonly usagePlanStructure?: UsagePlanStructure | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Tools = LazyLoading extends LazyLoadingDisabled ? EagerTools : LazyTools

export declare const Tools: (new (init: ModelInit<Tools>) => Tools) & {
  copyOf(source: Tools, mutator: (draft: MutableModel<Tools>) => MutableModel<Tools> | void): Tools;
}

type EagerMembershipTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MembershipTypes, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly price?: number | null;
  readonly period?: string | null;
  readonly toolDiscount?: number | null;
  readonly features?: string | null;
  readonly StripeProductID?: string | null;
  readonly StripePriceObjectID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMembershipTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MembershipTypes, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly price?: number | null;
  readonly period?: string | null;
  readonly toolDiscount?: number | null;
  readonly features?: string | null;
  readonly StripeProductID?: string | null;
  readonly StripePriceObjectID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MembershipTypes = LazyLoading extends LazyLoadingDisabled ? EagerMembershipTypes : LazyMembershipTypes

export declare const MembershipTypes: (new (init: ModelInit<MembershipTypes>) => MembershipTypes) & {
  copyOf(source: MembershipTypes, mutator: (draft: MutableModel<MembershipTypes>) => MutableModel<MembershipTypes> | void): MembershipTypes;
}

type EagerMemberships = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Memberships, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MembershipTypeID: string;
  readonly ClientID: string;
  readonly StripeSubscriptionID?: string | null;
  readonly StripeSubscriptionItemID?: string | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly status?: string | null;
  readonly toolDiscount?: number | null;
  readonly price?: number | null;
  readonly period?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMemberships = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Memberships, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MembershipTypeID: string;
  readonly ClientID: string;
  readonly StripeSubscriptionID?: string | null;
  readonly StripeSubscriptionItemID?: string | null;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly status?: string | null;
  readonly toolDiscount?: number | null;
  readonly price?: number | null;
  readonly period?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Memberships = LazyLoading extends LazyLoadingDisabled ? EagerMemberships : LazyMemberships

export declare const Memberships: (new (init: ModelInit<Memberships>) => Memberships) & {
  copyOf(source: Memberships, mutator: (draft: MutableModel<Memberships>) => MutableModel<Memberships> | void): Memberships;
}

type EagerMembershipTypeTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MembershipTypeTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MembershipTypeID: string;
  readonly ToolID: string;
  readonly overrideAlecartePrice?: boolean | null;
  readonly alecartePrice?: number | null;
  readonly overridePricePerExecution?: boolean | null;
  readonly pricePerExecution?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMembershipTypeTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MembershipTypeTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MembershipTypeID: string;
  readonly ToolID: string;
  readonly overrideAlecartePrice?: boolean | null;
  readonly alecartePrice?: number | null;
  readonly overridePricePerExecution?: boolean | null;
  readonly pricePerExecution?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MembershipTypeTools = LazyLoading extends LazyLoadingDisabled ? EagerMembershipTypeTools : LazyMembershipTypeTools

export declare const MembershipTypeTools: (new (init: ModelInit<MembershipTypeTools>) => MembershipTypeTools) & {
  copyOf(source: MembershipTypeTools, mutator: (draft: MutableModel<MembershipTypeTools>) => MutableModel<MembershipTypeTools> | void): MembershipTypeTools;
}

type EagerMembershipTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MembershipTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MembershipID: string;
  readonly ToolID: string;
  readonly StripeSubscriptionItemID?: string | null;
  readonly overrideAlecartePrice?: boolean | null;
  readonly alecartePrice?: number | null;
  readonly overridePricePerExecution?: boolean | null;
  readonly pricePerExecution?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMembershipTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MembershipTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MembershipID: string;
  readonly ToolID: string;
  readonly StripeSubscriptionItemID?: string | null;
  readonly overrideAlecartePrice?: boolean | null;
  readonly alecartePrice?: number | null;
  readonly overridePricePerExecution?: boolean | null;
  readonly pricePerExecution?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MembershipTools = LazyLoading extends LazyLoadingDisabled ? EagerMembershipTools : LazyMembershipTools

export declare const MembershipTools: (new (init: ModelInit<MembershipTools>) => MembershipTools) & {
  copyOf(source: MembershipTools, mutator: (draft: MutableModel<MembershipTools>) => MutableModel<MembershipTools> | void): MembershipTools;
}

type EagerToolSubscriptions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolSubscriptions, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly ToolID: string;
  readonly ClientID: string;
  readonly StripeSubscriptionID?: string | null;
  readonly StripeSubscriptionItemID?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyToolSubscriptions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolSubscriptions, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly ToolID: string;
  readonly ClientID: string;
  readonly StripeSubscriptionID?: string | null;
  readonly StripeSubscriptionItemID?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ToolSubscriptions = LazyLoading extends LazyLoadingDisabled ? EagerToolSubscriptions : LazyToolSubscriptions

export declare const ToolSubscriptions: (new (init: ModelInit<ToolSubscriptions>) => ToolSubscriptions) & {
  copyOf(source: ToolSubscriptions, mutator: (draft: MutableModel<ToolSubscriptions>) => MutableModel<ToolSubscriptions> | void): ToolSubscriptions;
}

type EagerActivity = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Activity, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly title: string;
  readonly details?: string | null;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly typeCreatedAt?: string | null;
  readonly referenceNumber?: string | null;
  readonly ToolID?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly ProjectID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyActivity = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Activity, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly title: string;
  readonly details?: string | null;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly typeCreatedAt?: string | null;
  readonly referenceNumber?: string | null;
  readonly ToolID?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly ProjectID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Activity = LazyLoading extends LazyLoadingDisabled ? EagerActivity : LazyActivity

export declare const Activity: (new (init: ModelInit<Activity>) => Activity) & {
  copyOf(source: Activity, mutator: (draft: MutableModel<Activity>) => MutableModel<Activity> | void): Activity;
}

type EagerMessages = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Messages, 'id'>;
  };
  readonly id: string;
  readonly message: string;
  readonly direction?: string | null;
  readonly from?: string | null;
  readonly to?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly externalID?: string | null;
  readonly ThreadID?: string | null;
  readonly ToUserID?: string | null;
  readonly FromUserID?: string | null;
  readonly ProjectID?: string | null;
  readonly ClientID?: string | null;
}

type LazyMessages = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Messages, 'id'>;
  };
  readonly id: string;
  readonly message: string;
  readonly direction?: string | null;
  readonly from?: string | null;
  readonly to?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly externalID?: string | null;
  readonly ThreadID?: string | null;
  readonly ToUserID?: string | null;
  readonly FromUserID?: string | null;
  readonly ProjectID?: string | null;
  readonly ClientID?: string | null;
}

export declare type Messages = LazyLoading extends LazyLoadingDisabled ? EagerMessages : LazyMessages

export declare const Messages: (new (init: ModelInit<Messages>) => Messages) & {
  copyOf(source: Messages, mutator: (draft: MutableModel<Messages>) => MutableModel<Messages> | void): Messages;
}

type EagerMessageThreads = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MessageThreads, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMessageThreads = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MessageThreads, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MessageThreads = LazyLoading extends LazyLoadingDisabled ? EagerMessageThreads : LazyMessageThreads

export declare const MessageThreads: (new (init: ModelInit<MessageThreads>) => MessageThreads) & {
  copyOf(source: MessageThreads, mutator: (draft: MutableModel<MessageThreads>) => MutableModel<MessageThreads> | void): MessageThreads;
}

type EagerMessageThreadUsers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MessageThreadUsers, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MessageThreadID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMessageThreadUsers = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MessageThreadUsers, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MessageThreadID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MessageThreadUsers = LazyLoading extends LazyLoadingDisabled ? EagerMessageThreadUsers : LazyMessageThreadUsers

export declare const MessageThreadUsers: (new (init: ModelInit<MessageThreadUsers>) => MessageThreadUsers) & {
  copyOf(source: MessageThreadUsers, mutator: (draft: MutableModel<MessageThreadUsers>) => MutableModel<MessageThreadUsers> | void): MessageThreadUsers;
}

type EagerInformationRequests = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<InformationRequests, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly title: string;
  readonly summary?: string | null;
  readonly status?: string | null;
  readonly fields?: string | null;
  readonly responses?: string | null;
  readonly requestedById?: string | null;
  readonly requestedOn?: string | null;
  readonly dueDate?: string | null;
  readonly recipients?: (string | null)[] | null;
  readonly ClientID?: string | null;
  readonly ProjectID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyInformationRequests = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<InformationRequests, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly title: string;
  readonly summary?: string | null;
  readonly status?: string | null;
  readonly fields?: string | null;
  readonly responses?: string | null;
  readonly requestedById?: string | null;
  readonly requestedOn?: string | null;
  readonly dueDate?: string | null;
  readonly recipients?: (string | null)[] | null;
  readonly ClientID?: string | null;
  readonly ProjectID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type InformationRequests = LazyLoading extends LazyLoadingDisabled ? EagerInformationRequests : LazyInformationRequests

export declare const InformationRequests: (new (init: ModelInit<InformationRequests>) => InformationRequests) & {
  copyOf(source: InformationRequests, mutator: (draft: MutableModel<InformationRequests>) => MutableModel<InformationRequests> | void): InformationRequests;
}

type EagerClientMeeting = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientMeeting, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MeetingOrganizer?: string | null;
  readonly status?: string | null;
  readonly sendAgenda?: string | null;
  readonly dateTime?: string | null;
  readonly attendees?: (string | null)[] | null;
  readonly meetingLocation?: string | null;
  readonly recording?: string | null;
  readonly summary?: string | null;
  readonly agenda?: string | null;
  readonly keyDiscussionPoints?: (string | null)[] | null;
  readonly decisionsMade?: (string | null)[] | null;
  readonly actionItems?: (string | null)[] | null;
  readonly customerActionItems?: (string | null)[] | null;
  readonly customerFeedbackAndConcerns?: (string | null)[] | null;
  readonly internalObservations?: (string | null)[] | null;
  readonly customerSentiment?: number | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientMeeting = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientMeeting, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly MeetingOrganizer?: string | null;
  readonly status?: string | null;
  readonly sendAgenda?: string | null;
  readonly dateTime?: string | null;
  readonly attendees?: (string | null)[] | null;
  readonly meetingLocation?: string | null;
  readonly recording?: string | null;
  readonly summary?: string | null;
  readonly agenda?: string | null;
  readonly keyDiscussionPoints?: (string | null)[] | null;
  readonly decisionsMade?: (string | null)[] | null;
  readonly actionItems?: (string | null)[] | null;
  readonly customerActionItems?: (string | null)[] | null;
  readonly customerFeedbackAndConcerns?: (string | null)[] | null;
  readonly internalObservations?: (string | null)[] | null;
  readonly customerSentiment?: number | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientMeeting = LazyLoading extends LazyLoadingDisabled ? EagerClientMeeting : LazyClientMeeting

export declare const ClientMeeting: (new (init: ModelInit<ClientMeeting>) => ClientMeeting) & {
  copyOf(source: ClientMeeting, mutator: (draft: MutableModel<ClientMeeting>) => MutableModel<ClientMeeting> | void): ClientMeeting;
}

type EagerProductCatelogs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ProductCatelogs, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly importType?: string | null;
  readonly Products?: (Products | null)[] | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProductCatelogs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ProductCatelogs, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly importType?: string | null;
  readonly Products: AsyncCollection<Products>;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ProductCatelogs = LazyLoading extends LazyLoadingDisabled ? EagerProductCatelogs : LazyProductCatelogs

export declare const ProductCatelogs: (new (init: ModelInit<ProductCatelogs>) => ProductCatelogs) & {
  copyOf(source: ProductCatelogs, mutator: (draft: MutableModel<ProductCatelogs>) => MutableModel<ProductCatelogs> | void): ProductCatelogs;
}

type EagerProducts = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Products, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly descriptionKey: string;
  readonly values?: string | null;
  readonly ProductCatelogID: string;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProducts = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Products, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly descriptionKey: string;
  readonly values?: string | null;
  readonly ProductCatelogID: string;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Products = LazyLoading extends LazyLoadingDisabled ? EagerProducts : LazyProducts

export declare const Products: (new (init: ModelInit<Products>) => Products) & {
  copyOf(source: Products, mutator: (draft: MutableModel<Products>) => MutableModel<Products> | void): Products;
}

type EagerBlogs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Blogs, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly title: string;
  readonly style?: string | null;
  readonly keywords?: string | null;
  readonly summary?: string | null;
  readonly createdAt?: string | null;
  readonly content?: string | null;
  readonly excerpt?: string | null;
  readonly status: string;
  readonly tags?: (string | null)[] | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyBlogs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Blogs, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly title: string;
  readonly style?: string | null;
  readonly keywords?: string | null;
  readonly summary?: string | null;
  readonly createdAt?: string | null;
  readonly content?: string | null;
  readonly excerpt?: string | null;
  readonly status: string;
  readonly tags?: (string | null)[] | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Blogs = LazyLoading extends LazyLoadingDisabled ? EagerBlogs : LazyBlogs

export declare const Blogs: (new (init: ModelInit<Blogs>) => Blogs) & {
  copyOf(source: Blogs, mutator: (draft: MutableModel<Blogs>) => MutableModel<Blogs> | void): Blogs;
}

type EagerReviews = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Reviews, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly approved?: boolean | null;
  readonly rating?: string | null;
  readonly ratingScale?: string | null;
  readonly responseLength?: string | null;
  readonly reviewer?: string | null;
  readonly createdAt?: string | null;
  readonly approvedAt?: string | null;
  readonly reviewContent: string;
  readonly reviewSource?: string | null;
  readonly status: string;
  readonly content?: string | null;
  readonly externalID?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyReviews = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Reviews, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly approved?: boolean | null;
  readonly rating?: string | null;
  readonly ratingScale?: string | null;
  readonly responseLength?: string | null;
  readonly reviewer?: string | null;
  readonly createdAt?: string | null;
  readonly approvedAt?: string | null;
  readonly reviewContent: string;
  readonly reviewSource?: string | null;
  readonly status: string;
  readonly content?: string | null;
  readonly externalID?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Reviews = LazyLoading extends LazyLoadingDisabled ? EagerReviews : LazyReviews

export declare const Reviews: (new (init: ModelInit<Reviews>) => Reviews) & {
  copyOf(source: Reviews, mutator: (draft: MutableModel<Reviews>) => MutableModel<Reviews> | void): Reviews;
}

type EageropenAiQueue = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<openAiQueue, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly type?: string | null;
  readonly keyToPopulate?: string | null;
  readonly dynamoDBTable?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyopenAiQueue = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<openAiQueue, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly type?: string | null;
  readonly keyToPopulate?: string | null;
  readonly dynamoDBTable?: string | null;
  readonly status?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type openAiQueue = LazyLoading extends LazyLoadingDisabled ? EageropenAiQueue : LazyopenAiQueue

export declare const openAiQueue: (new (init: ModelInit<openAiQueue>) => openAiQueue) & {
  copyOf(source: openAiQueue, mutator: (draft: MutableModel<openAiQueue>) => MutableModel<openAiQueue> | void): openAiQueue;
}

type EagerScriptFields = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ScriptFields, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly display?: string | null;
  readonly type: string;
  readonly viewType?: string | null;
  readonly required?: string | null;
  readonly relevant?: string | null;
  readonly data?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyScriptFields = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ScriptFields, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly display?: string | null;
  readonly type: string;
  readonly viewType?: string | null;
  readonly required?: string | null;
  readonly relevant?: string | null;
  readonly data?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ScriptFields = LazyLoading extends LazyLoadingDisabled ? EagerScriptFields : LazyScriptFields

export declare const ScriptFields: (new (init: ModelInit<ScriptFields>) => ScriptFields) & {
  copyOf(source: ScriptFields, mutator: (draft: MutableModel<ScriptFields>) => MutableModel<ScriptFields> | void): ScriptFields;
}

type EagerScriptStages = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ScriptStages, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly fields?: string | null;
  readonly transitions?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyScriptStages = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ScriptStages, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly question: string;
  readonly fields?: string | null;
  readonly transitions?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ScriptStages = LazyLoading extends LazyLoadingDisabled ? EagerScriptStages : LazyScriptStages

export declare const ScriptStages: (new (init: ModelInit<ScriptStages>) => ScriptStages) & {
  copyOf(source: ScriptStages, mutator: (draft: MutableModel<ScriptStages>) => MutableModel<ScriptStages> | void): ScriptStages;
}

type EagerCallScripts = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<CallScripts, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly stages?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCallScripts = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<CallScripts, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly stages?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type CallScripts = LazyLoading extends LazyLoadingDisabled ? EagerCallScripts : LazyCallScripts

export declare const CallScripts: (new (init: ModelInit<CallScripts>) => CallScripts) & {
  copyOf(source: CallScripts, mutator: (draft: MutableModel<CallScripts>) => MutableModel<CallScripts> | void): CallScripts;
}

type EagerIdentifier = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Identifier, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly label?: string | null;
  readonly SoftwareID?: string | null;
  readonly identifier?: string | null;
  readonly IdentifierTypeID?: string | null;
  readonly SoftwareIdentifierType?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIdentifier = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Identifier, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly label?: string | null;
  readonly SoftwareID?: string | null;
  readonly identifier?: string | null;
  readonly IdentifierTypeID?: string | null;
  readonly SoftwareIdentifierType?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Identifier = LazyLoading extends LazyLoadingDisabled ? EagerIdentifier : LazyIdentifier

export declare const Identifier: (new (init: ModelInit<Identifier>) => Identifier) & {
  copyOf(source: Identifier, mutator: (draft: MutableModel<Identifier>) => MutableModel<Identifier> | void): Identifier;
}

type EagerIdentifierMapping = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IdentifierMapping, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly primaryIdentifierID?: string | null;
  readonly secondaryIdentifierID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIdentifierMapping = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IdentifierMapping, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly primaryIdentifierID?: string | null;
  readonly secondaryIdentifierID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type IdentifierMapping = LazyLoading extends LazyLoadingDisabled ? EagerIdentifierMapping : LazyIdentifierMapping

export declare const IdentifierMapping: (new (init: ModelInit<IdentifierMapping>) => IdentifierMapping) & {
  copyOf(source: IdentifierMapping, mutator: (draft: MutableModel<IdentifierMapping>) => MutableModel<IdentifierMapping> | void): IdentifierMapping;
}

type EagerIdentifierType = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IdentifierType, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly softwares?: (SoftwareIdentifier | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIdentifierType = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IdentifierType, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly softwares: AsyncCollection<SoftwareIdentifier>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type IdentifierType = LazyLoading extends LazyLoadingDisabled ? EagerIdentifierType : LazyIdentifierType

export declare const IdentifierType: (new (init: ModelInit<IdentifierType>) => IdentifierType) & {
  copyOf(source: IdentifierType, mutator: (draft: MutableModel<IdentifierType>) => MutableModel<IdentifierType> | void): IdentifierType;
}

type EagerSoftwareIdentifier = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<SoftwareIdentifier, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly software?: Softwares | null;
  readonly identifierType?: IdentifierType | null;
  readonly softwareId: string;
  readonly identifierTypeId: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazySoftwareIdentifier = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<SoftwareIdentifier, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly software: AsyncItem<Softwares | undefined>;
  readonly identifierType: AsyncItem<IdentifierType | undefined>;
  readonly softwareId: string;
  readonly identifierTypeId: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type SoftwareIdentifier = LazyLoading extends LazyLoadingDisabled ? EagerSoftwareIdentifier : LazySoftwareIdentifier

export declare const SoftwareIdentifier: (new (init: ModelInit<SoftwareIdentifier>) => SoftwareIdentifier) & {
  copyOf(source: SoftwareIdentifier, mutator: (draft: MutableModel<SoftwareIdentifier>) => MutableModel<SoftwareIdentifier> | void): SoftwareIdentifier;
}

type EagerRubriks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Rubriks, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly rubrikText?: string | null;
  readonly category?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyRubriks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Rubriks, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly rubrikText?: string | null;
  readonly category?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Rubriks = LazyLoading extends LazyLoadingDisabled ? EagerRubriks : LazyRubriks

export declare const Rubriks: (new (init: ModelInit<Rubriks>) => Rubriks) & {
  copyOf(source: Rubriks, mutator: (draft: MutableModel<Rubriks>) => MutableModel<Rubriks> | void): Rubriks;
}

type EagerCalls = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Calls, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly externalID?: string | null;
  readonly transcriptID?: string | null;
  readonly transcriptPath?: string | null;
  readonly callName?: string | null;
  readonly agent?: string | null;
  readonly category?: string | null;
  readonly opportunities?: string | null;
  readonly actionItems?: string | null;
  readonly rubrikScore?: string | null;
  readonly summary?: string | null;
  readonly contactDetails?: string | null;
  readonly importantNotes?: string | null;
  readonly source?: string | null;
  readonly wins?: string | null;
  readonly requiresFollowUp?: string | null;
  readonly requiresManagerAttention?: string | null;
  readonly technicianNotes?: string | null;
  readonly duration?: string | null;
  readonly managerMessage?: string | null;
  readonly from?: string | null;
  readonly to?: string | null;
  readonly direction?: string | null;
  readonly isLeadOpportunity?: string | null;
  readonly isBooked?: string | null;
  readonly isUpset?: string | null;
  readonly isCustomerCall?: string | null;
  readonly objections?: string | null;
  readonly recordingURL?: string | null;
  readonly aiPredictedEmployee?: string | null;
  readonly aiPredictionReason?: string | null;
  readonly aiPredictionStatus?: string | null;
  readonly aiPredictionUpdatedAt?: string | null;
  readonly recordingType?: string | null;
  readonly transcriptStatus?: string | null;
  readonly transcript?: string | null;
  readonly sentiment?: string | null;
  readonly createdAt?: string | null;
  readonly EmployeeID?: string | null;
  readonly ClientID?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyCalls = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Calls, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly externalID?: string | null;
  readonly transcriptID?: string | null;
  readonly transcriptPath?: string | null;
  readonly callName?: string | null;
  readonly agent?: string | null;
  readonly category?: string | null;
  readonly opportunities?: string | null;
  readonly actionItems?: string | null;
  readonly rubrikScore?: string | null;
  readonly summary?: string | null;
  readonly contactDetails?: string | null;
  readonly importantNotes?: string | null;
  readonly source?: string | null;
  readonly wins?: string | null;
  readonly requiresFollowUp?: string | null;
  readonly requiresManagerAttention?: string | null;
  readonly technicianNotes?: string | null;
  readonly duration?: string | null;
  readonly managerMessage?: string | null;
  readonly from?: string | null;
  readonly to?: string | null;
  readonly direction?: string | null;
  readonly isLeadOpportunity?: string | null;
  readonly isBooked?: string | null;
  readonly isUpset?: string | null;
  readonly isCustomerCall?: string | null;
  readonly objections?: string | null;
  readonly recordingURL?: string | null;
  readonly aiPredictedEmployee?: string | null;
  readonly aiPredictionReason?: string | null;
  readonly aiPredictionStatus?: string | null;
  readonly aiPredictionUpdatedAt?: string | null;
  readonly recordingType?: string | null;
  readonly transcriptStatus?: string | null;
  readonly transcript?: string | null;
  readonly sentiment?: string | null;
  readonly createdAt?: string | null;
  readonly EmployeeID?: string | null;
  readonly ClientID?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Calls = LazyLoading extends LazyLoadingDisabled ? EagerCalls : LazyCalls

export declare const Calls: (new (init: ModelInit<Calls>) => Calls) & {
  copyOf(source: Calls, mutator: (draft: MutableModel<Calls>) => MutableModel<Calls> | void): Calls;
}

type EagerEmployees = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Employees, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly street?: string | null;
  readonly street2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zip?: string | null;
  readonly country?: string | null;
  readonly birthDate?: string | null;
  readonly hireDate?: string | null;
  readonly jobTitle?: string | null;
  readonly photo?: string | null;
  readonly ManagerID?: string | null;
  readonly ClientID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEmployees = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Employees, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly phone?: string | null;
  readonly street?: string | null;
  readonly street2?: string | null;
  readonly city?: string | null;
  readonly state?: string | null;
  readonly zip?: string | null;
  readonly country?: string | null;
  readonly birthDate?: string | null;
  readonly hireDate?: string | null;
  readonly jobTitle?: string | null;
  readonly photo?: string | null;
  readonly ManagerID?: string | null;
  readonly ClientID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Employees = LazyLoading extends LazyLoadingDisabled ? EagerEmployees : LazyEmployees

export declare const Employees: (new (init: ModelInit<Employees>) => Employees) & {
  copyOf(source: Employees, mutator: (draft: MutableModel<Employees>) => MutableModel<Employees> | void): Employees;
}

type EagerEmployeeExternalIDs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<EmployeeExternalIDs, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly externalID?: string | null;
  readonly entityType?: string | null;
  readonly EmployeeID?: string | null;
  readonly ClientID?: string | null;
  readonly SoftwareID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyEmployeeExternalIDs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<EmployeeExternalIDs, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly externalID?: string | null;
  readonly entityType?: string | null;
  readonly EmployeeID?: string | null;
  readonly ClientID?: string | null;
  readonly SoftwareID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type EmployeeExternalIDs = LazyLoading extends LazyLoadingDisabled ? EagerEmployeeExternalIDs : LazyEmployeeExternalIDs

export declare const EmployeeExternalIDs: (new (init: ModelInit<EmployeeExternalIDs>) => EmployeeExternalIDs) & {
  copyOf(source: EmployeeExternalIDs, mutator: (draft: MutableModel<EmployeeExternalIDs>) => MutableModel<EmployeeExternalIDs> | void): EmployeeExternalIDs;
}

type EagerIcons = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Icons, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly location?: (string | null)[] | null;
  readonly data?: string | null;
  readonly s3URL?: string | null;
  readonly createdAt?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIcons = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Icons, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly location?: (string | null)[] | null;
  readonly data?: string | null;
  readonly s3URL?: string | null;
  readonly createdAt?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Icons = LazyLoading extends LazyLoadingDisabled ? EagerIcons : LazyIcons

export declare const Icons: (new (init: ModelInit<Icons>) => Icons) & {
  copyOf(source: Icons, mutator: (draft: MutableModel<Icons>) => MutableModel<Icons> | void): Icons;
}

type EagerIntegrations = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Integrations, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly serviceName: string;
  readonly description?: string | null;
  readonly integrationKeys?: string | null;
  readonly options?: string | null;
  readonly externalID?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly IntegrationTypeID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIntegrations = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Integrations, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly serviceName: string;
  readonly description?: string | null;
  readonly integrationKeys?: string | null;
  readonly options?: string | null;
  readonly externalID?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly IntegrationTypeID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Integrations = LazyLoading extends LazyLoadingDisabled ? EagerIntegrations : LazyIntegrations

export declare const Integrations: (new (init: ModelInit<Integrations>) => Integrations) & {
  copyOf(source: Integrations, mutator: (draft: MutableModel<Integrations>) => MutableModel<Integrations> | void): Integrations;
}

type EagerIntegrationTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IntegrationTypes, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyIntegrationTypes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<IntegrationTypes, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type IntegrationTypes = LazyLoading extends LazyLoadingDisabled ? EagerIntegrationTypes : LazyIntegrationTypes

export declare const IntegrationTypes: (new (init: ModelInit<IntegrationTypes>) => IntegrationTypes) & {
  copyOf(source: IntegrationTypes, mutator: (draft: MutableModel<IntegrationTypes>) => MutableModel<IntegrationTypes> | void): IntegrationTypes;
}

type EagerApprovals = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Approvals, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly approvalText?: string | null;
  readonly details?: string | null;
  readonly type?: string | null;
  readonly requestedDate?: string | null;
  readonly respondedDate?: string | null;
  readonly createdAt?: string | null;
  readonly response?: ResponseEnum | keyof typeof ResponseEnum | null;
  readonly approverName?: string | null;
  readonly approverEmail?: string | null;
  readonly responseRecipients?: string | null;
  readonly referenceNumber?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyApprovals = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Approvals, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly approvalText?: string | null;
  readonly details?: string | null;
  readonly type?: string | null;
  readonly requestedDate?: string | null;
  readonly respondedDate?: string | null;
  readonly createdAt?: string | null;
  readonly response?: ResponseEnum | keyof typeof ResponseEnum | null;
  readonly approverName?: string | null;
  readonly approverEmail?: string | null;
  readonly responseRecipients?: string | null;
  readonly referenceNumber?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Approvals = LazyLoading extends LazyLoadingDisabled ? EagerApprovals : LazyApprovals

export declare const Approvals: (new (init: ModelInit<Approvals>) => Approvals) & {
  copyOf(source: Approvals, mutator: (draft: MutableModel<Approvals>) => MutableModel<Approvals> | void): Approvals;
}

type EagerDashboard = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Dashboard, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly isTemplate?: string | null;
  readonly layout?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly dashboardType?: DashboardType | keyof typeof DashboardType | null;
  readonly webhookInstanceID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDashboard = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Dashboard, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly isTemplate?: string | null;
  readonly layout?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly dashboardType?: DashboardType | keyof typeof DashboardType | null;
  readonly webhookInstanceID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Dashboard = LazyLoading extends LazyLoadingDisabled ? EagerDashboard : LazyDashboard

export declare const Dashboard: (new (init: ModelInit<Dashboard>) => Dashboard) & {
  copyOf(source: Dashboard, mutator: (draft: MutableModel<Dashboard>) => MutableModel<Dashboard> | void): Dashboard;
}

type EagerZapierTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ZapierTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly url?: string | null;
  readonly video?: string | null;
  readonly requestFields?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyZapierTools = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ZapierTools, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly url?: string | null;
  readonly video?: string | null;
  readonly requestFields?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ZapierTools = LazyLoading extends LazyLoadingDisabled ? EagerZapierTools : LazyZapierTools

export declare const ZapierTools: (new (init: ModelInit<ZapierTools>) => ZapierTools) & {
  copyOf(source: ZapierTools, mutator: (draft: MutableModel<ZapierTools>) => MutableModel<ZapierTools> | void): ZapierTools;
}

type EagerProviders = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Providers, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly additional?: string | null;
  readonly services?: string | null;
  readonly affiliateLink?: string | null;
  readonly phone?: string | null;
  readonly logo?: string | null;
  readonly email?: string | null;
  readonly offer?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProviders = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Providers, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly additional?: string | null;
  readonly services?: string | null;
  readonly affiliateLink?: string | null;
  readonly phone?: string | null;
  readonly logo?: string | null;
  readonly email?: string | null;
  readonly offer?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Providers = LazyLoading extends LazyLoadingDisabled ? EagerProviders : LazyProviders

export declare const Providers: (new (init: ModelInit<Providers>) => Providers) & {
  copyOf(source: Providers, mutator: (draft: MutableModel<Providers>) => MutableModel<Providers> | void): Providers;
}

type EagerOCRJobs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OCRJobs, 'id'>;
  };
  readonly id: string;
  readonly source?: string | null;
  readonly name?: string | null;
  readonly metaData?: string | null;
  readonly totalPageCount?: string | null;
  readonly extractedPageData?: string | null;
  readonly status?: string | null;
  readonly fileLocation?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
}

type LazyOCRJobs = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<OCRJobs, 'id'>;
  };
  readonly id: string;
  readonly source?: string | null;
  readonly name?: string | null;
  readonly metaData?: string | null;
  readonly totalPageCount?: string | null;
  readonly extractedPageData?: string | null;
  readonly status?: string | null;
  readonly fileLocation?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
}

export declare type OCRJobs = LazyLoading extends LazyLoadingDisabled ? EagerOCRJobs : LazyOCRJobs

export declare const OCRJobs: (new (init: ModelInit<OCRJobs>) => OCRJobs) & {
  copyOf(source: OCRJobs, mutator: (draft: MutableModel<OCRJobs>) => MutableModel<OCRJobs> | void): OCRJobs;
}

type EagerInvoices = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Invoices, 'id'>;
  };
  readonly id: string;
  readonly OCRJobID?: string | null;
  readonly jobID?: string | null;
  readonly confirmedAt?: string | null;
  readonly textractData?: string | null;
  readonly fileLink?: string | null;
  readonly originalFileLink?: string | null;
  readonly type?: string | null;
  readonly source?: string | null;
  readonly percentageConfidence?: number | null;
  readonly lineItems?: string | null;
  readonly customFields?: string | null;
  readonly textractStatus?: string | null;
  readonly receivedStatus?: string | null;
  readonly vendorName?: string | null;
  readonly vendorAddress?: string | null;
  readonly vendorUrl?: string | null;
  readonly vendorContact?: string | null;
  readonly vendorABN?: string | null;
  readonly vendorGST?: string | null;
  readonly vendorPAN?: string | null;
  readonly vendorVAT?: string | null;
  readonly clientUrl?: string | null;
  readonly clientName?: string | null;
  readonly clientAddress?: string | null;
  readonly clientPhone?: string | null;
  readonly clientABN?: string | null;
  readonly clientGST?: string | null;
  readonly clientPAN?: string | null;
  readonly clientVAT?: string | null;
  readonly customerTaxID?: string | null;
  readonly customerNumber?: string | null;
  readonly customerAccount?: string | null;
  readonly invoiceNumber?: string | null;
  readonly invoiceDate?: string | null;
  readonly dueDate?: string | null;
  readonly paymentMethod?: string | null;
  readonly orderDate?: string | null;
  readonly deliveryDate?: string | null;
  readonly poNumber?: string | null;
  readonly serviceCharge?: string | null;
  readonly gratuity?: string | null;
  readonly discount?: string | null;
  readonly priorBalance?: string | null;
  readonly amountDue?: string | null;
  readonly amountPaid?: string | null;
  readonly subTotal?: string | null;
  readonly shippingHandling?: string | null;
  readonly total?: string | null;
  readonly tax?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly ClientGroupID?: string | null;
  readonly user?: string | null;
  readonly clientID?: string | null;
  readonly UserID?: string | null;
}

type LazyInvoices = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Invoices, 'id'>;
  };
  readonly id: string;
  readonly OCRJobID?: string | null;
  readonly jobID?: string | null;
  readonly confirmedAt?: string | null;
  readonly textractData?: string | null;
  readonly fileLink?: string | null;
  readonly originalFileLink?: string | null;
  readonly type?: string | null;
  readonly source?: string | null;
  readonly percentageConfidence?: number | null;
  readonly lineItems?: string | null;
  readonly customFields?: string | null;
  readonly textractStatus?: string | null;
  readonly receivedStatus?: string | null;
  readonly vendorName?: string | null;
  readonly vendorAddress?: string | null;
  readonly vendorUrl?: string | null;
  readonly vendorContact?: string | null;
  readonly vendorABN?: string | null;
  readonly vendorGST?: string | null;
  readonly vendorPAN?: string | null;
  readonly vendorVAT?: string | null;
  readonly clientUrl?: string | null;
  readonly clientName?: string | null;
  readonly clientAddress?: string | null;
  readonly clientPhone?: string | null;
  readonly clientABN?: string | null;
  readonly clientGST?: string | null;
  readonly clientPAN?: string | null;
  readonly clientVAT?: string | null;
  readonly customerTaxID?: string | null;
  readonly customerNumber?: string | null;
  readonly customerAccount?: string | null;
  readonly invoiceNumber?: string | null;
  readonly invoiceDate?: string | null;
  readonly dueDate?: string | null;
  readonly paymentMethod?: string | null;
  readonly orderDate?: string | null;
  readonly deliveryDate?: string | null;
  readonly poNumber?: string | null;
  readonly serviceCharge?: string | null;
  readonly gratuity?: string | null;
  readonly discount?: string | null;
  readonly priorBalance?: string | null;
  readonly amountDue?: string | null;
  readonly amountPaid?: string | null;
  readonly subTotal?: string | null;
  readonly shippingHandling?: string | null;
  readonly total?: string | null;
  readonly tax?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly ClientGroupID?: string | null;
  readonly user?: string | null;
  readonly clientID?: string | null;
  readonly UserID?: string | null;
}

export declare type Invoices = LazyLoading extends LazyLoadingDisabled ? EagerInvoices : LazyInvoices

export declare const Invoices: (new (init: ModelInit<Invoices>) => Invoices) & {
  copyOf(source: Invoices, mutator: (draft: MutableModel<Invoices>) => MutableModel<Invoices> | void): Invoices;
}

type EagerDataCleaningQueue = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DataCleaningQueue, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly services?: string | null;
  readonly type?: string | null;
  readonly steps?: string | null;
  readonly options?: string | null;
  readonly dateStarted?: string | null;
  readonly dateCompleted?: string | null;
  readonly status?: string | null;
  readonly DataCleaningItems?: (DataCleaningItems | null)[] | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDataCleaningQueue = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DataCleaningQueue, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly services?: string | null;
  readonly type?: string | null;
  readonly steps?: string | null;
  readonly options?: string | null;
  readonly dateStarted?: string | null;
  readonly dateCompleted?: string | null;
  readonly status?: string | null;
  readonly DataCleaningItems: AsyncCollection<DataCleaningItems>;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DataCleaningQueue = LazyLoading extends LazyLoadingDisabled ? EagerDataCleaningQueue : LazyDataCleaningQueue

export declare const DataCleaningQueue: (new (init: ModelInit<DataCleaningQueue>) => DataCleaningQueue) & {
  copyOf(source: DataCleaningQueue, mutator: (draft: MutableModel<DataCleaningQueue>) => MutableModel<DataCleaningQueue> | void): DataCleaningQueue;
}

type EagerDataCleaningItems = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DataCleaningItems, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly data?: string | null;
  readonly status?: string | null;
  readonly types?: string | null;
  readonly service?: string | null;
  readonly DataCleaningQueueID: string;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDataCleaningItems = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<DataCleaningItems, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly data?: string | null;
  readonly status?: string | null;
  readonly types?: string | null;
  readonly service?: string | null;
  readonly DataCleaningQueueID: string;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type DataCleaningItems = LazyLoading extends LazyLoadingDisabled ? EagerDataCleaningItems : LazyDataCleaningItems

export declare const DataCleaningItems: (new (init: ModelInit<DataCleaningItems>) => DataCleaningItems) & {
  copyOf(source: DataCleaningItems, mutator: (draft: MutableModel<DataCleaningItems>) => MutableModel<DataCleaningItems> | void): DataCleaningItems;
}

type EagerProjects = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Projects, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly status?: string | null;
  readonly technologies?: string | null;
  readonly constraints?: string | null;
  readonly keyPlayers?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly startedAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly priority?: string | null;
  readonly approvedBy?: string | null;
  readonly approvedOn?: string | null;
  readonly expectedHours?: number | null;
  readonly softwares?: (string | null)[] | null;
  readonly tools?: (string | null)[] | null;
  readonly painPoints?: (string | null)[] | null;
  readonly completedAt?: string | null;
  readonly dueAt?: string | null;
  readonly assignedTo?: string | null;
  readonly clientID?: string | null;
  readonly Tasks?: (Tasks | null)[] | null;
  readonly Notes?: (Notes | null)[] | null;
  readonly Users?: (UserProjects | null)[] | null;
}

type LazyProjects = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Projects, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly status?: string | null;
  readonly technologies?: string | null;
  readonly constraints?: string | null;
  readonly keyPlayers?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly startedAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly priority?: string | null;
  readonly approvedBy?: string | null;
  readonly approvedOn?: string | null;
  readonly expectedHours?: number | null;
  readonly softwares?: (string | null)[] | null;
  readonly tools?: (string | null)[] | null;
  readonly painPoints?: (string | null)[] | null;
  readonly completedAt?: string | null;
  readonly dueAt?: string | null;
  readonly assignedTo?: string | null;
  readonly clientID?: string | null;
  readonly Tasks: AsyncCollection<Tasks>;
  readonly Notes: AsyncCollection<Notes>;
  readonly Users: AsyncCollection<UserProjects>;
}

export declare type Projects = LazyLoading extends LazyLoadingDisabled ? EagerProjects : LazyProjects

export declare const Projects: (new (init: ModelInit<Projects>) => Projects) & {
  copyOf(source: Projects, mutator: (draft: MutableModel<Projects>) => MutableModel<Projects> | void): Projects;
}

type EagerTasks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Tasks, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly expectedHours?: number | null;
  readonly dependsOn?: string | null;
  readonly parent?: string | null;
  readonly order?: number | null;
  readonly progress?: string | null;
  readonly status?: string | null;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly completedAt?: string | null;
  readonly startAt?: string | null;
  readonly dueAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly isAdmin?: string | null;
  readonly pagePath?: string | null;
  readonly assignedTo?: string | null;
  readonly projectID?: string | null;
  readonly clientID?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly GroupingID?: string | null;
}

type LazyTasks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Tasks, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly expectedHours?: number | null;
  readonly dependsOn?: string | null;
  readonly parent?: string | null;
  readonly order?: number | null;
  readonly progress?: string | null;
  readonly status?: string | null;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly completedAt?: string | null;
  readonly startAt?: string | null;
  readonly dueAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly isAdmin?: string | null;
  readonly pagePath?: string | null;
  readonly assignedTo?: string | null;
  readonly projectID?: string | null;
  readonly clientID?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly GroupingID?: string | null;
}

export declare type Tasks = LazyLoading extends LazyLoadingDisabled ? EagerTasks : LazyTasks

export declare const Tasks: (new (init: ModelInit<Tasks>) => Tasks) & {
  copyOf(source: Tasks, mutator: (draft: MutableModel<Tasks>) => MutableModel<Tasks> | void): Tasks;
}

type EagerTaskLinks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<TaskLinks, 'id'>;
  };
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
}

type LazyTaskLinks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<TaskLinks, 'id'>;
  };
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
}

export declare type TaskLinks = LazyLoading extends LazyLoadingDisabled ? EagerTaskLinks : LazyTaskLinks

export declare const TaskLinks: (new (init: ModelInit<TaskLinks>) => TaskLinks) & {
  copyOf(source: TaskLinks, mutator: (draft: MutableModel<TaskLinks>) => MutableModel<TaskLinks> | void): TaskLinks;
}

type EagerNotifications = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Notifications, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly status?: string | null;
  readonly link?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly readAt?: string | null;
  readonly type?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
}

type LazyNotifications = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Notifications, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly status?: string | null;
  readonly link?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly readAt?: string | null;
  readonly type?: string | null;
  readonly user?: string | null;
  readonly UserID?: string | null;
}

export declare type Notifications = LazyLoading extends LazyLoadingDisabled ? EagerNotifications : LazyNotifications

export declare const Notifications: (new (init: ModelInit<Notifications>) => Notifications) & {
  copyOf(source: Notifications, mutator: (draft: MutableModel<Notifications>) => MutableModel<Notifications> | void): Notifications;
}

type EagerNotes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Notes, 'id'>;
  };
  readonly id: string;
  readonly note: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly updatedBy?: string | null;
  readonly isAdmin?: string | null;
  readonly pinned?: boolean | null;
  readonly pagePath?: string | null;
  readonly user?: string | null;
  readonly ProjectID?: string | null;
  readonly ClientID?: string | null;
  readonly ThreadID?: string | null;
  readonly UserID?: string | null;
}

type LazyNotes = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Notes, 'id'>;
  };
  readonly id: string;
  readonly note: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly updatedBy?: string | null;
  readonly isAdmin?: string | null;
  readonly pinned?: boolean | null;
  readonly pagePath?: string | null;
  readonly user?: string | null;
  readonly ProjectID?: string | null;
  readonly ClientID?: string | null;
  readonly ThreadID?: string | null;
  readonly UserID?: string | null;
}

export declare type Notes = LazyLoading extends LazyLoadingDisabled ? EagerNotes : LazyNotes

export declare const Notes: (new (init: ModelInit<Notes>) => Notes) & {
  copyOf(source: Notes, mutator: (draft: MutableModel<Notes>) => MutableModel<Notes> | void): Notes;
}

type EagerThreads = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Threads, 'id'>;
  };
  readonly id: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly Notes?: (Notes | null)[] | null;
}

type LazyThreads = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Threads, 'id'>;
  };
  readonly id: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly Notes: AsyncCollection<Notes>;
}

export declare type Threads = LazyLoading extends LazyLoadingDisabled ? EagerThreads : LazyThreads

export declare const Threads: (new (init: ModelInit<Threads>) => Threads) & {
  copyOf(source: Threads, mutator: (draft: MutableModel<Threads>) => MutableModel<Threads> | void): Threads;
}

type EagerChatBots = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatBots, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly instructions?: string | null;
  readonly isGlobal?: string | null;
  readonly emailKey?: string | null;
  readonly externalID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatBots = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatBots, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly instructions?: string | null;
  readonly isGlobal?: string | null;
  readonly emailKey?: string | null;
  readonly externalID?: string | null;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatBots = LazyLoading extends LazyLoadingDisabled ? EagerChatBots : LazyChatBots

export declare const ChatBots: (new (init: ModelInit<ChatBots>) => ChatBots) & {
  copyOf(source: ChatBots, mutator: (draft: MutableModel<ChatBots>) => MutableModel<ChatBots> | void): ChatBots;
}

type EagerChatFiles = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatFiles, 'id'>;
  };
  readonly id: string;
  readonly externalID?: string | null;
  readonly ChatBotID: string;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatFiles = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatFiles, 'id'>;
  };
  readonly id: string;
  readonly externalID?: string | null;
  readonly ChatBotID: string;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatFiles = LazyLoading extends LazyLoadingDisabled ? EagerChatFiles : LazyChatFiles

export declare const ChatFiles: (new (init: ModelInit<ChatFiles>) => ChatFiles) & {
  copyOf(source: ChatFiles, mutator: (draft: MutableModel<ChatFiles>) => MutableModel<ChatFiles> | void): ChatFiles;
}

type EagerChats = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Chats, 'id'>;
  };
  readonly id: string;
  readonly creationMethod?: string | null;
  readonly from?: string | null;
  readonly externalID?: string | null;
  readonly ChatBotID: string;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChats = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Chats, 'id'>;
  };
  readonly id: string;
  readonly creationMethod?: string | null;
  readonly from?: string | null;
  readonly externalID?: string | null;
  readonly ChatBotID: string;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Chats = LazyLoading extends LazyLoadingDisabled ? EagerChats : LazyChats

export declare const Chats: (new (init: ModelInit<Chats>) => Chats) & {
  copyOf(source: Chats, mutator: (draft: MutableModel<Chats>) => MutableModel<Chats> | void): Chats;
}

type EagerChatMessages = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatMessages, 'id'>;
  };
  readonly id: string;
  readonly message?: string | null;
  readonly externalID?: string | null;
  readonly ChatID: string;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatMessages = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatMessages, 'id'>;
  };
  readonly id: string;
  readonly message?: string | null;
  readonly externalID?: string | null;
  readonly ChatID: string;
  readonly UserID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatMessages = LazyLoading extends LazyLoadingDisabled ? EagerChatMessages : LazyChatMessages

export declare const ChatMessages: (new (init: ModelInit<ChatMessages>) => ChatMessages) & {
  copyOf(source: ChatMessages, mutator: (draft: MutableModel<ChatMessages>) => MutableModel<ChatMessages> | void): ChatMessages;
}

type EagerWebhooks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Webhooks, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly html?: string | null;
  readonly style?: string | null;
  readonly variables?: string | null;
  readonly passwordProtected?: boolean | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWebhooks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Webhooks, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly html?: string | null;
  readonly style?: string | null;
  readonly variables?: string | null;
  readonly passwordProtected?: boolean | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Webhooks = LazyLoading extends LazyLoadingDisabled ? EagerWebhooks : LazyWebhooks

export declare const Webhooks: (new (init: ModelInit<Webhooks>) => Webhooks) & {
  copyOf(source: Webhooks, mutator: (draft: MutableModel<Webhooks>) => MutableModel<Webhooks> | void): Webhooks;
}

type EagerWebhookInstances = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<WebhookInstances, 'id'>;
  };
  readonly id: string;
  readonly password?: string | null;
  readonly externalID?: string | null;
  readonly inputs?: string | null;
  readonly numberOfVisits?: number | null;
  readonly WebhookID: string;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWebhookInstances = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<WebhookInstances, 'id'>;
  };
  readonly id: string;
  readonly password?: string | null;
  readonly externalID?: string | null;
  readonly inputs?: string | null;
  readonly numberOfVisits?: number | null;
  readonly WebhookID: string;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WebhookInstances = LazyLoading extends LazyLoadingDisabled ? EagerWebhookInstances : LazyWebhookInstances

export declare const WebhookInstances: (new (init: ModelInit<WebhookInstances>) => WebhookInstances) & {
  copyOf(source: WebhookInstances, mutator: (draft: MutableModel<WebhookInstances>) => MutableModel<WebhookInstances> | void): WebhookInstances;
}

type EagerWebhookInstanceEvents = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<WebhookInstanceEvents, 'id'>;
  };
  readonly id: string;
  readonly queryParams?: string | null;
  readonly body?: string | null;
  readonly headers?: string | null;
  readonly ipAddress?: string | null;
  readonly type?: string | null;
  readonly WebhookInstanceID: string;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyWebhookInstanceEvents = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<WebhookInstanceEvents, 'id'>;
  };
  readonly id: string;
  readonly queryParams?: string | null;
  readonly body?: string | null;
  readonly headers?: string | null;
  readonly ipAddress?: string | null;
  readonly type?: string | null;
  readonly WebhookInstanceID: string;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type WebhookInstanceEvents = LazyLoading extends LazyLoadingDisabled ? EagerWebhookInstanceEvents : LazyWebhookInstanceEvents

export declare const WebhookInstanceEvents: (new (init: ModelInit<WebhookInstanceEvents>) => WebhookInstanceEvents) & {
  copyOf(source: WebhookInstanceEvents, mutator: (draft: MutableModel<WebhookInstanceEvents>) => MutableModel<WebhookInstanceEvents> | void): WebhookInstanceEvents;
}

type EagerFilledPDFTemplates = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<FilledPDFTemplates, 'id'>;
  };
  readonly id: string;
  readonly templateID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly uniquePath?: string | null;
  readonly fileName?: string | null;
  readonly expiration?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
}

type LazyFilledPDFTemplates = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<FilledPDFTemplates, 'id'>;
  };
  readonly id: string;
  readonly templateID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly uniquePath?: string | null;
  readonly fileName?: string | null;
  readonly expiration?: string | null;
  readonly UserID?: string | null;
  readonly ClientID?: string | null;
}

export declare type FilledPDFTemplates = LazyLoading extends LazyLoadingDisabled ? EagerFilledPDFTemplates : LazyFilledPDFTemplates

export declare const FilledPDFTemplates: (new (init: ModelInit<FilledPDFTemplates>) => FilledPDFTemplates) & {
  copyOf(source: FilledPDFTemplates, mutator: (draft: MutableModel<FilledPDFTemplates>) => MutableModel<FilledPDFTemplates> | void): FilledPDFTemplates;
}

type EagerUserToolsSettings = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserToolsSettings, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly settings?: string | null;
  readonly bookmarked?: string | null;
  readonly UserID?: string | null;
  readonly ToolID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserToolsSettings = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserToolsSettings, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly settings?: string | null;
  readonly bookmarked?: string | null;
  readonly UserID?: string | null;
  readonly ToolID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserToolsSettings = LazyLoading extends LazyLoadingDisabled ? EagerUserToolsSettings : LazyUserToolsSettings

export declare const UserToolsSettings: (new (init: ModelInit<UserToolsSettings>) => UserToolsSettings) & {
  copyOf(source: UserToolsSettings, mutator: (draft: MutableModel<UserToolsSettings>) => MutableModel<UserToolsSettings> | void): UserToolsSettings;
}

type EagerClientToolsSettings = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientToolsSettings, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly settings?: string | null;
  readonly bookmarked?: string | null;
  readonly ClientID?: string | null;
  readonly ToolID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyClientToolsSettings = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientToolsSettings, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly settings?: string | null;
  readonly bookmarked?: string | null;
  readonly ClientID?: string | null;
  readonly ToolID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ClientToolsSettings = LazyLoading extends LazyLoadingDisabled ? EagerClientToolsSettings : LazyClientToolsSettings

export declare const ClientToolsSettings: (new (init: ModelInit<ClientToolsSettings>) => ClientToolsSettings) & {
  copyOf(source: ClientToolsSettings, mutator: (draft: MutableModel<ClientToolsSettings>) => MutableModel<ClientToolsSettings> | void): ClientToolsSettings;
}

type EagerUserToolPermissions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserToolPermissions, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly permissions?: string | null;
  readonly hasAccess?: string | null;
  readonly UserID?: string | null;
  readonly ToolID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserToolPermissions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserToolPermissions, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly permissions?: string | null;
  readonly hasAccess?: string | null;
  readonly UserID?: string | null;
  readonly ToolID?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserToolPermissions = LazyLoading extends LazyLoadingDisabled ? EagerUserToolPermissions : LazyUserToolPermissions

export declare const UserToolPermissions: (new (init: ModelInit<UserToolPermissions>) => UserToolPermissions) & {
  copyOf(source: UserToolPermissions, mutator: (draft: MutableModel<UserToolPermissions>) => MutableModel<UserToolPermissions> | void): UserToolPermissions;
}

type EagerAssignments = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Assignments, 'id'>;
  };
  readonly id: string;
  readonly tableName?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly dueDate?: string | null;
  readonly status?: string | null;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly completedAt?: string | null;
  readonly dueAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly pagePath?: string | null;
  readonly assignedTo?: string | null;
  readonly subassignees?: (string | null)[] | null;
  readonly refID?: string | null;
  readonly ClientID?: string | null;
}

type LazyAssignments = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Assignments, 'id'>;
  };
  readonly id: string;
  readonly tableName?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly dueDate?: string | null;
  readonly status?: string | null;
  readonly type?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly completedAt?: string | null;
  readonly dueAt?: string | null;
  readonly createdBy?: string | null;
  readonly updatedBy?: string | null;
  readonly pagePath?: string | null;
  readonly assignedTo?: string | null;
  readonly subassignees?: (string | null)[] | null;
  readonly refID?: string | null;
  readonly ClientID?: string | null;
}

export declare type Assignments = LazyLoading extends LazyLoadingDisabled ? EagerAssignments : LazyAssignments

export declare const Assignments: (new (init: ModelInit<Assignments>) => Assignments) & {
  copyOf(source: Assignments, mutator: (draft: MutableModel<Assignments>) => MutableModel<Assignments> | void): Assignments;
}

type EagerRivetTransactions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<RivetTransactions, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly amount?: number | null;
  readonly balanceAfter?: number | null;
  readonly transactionType?: RivetTransactionType | keyof typeof RivetTransactionType | null;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly ReferenceID?: string | null;
  readonly referenceType?: RivetReferenceType | keyof typeof RivetReferenceType | null;
  readonly reference?: string | null;
  readonly updatedAt?: string | null;
}

type LazyRivetTransactions = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<RivetTransactions, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly amount?: number | null;
  readonly balanceAfter?: number | null;
  readonly transactionType?: RivetTransactionType | keyof typeof RivetTransactionType | null;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly ReferenceID?: string | null;
  readonly referenceType?: RivetReferenceType | keyof typeof RivetReferenceType | null;
  readonly reference?: string | null;
  readonly updatedAt?: string | null;
}

export declare type RivetTransactions = LazyLoading extends LazyLoadingDisabled ? EagerRivetTransactions : LazyRivetTransactions

export declare const RivetTransactions: (new (init: ModelInit<RivetTransactions>) => RivetTransactions) & {
  copyOf(source: RivetTransactions, mutator: (draft: MutableModel<RivetTransactions>) => MutableModel<RivetTransactions> | void): RivetTransactions;
}

type EagerUsagePacks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UsagePacks, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly RivetTransactionID?: string | null;
  readonly packName?: string | null;
  readonly totalUnits?: number | null;
  readonly unitsRemaining?: number | null;
  readonly unitType?: string | null;
  readonly rivetsCost?: number | null;
  readonly purchasedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUsagePacks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UsagePacks, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly RivetTransactionID?: string | null;
  readonly packName?: string | null;
  readonly totalUnits?: number | null;
  readonly unitsRemaining?: number | null;
  readonly unitType?: string | null;
  readonly rivetsCost?: number | null;
  readonly purchasedAt?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UsagePacks = LazyLoading extends LazyLoadingDisabled ? EagerUsagePacks : LazyUsagePacks

export declare const UsagePacks: (new (init: ModelInit<UsagePacks>) => UsagePacks) & {
  copyOf(source: UsagePacks, mutator: (draft: MutableModel<UsagePacks>) => MutableModel<UsagePacks> | void): UsagePacks;
}

type EagerToolUsage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolUsage, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly units?: number | null;
  readonly createdAt?: string | null;
  readonly actorUserID?: string | null;
  readonly updatedAt?: string | null;
}

type LazyToolUsage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolUsage, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly units?: number | null;
  readonly createdAt?: string | null;
  readonly actorUserID?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ToolUsage = LazyLoading extends LazyLoadingDisabled ? EagerToolUsage : LazyToolUsage

export declare const ToolUsage: (new (init: ModelInit<ToolUsage>) => ToolUsage) & {
  copyOf(source: ToolUsage, mutator: (draft: MutableModel<ToolUsage>) => MutableModel<ToolUsage> | void): ToolUsage;
}

type EagerToolUsageUsagePacks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolUsageUsagePacks, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ToolUsageID: string;
  readonly UsagePackID: string;
  readonly units?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyToolUsageUsagePacks = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolUsageUsagePacks, 'id'>;
    readOnlyFields: 'updatedAt';
  };
  readonly id: string;
  readonly ToolUsageID: string;
  readonly UsagePackID: string;
  readonly units?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ToolUsageUsagePacks = LazyLoading extends LazyLoadingDisabled ? EagerToolUsageUsagePacks : LazyToolUsageUsagePacks

export declare const ToolUsageUsagePacks: (new (init: ModelInit<ToolUsageUsagePacks>) => ToolUsageUsagePacks) & {
  copyOf(source: ToolUsageUsagePacks, mutator: (draft: MutableModel<ToolUsageUsagePacks>) => MutableModel<ToolUsageUsagePacks> | void): ToolUsageUsagePacks;
}

type EagerTemplatedAssemblies = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<TemplatedAssemblies, 'id'>;
  };
  readonly id: string;
  readonly code?: string | null;
  readonly icon?: string | null;
  readonly name?: string | null;
  readonly intakeFormVersion?: number | null;
  readonly department?: string | null;
  readonly category?: string | null;
  readonly video?: string | null;
  readonly description?: string | null;
  readonly rivetCost?: number | null;
  readonly businessImpactScore?: number | null;
  readonly businessImpactReasoning?: string | null;
  readonly regulationSafetyScore?: number | null;
  readonly cyberPrivacyScore?: number | null;
  readonly operationalExcellenceScore?: number | null;
  readonly insightForesightScore?: number | null;
  readonly peopleCultureScore?: number | null;
  readonly financialEfficiencyScore?: number | null;
  readonly laborLeverageScore?: number | null;
  readonly strategicFitScore?: number | null;
  readonly complexityTier?: ComplexityTier | keyof typeof ComplexityTier | null;
  readonly activeStatus?: ActiveStatus | keyof typeof ActiveStatus | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly intakeFormActiveVersion?: number | null;
}

type LazyTemplatedAssemblies = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<TemplatedAssemblies, 'id'>;
  };
  readonly id: string;
  readonly code?: string | null;
  readonly icon?: string | null;
  readonly name?: string | null;
  readonly intakeFormVersion?: number | null;
  readonly department?: string | null;
  readonly category?: string | null;
  readonly video?: string | null;
  readonly description?: string | null;
  readonly rivetCost?: number | null;
  readonly businessImpactScore?: number | null;
  readonly businessImpactReasoning?: string | null;
  readonly regulationSafetyScore?: number | null;
  readonly cyberPrivacyScore?: number | null;
  readonly operationalExcellenceScore?: number | null;
  readonly insightForesightScore?: number | null;
  readonly peopleCultureScore?: number | null;
  readonly financialEfficiencyScore?: number | null;
  readonly laborLeverageScore?: number | null;
  readonly strategicFitScore?: number | null;
  readonly complexityTier?: ComplexityTier | keyof typeof ComplexityTier | null;
  readonly activeStatus?: ActiveStatus | keyof typeof ActiveStatus | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly intakeFormActiveVersion?: number | null;
}

export declare type TemplatedAssemblies = LazyLoading extends LazyLoadingDisabled ? EagerTemplatedAssemblies : LazyTemplatedAssemblies

export declare const TemplatedAssemblies: (new (init: ModelInit<TemplatedAssemblies>) => TemplatedAssemblies) & {
  copyOf(source: TemplatedAssemblies, mutator: (draft: MutableModel<TemplatedAssemblies>) => MutableModel<TemplatedAssemblies> | void): TemplatedAssemblies;
}

type EagerClientAssemblies = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientAssemblies, 'id'>;
  };
  readonly id: string;
  readonly ClientID: string;
  readonly TemplatedAssemblyID?: string | null;
  readonly status?: ClientAssemblyStatus | keyof typeof ClientAssemblyStatus | null;
  readonly requestedBy?: string | null;
  readonly activeSince?: string | null;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly icon?: string | null;
  readonly department?: string | null;
  readonly category?: string | null;
  readonly video?: string | null;
  readonly rivetCostAtRequest?: number | null;
  readonly RivetTransactionID?: string | null;
  readonly businessImpactScoreAtRequest?: number | null;
  readonly businessImpactReasoningAtRequest?: string | null;
  readonly regulationSafetyScoreAtRequest?: number | null;
  readonly cyberPrivacyScoreAtRequest?: number | null;
  readonly operationalExcellenceScoreAtRequest?: number | null;
  readonly insightForesightScoreAtRequest?: number | null;
  readonly peopleCultureScoreAtRequest?: number | null;
  readonly financialEfficiencyScoreAtRequest?: number | null;
  readonly laborLeverageScoreAtRequest?: number | null;
  readonly strategicFitScoreAtRequest?: number | null;
  readonly complexityTier?: ComplexityTier | keyof typeof ComplexityTier | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly intakeFormActiveVersion?: number | null;
}

type LazyClientAssemblies = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ClientAssemblies, 'id'>;
  };
  readonly id: string;
  readonly ClientID: string;
  readonly TemplatedAssemblyID?: string | null;
  readonly status?: ClientAssemblyStatus | keyof typeof ClientAssemblyStatus | null;
  readonly requestedBy?: string | null;
  readonly activeSince?: string | null;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly icon?: string | null;
  readonly department?: string | null;
  readonly category?: string | null;
  readonly video?: string | null;
  readonly rivetCostAtRequest?: number | null;
  readonly RivetTransactionID?: string | null;
  readonly businessImpactScoreAtRequest?: number | null;
  readonly businessImpactReasoningAtRequest?: string | null;
  readonly regulationSafetyScoreAtRequest?: number | null;
  readonly cyberPrivacyScoreAtRequest?: number | null;
  readonly operationalExcellenceScoreAtRequest?: number | null;
  readonly insightForesightScoreAtRequest?: number | null;
  readonly peopleCultureScoreAtRequest?: number | null;
  readonly financialEfficiencyScoreAtRequest?: number | null;
  readonly laborLeverageScoreAtRequest?: number | null;
  readonly strategicFitScoreAtRequest?: number | null;
  readonly complexityTier?: ComplexityTier | keyof typeof ComplexityTier | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly intakeFormActiveVersion?: number | null;
}

export declare type ClientAssemblies = LazyLoading extends LazyLoadingDisabled ? EagerClientAssemblies : LazyClientAssemblies

export declare const ClientAssemblies: (new (init: ModelInit<ClientAssemblies>) => ClientAssemblies) & {
  copyOf(source: ClientAssemblies, mutator: (draft: MutableModel<ClientAssemblies>) => MutableModel<ClientAssemblies> | void): ClientAssemblies;
}

type EagerToolEmails = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolEmails, 'id'>;
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly clientTool: string;
  readonly clientToolReadStatus: string;
  readonly subject?: string | null;
  readonly preview?: string | null;
  readonly from?: string | null;
  readonly receivedAt?: string | null;
  readonly fileCount?: number | null;
  readonly threadId?: string | null;
  readonly readAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
}

type LazyToolEmails = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ToolEmails, 'id'>;
  };
  readonly id: string;
  readonly ClientID: string;
  readonly ToolID: string;
  readonly clientTool: string;
  readonly clientToolReadStatus: string;
  readonly subject?: string | null;
  readonly preview?: string | null;
  readonly from?: string | null;
  readonly receivedAt?: string | null;
  readonly fileCount?: number | null;
  readonly threadId?: string | null;
  readonly readAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt?: string | null;
}

export declare type ToolEmails = LazyLoading extends LazyLoadingDisabled ? EagerToolEmails : LazyToolEmails

export declare const ToolEmails: (new (init: ModelInit<ToolEmails>) => ToolEmails) & {
  copyOf(source: ToolEmails, mutator: (draft: MutableModel<ToolEmails>) => MutableModel<ToolEmails> | void): ToolEmails;
}

type EagerUserProjects = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserProjects, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly usersId?: string | null;
  readonly projectsId?: string | null;
  readonly users: Users;
  readonly projects: Projects;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserProjects = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserProjects, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly usersId?: string | null;
  readonly projectsId?: string | null;
  readonly users: AsyncItem<Users>;
  readonly projects: AsyncItem<Projects>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserProjects = LazyLoading extends LazyLoadingDisabled ? EagerUserProjects : LazyUserProjects

export declare const UserProjects: (new (init: ModelInit<UserProjects>) => UserProjects) & {
  copyOf(source: UserProjects, mutator: (draft: MutableModel<UserProjects>) => MutableModel<UserProjects> | void): UserProjects;
}

type EagerUserClients = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserClients, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly usersId?: string | null;
  readonly clientsId?: string | null;
  readonly users: Users;
  readonly clients: Clients;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUserClients = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<UserClients, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly usersId?: string | null;
  readonly clientsId?: string | null;
  readonly users: AsyncItem<Users>;
  readonly clients: AsyncItem<Clients>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type UserClients = LazyLoading extends LazyLoadingDisabled ? EagerUserClients : LazyUserClients

export declare const UserClients: (new (init: ModelInit<UserClients>) => UserClients) & {
  copyOf(source: UserClients, mutator: (draft: MutableModel<UserClients>) => MutableModel<UserClients> | void): UserClients;
}