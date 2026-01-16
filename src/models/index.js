// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const ComplexityTier = {
  "T1": "T1",
  "T2": "T2",
  "T3": "T3",
  "T4": "T4",
  "T5": "T5"
};

const ActiveStatus = {
  "ACTIVE": "ACTIVE",
  "INACTIVE": "INACTIVE"
};

const ResponseEnum = {
  "PENDING": "PENDING",
  "APPROVED": "APPROVED",
  "DENIED": "DENIED"
};

const CostMetricType = {
  "FLAT_RATE": "FLAT_RATE",
  "PER_EXECUTION": "PER_EXECUTION",
  "OTHER": "OTHER"
};

const DashboardType = {
  "STANDARD": "STANDARD",
  "WEBPAGE": "WEBPAGE"
};

const RivetTransactionType = {
  "MONTHLY_ALLOWANCE": "MONTHLY_ALLOWANCE",
  "TEMPLATED_ASSEMBLY": "TEMPLATED_ASSEMBLY",
  "CUSTOM_ASSEMBLY": "CUSTOM_ASSEMBLY",
  "TOOL_USAGE": "TOOL_USAGE",
  "ADJUSTMENT": "ADJUSTMENT",
  "RIVET_PURCHASE": "RIVET_PURCHASE"
};

const RivetReferenceType = {
  "TEMPLATED_ASSEMBLY": "TEMPLATED_ASSEMBLY",
  "CLIENT_ASSEMBLY": "CLIENT_ASSEMBLY",
  "USAGE_PACK": "USAGE_PACK",
  "TOOL_USAGE": "TOOL_USAGE"
};

const PremiumBillingType = {
  "PER_USAGE": "PER_USAGE",
  "SESSION_BLOCKS": "SESSION_BLOCKS"
};

const ClientAssemblyStatus = {
  "REQUESTED": "REQUESTED",
  "LIVE": "LIVE",
  "REJECTED": "REJECTED"
};

const ClientType = {
  "LEAD": "LEAD",
  "CLIENT": "CLIENT",
  "PARTNER": "PARTNER",
  "PROSPECT": "PROSPECT"
};

const { Users, Apps, IngestionTasks, IngestionTaskErrorHandlers, Connections, MasterPermissions, Clients, ClientContactMethods, ClientAddresses, ClientContactActivityEvents, ClientContactActivityTypes, ClientContacts, ClientContactTypes, ClientEmailTemplates, ClientTools, ClientGroups, ClientGroupAssignments, DataSources, Interfaces, InterfaceInstances, Softwares, ClientSoftwares, Usage, Tools, MembershipTypes, Memberships, MembershipTypeTools, MembershipTools, ToolSubscriptions, Activity, Messages, MessageThreads, MessageThreadUsers, InformationRequests, ClientMeeting, ProductCatelogs, Products, Blogs, Reviews, openAiQueue, ScriptFields, ScriptStages, CallScripts, Identifier, IdentifierMapping, IdentifierType, SoftwareIdentifier, Rubriks, Calls, Employees, EmployeeExternalIDs, Icons, Integrations, IntegrationTypes, Approvals, Dashboard, ZapierTools, Providers, OCRJobs, Invoices, DataCleaningQueue, DataCleaningItems, Projects, Tasks, TaskLinks, Notifications, Notes, Threads, ChatBots, ChatFiles, Chats, ChatMessages, Webhooks, WebhookInstances, WebhookInstanceEvents, FilledPDFTemplates, UserToolsSettings, ClientToolsSettings, UserToolPermissions, Assignments, RivetTransactions, UsagePacks, ToolUsage, ToolUsageUsagePacks, TemplatedAssemblies, ClientAssemblies, ToolEmails, UserProjects, UserClients, UsagePlanStructure } = initSchema(schema);

export {
  Users,
  Apps,
  IngestionTasks,
  IngestionTaskErrorHandlers,
  Connections,
  MasterPermissions,
  Clients,
  ClientContactMethods,
  ClientAddresses,
  ClientContactActivityEvents,
  ClientContactActivityTypes,
  ClientContacts,
  ClientContactTypes,
  ClientEmailTemplates,
  ClientTools,
  ClientGroups,
  ClientGroupAssignments,
  DataSources,
  Interfaces,
  InterfaceInstances,
  Softwares,
  ClientSoftwares,
  Usage,
  Tools,
  MembershipTypes,
  Memberships,
  MembershipTypeTools,
  MembershipTools,
  ToolSubscriptions,
  Activity,
  Messages,
  MessageThreads,
  MessageThreadUsers,
  InformationRequests,
  ClientMeeting,
  ProductCatelogs,
  Products,
  Blogs,
  Reviews,
  openAiQueue,
  ScriptFields,
  ScriptStages,
  CallScripts,
  Identifier,
  IdentifierMapping,
  IdentifierType,
  SoftwareIdentifier,
  Rubriks,
  Calls,
  Employees,
  EmployeeExternalIDs,
  Icons,
  Integrations,
  IntegrationTypes,
  Approvals,
  Dashboard,
  ZapierTools,
  Providers,
  OCRJobs,
  Invoices,
  DataCleaningQueue,
  DataCleaningItems,
  Projects,
  Tasks,
  TaskLinks,
  Notifications,
  Notes,
  Threads,
  ChatBots,
  ChatFiles,
  Chats,
  ChatMessages,
  Webhooks,
  WebhookInstances,
  WebhookInstanceEvents,
  FilledPDFTemplates,
  UserToolsSettings,
  ClientToolsSettings,
  UserToolPermissions,
  Assignments,
  RivetTransactions,
  UsagePacks,
  ToolUsage,
  ToolUsageUsagePacks,
  TemplatedAssemblies,
  ClientAssemblies,
  ToolEmails,
  UserProjects,
  UserClients,
  ComplexityTier,
  ActiveStatus,
  ResponseEnum,
  CostMetricType,
  DashboardType,
  RivetTransactionType,
  RivetReferenceType,
  PremiumBillingType,
  ClientAssemblyStatus,
  ClientType,
  UsagePlanStructure
};