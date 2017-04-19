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
import {CodenvyOrganization} from '../../components/api/codenvy-organizations.factory';
import {CodenvyPermissions} from '../../components/api/codenvy-permissions.factory';

/**
 * @ngdoc controller
 * @name organizations.controller:OrganizationsController
 * @description This class is handling the controller for organizations
 * @author Oleksii Orel
 */
export class OrganizationsController {
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * Service for displaying notifications.
   */
  private cheNotification: any;
  /**
   * Loading state of the page.
   */
  private isInfoLoading: boolean;
  /**
   * List of organizations.
   */
  private organizations: Array<any> = [];
  /**
   * Max items for page.
   */
  private maxItems: number;
  /**
   * Has admin user service.
   */
  private hasAdminUserService: boolean;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(codenvyOrganization: CodenvyOrganization, cheNotification: any,
              $q: ng.IQService, codenvyPermissions: CodenvyPermissions) {
    this.codenvyOrganization = codenvyOrganization;
    this.cheNotification = cheNotification;
    this.$q = $q;

    this.hasAdminUserService = codenvyPermissions.getUserServices().hasAdminUserService;
    this.organizations = codenvyOrganization.getOrganizations();
    this.maxItems = 6;
    this.fetchOrganizations();
  }

  /**
   * Fetches the list of root organizations.
   */
  fetchOrganizations(): void {
    this.isInfoLoading = true;
    this.codenvyOrganization.fetchOrganizations(this.maxItems).then(() => {
      this.isInfoLoading = false;
    }, (error: any) => {
      this.isInfoLoading = false;
      let message = error.data && error.data.message ? error.data.message : 'Failed to retrieve organizations.';
      this.cheNotification.showError(message);
    });
  }

  /**
   * Gets the list of organizations.
   *
   * @returns {Array<codenvy.IOrganization>}
   */
  getOrganizations(): Array<codenvy.IOrganization> {
    return this.organizations;
  }
}
