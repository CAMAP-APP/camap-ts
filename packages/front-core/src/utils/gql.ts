export type Stub<T extends { __typename?: string; id: string | number }> = {
    __typename?: T['__typename'];
    id: T['id'];
};