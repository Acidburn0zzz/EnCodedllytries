/*
 *  [2015] - [2017] Codenvy, S.A.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Codenvy S.A. and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Codenvy S.A.
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Codenvy S.A..
 */
'use strict';

/**
 * This is class of organization actions.
 *
 * @author Oleksii Orel
 */
export class CodenvyOrganizationActions {
  static get UPDATE(): string {
    return 'update';
  }
  static get DELETE(): string {
    return 'delete';
  }
  static get SET_PERMISSIONS(): string {
    return 'setPermissions';
  }
  static get MANAGE_RESOURCES(): string {
    return 'manageResources';
  }
  static get CREATE_WORKSPACES(): string {
    return 'createWorkspaces';
  }
  static get MANAGE_WORKSPACES(): string {
    return 'manageWorkspaces';
  }
  static get MANAGE_SUB_ORGANIZATION(): string {
    return 'manageSuborganizations';
  }
}
