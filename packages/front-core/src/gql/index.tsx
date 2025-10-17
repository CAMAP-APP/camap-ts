/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type AttachmentFileInput = {
  cid?: InputMaybe<Scalars['String']>;
  content: Scalars['String'];
  contentType: Scalars['String'];
  encoding: Scalars['String'];
  filename: Scalars['String'];
};

export type AttachmentUnion = EmbeddedImageAttachment | OtherAttachment;

export type AttendanceClassicContract = {
  __typename?: 'AttendanceClassicContract';
  catalog: Catalog;
  distributions: Array<Distribution>;
  subscriptions: Array<CsaSubscriptionType>;
};

export type AttendanceVariableContract = {
  __typename?: 'AttendanceVariableContract';
  catalog: Catalog;
  distribution: Distribution;
  subscriptions: Array<CsaSubscriptionType>;
};

export type Catalog = {
  __typename?: 'Catalog';
  endDate: Scalars['DateTime'];
  group: Group;
  groupId: Scalars['Int'];
  id: Scalars['Int'];
  name: Scalars['String'];
  products: Array<Product>;
  startDate: Scalars['DateTime'];
  subscriptions: Array<CsaSubscriptionType>;
  type: CatalogType;
  user?: Maybe<User>;
  vendor: Vendor;
  vendorId: Scalars['Int'];
};

export enum CatalogType {
  TYPE_CONSTORDERS = 'TYPE_CONSTORDERS',
  TYPE_VARORDER = 'TYPE_VARORDER'
}

export type CreateMembershipInput = {
  date: Scalars['DateTime'];
  distributionId?: InputMaybe<Scalars['Int']>;
  groupId: Scalars['Int'];
  membershipFee?: InputMaybe<Scalars['Float']>;
  paymentType?: InputMaybe<PaymentTypeId>;
  userId: Scalars['Int'];
  year?: InputMaybe<Scalars['Int']>;
};

export type CreateMembershipsInput = {
  date: Scalars['DateTime'];
  distributionId?: InputMaybe<Scalars['Int']>;
  groupId: Scalars['Int'];
  membershipFee?: InputMaybe<Scalars['Float']>;
  paymentType?: InputMaybe<PaymentTypeId>;
  userIds: Array<Scalars['Int']>;
  year?: InputMaybe<Scalars['Int']>;
};

export type CreateMembershipsResponse = {
  __typename?: 'CreateMembershipsResponse';
  errors: Array<CreateMembershipsResponseError>;
  success: Array<Membership>;
};

export type CreateMembershipsResponseError = {
  __typename?: 'CreateMembershipsResponseError';
  message: Scalars['String'];
  userId: Scalars['Int'];
};

export type CreateMessageInput = {
  attachments?: InputMaybe<Array<AttachmentFileInput>>;
  group: MailGroupInput;
  htmlBody: Scalars['String'];
  list: MailListInput;
  recipients: Array<MailUserInput>;
  senderEmail: Scalars['String'];
  senderName: Scalars['String'];
  slateContent: Scalars['String'];
  title: Scalars['String'];
};

export type CsaSubscriptionType = {
  __typename?: 'CsaSubscriptionType';
  absentDistribIds?: Maybe<Scalars['String']>;
  balance: Scalars['Float'];
  catalog: Catalog;
  catalogId: Scalars['Int'];
  endDate: Scalars['DateTime'];
  id: Scalars['Int'];
  startDate: Scalars['DateTime'];
  user: User;
  user2?: Maybe<User>;
  userId: Scalars['Int'];
  userId2?: Maybe<Scalars['Int']>;
};

export type Distribution = {
  __typename?: 'Distribution';
  catalog: Catalog;
  catalogId: Scalars['Int'];
  date: Scalars['DateTime'];
  end: Scalars['DateTime'];
  id: Scalars['Int'];
  multiDistrib: MultiDistrib;
  orderEndDate: Scalars['DateTime'];
  orderStartDate: Scalars['DateTime'];
  place: Place;
  userOrders: Array<UserOrder>;
};

export type DistributionCycle = {
  __typename?: 'DistributionCycle';
  closingHour: Scalars['DateTime'];
  cycleType: DistributionCycleType;
  daysBeforeOrderEnd: Scalars['Int'];
  daysBeforeOrderStart: Scalars['Int'];
  endDate: Scalars['DateTime'];
  endHour: Scalars['DateTime'];
  groupId: Scalars['Int'];
  id: Scalars['Int'];
  openingHour: Scalars['DateTime'];
  placeId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  startHour: Scalars['DateTime'];
};

export enum DistributionCycleType {
  BiWeekly = 'BiWeekly',
  Monthly = 'Monthly',
  TriWeekly = 'TriWeekly',
  Weekly = 'Weekly'
}

export type EmbeddedImageAttachment = {
  __typename?: 'EmbeddedImageAttachment';
  cid: Scalars['String'];
  content: Scalars['String'];
};

