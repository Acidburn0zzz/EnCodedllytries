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
 * This class is providing a builder for Permissions
 *
 * @autor Oleksii Kurinnyi
 */
export class CodenvyPermissionsBuilder {

  private permissions: codenvy.IPermissions;

  /**
   * Default constructor
   */
  constructor() {
    this.permissions = {
      actions: [],
      domainId: '',
      instanceId: '',
      userId: ''
    };
  }

  /**
   * Sets actions of the permissions
   *
   * @param {string[]} id user ID
   * @return {CodenvyPermissionsBuilder}
   */
  withActions(actions: string[]): CodenvyPermissionsBuilder {
    this.permissions.actions = actions;
    return this;
  }
  /**
   * Sets the user ID of the permissions
   *
   * @param {string} id user ID
   * @return {CodenvyPermissionsBuilder}
   */
  withUserId(id: string): CodenvyPermissionsBuilder {
    this.permissions.userId = id;
    return this;
  }

  /**
   * Sets the instance ID of the permissions
   *
   * @param {string} id instance ID
   * @return {CodenvyPermissionsBuilder}
   */
  withInstanceId(id: string): CodenvyPermissionsBuilder {
    this.permissions.instanceId = id;
    return this;
  }

  /**
   * Sets the domain ID of the permissions
   *
   * @param {string} id domain ID
   * @return {CodenvyPermissionsBuilder}
   */
  withDomainId(id: string): CodenvyPermissionsBuilder {
    this.permissions.domainId = id;
    return this;
  }

  /**
   * Build the permissions
   *
   * @return {codenvy.IOrganization}
   */
  build(): codenvy.IPermissions {
    return this.permissions;
  }

}
