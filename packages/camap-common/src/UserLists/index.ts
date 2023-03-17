export type UserListsType =
  | 'all'
  | 'test'
  | 'admins'
  | 'hasNoOrders'
  | 'hasOrders'
  | 'noMembership'
  | 'membership'
  | 'contractSubscribers'
  | 'newUsers'
  | 'waitingList'
  | 'withCommandInNextDistribution'
  | 'noCommandInNextDistribution'
  | 'withRunningContract'
  | 'withProductToGetOnDistribution'
  | 'catalogsContacts'
  | 'freeList'
  | 'vendors';

export class UserLists {
  static readonly ALL = new UserLists('all');

  static readonly TEST = new UserLists('test');

  static readonly ADMINS = new UserLists('admins');

  static readonly NO_ORDERS = new UserLists('hasNoOrders');

  static readonly WITH_ORDERS = new UserLists('hasOrders');

  static readonly MEMBERSHIP_TO_BE_RENEWED = new UserLists('noMembership');

  static readonly VALID_MEMBERSHIP = new UserLists('membership');

  static readonly CONTRACT_SUBSCRIBERS = new UserLists('contractSubscribers');

  static readonly NEW_USERS = new UserLists('newUsers');

  static readonly WAITING_LIST = new UserLists('waitingList');

  static readonly WITH_COMMAND_IN_NEXT_DISTRIBUTION = new UserLists('withCommandInNextDistribution');

  static readonly NO_COMMAND_IN_NEXT_DISTRIBUTION = new UserLists('noCommandInNextDistribution');

  static readonly WITH_PRODUCT_TO_GET_ON_DISTRIBUTION = new UserLists('withProductToGetOnDistribution');

  static readonly WITH_RUNNING_CONTRACT = new UserLists('withRunningContract');

  static readonly CATALOGS_CONTACTS = new UserLists('catalogsContacts');

  static readonly FREE_LIST = new UserLists('freeList');

  static readonly VENDORS = new UserLists('vendors');

  private data?: any;

  constructor(public readonly type: UserListsType) {}

  static getLists() {
    return [
      UserLists.ALL,
      UserLists.ADMINS,
      UserLists.CATALOGS_CONTACTS,
      UserLists.NO_ORDERS,
      UserLists.WITH_ORDERS,
      UserLists.NEW_USERS,
      UserLists.MEMBERSHIP_TO_BE_RENEWED,
      UserLists.VALID_MEMBERSHIP,
      UserLists.WAITING_LIST,
      UserLists.CONTRACT_SUBSCRIBERS,
      UserLists.WITH_COMMAND_IN_NEXT_DISTRIBUTION,
      UserLists.NO_COMMAND_IN_NEXT_DISTRIBUTION,
      UserLists.WITH_RUNNING_CONTRACT,
      UserLists.WITH_PRODUCT_TO_GET_ON_DISTRIBUTION,
    ];
  }

  static getListByType(type: UserListsType): UserLists | undefined {
    switch (type) {
      case 'all':
        return UserLists.ALL;
      case 'admins':
        return UserLists.ADMINS;
      case 'test':
        return UserLists.TEST;
      case 'hasNoOrders':
        return UserLists.NO_ORDERS;
      case 'hasOrders':
        return UserLists.WITH_ORDERS;
      case 'noMembership':
        return UserLists.MEMBERSHIP_TO_BE_RENEWED;
      case 'membership':
        return UserLists.VALID_MEMBERSHIP;
      case 'waitingList':
        return UserLists.WAITING_LIST;
      case 'contractSubscribers':
        return UserLists.CONTRACT_SUBSCRIBERS;
      case 'withCommandInNextDistribution':
        return UserLists.WITH_COMMAND_IN_NEXT_DISTRIBUTION;
      case 'noCommandInNextDistribution':
        return UserLists.NO_COMMAND_IN_NEXT_DISTRIBUTION;
      case 'withRunningContract':
        return UserLists.WITH_RUNNING_CONTRACT;
      case 'withProductToGetOnDistribution':
        return UserLists.WITH_PRODUCT_TO_GET_ON_DISTRIBUTION;
      case 'freeList':
        return UserLists.FREE_LIST;
      case 'newUsers':
        return UserLists.NEW_USERS;
      case 'catalogsContacts':
        return UserLists.CATALOGS_CONTACTS;
      case 'vendors':
        return UserLists.VENDORS;
      default:
        return undefined;
    }
  }

  static isDynamic(type: UserListsType): boolean {
    return type === 'contractSubscribers' || type === 'withProductToGetOnDistribution';
  }

  setData(data: any) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}