export type File = {
  __typename?: 'File';
  cDate?: Maybe<Scalars['DateTime']>;
  data: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type Group = {
  __typename?: 'Group';
  allowedPaymentsType?: Maybe<Array<PaymentTypeId>>;
  betaFlags: Scalars['Int'];
  currencyCode: Scalars['String'];
  disabled?: Maybe<GroupDisabledReason>;
  extUrl?: Maybe<Scalars['String']>;
  flags: Scalars['Int'];
  hasAddressRequired: Scalars['Boolean'];
  hasMembership: Scalars['Boolean'];
  hasPhoneRequired: Scalars['Boolean'];
  iban?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  image?: Maybe<Scalars['String']>;
  membershipFee?: Maybe<Scalars['Float']>;
  multiDistribs: Array<MultiDistrib>;
  name: Scalars['String'];
  txtDistrib?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  userGroup?: Maybe<UserGroup>;
  users?: Maybe<Array<User>>;
};

export enum GroupDisabledReason {
  BLOCKED_BY_ADMIN = 'BLOCKED_BY_ADMIN',
  MOVED = 'MOVED',
  SUSPENDED = 'SUSPENDED'
}

export type GroupPreview = {
  __typename?: 'GroupPreview';
  allowedPaymentsType?: Maybe<Array<PaymentTypeId>>;
  betaFlags: Scalars['Int'];
  currencyCode: Scalars['String'];
  disabled?: Maybe<GroupDisabledReason>;
  extUrl?: Maybe<Scalars['String']>;
  flags: Scalars['Int'];
  hasAddressRequired: Scalars['Boolean'];
  hasPhoneRequired: Scalars['Boolean'];
  iban?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type GroupPreviewCatalogs = {
  __typename?: 'GroupPreviewCatalogs';
  flags: Scalars['Int'];
  id: Scalars['Int'];
  mainPlace: Place;
  name: Scalars['String'];
  places: Array<Place>;
  users: Array<User>;
  volunteerRoles: Array<VolunteerRole>;
};

export type GroupPreviewMap = {
  __typename?: 'GroupPreviewMap';
  id: Scalars['Int'];
  image?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  place: Place;
  placeId: Scalars['Int'];
};

export type GroupPreviewMembers = {
  __typename?: 'GroupPreviewMembers';
  hasMembership: Scalars['Boolean'];
  id: Scalars['Int'];
  membershipFee?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
};

export type InitVendorPage = {
  __typename?: 'InitVendorPage';
  nextDistributions: Array<Distribution>;
  vendor: Vendor;
};

export type InvitedUser = {
  __typename?: 'InvitedUser';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  email2?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  firstName2?: Maybe<Scalars['String']>;
  lastName: Scalars['String'];
  lastName2?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  phone2?: Maybe<Scalars['String']>;
  zipCode?: Maybe<Scalars['String']>;
};

export type LoginInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  sid: Scalars['String'];
};

export type MailAlreadyInUseError = {
  __typename?: 'MailAlreadyInUseError';
  type: UserErrorType;
};

export type MailGroupInput = {
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type MailListInput = {
  name?: InputMaybe<Scalars['String']>;
  type: Scalars['String'];
};

export type MailUserInput = {
  email: Scalars['String'];
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['Int']>;
  lastName?: InputMaybe<Scalars['String']>;
};

export type Membership = {
  __typename?: 'Membership';
  amount: Scalars['Float'];
  date: Scalars['DateTime'];
  distributionId?: Maybe<Scalars['Int']>;
  group?: Maybe<Group>;
  groupId: Scalars['Int'];
  id: Scalars['String'];
  name: Scalars['String'];
  operation?: Maybe<Operation>;
  operationId?: Maybe<Scalars['Int']>;
  user?: Maybe<User>;
  userId: Scalars['Int'];
  year: Scalars['Int'];
};

export type MembershipAvailableYears = {
  __typename?: 'MembershipAvailableYears';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type MembershipFormData = {
  __typename?: 'MembershipFormData';
  availableYears: Array<MembershipAvailableYears>;
  distributions: Array<MultiDistrib>;
  membershipFee?: Maybe<Scalars['Float']>;
};

export type MembershipOperationTypeData = {
  __typename?: 'MembershipOperationTypeData';
  year: Scalars['Int'];
};

export type Message = {
  __typename?: 'Message';
  amapId?: Maybe<Scalars['Int']>;
  attachments?: Maybe<Array<AttachmentUnion>>;
  body: Scalars['String'];
  date: Scalars['DateTime'];
  group?: Maybe<Group>;
  id: Scalars['Int'];
  recipientListId?: Maybe<Scalars['String']>;
  recipients: Array<Scalars['String']>;
  sender: User;
  senderId: Scalars['Int'];
  slateContent: Scalars['String'];
  title: Scalars['String'];
};

export type MoveBackToWaitingListError = {
  __typename?: 'MoveBackToWaitingListError';
  message: Scalars['String'];
  userId: Scalars['Int'];
};

export type MoveBackToWaitingListResponse = {
  __typename?: 'MoveBackToWaitingListResponse';
  errors: Array<MoveBackToWaitingListError>;
  success: Array<WaitingList>;
};

export type MultiDistrib = {
  __typename?: 'MultiDistrib';
  distribEndDate: Scalars['DateTime'];
  distribStartDate: Scalars['DateTime'];
  distributionCycleId?: Maybe<Scalars['Int']>;
  groupId: Scalars['Int'];
  id: Scalars['Int'];
  orderEndDate: Scalars['DateTime'];
  orderStartDate: Scalars['DateTime'];
  placeId: Scalars['Int'];
  volunteerRoles: Array<VolunteerRole>;
  volunteers: Array<Volunteer>;
};

export type Mutation = {
  __typename?: 'Mutation';
  approveRequest: UserGroup;
  cancelRequest: WaitingList;
  createMembership: Membership;
  createMemberships: CreateMembershipsResponse;
  createMessage: Message;
  deleteAccount: Scalars['Int'];
  deleteMembership: Scalars['String'];
  deleteOperation?: Maybe<Scalars['Int']>;
  importAndCreateMembers: SendInvitesToNewMembersResponse;
  login: User;
  loginAs: User;
  logout?: Maybe<Scalars['Int']>;
  moveBackToWaitingList: MoveBackToWaitingListResponse;
  quitGroup: UserGroup;
  quitGroupByControlKey: UserGroup;
  recordBadLogin: Scalars['Int'];
  register: User;
  removeUsersFromGroup: RemoveUsersFromGroupResponse;
  sendInvitesToNewMembers: SendInvitesToNewMembersResponse;
  setGroupImage: Group;
  setProductImage: Product;
  setVendorImage: Vendor;
  updateUser: UpdateUserResult;
  updateUserNotifications: User;
  validateOperation: Operation;
};


export type MutationApproveRequestArgs = {
  groupId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationCancelRequestArgs = {
  groupId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationCreateMembershipArgs = {
  input: CreateMembershipInput;
};


export type MutationCreateMembershipsArgs = {
  input: CreateMembershipsInput;
};


export type MutationCreateMessageArgs = {
  input: CreateMessageInput;
};


export type MutationDeleteAccountArgs = {
  password: Scalars['String'];
  userId: Scalars['Int'];
};


export type MutationDeleteMembershipArgs = {
  groupId: Scalars['Int'];
  userId: Scalars['Int'];
  year: Scalars['Int'];
};


export type MutationDeleteOperationArgs = {
  id: Scalars['Int'];
};


export type MutationImportAndCreateMembersArgs = {
  groupId: Scalars['Int'];
  withAccounts: Array<Scalars['Int']>;
  withoutAccounts: Array<SendInvitesToNewMembersInput>;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLoginAsArgs = {
  groupId?: InputMaybe<Scalars['Int']>;
  userId: Scalars['Int'];
};


export type MutationMoveBackToWaitingListArgs = {
  groupId: Scalars['Int'];
  message: Scalars['String'];
  userIds: Array<Scalars['Int']>;
};


export type MutationQuitGroupArgs = {
  groupId: Scalars['Int'];
};


export type MutationQuitGroupByControlKeyArgs = {
  controlKey: Scalars['String'];
  groupId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveUsersFromGroupArgs = {
  groupId: Scalars['Int'];
  userIds: Array<Scalars['Int']>;
};


export type MutationSendInvitesToNewMembersArgs = {
  groupId: Scalars['Int'];
  withAccounts: Array<Scalars['Int']>;
  withoutAccounts: Array<SendInvitesToNewMembersInput>;
};


export type MutationSetGroupImageArgs = {
  base64EncodedImage: Scalars['String'];
  fileName: Scalars['String'];
  groupId: Scalars['Int'];
  maxWidth: Scalars['Int'];
  mimeType: Scalars['String'];
};


export type MutationSetProductImageArgs = {
  base64EncodedImage: Scalars['String'];
  fileName: Scalars['String'];
  maxWidth: Scalars['Int'];
  mimeType: Scalars['String'];
  productId: Scalars['Int'];
};


export type MutationSetVendorImageArgs = {
  base64EncodedImage: Scalars['String'];
  fileName: Scalars['String'];
  maxWidth: Scalars['Int'];
  mimeType: Scalars['String'];
  vendorId: Scalars['Int'];
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserNotificationsArgs = {
  input: UpdateUserNotificationsInput;
};


export type MutationValidateOperationArgs = {
  id: Scalars['Int'];
  type?: InputMaybe<PaymentTypeId>;
};

export type Operation = {
  __typename?: 'Operation';
  amount: Scalars['Float'];
  data?: Maybe<OperationDataUnion>;
  date: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  pending: Scalars['Boolean'];
  relatedPayments: Array<Operation>;
  relationId?: Maybe<Scalars['Int']>;
  type: OperationType;
};

export type OperationDataUnion = MembershipOperationTypeData | OrderOperationTypeData | PaymentOperationTypeData | SubscriptionTotalOperationTypeData;

export enum OperationType {
  Membership = 'Membership',
  Order = 'Order',
  Payment = 'Payment',
  SubscriptionTotal = 'SubscriptionTotal'
}

export type OrderOperationTypeData = {
  __typename?: 'OrderOperationTypeData';
  basketId: Scalars['Int'];
};

export type OtherAttachment = {
  __typename?: 'OtherAttachment';
  fileName: Scalars['String'];
};

export type PaymentOperationTypeData = {
  __typename?: 'PaymentOperationTypeData';
  remoteOpId?: Maybe<Scalars['String']>;
  type: PaymentTypeId;
};

export enum PaymentTypeId {
  cardTerminal = 'cardTerminal',
  cash = 'cash',
  check = 'check',
  moneypot = 'moneypot',
  onthespot = 'onthespot',
  transfer = 'transfer'
}

export type Place = {
  __typename?: 'Place';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  country?: Maybe<Scalars['String']>;
  group: Group;
  id: Scalars['Int'];
  lat?: Maybe<Scalars['Float']>;
  lng?: Maybe<Scalars['Float']>;
  name: Scalars['String'];
  zipCode: Scalars['String'];
};

export type Product = {
  __typename?: 'Product';
  active: Scalars['Boolean'];
  bulk: Scalars['Boolean'];
  catalogId: Scalars['Int'];
  catalogName: Scalars['String'];
  desc?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  image: Scalars['String'];
  imageId?: Maybe<Scalars['Int']>;
  multiWeight: Scalars['Boolean'];
  name: Scalars['String'];
  organic: Scalars['Boolean'];
  price: Scalars['Float'];
  qt: Scalars['Float'];
  ref?: Maybe<Scalars['String']>;
  stock?: Maybe<Scalars['Float']>;
  stockTracking: StockTracking;
  stockTrackingPerDistrib: StockTrackingPerDistribution;
  unitType: Scalars['Int'];
  variablePrice: Scalars['Boolean'];
  vat: Scalars['Float'];
  vendorId: Scalars['Int'];
  vendorName: Scalars['String'];
  wholesale: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  attendanceClassicContract: AttendanceClassicContract;
  attendanceVariableContract: AttendanceVariableContract;
  canManageAllCatalogs: Scalars['Boolean'];
  catalog: Catalog;
  distributedMultiDistribs: Array<MultiDistrib>;
  distribution: Distribution;
  distributionCycles: Array<DistributionCycle>;
  getActiveCatalogs: Array<Catalog>;
  getActiveVendorsFromGroup: Array<Vendor>;
  getContractsUserLists: Array<UserList>;
  getDistributionsUserLists: Array<UserList>;
  getGroupsOnMap: Array<GroupPreviewMap>;
  getInvitedUserToRegister?: Maybe<InvitedUser>;
  getLatestMessages: Array<Message>;
  getMembershipFormData: MembershipFormData;
  getMessagesForGroup: Array<Message>;
  getOrderableCatalogsFromMultiDistrib: Array<Catalog>;
  getUserFromControlKey: User;
  getUserListInGroupByListType: Array<User>;
  getUserLists: Array<UserList>;
  getUserMemberships: Array<Membership>;
  getUserMessagesForGroup: Array<Message>;
  getUsersFromEmails: Array<User>;
  getVendorWithEmailCheck: Vendor;
  getVendorsFromCompanyNumber: Array<Vendor>;
  getWaitingListsOfGroup: Array<WaitingList>;
  group: Group;
  groupPreview: GroupPreview;
  groupPreviewCatalogs: GroupPreviewCatalogs;
  groupPreviewMembers: GroupPreviewMembers;
  groupPreviews: Array<GroupPreview>;
  groupPreviews2: Array<GroupPreview>;
  initVendorPage: InitVendorPage;
  isEmailRegistered: Scalars['Boolean'];
  isGroupAdmin: Scalars['Boolean'];
  me: User;
  message: Message;
  multiDistribs: Array<MultiDistrib>;
  multiDistribution: MultiDistrib;
  myGroups: Array<GroupPreview>;
  place: Place;
  user: User;
  userGroup?: Maybe<UserGroup>;
  vendor: Vendor;
};


export type QueryAttendanceClassicContractArgs = {
  catalogId: Scalars['Int'];
  endDate?: InputMaybe<Scalars['DateTime']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};


export type QueryAttendanceVariableContractArgs = {
  catalogId: Scalars['Int'];
  distributionId: Scalars['Int'];
};


export type QueryCanManageAllCatalogsArgs = {
  groupId: Scalars['Int'];
};


export type QueryCatalogArgs = {
  id: Scalars['Int'];
};


export type QueryDistributedMultiDistribsArgs = {
  groupId: Scalars['Int'];
};


export type QueryDistributionArgs = {
  id: Scalars['Int'];
};


export type QueryDistributionCyclesArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetActiveCatalogsArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetActiveVendorsFromGroupArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetContractsUserListsArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetDistributionsUserListsArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetGroupsOnMapArgs = {
  lat?: InputMaybe<Scalars['Float']>;
  lng?: InputMaybe<Scalars['Float']>;
  maxLat?: InputMaybe<Scalars['Float']>;
  maxLng?: InputMaybe<Scalars['Float']>;
  minLat?: InputMaybe<Scalars['Float']>;
  minLng?: InputMaybe<Scalars['Float']>;
};


export type QueryGetInvitedUserToRegisterArgs = {
  email: Scalars['String'];
};


export type QueryGetMembershipFormDataArgs = {
  groupId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type QueryGetMessagesForGroupArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetOrderableCatalogsFromMultiDistribArgs = {
  multiDistribId: Scalars['Int'];
};


export type QueryGetUserFromControlKeyArgs = {
  controlKey: Scalars['String'];
  groupId?: InputMaybe<Scalars['Int']>;
  id: Scalars['Int'];
};


export type QueryGetUserListInGroupByListTypeArgs = {
  data?: InputMaybe<Scalars['String']>;
  groupId: Scalars['Int'];
  listType: Scalars['String'];
};


export type QueryGetUserListsArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetUserMembershipsArgs = {
  groupId: Scalars['Int'];
  ignoreIfNotAllowed?: Scalars['Boolean'];
  userId: Scalars['Int'];
};


export type QueryGetUserMessagesForGroupArgs = {
  groupId: Scalars['Int'];
};


export type QueryGetUsersFromEmailsArgs = {
  emails: Array<Scalars['String']>;
};


export type QueryGetVendorWithEmailCheckArgs = {
  vendorId: Scalars['Int'];
};


export type QueryGetVendorsFromCompanyNumberArgs = {
  companyNumber: Scalars['String'];
};


export type QueryGetWaitingListsOfGroupArgs = {
  groupId: Scalars['Int'];
};


export type QueryGroupArgs = {
  id: Scalars['Int'];
};


export type QueryGroupPreviewArgs = {
  id: Scalars['Int'];
};


export type QueryGroupPreviewCatalogsArgs = {
  id: Scalars['Int'];
};


export type QueryGroupPreviewMembersArgs = {
  id: Scalars['Int'];
};


export type QueryInitVendorPageArgs = {
  vendorId: Scalars['Int'];
};


export type QueryIsEmailRegisteredArgs = {
  email: Scalars['String'];
};


export type QueryIsGroupAdminArgs = {
  groupId: Scalars['Int'];
};


export type QueryMessageArgs = {
  id: Scalars['Int'];
};


export type QueryMultiDistribsArgs = {
  fromDate: Scalars['DateTime'];
  groupId: Scalars['Int'];
  nextMultiDistribIfEmpty?: InputMaybe<Scalars['Boolean']>;
  toDate: Scalars['DateTime'];
};


export type QueryMultiDistributionArgs = {
  id: Scalars['Int'];
};


export type QueryPlaceArgs = {
  id: Scalars['Int'];
};


export type QueryUserArgs = {
  id: Scalars['Int'];
};


export type QueryUserGroupArgs = {
  groupId: Scalars['Int'];
  userId: Scalars['Int'];
};


export type QueryVendorArgs = {
  id: Scalars['Int'];
};

export type RegisterInput = {
  address1?: InputMaybe<Scalars['String']>;
  city?: InputMaybe<Scalars['String']>;
  confirmPassword: Scalars['String'];
  email: Scalars['String'];
  email2?: InputMaybe<Scalars['String']>;
  firstName: Scalars['String'];
  firstName2?: InputMaybe<Scalars['String']>;
  invitedGroupId?: InputMaybe<Scalars['Int']>;
  lastName: Scalars['String'];
  lastName2?: InputMaybe<Scalars['String']>;
  password: Scalars['String'];
  phone?: InputMaybe<Scalars['String']>;
  phone2?: InputMaybe<Scalars['String']>;
  sid: Scalars['String'];
  tos: Scalars['Boolean'];
  zipCode?: InputMaybe<Scalars['String']>;
};

export type RemoveUsersFromGroupError = {
  __typename?: 'RemoveUsersFromGroupError';
  message: Scalars['String'];
  userId: Scalars['Int'];
};

export type RemoveUsersFromGroupResponse = {
  __typename?: 'RemoveUsersFromGroupResponse';
  errors: Array<RemoveUsersFromGroupError>;
  success: Array<UserGroup>;
};

export type SendInvitesToNewMembersInput = {
  address1?: InputMaybe<Scalars['String']>;
  address2?: InputMaybe<Scalars['String']>;
  birthDate?: InputMaybe<Scalars['DateTime']>;
  city?: InputMaybe<Scalars['String']>;
  countryOfResidence?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  email2?: InputMaybe<Scalars['String']>;
  firstName: Scalars['String'];
  firstName2?: InputMaybe<Scalars['String']>;
  lastName: Scalars['String'];
  lastName2?: InputMaybe<Scalars['String']>;
  nationality?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  phone2?: InputMaybe<Scalars['String']>;
  zipCode?: InputMaybe<Scalars['String']>;
};

export type SendInvitesToNewMembersResponse = {
  __typename?: 'SendInvitesToNewMembersResponse';
  withAccounts: Array<Scalars['Int']>;
  withoutAccounts: Array<Scalars['String']>;
};

export enum StockTracking {
  Disabled = 'Disabled',
  Global = 'Global',
  PerDistribution = 'PerDistribution'
}

export enum StockTrackingPerDistribution {
  AlwaysTheSame = 'AlwaysTheSame',
  FrequencyBased = 'FrequencyBased',
  PerPeriod = 'PerPeriod'
}

export type SubscriptionTotalOperationTypeData = {
  __typename?: 'SubscriptionTotalOperationTypeData';
  subscriptionId: Scalars['Int'];
};

export type UpdateUserInput = {
  address1?: InputMaybe<Scalars['String']>;
  address2?: InputMaybe<Scalars['String']>;
  birthDate?: InputMaybe<Scalars['DateTime']>;
  city?: InputMaybe<Scalars['String']>;
  countryOfResidence?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  email2?: InputMaybe<Scalars['String']>;
  firstName?: InputMaybe<Scalars['String']>;
  firstName2?: InputMaybe<Scalars['String']>;
  id: Scalars['Int'];
  lastName?: InputMaybe<Scalars['String']>;
  lastName2?: InputMaybe<Scalars['String']>;
  nationality?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  phone2?: InputMaybe<Scalars['String']>;
  zipCode?: InputMaybe<Scalars['String']>;
};

export type UpdateUserNotificationsInput = {
  controlKey?: InputMaybe<Scalars['String']>;
  hasEmailNotif4h?: InputMaybe<Scalars['Boolean']>;
  hasEmailNotif24h?: InputMaybe<Scalars['Boolean']>;
  hasEmailNotifOuverture?: InputMaybe<Scalars['Boolean']>;
  userId: Scalars['Int'];
};

export type UpdateUserResult = MailAlreadyInUseError | User;

export type User = {
  __typename?: 'User';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  birthDate?: Maybe<Scalars['DateTime']>;
  city?: Maybe<Scalars['String']>;
  countryOfResidence?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  email2?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  firstName2?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  lastName: Scalars['String'];
  lastName2?: Maybe<Scalars['String']>;
  nationality?: Maybe<Scalars['String']>;
  notifications: UserNotifications;
  phone?: Maybe<Scalars['String']>;
  phone2?: Maybe<Scalars['String']>;
  zipCode?: Maybe<Scalars['String']>;
};

export enum UserErrorType {
  MailAlreadyInUse = 'MailAlreadyInUse',
  UserNotFound = 'UserNotFound'
}

export type UserGroup = {
  __typename?: 'UserGroup';
  balance: Scalars['Float'];
  group: Group;
  groupId: Scalars['Int'];
  hasValidMembership: Scalars['Boolean'];
  userId: Scalars['Int'];
};

export type UserList = {
  __typename?: 'UserList';
  count?: Maybe<Scalars['Float']>;
  data?: Maybe<Scalars['String']>;
  type: Scalars['String'];
};

export type UserNotifications = {
  __typename?: 'UserNotifications';
  hasEmailNotif4h: Scalars['Boolean'];
  hasEmailNotif24h: Scalars['Boolean'];
  hasEmailNotifOuverture: Scalars['Boolean'];
};

export type UserOrder = {
  __typename?: 'UserOrder';
  distributionId: Scalars['Int'];
  id: Scalars['Int'];
  product: Product;
  productId: Scalars['Int'];
  productPrice: Scalars['Float'];
  quantity: Scalars['Float'];
  smartQt: Scalars['String'];
  subscriptionId?: Maybe<Scalars['Int']>;
  userId: Scalars['Int'];
};

export type Vendor = {
  __typename?: 'Vendor';
  address1?: Maybe<Scalars['String']>;
  address2?: Maybe<Scalars['String']>;
  cdate: Scalars['DateTime'];
  city: Scalars['String'];
  companyNumber?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  desc?: Maybe<Scalars['String']>;
  disabled?: Maybe<VendorDisabledReason>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  image?: Maybe<Scalars['String']>;
  imageFile?: Maybe<File>;
  imageId?: Maybe<Scalars['Int']>;
  images: VendorImages;
  linkText?: Maybe<Scalars['String']>;
  linkUrl?: Maybe<Scalars['String']>;
  longDesc?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  peopleName?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  portrait: Scalars['String'];
  profession: Scalars['String'];
  professionId?: Maybe<Scalars['Int']>;
  zipCode?: Maybe<Scalars['String']>;
};

export enum VendorDisabledReason {
  Banned = 'Banned',
  IncompleteLegalInfos = 'IncompleteLegalInfos',
  NotCompliantWithPolicy = 'NotCompliantWithPolicy'
}

export type VendorImages = {
  __typename?: 'VendorImages';
  banner?: Maybe<Scalars['String']>;
  farm1?: Maybe<Scalars['String']>;
  farm2?: Maybe<Scalars['String']>;
  farm3?: Maybe<Scalars['String']>;
  farm4?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
  portrait?: Maybe<Scalars['String']>;
};

export type Volunteer = {
  __typename?: 'Volunteer';
  multiDistribId: Scalars['Int'];
  user: User;
  userId: Scalars['Int'];
  volunteerRole: VolunteerRole;
  volunteerRoleId: Scalars['Int'];
};

export type VolunteerRole = {
  __typename?: 'VolunteerRole';
  catalogId?: Maybe<Scalars['Int']>;
  groupId: Scalars['Int'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type WaitingList = {
  __typename?: 'WaitingList';
  amapId: Scalars['Int'];
  date: Scalars['DateTime'];
  message: Scalars['String'];
  user: User;
  userId: Scalars['Int'];
};

export type UserFragment = { __typename?: 'User', id: number, email: string, firstName: string, lastName: string, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, nationality?: string | null, countryOfResidence?: string | null, birthDate?: any | null, email2?: string | null, firstName2?: string | null, lastName2?: string | null, phone?: string | null, phone2?: string | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'User', id: number } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: number | null };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'User', id: number } };

export type RecordBadLoginMutationVariables = Exact<{ [key: string]: never; }>;


export type RecordBadLoginMutation = { __typename?: 'Mutation', recordBadLogin: number };

export type LoginAsMutationVariables = Exact<{
  userId: Scalars['Int'];
  groupId?: InputMaybe<Scalars['Int']>;
}>;


export type LoginAsMutation = { __typename?: 'Mutation', loginAs: { __typename?: 'User', id: number } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: number, email: string, firstName: string, lastName: string, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, nationality?: string | null, countryOfResidence?: string | null, birthDate?: any | null, email2?: string | null, firstName2?: string | null, lastName2?: string | null, phone?: string | null, phone2?: string | null } };

export type GroupPreviewQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GroupPreviewQuery = { __typename?: 'Query', groupPreview: { __typename?: 'GroupPreview', id: number, name: string } };

export type PlaceQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type PlaceQuery = { __typename?: 'Query', place: { __typename?: 'Place', id: number, name: string, address1?: string | null, address2?: string | null, city: string, zipCode: string, lat?: number | null, lng?: number | null } };

export type IsGroupAdminQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type IsGroupAdminQuery = { __typename?: 'Query', isGroupAdmin: boolean };

export type AttendanceClassicContractQueryVariables = Exact<{
  catalogId: Scalars['Int'];
  startDate?: InputMaybe<Scalars['DateTime']>;
  endDate?: InputMaybe<Scalars['DateTime']>;
}>;


export type AttendanceClassicContractQuery = { __typename?: 'Query', attendanceClassicContract: { __typename?: 'AttendanceClassicContract', catalog: { __typename?: 'Catalog', id: number, name: string, startDate: any, endDate: any, user?: { __typename?: 'User', id: number, firstName: string, lastName: string, phone?: string | null, email: string } | null, vendor: { __typename?: 'Vendor', id: number, name: string, phone?: string | null, email?: string | null }, group: { __typename?: 'Group', id: number, name: string, txtDistrib?: string | null }, products: Array<{ __typename?: 'Product', id: number, name: string, unitType: number, qt: number }> }, distributions: Array<{ __typename?: 'Distribution', id: number, date: any, userOrders: Array<{ __typename?: 'UserOrder', id: number, userId: number, smartQt: string, productId: number, quantity: number }> }>, subscriptions: Array<{ __typename?: 'CsaSubscriptionType', id: number, absentDistribIds?: string | null, user: { __typename?: 'User', id: number, lastName: string, firstName: string, lastName2?: string | null, firstName2?: string | null, phone?: string | null }, user2?: { __typename?: 'User', id: number, lastName: string, firstName: string, lastName2?: string | null, firstName2?: string | null, phone?: string | null } | null }> } };

export type AttendanceVariableContractQueryVariables = Exact<{
  catalogId: Scalars['Int'];
  distributionId: Scalars['Int'];
}>;


export type AttendanceVariableContractQuery = { __typename?: 'Query', attendanceVariableContract: { __typename?: 'AttendanceVariableContract', catalog: { __typename?: 'Catalog', id: number, name: string, startDate: any, endDate: any, user?: { __typename?: 'User', id: number, firstName: string, lastName: string, phone?: string | null, email: string } | null, vendor: { __typename?: 'Vendor', id: number, name: string, phone?: string | null, email?: string | null }, group: { __typename?: 'Group', id: number, name: string, txtDistrib?: string | null } }, subscriptions: Array<{ __typename?: 'CsaSubscriptionType', id: number, balance: number, absentDistribIds?: string | null, user: { __typename?: 'User', id: number, lastName: string, firstName: string, lastName2?: string | null, firstName2?: string | null, phone?: string | null } }>, distribution: { __typename?: 'Distribution', id: number, date: any, userOrders: Array<{ __typename?: 'UserOrder', id: number, userId: number, quantity: number, smartQt: string, subscriptionId?: number | null, productPrice: number, product: { __typename?: 'Product', id: number, name: string, qt: number, unitType: number, price: number } }>, multiDistrib: { __typename?: 'MultiDistrib', id: number, volunteers: Array<{ __typename?: 'Volunteer', volunteerRole: { __typename?: 'VolunteerRole', id: number, name: string, catalogId?: number | null, groupId: number }, user: { __typename?: 'User', id: number, lastName: string, firstName: string, phone?: string | null, email: string } }> } } } };

export type GetCatalogSubscriptionsQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetCatalogSubscriptionsQuery = { __typename?: 'Query', catalog: { __typename?: 'Catalog', id: number, type: CatalogType, name: string, subscriptions: Array<{ __typename?: 'CsaSubscriptionType', id: number, user: { __typename?: 'User', id: number, firstName: string, lastName: string } }> } };

export type GroupDisabledQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GroupDisabledQuery = { __typename?: 'Query', canManageAllCatalogs: boolean, groupPreview: { __typename?: 'GroupPreview', id: number, disabled?: GroupDisabledReason | null, extUrl?: string | null } };

export type PlaceFragment = { __typename?: 'Place', id: number, name: string, lat?: number | null, lng?: number | null, address1?: string | null, address2?: string | null, zipCode: string, city: string };

export type GetGroupsOnMapQueryVariables = Exact<{
  lat?: InputMaybe<Scalars['Float']>;
  lng?: InputMaybe<Scalars['Float']>;
  minLat?: InputMaybe<Scalars['Float']>;
  minLng?: InputMaybe<Scalars['Float']>;
  maxLat?: InputMaybe<Scalars['Float']>;
  maxLng?: InputMaybe<Scalars['Float']>;
}>;


export type GetGroupsOnMapQuery = { __typename?: 'Query', getGroupsOnMap: Array<{ __typename?: 'GroupPreviewMap', id: number, name: string, image?: string | null, placeId: number, place: { __typename?: 'Place', id: number, name: string, lat?: number | null, lng?: number | null, address1?: string | null, address2?: string | null, zipCode: string, city: string } }> };

export type SetProductImageMutationVariables = Exact<{
  productId: Scalars['Int'];
  base64EncodedImage: Scalars['String'];
  mimeType: Scalars['String'];
  fileName: Scalars['String'];
  maxWidth: Scalars['Int'];
}>;


export type SetProductImageMutation = { __typename?: 'Mutation', setProductImage: { __typename?: 'Product', id: number } };

export type SetGroupImageMutationVariables = Exact<{
  groupId: Scalars['Int'];
  base64EncodedImage: Scalars['String'];
  mimeType: Scalars['String'];
  fileName: Scalars['String'];
  maxWidth: Scalars['Int'];
}>;


export type SetGroupImageMutation = { __typename?: 'Mutation', setGroupImage: { __typename?: 'Group', id: number } };

export type SetVendorImageMutationVariables = Exact<{
  vendorId: Scalars['Int'];
  base64EncodedImage: Scalars['String'];
  mimeType: Scalars['String'];
  fileName: Scalars['String'];
  maxWidth: Scalars['Int'];
}>;


export type SetVendorImageMutation = { __typename?: 'Mutation', setVendorImage: { __typename?: 'Vendor', id: number } };

export type GetInvitedUserToRegisterQueryVariables = Exact<{
  email: Scalars['String'];
}>;


export type GetInvitedUserToRegisterQuery = { __typename?: 'Query', getInvitedUserToRegister?: { __typename?: 'InvitedUser', firstName: string, lastName: string, email: string, phone?: string | null, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, firstName2?: string | null, lastName2?: string | null, email2?: string | null, phone2?: string | null } | null };

export type IsEmailRegisteredQueryVariables = Exact<{
  email: Scalars['String'];
}>;


export type IsEmailRegisteredQuery = { __typename?: 'Query', isEmailRegistered: boolean };

export type InitMembersQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type InitMembersQuery = { __typename?: 'Query', me: { __typename?: 'User', id: number, email: string, firstName: string, lastName: string, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, nationality?: string | null, countryOfResidence?: string | null, birthDate?: any | null, email2?: string | null, firstName2?: string | null, lastName2?: string | null, phone?: string | null, phone2?: string | null }, groupPreviewMembers: { __typename?: 'GroupPreviewMembers', membershipFee?: number | null, hasMembership: boolean }, getUserLists: Array<{ __typename?: 'UserList', type: string, count?: number | null, data?: string | null }> };

export type GetMembersOfGroupByListTypeQueryVariables = Exact<{
  listType: Scalars['String'];
  groupId: Scalars['Int'];
  data?: InputMaybe<Scalars['String']>;
}>;


export type GetMembersOfGroupByListTypeQuery = { __typename?: 'Query', getUserListInGroupByListType: Array<{ __typename?: 'User', id: number, firstName: string, lastName: string, firstName2?: string | null, lastName2?: string | null, city?: string | null, zipCode?: string | null, address1?: string | null, address2?: string | null, email: string, phone?: string | null, email2?: string | null, phone2?: string | null }> };

export type GetWaitingListsOfGroupQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type GetWaitingListsOfGroupQuery = { __typename?: 'Query', getWaitingListsOfGroup: Array<{ __typename?: 'WaitingList', date: any, message: string, user: { __typename?: 'User', id: number, firstName: string, lastName: string, firstName2?: string | null, lastName2?: string | null, email: string, phone?: string | null } }> };

export type MoveBackToWaitingListMutationVariables = Exact<{
  userIds: Array<Scalars['Int']> | Scalars['Int'];
  groupId: Scalars['Int'];
  message: Scalars['String'];
}>;


export type MoveBackToWaitingListMutation = { __typename?: 'Mutation', moveBackToWaitingList: { __typename?: 'MoveBackToWaitingListResponse', success: Array<{ __typename?: 'WaitingList', amapId: number, userId: number }>, errors: Array<{ __typename?: 'MoveBackToWaitingListError', userId: number, message: string }> } };

export type RemoveUsersFromGroupMutationVariables = Exact<{
  userIds: Array<Scalars['Int']> | Scalars['Int'];
  groupId: Scalars['Int'];
}>;


export type RemoveUsersFromGroupMutation = { __typename?: 'Mutation', removeUsersFromGroup: { __typename?: 'RemoveUsersFromGroupResponse', success: Array<{ __typename?: 'UserGroup', groupId: number, userId: number }>, errors: Array<{ __typename?: 'RemoveUsersFromGroupError', userId: number, message: string }> } };

export type ApproveRequestMutationVariables = Exact<{
  userId: Scalars['Int'];
  groupId: Scalars['Int'];
}>;


export type ApproveRequestMutation = { __typename?: 'Mutation', approveRequest: { __typename?: 'UserGroup', userId: number } };

export type CancelRequestMutationVariables = Exact<{
  userId: Scalars['Int'];
  groupId: Scalars['Int'];
}>;


export type CancelRequestMutation = { __typename?: 'Mutation', cancelRequest: { __typename?: 'WaitingList', userId: number } };

export type CreateMembershipsMutationVariables = Exact<{
  input: CreateMembershipsInput;
}>;


export type CreateMembershipsMutation = { __typename?: 'Mutation', createMemberships: { __typename?: 'CreateMembershipsResponse', success: Array<{ __typename?: 'Membership', date: any, amount: number }>, errors: Array<{ __typename?: 'CreateMembershipsResponseError', userId: number, message: string }> } };

export type GetUsersFromEmailsQueryVariables = Exact<{
  emails: Array<Scalars['String']> | Scalars['String'];
}>;


export type GetUsersFromEmailsQuery = { __typename?: 'Query', getUsersFromEmails: Array<{ __typename?: 'User', id: number, email: string, email2?: string | null }> };

export type SendInvitesToNewMembersMutationVariables = Exact<{
  groupId: Scalars['Int'];
  withAccounts: Array<Scalars['Int']> | Scalars['Int'];
  withoutAccounts: Array<SendInvitesToNewMembersInput> | SendInvitesToNewMembersInput;
}>;


export type SendInvitesToNewMembersMutation = { __typename?: 'Mutation', sendInvitesToNewMembers: { __typename?: 'SendInvitesToNewMembersResponse', withAccounts: Array<number>, withoutAccounts: Array<string> } };

export type ImportAndCreateMembersMutationVariables = Exact<{
  groupId: Scalars['Int'];
  withAccounts: Array<Scalars['Int']> | Scalars['Int'];
  withoutAccounts: Array<SendInvitesToNewMembersInput> | SendInvitesToNewMembersInput;
}>;


export type ImportAndCreateMembersMutation = { __typename?: 'Mutation', importAndCreateMembers: { __typename?: 'SendInvitesToNewMembersResponse', withAccounts: Array<number>, withoutAccounts: Array<string> } };

export type GetUserMembershipsQueryVariables = Exact<{
  userId: Scalars['Int'];
  groupId: Scalars['Int'];
}>;


export type GetUserMembershipsQuery = { __typename?: 'Query', getUserMemberships: Array<{ __typename?: 'Membership', year: number, name: string, amount: number, date: any }> };

export type GetMembershipFormDataQueryVariables = Exact<{
  userId: Scalars['Int'];
  groupId: Scalars['Int'];
}>;


export type GetMembershipFormDataQuery = { __typename?: 'Query', getMembershipFormData: { __typename?: 'MembershipFormData', membershipFee?: number | null, availableYears: Array<{ __typename?: 'MembershipAvailableYears', name: string, id: number }>, distributions: Array<{ __typename?: 'MultiDistrib', id: number, distribStartDate: any }> } };

export type CreateMembershipMutationVariables = Exact<{
  input: CreateMembershipInput;
}>;


export type CreateMembershipMutation = { __typename?: 'Mutation', createMembership: { __typename?: 'Membership', date: any, amount: number } };

export type DeleteMembershipMutationVariables = Exact<{
  userId: Scalars['Int'];
  groupId: Scalars['Int'];
  year: Scalars['Int'];
}>;


export type DeleteMembershipMutation = { __typename?: 'Mutation', deleteMembership: string };

export type InitMessagingServiceQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type InitMessagingServiceQuery = { __typename?: 'Query', me: { __typename?: 'User', id: number, email: string, firstName: string, lastName: string, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, nationality?: string | null, countryOfResidence?: string | null, birthDate?: any | null, email2?: string | null, firstName2?: string | null, lastName2?: string | null, phone?: string | null, phone2?: string | null }, groupPreview: { __typename?: 'GroupPreview', id: number, name: string }, getUserLists: Array<{ __typename?: 'UserList', type: string, count?: number | null, data?: string | null }> };

export type GetLatestMessagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLatestMessagesQuery = { __typename?: 'Query', getLatestMessages: Array<{ __typename?: 'Message', date: any, slateContent: string, title: string, attachments?: Array<{ __typename?: 'EmbeddedImageAttachment', cid: string, content: string } | { __typename?: 'OtherAttachment', fileName: string }> | null, group?: { __typename?: 'Group', name: string } | null }> };

export type ContractsUserListsQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type ContractsUserListsQuery = { __typename?: 'Query', getContractsUserLists: Array<{ __typename?: 'UserList', count?: number | null, type: string, data?: string | null }> };

export type DistributionsUserListsQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type DistributionsUserListsQuery = { __typename?: 'Query', getDistributionsUserLists: Array<{ __typename?: 'UserList', count?: number | null, type: string, data?: string | null }> };

export type GetUserListInGroupByListTypeQueryVariables = Exact<{
  listType: Scalars['String'];
  groupId: Scalars['Int'];
  data?: InputMaybe<Scalars['String']>;
}>;


export type GetUserListInGroupByListTypeQuery = { __typename?: 'Query', getUserListInGroupByListType: Array<{ __typename?: 'User', id: number, firstName: string, lastName: string, firstName2?: string | null, lastName2?: string | null, email: string, email2?: string | null }> };

export type CreateMessageMutationVariables = Exact<{
  input: CreateMessageInput;
}>;


export type CreateMessageMutation = { __typename?: 'Mutation', createMessage: { __typename?: 'Message', id: number } };

export type GetMessagesForGroupQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type GetMessagesForGroupQuery = { __typename?: 'Query', getMessagesForGroup: Array<{ __typename?: 'Message', id: number, title: string, date: any }> };

export type GetUserMessagesForGroupQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type GetUserMessagesForGroupQuery = { __typename?: 'Query', getUserMessagesForGroup: Array<{ __typename?: 'Message', id: number, title: string, date: any }> };

export type GetMessageByIdQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetMessageByIdQuery = { __typename?: 'Query', message: { __typename?: 'Message', id: number, title: string, date: any, recipientListId?: string | null, slateContent: string, recipients: Array<string>, sender: { __typename?: 'User', id: number, firstName: string, lastName: string }, attachments?: Array<{ __typename?: 'EmbeddedImageAttachment', cid: string, content: string } | { __typename?: 'OtherAttachment', fileName: string }> | null } };

export type GetActiveCatalogsPicturesQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type GetActiveCatalogsPicturesQuery = { __typename?: 'Query', getActiveCatalogs: Array<{ __typename?: 'Catalog', id: number, vendor: { __typename?: 'Vendor', id: number, name: string, image?: string | null } }> };

export type GetActiveVendorsFromGroupQueryVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type GetActiveVendorsFromGroupQuery = { __typename?: 'Query', getActiveVendorsFromGroup: Array<{ __typename?: 'Vendor', id: number, name: string, email?: string | null }> };

export type DeleteAccountMutationVariables = Exact<{
  userId: Scalars['Int'];
  password: Scalars['String'];
}>;


export type DeleteAccountMutation = { __typename?: 'Mutation', deleteAccount: number };

export type GetUserFromControlKeyQueryVariables = Exact<{
  id: Scalars['Int'];
  controlKey: Scalars['String'];
  groupId?: InputMaybe<Scalars['Int']>;
}>;


export type GetUserFromControlKeyQuery = { __typename?: 'Query', getUserFromControlKey: { __typename?: 'User', id: number, firstName: string, lastName: string, email: string, firstName2?: string | null, lastName2?: string | null, email2?: string | null, phone2?: string | null, notifications: { __typename?: 'UserNotifications', hasEmailNotif4h: boolean, hasEmailNotif24h: boolean, hasEmailNotifOuverture: boolean } } };

export type BaseUserFragment = { __typename?: 'User', id: number, firstName: string, lastName: string, email: string };

export type ContactUserFragment = { __typename?: 'User', phone?: string | null, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, countryOfResidence?: string | null };

export type PartnerUserFragment = { __typename?: 'User', firstName2?: string | null, lastName2?: string | null, email2?: string | null, phone2?: string | null };

export type NotificationsUserFragment = { __typename?: 'User', notifications: { __typename?: 'UserNotifications', hasEmailNotif4h: boolean, hasEmailNotif24h: boolean, hasEmailNotifOuverture: boolean } };

export type UserAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type UserAccountQuery = { __typename?: 'Query', me: { __typename?: 'User', birthDate?: any | null, nationality?: string | null, id: number, firstName: string, lastName: string, email: string, phone?: string | null, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, countryOfResidence?: string | null, firstName2?: string | null, lastName2?: string | null, email2?: string | null, phone2?: string | null, notifications: { __typename?: 'UserNotifications', hasEmailNotif4h: boolean, hasEmailNotif24h: boolean, hasEmailNotifOuverture: boolean } }, myGroups: Array<{ __typename?: 'GroupPreview', id: number, name: string, hasAddressRequired: boolean, hasPhoneRequired: boolean }> };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename: 'MailAlreadyInUseError' } | { __typename?: 'User', birthDate?: any | null, nationality?: string | null, id: number, firstName: string, lastName: string, email: string, phone?: string | null, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, countryOfResidence?: string | null, firstName2?: string | null, lastName2?: string | null, email2?: string | null, phone2?: string | null, notifications: { __typename?: 'UserNotifications', hasEmailNotif4h: boolean, hasEmailNotif24h: boolean, hasEmailNotifOuverture: boolean } } };

export type UpdateUserNotificationsMutationVariables = Exact<{
  input: UpdateUserNotificationsInput;
}>;


export type UpdateUserNotificationsMutation = { __typename?: 'Mutation', updateUserNotifications: { __typename?: 'User', birthDate?: any | null, nationality?: string | null, id: number, firstName: string, lastName: string, email: string, phone?: string | null, address1?: string | null, address2?: string | null, zipCode?: string | null, city?: string | null, countryOfResidence?: string | null, firstName2?: string | null, lastName2?: string | null, email2?: string | null, phone2?: string | null, notifications: { __typename?: 'UserNotifications', hasEmailNotif4h: boolean, hasEmailNotif24h: boolean, hasEmailNotifOuverture: boolean } } };

export type QuitGroupMutationVariables = Exact<{
  groupId: Scalars['Int'];
}>;


export type QuitGroupMutation = { __typename?: 'Mutation', quitGroup: { __typename?: 'UserGroup', userId: number, groupId: number } };

export type QuitGroupByControlKeyMutationVariables = Exact<{
  userId: Scalars['Int'];
  groupId: Scalars['Int'];
  controlKey: Scalars['String'];
}>;


export type QuitGroupByControlKeyMutation = { __typename?: 'Mutation', quitGroupByControlKey: { __typename?: 'UserGroup', userId: number, groupId: number } };

export const UserFragmentDoc = gql`
    fragment User on User {
  id
  email
  firstName
  lastName
  address1
  address2
  zipCode
  city
  nationality
  countryOfResidence
  birthDate
  email2
  firstName2
  lastName2
  phone
  phone2
}
    `;
export const PlaceFragmentDoc = gql`
    fragment Place on Place {
  id
  name
  lat
  lng
  address1
  address2
  zipCode
  city
}
    `;
export const BaseUserFragmentDoc = gql`
    fragment BaseUser on User {
  id
  firstName
  lastName
  email
}
    `;
export const ContactUserFragmentDoc = gql`
    fragment ContactUser on User {
  phone
  address1
  address2
  zipCode
  city
  countryOfResidence
}
    `;
export const PartnerUserFragmentDoc = gql`
    fragment PartnerUser on User {
  firstName2
  lastName2
  email2
  phone2
}
    `;
export const NotificationsUserFragmentDoc = gql`
    fragment NotificationsUser on User {
  notifications {
    hasEmailNotif4h
    hasEmailNotif24h
    hasEmailNotifOuverture
  }
}
    `;
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    id
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    id
  }
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const RecordBadLoginDocument = gql`
    mutation RecordBadLogin {
  recordBadLogin
}
    `;
export type RecordBadLoginMutationFn = Apollo.MutationFunction<RecordBadLoginMutation, RecordBadLoginMutationVariables>;

/**
 * __useRecordBadLoginMutation__
 *
 * To run a mutation, you first call `useRecordBadLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordBadLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordBadLoginMutation, { data, loading, error }] = useRecordBadLoginMutation({
 *   variables: {
 *   },
 * });
 */
export function useRecordBadLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RecordBadLoginMutation, RecordBadLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RecordBadLoginMutation, RecordBadLoginMutationVariables>(RecordBadLoginDocument, options);
      }
export type RecordBadLoginMutationHookResult = ReturnType<typeof useRecordBadLoginMutation>;
export type RecordBadLoginMutationResult = Apollo.MutationResult<RecordBadLoginMutation>;
export type RecordBadLoginMutationOptions = Apollo.BaseMutationOptions<RecordBadLoginMutation, RecordBadLoginMutationVariables>;
export const LoginAsDocument = gql`
    mutation LoginAs($userId: Int!, $groupId: Int) {
  loginAs(userId: $userId, groupId: $groupId) {
    id
  }
}
    `;
export type LoginAsMutationFn = Apollo.MutationFunction<LoginAsMutation, LoginAsMutationVariables>;

/**
 * __useLoginAsMutation__
 *
 * To run a mutation, you first call `useLoginAsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginAsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginAsMutation, { data, loading, error }] = useLoginAsMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useLoginAsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginAsMutation, LoginAsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginAsMutation, LoginAsMutationVariables>(LoginAsDocument, options);
      }
export type LoginAsMutationHookResult = ReturnType<typeof useLoginAsMutation>;
export type LoginAsMutationResult = Apollo.MutationResult<LoginAsMutation>;
export type LoginAsMutationOptions = Apollo.BaseMutationOptions<LoginAsMutation, LoginAsMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    ...User
  }
}
    ${UserFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const GroupPreviewDocument = gql`
    query GroupPreview($id: Int!) {
  groupPreview(id: $id) {
    id
    name
  }
}
    `;

/**
 * __useGroupPreviewQuery__
 *
 * To run a query within a React component, call `useGroupPreviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupPreviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupPreviewQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupPreviewQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GroupPreviewQuery, GroupPreviewQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GroupPreviewQuery, GroupPreviewQueryVariables>(GroupPreviewDocument, options);
      }
export function useGroupPreviewLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GroupPreviewQuery, GroupPreviewQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GroupPreviewQuery, GroupPreviewQueryVariables>(GroupPreviewDocument, options);
        }
export type GroupPreviewQueryHookResult = ReturnType<typeof useGroupPreviewQuery>;
export type GroupPreviewLazyQueryHookResult = ReturnType<typeof useGroupPreviewLazyQuery>;
export type GroupPreviewQueryResult = Apollo.QueryResult<GroupPreviewQuery, GroupPreviewQueryVariables>;
export const PlaceDocument = gql`
    query place($id: Int!) {
  place(id: $id) {
    id
    name
    address1
    address2
    city
    zipCode
    lat
    lng
  }
}
    `;

/**
 * __usePlaceQuery__
 *
 * To run a query within a React component, call `usePlaceQuery` and pass it any options that fit your needs.
 * When your component renders, `usePlaceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePlaceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePlaceQuery(baseOptions: ApolloReactHooks.QueryHookOptions<PlaceQuery, PlaceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<PlaceQuery, PlaceQueryVariables>(PlaceDocument, options);
      }
export function usePlaceLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<PlaceQuery, PlaceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<PlaceQuery, PlaceQueryVariables>(PlaceDocument, options);
        }
export type PlaceQueryHookResult = ReturnType<typeof usePlaceQuery>;
export type PlaceLazyQueryHookResult = ReturnType<typeof usePlaceLazyQuery>;
export type PlaceQueryResult = Apollo.QueryResult<PlaceQuery, PlaceQueryVariables>;
export const IsGroupAdminDocument = gql`
    query isGroupAdmin($groupId: Int!) {
  isGroupAdmin(groupId: $groupId)
}
    `;

/**
 * __useIsGroupAdminQuery__
 *
 * To run a query within a React component, call `useIsGroupAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsGroupAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsGroupAdminQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useIsGroupAdminQuery(baseOptions: ApolloReactHooks.QueryHookOptions<IsGroupAdminQuery, IsGroupAdminQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<IsGroupAdminQuery, IsGroupAdminQueryVariables>(IsGroupAdminDocument, options);
      }
export function useIsGroupAdminLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<IsGroupAdminQuery, IsGroupAdminQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<IsGroupAdminQuery, IsGroupAdminQueryVariables>(IsGroupAdminDocument, options);
        }
export type IsGroupAdminQueryHookResult = ReturnType<typeof useIsGroupAdminQuery>;
export type IsGroupAdminLazyQueryHookResult = ReturnType<typeof useIsGroupAdminLazyQuery>;
export type IsGroupAdminQueryResult = Apollo.QueryResult<IsGroupAdminQuery, IsGroupAdminQueryVariables>;
export const AttendanceClassicContractDocument = gql`
    query AttendanceClassicContract($catalogId: Int!, $startDate: DateTime, $endDate: DateTime) {
  attendanceClassicContract(
    catalogId: $catalogId
    startDate: $startDate
    endDate: $endDate
  ) {
    catalog {
      id
      name
      startDate
      endDate
      user {
        id
        firstName
        lastName
        phone
        email
      }
      vendor {
        id
        name
        phone
        email
      }
      group {
        id
        name
        txtDistrib
      }
      products {
        id
        name
        unitType
        qt
      }
    }
    distributions {
      id
      date
      userOrders {
        id
        userId
        smartQt
        productId
        quantity
      }
    }
    subscriptions {
      id
      absentDistribIds
      user {
        id
        lastName
        firstName
        lastName2
        firstName2
        phone
      }
      user2 {
        id
        lastName
        firstName
        lastName2
        firstName2
        phone
      }
    }
  }
}
    `;

/**
 * __useAttendanceClassicContractQuery__
 *
 * To run a query within a React component, call `useAttendanceClassicContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttendanceClassicContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttendanceClassicContractQuery({
 *   variables: {
 *      catalogId: // value for 'catalogId'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useAttendanceClassicContractQuery(baseOptions: ApolloReactHooks.QueryHookOptions<AttendanceClassicContractQuery, AttendanceClassicContractQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AttendanceClassicContractQuery, AttendanceClassicContractQueryVariables>(AttendanceClassicContractDocument, options);
      }
export function useAttendanceClassicContractLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AttendanceClassicContractQuery, AttendanceClassicContractQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AttendanceClassicContractQuery, AttendanceClassicContractQueryVariables>(AttendanceClassicContractDocument, options);
        }
export type AttendanceClassicContractQueryHookResult = ReturnType<typeof useAttendanceClassicContractQuery>;
export type AttendanceClassicContractLazyQueryHookResult = ReturnType<typeof useAttendanceClassicContractLazyQuery>;
export type AttendanceClassicContractQueryResult = Apollo.QueryResult<AttendanceClassicContractQuery, AttendanceClassicContractQueryVariables>;
export const AttendanceVariableContractDocument = gql`
    query AttendanceVariableContract($catalogId: Int!, $distributionId: Int!) {
  attendanceVariableContract(
    catalogId: $catalogId
    distributionId: $distributionId
  ) {
    catalog {
      id
      name
      startDate
      endDate
      user {
        id
        firstName
        lastName
        phone
        email
      }
      vendor {
        id
        name
        phone
        email
      }
      group {
        id
        name
        txtDistrib
      }
    }
    subscriptions {
      id
      balance
      absentDistribIds
      user {
        id
        lastName
        firstName
        lastName2
        firstName2
        phone
      }
    }
    distribution {
      id
      date
      userOrders {
        id
        userId
        quantity
        smartQt
        subscriptionId
        productPrice
        product {
          id
          name
          qt
          unitType
          price
        }
      }
      multiDistrib {
        id
        volunteers {
          volunteerRole {
            id
            name
            catalogId
            groupId
          }
          user {
            id
            lastName
            firstName
            phone
            email
          }
        }
      }
    }
  }
}
    `;

/**
 * __useAttendanceVariableContractQuery__
 *
 * To run a query within a React component, call `useAttendanceVariableContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useAttendanceVariableContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAttendanceVariableContractQuery({
 *   variables: {
 *      catalogId: // value for 'catalogId'
 *      distributionId: // value for 'distributionId'
 *   },
 * });
 */
export function useAttendanceVariableContractQuery(baseOptions: ApolloReactHooks.QueryHookOptions<AttendanceVariableContractQuery, AttendanceVariableContractQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AttendanceVariableContractQuery, AttendanceVariableContractQueryVariables>(AttendanceVariableContractDocument, options);
      }
export function useAttendanceVariableContractLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AttendanceVariableContractQuery, AttendanceVariableContractQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AttendanceVariableContractQuery, AttendanceVariableContractQueryVariables>(AttendanceVariableContractDocument, options);
        }
export type AttendanceVariableContractQueryHookResult = ReturnType<typeof useAttendanceVariableContractQuery>;
export type AttendanceVariableContractLazyQueryHookResult = ReturnType<typeof useAttendanceVariableContractLazyQuery>;
export type AttendanceVariableContractQueryResult = Apollo.QueryResult<AttendanceVariableContractQuery, AttendanceVariableContractQueryVariables>;
export const GetCatalogSubscriptionsDocument = gql`
    query getCatalogSubscriptions($id: Int!) {
  catalog(id: $id) {
    id
    type
    name
    subscriptions {
      id
      user {
        id
        firstName
        lastName
      }
    }
  }
}
    `;

/**
 * __useGetCatalogSubscriptionsQuery__
 *
 * To run a query within a React component, call `useGetCatalogSubscriptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCatalogSubscriptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCatalogSubscriptionsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCatalogSubscriptionsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetCatalogSubscriptionsQuery, GetCatalogSubscriptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCatalogSubscriptionsQuery, GetCatalogSubscriptionsQueryVariables>(GetCatalogSubscriptionsDocument, options);
      }
export function useGetCatalogSubscriptionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCatalogSubscriptionsQuery, GetCatalogSubscriptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCatalogSubscriptionsQuery, GetCatalogSubscriptionsQueryVariables>(GetCatalogSubscriptionsDocument, options);
        }
export type GetCatalogSubscriptionsQueryHookResult = ReturnType<typeof useGetCatalogSubscriptionsQuery>;
export type GetCatalogSubscriptionsLazyQueryHookResult = ReturnType<typeof useGetCatalogSubscriptionsLazyQuery>;
export type GetCatalogSubscriptionsQueryResult = Apollo.QueryResult<GetCatalogSubscriptionsQuery, GetCatalogSubscriptionsQueryVariables>;
export const GroupDisabledDocument = gql`
    query groupDisabled($id: Int!) {
  groupPreview(id: $id) {
    id
    disabled
    extUrl
  }
  canManageAllCatalogs(groupId: $id)
}
    `;

/**
 * __useGroupDisabledQuery__
 *
 * To run a query within a React component, call `useGroupDisabledQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupDisabledQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupDisabledQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupDisabledQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GroupDisabledQuery, GroupDisabledQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GroupDisabledQuery, GroupDisabledQueryVariables>(GroupDisabledDocument, options);
      }
export function useGroupDisabledLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GroupDisabledQuery, GroupDisabledQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GroupDisabledQuery, GroupDisabledQueryVariables>(GroupDisabledDocument, options);
        }
export type GroupDisabledQueryHookResult = ReturnType<typeof useGroupDisabledQuery>;
export type GroupDisabledLazyQueryHookResult = ReturnType<typeof useGroupDisabledLazyQuery>;
export type GroupDisabledQueryResult = Apollo.QueryResult<GroupDisabledQuery, GroupDisabledQueryVariables>;
export const GetGroupsOnMapDocument = gql`
    query getGroupsOnMap($lat: Float, $lng: Float, $minLat: Float, $minLng: Float, $maxLat: Float, $maxLng: Float) {
  getGroupsOnMap(
    lat: $lat
    lng: $lng
    minLat: $minLat
    maxLat: $maxLat
    minLng: $minLng
    maxLng: $maxLng
  ) {
    id
    name
    image
    placeId
    place {
      ...Place
    }
  }
}
    ${PlaceFragmentDoc}`;

/**
 * __useGetGroupsOnMapQuery__
 *
 * To run a query within a React component, call `useGetGroupsOnMapQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupsOnMapQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupsOnMapQuery({
 *   variables: {
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      minLat: // value for 'minLat'
 *      minLng: // value for 'minLng'
 *      maxLat: // value for 'maxLat'
 *      maxLng: // value for 'maxLng'
 *   },
 * });
 */
export function useGetGroupsOnMapQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetGroupsOnMapQuery, GetGroupsOnMapQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetGroupsOnMapQuery, GetGroupsOnMapQueryVariables>(GetGroupsOnMapDocument, options);
      }
export function useGetGroupsOnMapLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetGroupsOnMapQuery, GetGroupsOnMapQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetGroupsOnMapQuery, GetGroupsOnMapQueryVariables>(GetGroupsOnMapDocument, options);
        }
