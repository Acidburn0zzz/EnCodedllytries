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
import {CodenvyPermissions} from '../../components/api/codenvy-permissions.factory';


/**
 * This class is fetch and handling the user permission data for organizations
 *
 * @author Oleksii Orel
 */
export class OrganizationsPermissionService {

  /**
   * Permissions API interaction.
   */
  private codenvyPermissions: CodenvyPermissions;
  /**
   * User API interaction.
   */
  private cheUser: any;
  /**
   * User id.
   */
  private userId: string;

  private fetchingMap: Map<string, ng.IPromise<any>> = new Map();

  /**
   * @ngInject for Dependency injection
   */
  constructor(codenvyPermissions: CodenvyPermissions, cheUser: any) {
    this.codenvyPermissions = codenvyPermissions;
    this.cheUser = cheUser;

    let user = this.cheUser.getUser();
    if (user) {
      this.userId = user.id;
    } else {
      this.cheUser.fetchUser().then((user: codenvy.IUser) => {
        this.userId = user.userId;
      });
    }
  }

  fetchPermissions(organizationId: string): ng.IPromise<any> {
    if (this.fetchingMap.get(organizationId)) {
      return this.fetchingMap.get(organizationId);
    }
    let promise = this.codenvyPermissions.fetchOrganizationPermissions(organizationId);
    this.fetchingMap.set(organizationId, promise);
    promise.finally(() => {
      this.fetchingMap.delete(organizationId);
    });
  }

  /**
   * Checks whether user is allowed to perform pointed action.
   *
   * @param action {string} action
   * @param organizationId {string} organization id
   * @returns {boolean} <code>true</code> if allowed
   */
  isUserAllowedTo(action: string, organizationId: string): boolean {
    if (!organizationId || !action) {
      return false;
    }
    let permissions = this.codenvyPermissions.getOrganizationPermissions(organizationId);
    if (!permissions) {
      this.fetchPermissions(organizationId);
      return false;
    }
    return !angular.isUndefined(permissions.find((permission: codenvy.IPermissions) => {
      return permission.userId === this.userId && permission.actions.indexOf(action.toString()) !== -1;
    }));
  }
}
