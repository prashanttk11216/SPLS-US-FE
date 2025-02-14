export interface PermissionType {
    resource: string;
    actions: string[];
}

export interface Role {
    _id: string;
    name: string;
    permissions: PermissionType[];
}

/**
 * Checks if a user has the required permission.
 * 
 * @param userRoles - An array of roles assigned to the user.
 * @param resource - The resource to check permission for (e.g., "loads", "customers").
 * @param action - The action to check (e.g., "view", "create", "edit").
 * @returns {boolean} - Returns true if the user has permission, otherwise false.
 */
export const hasAccess = (
    userRoles: Role[], // Expect populated user roles
    options: { roles?: string[]; permission?: { resource: string; action: string } }
  ): boolean => {
    if (!userRoles || userRoles.length === 0) return false;
  
    // Check for role match
    if (options.roles) {
      if (options.roles.some(roleName => userRoles.some(role => role.name === roleName))) {
        return true;
      }
    }
  
    // Check for permission match
    if (options.permission) {
      const { resource, action } = options.permission;
      return userRoles.some(role =>
        role.permissions.some(permission =>
          permission.resource === resource && permission.actions.includes(action)
        )
      );
    }
  
    return false;
  };
  