export type GetGroupsOnMapQueryHookResult = ReturnType<typeof useGetGroupsOnMapQuery>;
export type GetGroupsOnMapLazyQueryHookResult = ReturnType<typeof useGetGroupsOnMapLazyQuery>;
export type GetGroupsOnMapQueryResult = Apollo.QueryResult<GetGroupsOnMapQuery, GetGroupsOnMapQueryVariables>;
export const SetProductImageDocument = gql`
    mutation setProductImage($productId: Int!, $base64EncodedImage: String!, $mimeType: String!, $fileName: String!, $maxWidth: Int!) {
  setProductImage(
    productId: $productId
    base64EncodedImage: $base64EncodedImage
    mimeType: $mimeType
    fileName: $fileName
    maxWidth: $maxWidth
  ) {
    id
  }
}
    `;
export type SetProductImageMutationFn = Apollo.MutationFunction<SetProductImageMutation, SetProductImageMutationVariables>;

/**
 * __useSetProductImageMutation__
 *
 * To run a mutation, you first call `useSetProductImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetProductImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setProductImageMutation, { data, loading, error }] = useSetProductImageMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *      base64EncodedImage: // value for 'base64EncodedImage'
 *      mimeType: // value for 'mimeType'
 *      fileName: // value for 'fileName'
 *      maxWidth: // value for 'maxWidth'
 *   },
 * });
 */
