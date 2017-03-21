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
import {OrganizationsItemController} from './list-organizations/organizations-item/organizations-item.controller';
import {OrganizationsItem} from './list-organizations/organizations-item/organizations-item.directive';
import {ListOrganizationsController} from './list-organizations/list-organizations.controller';
import {ListOrganizations} from './list-organizations/list-organizations.directive';
import {OrganizationsController} from './organizations.controller';
import {CreateOrganizationController} from './create-organizations/create-organizations.controller';
import {OrganizationDetailsController} from './organization-details/organization-details.controller';
import {ListOrganizationMembersController} from './organization-details/organization-members/list-organization-members.controller';
import {ListOrganizationInviteMembersController} from './organization-details/organization-invite-members/list-organization-invite-members.controller';
import {ListOrganizationInviteMembers} from './organization-details/organization-invite-members/list-organization-invite-members.directive';
import {ListOrganizationMembers} from './organization-details/organization-members/list-organization-members.directive';
import {OrganizationMemberDialogController} from './organization-details/organization-member-dialog/organization-member-dialog.controller';
import {CodenvyOrganization} from '../../components/api/codenvy-organizations.factory';
import {OrganizationsPermissionService} from './organizations-permission.service';

/**
 * The configuration of teams, defines controllers, directives and routing.
 *
 * @author Oleksii Orel
 */
export class OrganizationsConfig {

  constructor(register: any) {
    register.controller('OrganizationsController', OrganizationsController);

    register.controller('OrganizationDetailsController', OrganizationDetailsController);

    register.controller('OrganizationsItemController', OrganizationsItemController);
    register.directive('organizationsItem', OrganizationsItem);

    register.controller('ListOrganizationMembersController', ListOrganizationMembersController);
    register.directive('listOrganizationMembers', ListOrganizationMembers);

    register.directive('listOrganizationInviteMembers', ListOrganizationInviteMembers);
    register.controller('ListOrganizationInviteMembersController', ListOrganizationInviteMembersController);

    register.controller('OrganizationMemberDialogController', OrganizationMemberDialogController);

    register.controller('CreateOrganizationController', CreateOrganizationController);

    register.controller('ListOrganizationsController', ListOrganizationsController);
    register.directive('listOrganizations', ListOrganizations);

    register.service('organizationsPermissionService', OrganizationsPermissionService);

    let fetchOrganization = ($q: ng.IQService, codenvyOrganization: CodenvyOrganization) => {
      let defer = $q.defer();
      codenvyOrganization.fetchOrganizations().then(() => {
        defer.resolve();
      }, (error: any) => {
        // resolve it to show 'not found page' in case with error
        defer.resolve();
      });

      return defer.promise;
    };

    let organizationDetailsLocationProvider = {
      title: (params: any) => {
        return params.organizationName;
      },
      reloadOnSearch: false,
      templateUrl: 'app/organizations/organization-details/organization-details.html',
      controller: 'OrganizationDetailsController',
      controllerAs: 'organizationDetailsController',
      resolve: {
        check: ['$q', 'codenvyOrganization', fetchOrganization]
      }
    };

    let createOrganizationLocationProvider = {
      title: 'New Organization',
      templateUrl: 'app/organizations/create-organizations/create-organizations.html',
      controller: 'CreateOrganizationController',
      controllerAs: 'createOrganizationController',
      resolve: {
        check: ['$q', 'codenvyOrganization', fetchOrganization]
      }
    };

    // config routes
    register.app.config(($routeProvider: any) => {
      $routeProvider.accessWhen('/organizations', {
        title: 'organizations',
        templateUrl: 'app/organizations/organizations.html',
        controller: 'OrganizationsController',
        controllerAs: 'organizationsController'
      })
        .accessWhen('/admin/create-organization', createOrganizationLocationProvider)
        .accessWhen('/admin/create-organization/:parentQualifiedName*', createOrganizationLocationProvider)
        .accessWhen('/organization/:organizationName*', organizationDetailsLocationProvider);
    });
  }
}
