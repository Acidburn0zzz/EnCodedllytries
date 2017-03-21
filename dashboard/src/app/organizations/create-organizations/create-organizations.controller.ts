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
import {CodenvyPermissions} from '../../../components/api/codenvy-permissions.factory';
import {CodenvyUser} from '../../../components/api/codenvy-user.factory';
import {CodenvyOrganization} from '../../../components/api/codenvy-organizations.factory';

/**
 * @ngdoc controller
 * @name organizations.create.controller:CreateOrganizationController
 * @description This class is handling the controller for the new organization creation.
 * @author Oleksii Orel
 */
export class CreateOrganizationController {
  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * User API interaction.
   */
  private codenvyUser: CodenvyUser;
  /**
   * Permissions API interaction.
   */
  private codenvyPermissions: CodenvyPermissions;
  /**
   * Notifications service.
   */
  private cheNotification: any;
  /**
   * Location service.
   */
  private $location: ng.ILocationService;
  /**
   * Log service.
   */
  private $log: ng.ILogService;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Current organization's name.
   */
  private organizationName: string;
  /**
   * Loading state of the page.
   */
  private isLoading: boolean;
  /**
   * The list of users to invite.
   */
  private members: Array<codenvy.IMember>;
  /**
   * Parent organization name.
   */
  private parentQualifiedName: string;
  /**
   * Parent organization id.
   */
  private parentId: string;

  /**
   * Default constructor
   * @ngInject for Dependency injection
   */
  constructor(codenvyOrganization: CodenvyOrganization, codenvyUser: CodenvyUser, codenvyPermissions: CodenvyPermissions, cheNotification: any,
              $location: ng.ILocationService, $q: ng.IQService, $log: ng.ILogService, $route: ng.route.IRouteService) {
    this.codenvyOrganization = codenvyOrganization;
    this.codenvyUser = codenvyUser;
    this.codenvyPermissions = codenvyPermissions;
    this.cheNotification = cheNotification;
    this.$location = $location;
    this.$q = $q;
    this.$log = $log;

    this.organizationName = '';
    this.isLoading = false;
    this.members = [];

    this.parentQualifiedName = $route.current.params.parentQualifiedName;
    if (this.parentQualifiedName) {
      let organizations = this.codenvyOrganization.getOrganizations();
      let parentOrganization = organizations.find((organization: codenvy.IOrganization) => {
        return organization.qualifiedName === this.parentQualifiedName;
      });
      this.parentId = parentOrganization ? parentOrganization.id : '';

    }
  }

  /**
   * Check if the name is unique.
   * @param name
   * @returns {boolean}
   */
  isUniqueName(name: string): boolean {
    let organizations = this.codenvyOrganization.getOrganizations();
    let account = this.parentQualifiedName ? this.parentQualifiedName + '/' : '';
    if (!organizations.length) {
      return true;
    } else {
      for (let i = 0; i < organizations.length; i++) {
        if (organizations[i].qualifiedName === account + name) {
          return false;
        }
      }
      return true;
    }
  }

  /**
   * Performs new organization creation.
   */
  createOrganization(): void {
    this.isLoading = true;
    this.codenvyOrganization.createOrganization(this.organizationName, this.parentId).then((organization: codenvy.IOrganization) => {
      this.addPermissions(organization, this.members);
      this.codenvyOrganization.fetchOrganizations();
    }, (error: any) => {
      this.isLoading = false;
      let message = error.data && error.data.message ? error.data.message : 'Failed to create organization ' + this.organizationName + '.';
      this.cheNotification.showError(message);
    });
  }

  /**
   * Add permissions for members in pointed organization.
   *
   * @param organization {codenvy.IOrganization} organization
   * @param members members to be added to organization
   */
  addPermissions(organization: codenvy.IOrganization, members: Array<any>) {
    let promises = [];
    members.forEach((member: codenvy.IMember) => {
      if (member.id) {
        let actions = this.codenvyOrganization.getActionsFromRoles(member.roles);
        let permissions = {
          instanceId: organization.id,
          userId: member.id,
          domainId: 'organization',
          actions: actions
        };

        let promise = this.codenvyPermissions.storePermissions(permissions);
        promises.push(promise);
      }
    });

    this.$q.all(promises).then(() => {
      this.isLoading = false;
      this.$location.path('/organization/' + organization.qualifiedName);
    }, (error: any) => {
      this.isLoading = false;
      let message = error.data && error.data.message ? error.data.message : 'Failed to create organization ' + this.organizationName + '.';
      this.cheNotification.showError(message);
    });
  }
}