export function useSetProductImageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetProductImageMutation, SetProductImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetProductImageMutation, SetProductImageMutationVariables>(SetProductImageDocument, options);
      }
export type SetProductImageMutationHookResult = ReturnType<typeof useSetProductImageMutation>;
export type SetProductImageMutationResult = Apollo.MutationResult<SetProductImageMutation>;
export type SetProductImageMutationOptions = Apollo.BaseMutationOptions<SetProductImageMutation, SetProductImageMutationVariables>;
export const SetGroupImageDocument = gql`
    mutation setGroupImage($groupId: Int!, $base64EncodedImage: String!, $mimeType: String!, $fileName: String!, $maxWidth: Int!) {
  setGroupImage(
    groupId: $groupId
    base64EncodedImage: $base64EncodedImage
    mimeType: $mimeType
    fileName: $fileName
    maxWidth: $maxWidth
  ) {
    id
  }
}
    `;
export type SetGroupImageMutationFn = Apollo.MutationFunction<SetGroupImageMutation, SetGroupImageMutationVariables>;

/**
 * __useSetGroupImageMutation__
 *
 * To run a mutation, you first call `useSetGroupImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetGroupImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setGroupImageMutation, { data, loading, error }] = useSetGroupImageMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      base64EncodedImage: // value for 'base64EncodedImage'
 *      mimeType: // value for 'mimeType'
 *      fileName: // value for 'fileName'
 *      maxWidth: // value for 'maxWidth'
 *   },
 * });
 */
