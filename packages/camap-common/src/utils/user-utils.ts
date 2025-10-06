/* please keep consistent with methods found on db.User in camap-hx */

export const formatLastName = (lastName: string) => lastName.toUpperCase()
export const formatFirstName = (firstName:string) => firstName.substring(0, 1).toUpperCase() + firstName.substring(1);
export const formatUserName = (user: { firstName:string, lastName:string }) => `${formatLastName(user.lastName)} ${formatFirstName(user.firstName)}`;
export const formatUserName2 = ({ firstName2: firstName, lastName2: lastName }: { firstName2:string, lastName2:string }) => formatUserName({ firstName, lastName });
export const formatCoupleName = (userOrCouple: { firstName:string, lastName:string, firstName2?: string | null, lastName2?: string | null }, separator: string = "/") => `${formatUserName(userOrCouple)}${
    userOrCouple.firstName2 != null
    ? ` ${separator} ${(
        userOrCouple.lastName2 != null && userOrCouple.lastName2 != userOrCouple.lastName
        ? formatUserName({ firstName: userOrCouple.firstName2, lastName: userOrCouple.lastName2 })
        : formatFirstName( userOrCouple.firstName2 )
    )}`
    : ''
}`;
export const userSortKey = (user: { lastName: string, firstName: string }) => `${user.lastName} ${user.firstName}`.toUpperCase();
export const userSortCompare = (a: { lastName: string, firstName: string }, b: { lastName: string, firstName: string }) => userSortKey(a) < userSortKey(b) ? -1 : 1