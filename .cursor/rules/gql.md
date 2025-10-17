# GraphQL Rules

## Code Generation
- Frontend API and hooks are auto-generated with `npm run gql:gen`
- **Always run codegen after GraphQL changes**

## Module Organization
- Module-specific queries go in separate `.gql` files named after the module
- Keep queries organized by feature/domain