export function useSetGroupImageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetGroupImageMutation, SetGroupImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetGroupImageMutation, SetGroupImageMutationVariables>(SetGroupImageDocument, options);
      }
export type SetGroupImageMutationHookResult = ReturnType<typeof useSetGroupImageMutation>;
export type SetGroupImageMutationResult = Apollo.MutationResult<SetGroupImageMutation>;
export type SetGroupImageMutationOptions = Apollo.BaseMutationOptions<SetGroupImageMutation, SetGroupImageMutationVariables>;
export const SetVendorImageDocument = gql`
    mutation setVendorImage($vendorId: Int!, $base64EncodedImage: String!, $mimeType: String!, $fileName: String!, $maxWidth: Int!) {
  setVendorImage(
    vendorId: $vendorId
    base64EncodedImage: $base64EncodedImage
    mimeType: $mimeType
    fileName: $fileName
    maxWidth: $maxWidth
  ) {
    id
  }
}
    `;
export type SetVendorImageMutationFn = Apollo.MutationFunction<SetVendorImageMutation, SetVendorImageMutationVariables>;

/**
 * __useSetVendorImageMutation__
 *
 * To run a mutation, you first call `useSetVendorImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetVendorImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setVendorImageMutation, { data, loading, error }] = useSetVendorImageMutation({
 *   variables: {
 *      vendorId: // value for 'vendorId'
 *      base64EncodedImage: // value for 'base64EncodedImage'
 *      mimeType: // value for 'mimeType'
 *      fileName: // value for 'fileName'
 *      maxWidth: // value for 'maxWidth'
 *   },
 * });
 */
export function useSetVendorImageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetVendorImageMutation, SetVendorImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetVendorImageMutation, SetVendorImageMutationVariables>(SetVendorImageDocument, options);
      }
export type SetVendorImageMutationHookResult = ReturnType<typeof useSetVendorImageMutation>;
export type SetVendorImageMutationResult = Apollo.MutationResult<SetVendorImageMutation>;
export type SetVendorImageMutationOptions = Apollo.BaseMutationOptions<SetVendorImageMutation, SetVendorImageMutationVariables>;
export const GetInvitedUserToRegisterDocument = gql`
    query getInvitedUserToRegister($email: String!) {
  getInvitedUserToRegister(email: $email) {
    firstName
    lastName
    email
    phone
    address1
    address2
    zipCode
    city
    firstName2
    lastName2
    email2
    phone2
  }
}
    `;

/**
 * __useGetInvitedUserToRegisterQuery__
 *
 * To run a query within a React component, call `useGetInvitedUserToRegisterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitedUserToRegisterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitedUserToRegisterQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetInvitedUserToRegisterQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetInvitedUserToRegisterQuery, GetInvitedUserToRegisterQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetInvitedUserToRegisterQuery, GetInvitedUserToRegisterQueryVariables>(GetInvitedUserToRegisterDocument, options);
      }
export function useGetInvitedUserToRegisterLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetInvitedUserToRegisterQuery, GetInvitedUserToRegisterQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetInvitedUserToRegisterQuery, GetInvitedUserToRegisterQueryVariables>(GetInvitedUserToRegisterDocument, options);
        }
export type GetInvitedUserToRegisterQueryHookResult = ReturnType<typeof useGetInvitedUserToRegisterQuery>;
export type GetInvitedUserToRegisterLazyQueryHookResult = ReturnType<typeof useGetInvitedUserToRegisterLazyQuery>;
export type GetInvitedUserToRegisterQueryResult = Apollo.QueryResult<GetInvitedUserToRegisterQuery, GetInvitedUserToRegisterQueryVariables>;
export const IsEmailRegisteredDocument = gql`
    query isEmailRegistered($email: String!) {
  isEmailRegistered(email: $email)
}
    `;

/**
 * __useIsEmailRegisteredQuery__
 *
 * To run a query within a React component, call `useIsEmailRegisteredQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsEmailRegisteredQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsEmailRegisteredQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useIsEmailRegisteredQuery(baseOptions: ApolloReactHooks.QueryHookOptions<IsEmailRegisteredQuery, IsEmailRegisteredQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<IsEmailRegisteredQuery, IsEmailRegisteredQueryVariables>(IsEmailRegisteredDocument, options);
      }
export function useIsEmailRegisteredLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<IsEmailRegisteredQuery, IsEmailRegisteredQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<IsEmailRegisteredQuery, IsEmailRegisteredQueryVariables>(IsEmailRegisteredDocument, options);
        }
export type IsEmailRegisteredQueryHookResult = ReturnType<typeof useIsEmailRegisteredQuery>;
export type IsEmailRegisteredLazyQueryHookResult = ReturnType<typeof useIsEmailRegisteredLazyQuery>;
export type IsEmailRegisteredQueryResult = Apollo.QueryResult<IsEmailRegisteredQuery, IsEmailRegisteredQueryVariables>;
export const InitMembersDocument = gql`
    query initMembers($groupId: Int!) {
  me {
    ...User
  }
  groupPreviewMembers(id: $groupId) {
    membershipFee
    hasMembership
  }
  getUserLists(groupId: $groupId) {
    type
    count
    data
  }
}
    ${UserFragmentDoc}`;

/**
 * __useInitMembersQuery__
 *
 * To run a query within a React component, call `useInitMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useInitMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInitMembersQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useInitMembersQuery(baseOptions: ApolloReactHooks.QueryHookOptions<InitMembersQuery, InitMembersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<InitMembersQuery, InitMembersQueryVariables>(InitMembersDocument, options);
      }
export function useInitMembersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<InitMembersQuery, InitMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<InitMembersQuery, InitMembersQueryVariables>(InitMembersDocument, options);
        }
export type InitMembersQueryHookResult = ReturnType<typeof useInitMembersQuery>;
export type InitMembersLazyQueryHookResult = ReturnType<typeof useInitMembersLazyQuery>;
export type InitMembersQueryResult = Apollo.QueryResult<InitMembersQuery, InitMembersQueryVariables>;
export const GetMembersOfGroupByListTypeDocument = gql`
    query getMembersOfGroupByListType($listType: String!, $groupId: Int!, $data: String) {
  getUserListInGroupByListType(
    listType: $listType
    groupId: $groupId
    data: $data
  ) {
    id
    firstName
    lastName
    firstName2
    lastName2
    city
    zipCode
    address1
    address2
    email
    phone
    email2
    phone2
  }
}
    `;

/**
 * __useGetMembersOfGroupByListTypeQuery__
 *
 * To run a query within a React component, call `useGetMembersOfGroupByListTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMembersOfGroupByListTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMembersOfGroupByListTypeQuery({
 *   variables: {
 *      listType: // value for 'listType'
 *      groupId: // value for 'groupId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetMembersOfGroupByListTypeQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetMembersOfGroupByListTypeQuery, GetMembersOfGroupByListTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMembersOfGroupByListTypeQuery, GetMembersOfGroupByListTypeQueryVariables>(GetMembersOfGroupByListTypeDocument, options);
      }
export function useGetMembersOfGroupByListTypeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMembersOfGroupByListTypeQuery, GetMembersOfGroupByListTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMembersOfGroupByListTypeQuery, GetMembersOfGroupByListTypeQueryVariables>(GetMembersOfGroupByListTypeDocument, options);
        }
export type GetMembersOfGroupByListTypeQueryHookResult = ReturnType<typeof useGetMembersOfGroupByListTypeQuery>;
export type GetMembersOfGroupByListTypeLazyQueryHookResult = ReturnType<typeof useGetMembersOfGroupByListTypeLazyQuery>;
export type GetMembersOfGroupByListTypeQueryResult = Apollo.QueryResult<GetMembersOfGroupByListTypeQuery, GetMembersOfGroupByListTypeQueryVariables>;
export const GetWaitingListsOfGroupDocument = gql`
    query getWaitingListsOfGroup($groupId: Int!) {
  getWaitingListsOfGroup(groupId: $groupId) {
    user {
      id
      firstName
      lastName
      firstName2
      lastName2
      email
      phone
    }
    date
    message
  }
}
    `;

/**
 * __useGetWaitingListsOfGroupQuery__
 *
 * To run a query within a React component, call `useGetWaitingListsOfGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWaitingListsOfGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWaitingListsOfGroupQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetWaitingListsOfGroupQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetWaitingListsOfGroupQuery, GetWaitingListsOfGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetWaitingListsOfGroupQuery, GetWaitingListsOfGroupQueryVariables>(GetWaitingListsOfGroupDocument, options);
      }
export function useGetWaitingListsOfGroupLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetWaitingListsOfGroupQuery, GetWaitingListsOfGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetWaitingListsOfGroupQuery, GetWaitingListsOfGroupQueryVariables>(GetWaitingListsOfGroupDocument, options);
        }
export type GetWaitingListsOfGroupQueryHookResult = ReturnType<typeof useGetWaitingListsOfGroupQuery>;
export type GetWaitingListsOfGroupLazyQueryHookResult = ReturnType<typeof useGetWaitingListsOfGroupLazyQuery>;
export type GetWaitingListsOfGroupQueryResult = Apollo.QueryResult<GetWaitingListsOfGroupQuery, GetWaitingListsOfGroupQueryVariables>;
export const MoveBackToWaitingListDocument = gql`
    mutation moveBackToWaitingList($userIds: [Int!]!, $groupId: Int!, $message: String!) {
  moveBackToWaitingList(userIds: $userIds, groupId: $groupId, message: $message) {
    success {
      amapId
      userId
    }
    errors {
      userId
      message
    }
  }
}
    `;
export type MoveBackToWaitingListMutationFn = Apollo.MutationFunction<MoveBackToWaitingListMutation, MoveBackToWaitingListMutationVariables>;

/**
 * __useMoveBackToWaitingListMutation__
 *
 * To run a mutation, you first call `useMoveBackToWaitingListMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveBackToWaitingListMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveBackToWaitingListMutation, { data, loading, error }] = useMoveBackToWaitingListMutation({
 *   variables: {
 *      userIds: // value for 'userIds'
 *      groupId: // value for 'groupId'
 *      message: // value for 'message'
 *   },
 * });
 */
export function useMoveBackToWaitingListMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<MoveBackToWaitingListMutation, MoveBackToWaitingListMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<MoveBackToWaitingListMutation, MoveBackToWaitingListMutationVariables>(MoveBackToWaitingListDocument, options);
      }
export type MoveBackToWaitingListMutationHookResult = ReturnType<typeof useMoveBackToWaitingListMutation>;
export type MoveBackToWaitingListMutationResult = Apollo.MutationResult<MoveBackToWaitingListMutation>;
export type MoveBackToWaitingListMutationOptions = Apollo.BaseMutationOptions<MoveBackToWaitingListMutation, MoveBackToWaitingListMutationVariables>;
export const RemoveUsersFromGroupDocument = gql`
    mutation removeUsersFromGroup($userIds: [Int!]!, $groupId: Int!) {
  removeUsersFromGroup(userIds: $userIds, groupId: $groupId) {
    success {
      groupId
      userId
    }
    errors {
      userId
      message
    }
  }
}
    `;
export type RemoveUsersFromGroupMutationFn = Apollo.MutationFunction<RemoveUsersFromGroupMutation, RemoveUsersFromGroupMutationVariables>;

/**
 * __useRemoveUsersFromGroupMutation__
 *
 * To run a mutation, you first call `useRemoveUsersFromGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUsersFromGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUsersFromGroupMutation, { data, loading, error }] = useRemoveUsersFromGroupMutation({
 *   variables: {
 *      userIds: // value for 'userIds'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useRemoveUsersFromGroupMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RemoveUsersFromGroupMutation, RemoveUsersFromGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RemoveUsersFromGroupMutation, RemoveUsersFromGroupMutationVariables>(RemoveUsersFromGroupDocument, options);
      }
export type RemoveUsersFromGroupMutationHookResult = ReturnType<typeof useRemoveUsersFromGroupMutation>;
export type RemoveUsersFromGroupMutationResult = Apollo.MutationResult<RemoveUsersFromGroupMutation>;
export type RemoveUsersFromGroupMutationOptions = Apollo.BaseMutationOptions<RemoveUsersFromGroupMutation, RemoveUsersFromGroupMutationVariables>;
export const ApproveRequestDocument = gql`
    mutation approveRequest($userId: Int!, $groupId: Int!) {
  approveRequest(userId: $userId, groupId: $groupId) {
    userId
  }
}
    `;
export type ApproveRequestMutationFn = Apollo.MutationFunction<ApproveRequestMutation, ApproveRequestMutationVariables>;

/**
 * __useApproveRequestMutation__
 *
 * To run a mutation, you first call `useApproveRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveRequestMutation, { data, loading, error }] = useApproveRequestMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useApproveRequestMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ApproveRequestMutation, ApproveRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ApproveRequestMutation, ApproveRequestMutationVariables>(ApproveRequestDocument, options);
      }
export type ApproveRequestMutationHookResult = ReturnType<typeof useApproveRequestMutation>;
export type ApproveRequestMutationResult = Apollo.MutationResult<ApproveRequestMutation>;
export type ApproveRequestMutationOptions = Apollo.BaseMutationOptions<ApproveRequestMutation, ApproveRequestMutationVariables>;
export const CancelRequestDocument = gql`
    mutation cancelRequest($userId: Int!, $groupId: Int!) {
  cancelRequest(userId: $userId, groupId: $groupId) {
    userId
  }
}
    `;
export type CancelRequestMutationFn = Apollo.MutationFunction<CancelRequestMutation, CancelRequestMutationVariables>;

/**
 * __useCancelRequestMutation__
 *
 * To run a mutation, you first call `useCancelRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelRequestMutation, { data, loading, error }] = useCancelRequestMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useCancelRequestMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CancelRequestMutation, CancelRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CancelRequestMutation, CancelRequestMutationVariables>(CancelRequestDocument, options);
      }
export type CancelRequestMutationHookResult = ReturnType<typeof useCancelRequestMutation>;
export type CancelRequestMutationResult = Apollo.MutationResult<CancelRequestMutation>;
export type CancelRequestMutationOptions = Apollo.BaseMutationOptions<CancelRequestMutation, CancelRequestMutationVariables>;
export const CreateMembershipsDocument = gql`
    mutation createMemberships($input: CreateMembershipsInput!) {
  createMemberships(input: $input) {
    success {
      date
      amount
    }
    errors {
      userId
      message
    }
  }
}
    `;
export type CreateMembershipsMutationFn = Apollo.MutationFunction<CreateMembershipsMutation, CreateMembershipsMutationVariables>;

/**
 * __useCreateMembershipsMutation__
 *
 * To run a mutation, you first call `useCreateMembershipsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMembershipsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMembershipsMutation, { data, loading, error }] = useCreateMembershipsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMembershipsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateMembershipsMutation, CreateMembershipsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateMembershipsMutation, CreateMembershipsMutationVariables>(CreateMembershipsDocument, options);
      }
export type CreateMembershipsMutationHookResult = ReturnType<typeof useCreateMembershipsMutation>;
export type CreateMembershipsMutationResult = Apollo.MutationResult<CreateMembershipsMutation>;
export type CreateMembershipsMutationOptions = Apollo.BaseMutationOptions<CreateMembershipsMutation, CreateMembershipsMutationVariables>;
export const GetUsersFromEmailsDocument = gql`
    query getUsersFromEmails($emails: [String!]!) {
  getUsersFromEmails(emails: $emails) {
    id
    email
    email2
  }
}
    `;

/**
 * __useGetUsersFromEmailsQuery__
 *
 * To run a query within a React component, call `useGetUsersFromEmailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersFromEmailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersFromEmailsQuery({
 *   variables: {
 *      emails: // value for 'emails'
 *   },
 * });
 */
export function useGetUsersFromEmailsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUsersFromEmailsQuery, GetUsersFromEmailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUsersFromEmailsQuery, GetUsersFromEmailsQueryVariables>(GetUsersFromEmailsDocument, options);
      }
export function useGetUsersFromEmailsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUsersFromEmailsQuery, GetUsersFromEmailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUsersFromEmailsQuery, GetUsersFromEmailsQueryVariables>(GetUsersFromEmailsDocument, options);
        }
export type GetUsersFromEmailsQueryHookResult = ReturnType<typeof useGetUsersFromEmailsQuery>;
export type GetUsersFromEmailsLazyQueryHookResult = ReturnType<typeof useGetUsersFromEmailsLazyQuery>;
export type GetUsersFromEmailsQueryResult = Apollo.QueryResult<GetUsersFromEmailsQuery, GetUsersFromEmailsQueryVariables>;
export const SendInvitesToNewMembersDocument = gql`
    mutation sendInvitesToNewMembers($groupId: Int!, $withAccounts: [Int!]!, $withoutAccounts: [SendInvitesToNewMembersInput!]!) {
  sendInvitesToNewMembers(
    groupId: $groupId
    withAccounts: $withAccounts
    withoutAccounts: $withoutAccounts
  ) {
    withAccounts
    withoutAccounts
  }
}
    `;
export type SendInvitesToNewMembersMutationFn = Apollo.MutationFunction<SendInvitesToNewMembersMutation, SendInvitesToNewMembersMutationVariables>;

/**
 * __useSendInvitesToNewMembersMutation__
 *
 * To run a mutation, you first call `useSendInvitesToNewMembersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendInvitesToNewMembersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendInvitesToNewMembersMutation, { data, loading, error }] = useSendInvitesToNewMembersMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      withAccounts: // value for 'withAccounts'
 *      withoutAccounts: // value for 'withoutAccounts'
 *   },
 * });
 */
export function useSendInvitesToNewMembersMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SendInvitesToNewMembersMutation, SendInvitesToNewMembersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SendInvitesToNewMembersMutation, SendInvitesToNewMembersMutationVariables>(SendInvitesToNewMembersDocument, options);
      }
export type SendInvitesToNewMembersMutationHookResult = ReturnType<typeof useSendInvitesToNewMembersMutation>;
export type SendInvitesToNewMembersMutationResult = Apollo.MutationResult<SendInvitesToNewMembersMutation>;
export type SendInvitesToNewMembersMutationOptions = Apollo.BaseMutationOptions<SendInvitesToNewMembersMutation, SendInvitesToNewMembersMutationVariables>;
export const ImportAndCreateMembersDocument = gql`
    mutation importAndCreateMembers($groupId: Int!, $withAccounts: [Int!]!, $withoutAccounts: [SendInvitesToNewMembersInput!]!) {
  importAndCreateMembers(
    groupId: $groupId
    withAccounts: $withAccounts
    withoutAccounts: $withoutAccounts
  ) {
    withAccounts
    withoutAccounts
  }
}
    `;
export type ImportAndCreateMembersMutationFn = Apollo.MutationFunction<ImportAndCreateMembersMutation, ImportAndCreateMembersMutationVariables>;

/**
 * __useImportAndCreateMembersMutation__
 *
 * To run a mutation, you first call `useImportAndCreateMembersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useImportAndCreateMembersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [importAndCreateMembersMutation, { data, loading, error }] = useImportAndCreateMembersMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      withAccounts: // value for 'withAccounts'
 *      withoutAccounts: // value for 'withoutAccounts'
 *   },
 * });
 */
export function useImportAndCreateMembersMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ImportAndCreateMembersMutation, ImportAndCreateMembersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ImportAndCreateMembersMutation, ImportAndCreateMembersMutationVariables>(ImportAndCreateMembersDocument, options);
      }
export type ImportAndCreateMembersMutationHookResult = ReturnType<typeof useImportAndCreateMembersMutation>;
export type ImportAndCreateMembersMutationResult = Apollo.MutationResult<ImportAndCreateMembersMutation>;
export type ImportAndCreateMembersMutationOptions = Apollo.BaseMutationOptions<ImportAndCreateMembersMutation, ImportAndCreateMembersMutationVariables>;
export const GetUserMembershipsDocument = gql`
    query getUserMemberships($userId: Int!, $groupId: Int!) {
  getUserMemberships(userId: $userId, groupId: $groupId) {
    year
    name
    amount
    date
  }
}
    `;

/**
 * __useGetUserMembershipsQuery__
 *
 * To run a query within a React component, call `useGetUserMembershipsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserMembershipsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserMembershipsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetUserMembershipsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserMembershipsQuery, GetUserMembershipsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserMembershipsQuery, GetUserMembershipsQueryVariables>(GetUserMembershipsDocument, options);
      }
export function useGetUserMembershipsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserMembershipsQuery, GetUserMembershipsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserMembershipsQuery, GetUserMembershipsQueryVariables>(GetUserMembershipsDocument, options);
        }
export type GetUserMembershipsQueryHookResult = ReturnType<typeof useGetUserMembershipsQuery>;
export type GetUserMembershipsLazyQueryHookResult = ReturnType<typeof useGetUserMembershipsLazyQuery>;
export type GetUserMembershipsQueryResult = Apollo.QueryResult<GetUserMembershipsQuery, GetUserMembershipsQueryVariables>;
export const GetMembershipFormDataDocument = gql`
    query getMembershipFormData($userId: Int!, $groupId: Int!) {
  getMembershipFormData(userId: $userId, groupId: $groupId) {
    availableYears {
      name
      id
    }
    membershipFee
    distributions {
      id
      distribStartDate
    }
  }
}
    `;

/**
 * __useGetMembershipFormDataQuery__
 *
 * To run a query within a React component, call `useGetMembershipFormDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMembershipFormDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMembershipFormDataQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetMembershipFormDataQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetMembershipFormDataQuery, GetMembershipFormDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMembershipFormDataQuery, GetMembershipFormDataQueryVariables>(GetMembershipFormDataDocument, options);
      }
export function useGetMembershipFormDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMembershipFormDataQuery, GetMembershipFormDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMembershipFormDataQuery, GetMembershipFormDataQueryVariables>(GetMembershipFormDataDocument, options);
        }
export type GetMembershipFormDataQueryHookResult = ReturnType<typeof useGetMembershipFormDataQuery>;
export type GetMembershipFormDataLazyQueryHookResult = ReturnType<typeof useGetMembershipFormDataLazyQuery>;
export type GetMembershipFormDataQueryResult = Apollo.QueryResult<GetMembershipFormDataQuery, GetMembershipFormDataQueryVariables>;
export const CreateMembershipDocument = gql`
    mutation createMembership($input: CreateMembershipInput!) {
  createMembership(input: $input) {
    date
    amount
  }
}
    `;
export type CreateMembershipMutationFn = Apollo.MutationFunction<CreateMembershipMutation, CreateMembershipMutationVariables>;

/**
 * __useCreateMembershipMutation__
 *
 * To run a mutation, you first call `useCreateMembershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMembershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMembershipMutation, { data, loading, error }] = useCreateMembershipMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMembershipMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateMembershipMutation, CreateMembershipMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateMembershipMutation, CreateMembershipMutationVariables>(CreateMembershipDocument, options);
      }
export type CreateMembershipMutationHookResult = ReturnType<typeof useCreateMembershipMutation>;
export type CreateMembershipMutationResult = Apollo.MutationResult<CreateMembershipMutation>;
export type CreateMembershipMutationOptions = Apollo.BaseMutationOptions<CreateMembershipMutation, CreateMembershipMutationVariables>;
export const DeleteMembershipDocument = gql`
    mutation deleteMembership($userId: Int!, $groupId: Int!, $year: Int!) {
  deleteMembership(userId: $userId, groupId: $groupId, year: $year)
}
    `;
export type DeleteMembershipMutationFn = Apollo.MutationFunction<DeleteMembershipMutation, DeleteMembershipMutationVariables>;

/**
 * __useDeleteMembershipMutation__
 *
 * To run a mutation, you first call `useDeleteMembershipMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMembershipMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMembershipMutation, { data, loading, error }] = useDeleteMembershipMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useDeleteMembershipMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteMembershipMutation, DeleteMembershipMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteMembershipMutation, DeleteMembershipMutationVariables>(DeleteMembershipDocument, options);
      }
export type DeleteMembershipMutationHookResult = ReturnType<typeof useDeleteMembershipMutation>;
export type DeleteMembershipMutationResult = Apollo.MutationResult<DeleteMembershipMutation>;
export type DeleteMembershipMutationOptions = Apollo.BaseMutationOptions<DeleteMembershipMutation, DeleteMembershipMutationVariables>;
export const InitMessagingServiceDocument = gql`
    query initMessagingService($id: Int!) {
  me {
    ...User
  }
  groupPreview(id: $id) {
    id
    name
  }
  getUserLists(groupId: $id) {
    type
    count
    data
  }
}
    ${UserFragmentDoc}`;

/**
 * __useInitMessagingServiceQuery__
 *
 * To run a query within a React component, call `useInitMessagingServiceQuery` and pass it any options that fit your needs.
 * When your component renders, `useInitMessagingServiceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useInitMessagingServiceQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useInitMessagingServiceQuery(baseOptions: ApolloReactHooks.QueryHookOptions<InitMessagingServiceQuery, InitMessagingServiceQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<InitMessagingServiceQuery, InitMessagingServiceQueryVariables>(InitMessagingServiceDocument, options);
      }
export function useInitMessagingServiceLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<InitMessagingServiceQuery, InitMessagingServiceQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<InitMessagingServiceQuery, InitMessagingServiceQueryVariables>(InitMessagingServiceDocument, options);
        }
export type InitMessagingServiceQueryHookResult = ReturnType<typeof useInitMessagingServiceQuery>;
export type InitMessagingServiceLazyQueryHookResult = ReturnType<typeof useInitMessagingServiceLazyQuery>;
export type InitMessagingServiceQueryResult = Apollo.QueryResult<InitMessagingServiceQuery, InitMessagingServiceQueryVariables>;
export const GetLatestMessagesDocument = gql`
    query GetLatestMessages {
  getLatestMessages {
    date
    slateContent
    title
    attachments {
      ... on EmbeddedImageAttachment {
        cid
        content
      }
      ... on OtherAttachment {
        fileName
      }
    }
    group {
      name
    }
  }
}
    `;

/**
 * __useGetLatestMessagesQuery__
 *
 * To run a query within a React component, call `useGetLatestMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLatestMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLatestMessagesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetLatestMessagesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetLatestMessagesQuery, GetLatestMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetLatestMessagesQuery, GetLatestMessagesQueryVariables>(GetLatestMessagesDocument, options);
      }
export function useGetLatestMessagesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetLatestMessagesQuery, GetLatestMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetLatestMessagesQuery, GetLatestMessagesQueryVariables>(GetLatestMessagesDocument, options);
        }
export type GetLatestMessagesQueryHookResult = ReturnType<typeof useGetLatestMessagesQuery>;
export type GetLatestMessagesLazyQueryHookResult = ReturnType<typeof useGetLatestMessagesLazyQuery>;
export type GetLatestMessagesQueryResult = Apollo.QueryResult<GetLatestMessagesQuery, GetLatestMessagesQueryVariables>;
export const ContractsUserListsDocument = gql`
    query ContractsUserLists($groupId: Int!) {
  getContractsUserLists(groupId: $groupId) {
    count
    type
    data
  }
}
    `;

/**
 * __useContractsUserListsQuery__
 *
 * To run a query within a React component, call `useContractsUserListsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContractsUserListsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContractsUserListsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useContractsUserListsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ContractsUserListsQuery, ContractsUserListsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ContractsUserListsQuery, ContractsUserListsQueryVariables>(ContractsUserListsDocument, options);
      }
export function useContractsUserListsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ContractsUserListsQuery, ContractsUserListsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ContractsUserListsQuery, ContractsUserListsQueryVariables>(ContractsUserListsDocument, options);
        }
export type ContractsUserListsQueryHookResult = ReturnType<typeof useContractsUserListsQuery>;
export type ContractsUserListsLazyQueryHookResult = ReturnType<typeof useContractsUserListsLazyQuery>;
export type ContractsUserListsQueryResult = Apollo.QueryResult<ContractsUserListsQuery, ContractsUserListsQueryVariables>;
export const DistributionsUserListsDocument = gql`
    query DistributionsUserLists($groupId: Int!) {
  getDistributionsUserLists(groupId: $groupId) {
    count
    type
    data
  }
}
    `;

/**
 * __useDistributionsUserListsQuery__
 *
 * To run a query within a React component, call `useDistributionsUserListsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDistributionsUserListsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDistributionsUserListsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useDistributionsUserListsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<DistributionsUserListsQuery, DistributionsUserListsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<DistributionsUserListsQuery, DistributionsUserListsQueryVariables>(DistributionsUserListsDocument, options);
      }
export function useDistributionsUserListsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<DistributionsUserListsQuery, DistributionsUserListsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<DistributionsUserListsQuery, DistributionsUserListsQueryVariables>(DistributionsUserListsDocument, options);
        }
export type DistributionsUserListsQueryHookResult = ReturnType<typeof useDistributionsUserListsQuery>;
export type DistributionsUserListsLazyQueryHookResult = ReturnType<typeof useDistributionsUserListsLazyQuery>;
export type DistributionsUserListsQueryResult = Apollo.QueryResult<DistributionsUserListsQuery, DistributionsUserListsQueryVariables>;
export const GetUserListInGroupByListTypeDocument = gql`
    query getUserListInGroupByListType($listType: String!, $groupId: Int!, $data: String) {
  getUserListInGroupByListType(
    listType: $listType
    groupId: $groupId
    data: $data
  ) {
    id
    firstName
    lastName
    firstName2
    lastName2
    email
    email2
  }
}
    `;

/**
 * __useGetUserListInGroupByListTypeQuery__
 *
 * To run a query within a React component, call `useGetUserListInGroupByListTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserListInGroupByListTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserListInGroupByListTypeQuery({
 *   variables: {
 *      listType: // value for 'listType'
 *      groupId: // value for 'groupId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useGetUserListInGroupByListTypeQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserListInGroupByListTypeQuery, GetUserListInGroupByListTypeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserListInGroupByListTypeQuery, GetUserListInGroupByListTypeQueryVariables>(GetUserListInGroupByListTypeDocument, options);
      }
export function useGetUserListInGroupByListTypeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserListInGroupByListTypeQuery, GetUserListInGroupByListTypeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserListInGroupByListTypeQuery, GetUserListInGroupByListTypeQueryVariables>(GetUserListInGroupByListTypeDocument, options);
        }
export type GetUserListInGroupByListTypeQueryHookResult = ReturnType<typeof useGetUserListInGroupByListTypeQuery>;
export type GetUserListInGroupByListTypeLazyQueryHookResult = ReturnType<typeof useGetUserListInGroupByListTypeLazyQuery>;
export type GetUserListInGroupByListTypeQueryResult = Apollo.QueryResult<GetUserListInGroupByListTypeQuery, GetUserListInGroupByListTypeQueryVariables>;
export const CreateMessageDocument = gql`
    mutation createMessage($input: CreateMessageInput!) {
  createMessage(input: $input) {
    id
  }
}
    `;
export type CreateMessageMutationFn = Apollo.MutationFunction<CreateMessageMutation, CreateMessageMutationVariables>;

/**
 * __useCreateMessageMutation__
 *
 * To run a mutation, you first call `useCreateMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMessageMutation, { data, loading, error }] = useCreateMessageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateMessageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateMessageMutation, CreateMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateMessageMutation, CreateMessageMutationVariables>(CreateMessageDocument, options);
      }
export type CreateMessageMutationHookResult = ReturnType<typeof useCreateMessageMutation>;
export type CreateMessageMutationResult = Apollo.MutationResult<CreateMessageMutation>;
export type CreateMessageMutationOptions = Apollo.BaseMutationOptions<CreateMessageMutation, CreateMessageMutationVariables>;
export const GetMessagesForGroupDocument = gql`
    query GetMessagesForGroup($groupId: Int!) {
  getMessagesForGroup(groupId: $groupId) {
    id
    title
    date
  }
}
    `;

/**
 * __useGetMessagesForGroupQuery__
 *
 * To run a query within a React component, call `useGetMessagesForGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessagesForGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessagesForGroupQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetMessagesForGroupQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetMessagesForGroupQuery, GetMessagesForGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMessagesForGroupQuery, GetMessagesForGroupQueryVariables>(GetMessagesForGroupDocument, options);
      }
export function useGetMessagesForGroupLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMessagesForGroupQuery, GetMessagesForGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMessagesForGroupQuery, GetMessagesForGroupQueryVariables>(GetMessagesForGroupDocument, options);
        }
export type GetMessagesForGroupQueryHookResult = ReturnType<typeof useGetMessagesForGroupQuery>;
export type GetMessagesForGroupLazyQueryHookResult = ReturnType<typeof useGetMessagesForGroupLazyQuery>;
export type GetMessagesForGroupQueryResult = Apollo.QueryResult<GetMessagesForGroupQuery, GetMessagesForGroupQueryVariables>;
export const GetUserMessagesForGroupDocument = gql`
    query GetUserMessagesForGroup($groupId: Int!) {
  getUserMessagesForGroup(groupId: $groupId) {
    id
    title
    date
  }
}
    `;

/**
 * __useGetUserMessagesForGroupQuery__
 *
 * To run a query within a React component, call `useGetUserMessagesForGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserMessagesForGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserMessagesForGroupQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetUserMessagesForGroupQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserMessagesForGroupQuery, GetUserMessagesForGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserMessagesForGroupQuery, GetUserMessagesForGroupQueryVariables>(GetUserMessagesForGroupDocument, options);
      }
export function useGetUserMessagesForGroupLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserMessagesForGroupQuery, GetUserMessagesForGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserMessagesForGroupQuery, GetUserMessagesForGroupQueryVariables>(GetUserMessagesForGroupDocument, options);
        }
export type GetUserMessagesForGroupQueryHookResult = ReturnType<typeof useGetUserMessagesForGroupQuery>;
export type GetUserMessagesForGroupLazyQueryHookResult = ReturnType<typeof useGetUserMessagesForGroupLazyQuery>;
export type GetUserMessagesForGroupQueryResult = Apollo.QueryResult<GetUserMessagesForGroupQuery, GetUserMessagesForGroupQueryVariables>;
export const GetMessageByIdDocument = gql`
    query GetMessageById($id: Int!) {
  message(id: $id) {
    id
    title
    date
    recipientListId
    sender {
      id
      firstName
      lastName
    }
    slateContent
    recipients
    attachments {
      ... on EmbeddedImageAttachment {
        cid
        content
      }
      ... on OtherAttachment {
        fileName
      }
    }
  }
}
    `;

/**
 * __useGetMessageByIdQuery__
 *
 * To run a query within a React component, call `useGetMessageByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessageByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessageByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMessageByIdQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetMessageByIdQuery, GetMessageByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetMessageByIdQuery, GetMessageByIdQueryVariables>(GetMessageByIdDocument, options);
      }
export function useGetMessageByIdLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMessageByIdQuery, GetMessageByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetMessageByIdQuery, GetMessageByIdQueryVariables>(GetMessageByIdDocument, options);
        }
export type GetMessageByIdQueryHookResult = ReturnType<typeof useGetMessageByIdQuery>;
export type GetMessageByIdLazyQueryHookResult = ReturnType<typeof useGetMessageByIdLazyQuery>;
export type GetMessageByIdQueryResult = Apollo.QueryResult<GetMessageByIdQuery, GetMessageByIdQueryVariables>;
export const GetActiveCatalogsPicturesDocument = gql`
    query getActiveCatalogsPictures($groupId: Int!) {
  getActiveCatalogs(groupId: $groupId) {
    id
    vendor {
      id
      name
      image
    }
  }
}
    `;

/**
 * __useGetActiveCatalogsPicturesQuery__
 *
 * To run a query within a React component, call `useGetActiveCatalogsPicturesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveCatalogsPicturesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveCatalogsPicturesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetActiveCatalogsPicturesQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetActiveCatalogsPicturesQuery, GetActiveCatalogsPicturesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetActiveCatalogsPicturesQuery, GetActiveCatalogsPicturesQueryVariables>(GetActiveCatalogsPicturesDocument, options);
      }
export function useGetActiveCatalogsPicturesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetActiveCatalogsPicturesQuery, GetActiveCatalogsPicturesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetActiveCatalogsPicturesQuery, GetActiveCatalogsPicturesQueryVariables>(GetActiveCatalogsPicturesDocument, options);
        }
export type GetActiveCatalogsPicturesQueryHookResult = ReturnType<typeof useGetActiveCatalogsPicturesQuery>;
export type GetActiveCatalogsPicturesLazyQueryHookResult = ReturnType<typeof useGetActiveCatalogsPicturesLazyQuery>;
export type GetActiveCatalogsPicturesQueryResult = Apollo.QueryResult<GetActiveCatalogsPicturesQuery, GetActiveCatalogsPicturesQueryVariables>;
export const GetActiveVendorsFromGroupDocument = gql`
    query getActiveVendorsFromGroup($groupId: Int!) {
  getActiveVendorsFromGroup(groupId: $groupId) {
    id
    name
    email
    id
  }
}
    `;

/**
 * __useGetActiveVendorsFromGroupQuery__
 *
 * To run a query within a React component, call `useGetActiveVendorsFromGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveVendorsFromGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveVendorsFromGroupQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetActiveVendorsFromGroupQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetActiveVendorsFromGroupQuery, GetActiveVendorsFromGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetActiveVendorsFromGroupQuery, GetActiveVendorsFromGroupQueryVariables>(GetActiveVendorsFromGroupDocument, options);
      }
export function useGetActiveVendorsFromGroupLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetActiveVendorsFromGroupQuery, GetActiveVendorsFromGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetActiveVendorsFromGroupQuery, GetActiveVendorsFromGroupQueryVariables>(GetActiveVendorsFromGroupDocument, options);
        }
export type GetActiveVendorsFromGroupQueryHookResult = ReturnType<typeof useGetActiveVendorsFromGroupQuery>;
export type GetActiveVendorsFromGroupLazyQueryHookResult = ReturnType<typeof useGetActiveVendorsFromGroupLazyQuery>;
export type GetActiveVendorsFromGroupQueryResult = Apollo.QueryResult<GetActiveVendorsFromGroupQuery, GetActiveVendorsFromGroupQueryVariables>;
export const DeleteAccountDocument = gql`
    mutation DeleteAccount($userId: Int!, $password: String!) {
  deleteAccount(userId: $userId, password: $password)
}
    `;
export type DeleteAccountMutationFn = Apollo.MutationFunction<DeleteAccountMutation, DeleteAccountMutationVariables>;

/**
 * __useDeleteAccountMutation__
 *
 * To run a mutation, you first call `useDeleteAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAccountMutation, { data, loading, error }] = useDeleteAccountMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useDeleteAccountMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteAccountMutation, DeleteAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteAccountMutation, DeleteAccountMutationVariables>(DeleteAccountDocument, options);
      }
export type DeleteAccountMutationHookResult = ReturnType<typeof useDeleteAccountMutation>;
export type DeleteAccountMutationResult = Apollo.MutationResult<DeleteAccountMutation>;
export type DeleteAccountMutationOptions = Apollo.BaseMutationOptions<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const GetUserFromControlKeyDocument = gql`
    query getUserFromControlKey($id: Int!, $controlKey: String!, $groupId: Int) {
  getUserFromControlKey(id: $id, controlKey: $controlKey, groupId: $groupId) {
    ... on User {
      ...BaseUser
      ...NotificationsUser
      ...PartnerUser
    }
  }
}
    ${BaseUserFragmentDoc}
${NotificationsUserFragmentDoc}
${PartnerUserFragmentDoc}`;

/**
 * __useGetUserFromControlKeyQuery__
 *
 * To run a query within a React component, call `useGetUserFromControlKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserFromControlKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserFromControlKeyQuery({
 *   variables: {
 *      id: // value for 'id'
 *      controlKey: // value for 'controlKey'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetUserFromControlKeyQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetUserFromControlKeyQuery, GetUserFromControlKeyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetUserFromControlKeyQuery, GetUserFromControlKeyQueryVariables>(GetUserFromControlKeyDocument, options);
      }
export function useGetUserFromControlKeyLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserFromControlKeyQuery, GetUserFromControlKeyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetUserFromControlKeyQuery, GetUserFromControlKeyQueryVariables>(GetUserFromControlKeyDocument, options);
        }
export type GetUserFromControlKeyQueryHookResult = ReturnType<typeof useGetUserFromControlKeyQuery>;
export type GetUserFromControlKeyLazyQueryHookResult = ReturnType<typeof useGetUserFromControlKeyLazyQuery>;
export type GetUserFromControlKeyQueryResult = Apollo.QueryResult<GetUserFromControlKeyQuery, GetUserFromControlKeyQueryVariables>;
export const UserAccountDocument = gql`
    query UserAccount {
  me {
    ...BaseUser
    birthDate
    nationality
    ...ContactUser
    ...PartnerUser
    ...NotificationsUser
  }
  myGroups {
    id
    name
    hasAddressRequired
    hasPhoneRequired
  }
}
    ${BaseUserFragmentDoc}
${ContactUserFragmentDoc}
${PartnerUserFragmentDoc}
${NotificationsUserFragmentDoc}`;

/**
 * __useUserAccountQuery__
 *
 * To run a query within a React component, call `useUserAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserAccountQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserAccountQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UserAccountQuery, UserAccountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UserAccountQuery, UserAccountQueryVariables>(UserAccountDocument, options);
      }
export function useUserAccountLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UserAccountQuery, UserAccountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UserAccountQuery, UserAccountQueryVariables>(UserAccountDocument, options);
        }
export type UserAccountQueryHookResult = ReturnType<typeof useUserAccountQuery>;
export type UserAccountLazyQueryHookResult = ReturnType<typeof useUserAccountLazyQuery>;
export type UserAccountQueryResult = Apollo.QueryResult<UserAccountQuery, UserAccountQueryVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    ... on User {
      ...BaseUser
      birthDate
      nationality
      ...ContactUser
      ...PartnerUser
      ...NotificationsUser
    }
    ... on MailAlreadyInUseError {
      __typename
    }
  }
}
    ${BaseUserFragmentDoc}
${ContactUserFragmentDoc}
${PartnerUserFragmentDoc}
${NotificationsUserFragmentDoc}`;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserNotificationsDocument = gql`
    mutation UpdateUserNotifications($input: UpdateUserNotificationsInput!) {
  updateUserNotifications(input: $input) {
    ... on User {
      ...BaseUser
      birthDate
      nationality
      ...ContactUser
      ...PartnerUser
      ...NotificationsUser
    }
  }
}
    ${BaseUserFragmentDoc}
${ContactUserFragmentDoc}
${PartnerUserFragmentDoc}
${NotificationsUserFragmentDoc}`;
export type UpdateUserNotificationsMutationFn = Apollo.MutationFunction<UpdateUserNotificationsMutation, UpdateUserNotificationsMutationVariables>;

/**
 * __useUpdateUserNotificationsMutation__
 *
 * To run a mutation, you first call `useUpdateUserNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserNotificationsMutation, { data, loading, error }] = useUpdateUserNotificationsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserNotificationsMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateUserNotificationsMutation, UpdateUserNotificationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateUserNotificationsMutation, UpdateUserNotificationsMutationVariables>(UpdateUserNotificationsDocument, options);
      }
export type UpdateUserNotificationsMutationHookResult = ReturnType<typeof useUpdateUserNotificationsMutation>;
export type UpdateUserNotificationsMutationResult = Apollo.MutationResult<UpdateUserNotificationsMutation>;
export type UpdateUserNotificationsMutationOptions = Apollo.BaseMutationOptions<UpdateUserNotificationsMutation, UpdateUserNotificationsMutationVariables>;
export const QuitGroupDocument = gql`
    mutation quitGroup($groupId: Int!) {
  quitGroup(groupId: $groupId) {
    userId
    groupId
  }
}
    `;
export type QuitGroupMutationFn = Apollo.MutationFunction<QuitGroupMutation, QuitGroupMutationVariables>;

/**
 * __useQuitGroupMutation__
 *
 * To run a mutation, you first call `useQuitGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useQuitGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [quitGroupMutation, { data, loading, error }] = useQuitGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useQuitGroupMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<QuitGroupMutation, QuitGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<QuitGroupMutation, QuitGroupMutationVariables>(QuitGroupDocument, options);
      }
export type QuitGroupMutationHookResult = ReturnType<typeof useQuitGroupMutation>;
export type QuitGroupMutationResult = Apollo.MutationResult<QuitGroupMutation>;
export type QuitGroupMutationOptions = Apollo.BaseMutationOptions<QuitGroupMutation, QuitGroupMutationVariables>;
export const QuitGroupByControlKeyDocument = gql`
    mutation quitGroupByControlKey($userId: Int!, $groupId: Int!, $controlKey: String!) {
  quitGroupByControlKey(
    groupId: $groupId
    userId: $userId
    controlKey: $controlKey
  ) {
    userId
    groupId
  }
}
    `;
export type QuitGroupByControlKeyMutationFn = Apollo.MutationFunction<QuitGroupByControlKeyMutation, QuitGroupByControlKeyMutationVariables>;

/**
 * __useQuitGroupByControlKeyMutation__
 *
 * To run a mutation, you first call `useQuitGroupByControlKeyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useQuitGroupByControlKeyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [quitGroupByControlKeyMutation, { data, loading, error }] = useQuitGroupByControlKeyMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *      controlKey: // value for 'controlKey'
 *   },
 * });
 */
export function useQuitGroupByControlKeyMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<QuitGroupByControlKeyMutation, QuitGroupByControlKeyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<QuitGroupByControlKeyMutation, QuitGroupByControlKeyMutationVariables>(QuitGroupByControlKeyDocument, options);
      }
export type QuitGroupByControlKeyMutationHookResult = ReturnType<typeof useQuitGroupByControlKeyMutation>;
export type QuitGroupByControlKeyMutationResult = Apollo.MutationResult<QuitGroupByControlKeyMutation>;
export type QuitGroupByControlKeyMutationOptions = Apollo.BaseMutationOptions<QuitGroupByControlKeyMutation, QuitGroupByControlKeyMutationVariables>;