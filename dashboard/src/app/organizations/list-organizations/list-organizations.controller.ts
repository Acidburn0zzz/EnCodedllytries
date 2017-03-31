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
import {CodenvyOrganization} from '../../../components/api/codenvy-organizations.factory';
import {CodenvyResourceLimits} from '../../../components/api/codenvy-resource-limits';
import {CodenvyPermissions} from '../../../components/api/codenvy-permissions.factory';
import {CodenvyResourcesDistribution} from '../../../components/api/codenvy-resources-distribution.factory';
import {OrganizationsPermissionService} from '../organizations-permission.service';
import {CodenvyOrganizationActions} from '../../../components/api/codenvy-organization-actions';


/**
 * @ngdoc controller
 * @name organizations.list.controller:ListOrganizationsController
 * @description This class is handling the controller for listing the organizations
 * @author Oleksii Orel
 */
export class ListOrganizationsController {
  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * Service for displaying notifications.
   */
  private cheNotification: any;
  /**
   * Service for displaying dialogs.
   */
  private confirmDialogService: any;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Permissions service.
   */
  private codenvyPermissions: CodenvyPermissions;
  /**
   * Resources distribution service.
   */
  private codenvyResourcesDistribution: CodenvyResourcesDistribution;
  /**
   * Organization permission service.
   */
  private organizationsPermissionService: OrganizationsPermissionService;
  /**
   * List of organizations.
   */
  private organizations: Array<any>;
  /**
   * Map of organization members.
   */
  private organizationMembers: Map<string, number>;
  /**
   * Map of organization total resources.
   */
  private organizationTotalResources: Map<string, any>;
  /**
   * Map of organization available resources.
   */
  private organizationAvailableResources: Map<string, any>;
  /**
   * Selected status of organizations in the list.
   */
  private organizationsSelectedStatus: { [organizationId: string]: boolean; };
  /**
   * Loading state of the page.
   */
  private isLoading: boolean;
  /**
   * Bulk operation checked state.
   */
  private isBulkChecked: boolean;
  /**
   * No selected workspace state.
   */
  private isNoSelected: boolean;
  /**
   * All selected workspace state.
   */
  private isAllSelected: boolean;
  /**
   * On update function.
   */
  private onUpdate: Function;

  /**
   * Parent organization name.
   */
  private parentName: string;
  /**
   * User order by.
   */
  private userOrderBy: string;
  /**
   * Organization filter.
   */
  private organizationFilter: Object;
  /**
   * User services.
   */
  private userServices: codenvy.IUserServices;
  /**
   * Has Manage permission
   */
  private hasManagePermission: boolean;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($q: ng.IQService, $scope: ng.IScope, codenvyPermissions: CodenvyPermissions, codenvyResourcesDistribution: CodenvyResourcesDistribution, codenvyOrganization: CodenvyOrganization, cheNotification: any, confirmDialogService: any, $route: ng.route.IRouteService, organizationsPermissionService: OrganizationsPermissionService) {
    this.$q = $q;
    this.cheNotification = cheNotification;
    this.codenvyPermissions = codenvyPermissions;
    this.codenvyOrganization = codenvyOrganization;
    this.confirmDialogService = confirmDialogService;
    this.codenvyResourcesDistribution = codenvyResourcesDistribution;

    this.parentName = $route.current.params.organizationName;
    this.isNoSelected = true;
    this.userOrderBy = 'name';
    this.organizationFilter = {name: ''};
    this.organizationsSelectedStatus = {};

    this.userServices = this.codenvyPermissions.getUserServices();
    this.organizationsPermissionService = organizationsPermissionService;

    $scope.$watch(() => {
      return this.organizations;
    }, () => {
      this.processOrganizations();
    });
    this.processOrganizations();
  }

  /**
   * Process organization - retrieving additional data.
   */
  processOrganizations(): void {
    if (this.parentName) {
      let parentOrganization = this.codenvyOrganization.getOrganizations().find((organization: codenvy.IOrganization) => {
        return organization.qualifiedName === this.parentName;
      });
      if (!parentOrganization) {
        this.hasManagePermission = false;
      } else {
        this.codenvyPermissions.fetchOrganizationPermissions(parentOrganization.id).then(() => {
          this.hasManagePermission = this.organizationsPermissionService.isUserAllowedTo(CodenvyOrganizationActions.MANAGE_SUB_ORGANIZATION, parentOrganization.id);
        });
      }
    } else {
      this.hasManagePermission = this.userServices.hasAdminUserService;
    }
    if (this.organizations && this.organizations.length) {
      this.organizationMembers = new Map();
      this.organizationTotalResources = new Map();
      this.organizationAvailableResources = new Map();
      let promises = [];
      this.isLoading = true;
      this.organizations.forEach((organization: codenvy.IOrganization) => {
        let promiseMembers = this.codenvyPermissions.fetchOrganizationPermissions(organization.id).then(() => {
          this.organizationMembers.set(organization.id, this.codenvyPermissions.getOrganizationPermissions(organization.id).length);
        });
        promises.push(promiseMembers);
        let promiseTotalResource = this.codenvyResourcesDistribution.fetchTotalOrganizationResources(organization.id).then(() => {
          this.processTotalResource(organization.id);
        });
        promises.push(promiseTotalResource);

        let promiseAvailableResource = this.codenvyResourcesDistribution.fetchAvailableOrganizationResources(organization.id).then(() => {
          this.processAvailableResource(organization.id);
        });
        promises.push(promiseAvailableResource);
      });
      this.$q.all(promises).finally(() => {
        this.isLoading = false;
      });
    }
  }

  /**
   * Process total organization resources.
   *
   * @param organizationId organization's id
   */
  processTotalResource(organizationId: string): void {
    let ramLimit = this.codenvyResourcesDistribution.getOrganizationTotalResourceByType(organizationId, CodenvyResourceLimits.RAM);
    this.organizationTotalResources.set(organizationId, ramLimit ? ramLimit.amount : undefined);
  }

  /**
   * Process available organization resources.
   *
   * @param organizationId organization's id
   */
  processAvailableResource(organizationId: string): void {
    let ramLimit = this.codenvyResourcesDistribution.getOrganizationAvailableResourceByType(organizationId, CodenvyResourceLimits.RAM);
    this.organizationAvailableResources.set(organizationId, ramLimit ? ramLimit.amount : undefined);
  }

  /**
   * Returns the number of organization's members.
   *
   * @param organizationId organization's id
   * @returns {any} number of organization members to display
   */
  getMembersCount(organizationId: string): any {
    if (this.organizationMembers && this.organizationMembers.size > 0) {
      return this.organizationMembers.get(organizationId) || '-';
    }
    return '-';
  }

  /**
   * Returns the total RAM of the organization.
   *
   * @param organizationId organization's id
   * @returns {any}
   */
  getTotalRAM(organizationId: string): any {
    if (this.organizationTotalResources && this.organizationTotalResources.size > 0) {
      let ram = this.organizationTotalResources.get(organizationId);
      return ram ? (ram / 1024) : null;
    }
    return null;
  }

  /**
   * Returns the available RAM of the organization.
   *
   * @param organizationId organization's id
   * @returns {any}
   */
  getAvailableRAM(organizationId: string): any {
    if (this.organizationAvailableResources && this.organizationAvailableResources.size > 0) {
      let ram = this.organizationAvailableResources.get(organizationId);
      return ram ? (ram / 1024) : null;
    }
    return null;
  }

  /**
   * return true if all organizations in list are checked
   * @returns {boolean}
   */
  isAllOrganizationsSelected(): boolean {
    return this.isAllSelected;
  }

  /**
   * returns true if all organizations in list are not checked
   * @returns {boolean}
   */
  isNoOrganizationsSelected(): boolean {
    return this.isNoSelected;
  }

  /**
   * Check all organizations in list
   */
  selectAllOrganizations(): void {
    this.organizations.forEach((organization: codenvy.IOrganization) => {
      this.organizationsSelectedStatus[organization.id] = true;
    });
  }

  /**
   * Uncheck all organizations in list
   */
  deselectAllOrganizations(): void {
    Object.keys(this.organizationsSelectedStatus).forEach((key: string) => {
      this.organizationsSelectedStatus[key] = false;
    });
  }

  /**
   * Change bulk selection value
   */
  changeBulkSelection(): void {
    if (this.isBulkChecked) {
      this.deselectAllOrganizations();
      this.isBulkChecked = false;
    } else {
      this.selectAllOrganizations();
      this.isBulkChecked = true;
    }
    this.updateSelectedStatus();
  }

  /**
   * Update organization selected status
   */
  updateSelectedStatus(): void {
    this.isNoSelected = true;
    this.isAllSelected = true;

    Object.keys(this.organizationsSelectedStatus).forEach((key: string) => {
      if (this.organizationsSelectedStatus[key]) {
        this.isNoSelected = false;
      } else {
        this.isAllSelected = false;
      }
    });

    if (this.isNoSelected) {
      this.isBulkChecked = false;
      return;
    }

    if (this.isAllSelected) {
      this.isBulkChecked = true;
    }
  }

  /**
   * Delete all selected organizations.
   */
  deleteSelectedOrganizations(): void {
    let organizationsSelectedStatusKeys = Object.keys(this.organizationsSelectedStatus);
    let checkedOrganizationKeys = [];

    if (!organizationsSelectedStatusKeys.length) {
      this.cheNotification.showError('No such organization.');
      return;
    }

    organizationsSelectedStatusKeys.forEach((key: string) => {
      if (this.organizationsSelectedStatus[key] === true) {
        checkedOrganizationKeys.push(key);
      }
    });

    if (!checkedOrganizationKeys.length) {
      this.cheNotification.showError('No such organization.');
      return;
    }

    let confirmationPromise = this._showDeleteOrganizationConfirmation(checkedOrganizationKeys.length);
    confirmationPromise.then(() => {
      let promises = [];

      checkedOrganizationKeys.forEach((organizationId: string) => {
        this.organizationsSelectedStatus[organizationId] = false;

        let promise = this.codenvyOrganization.deleteOrganization(organizationId).catch((error: any) => {
          let errorMessage = 'Failed to delete organization ' + organizationId + '.';
          this.cheNotification.showError(error && error.data && error.data.message ? error.data.message : errorMessage);
        });

        promises.push(promise);
      });

      this.$q.all(promises).finally(() => {
        if (typeof this.onUpdate !== 'undefined') {
          this.onUpdate();
        }
        this.updateSelectedStatus();
      });
    });
  }

  /**
   * Show confirmation popup before organization deletion.
   *
   * @param numberToDelete number of organization to be deleted
   * @returns {ng.IPromise<any>}
   */
  _showDeleteOrganizationConfirmation(numberToDelete: number): ng.IPromise<any> {
    let content = 'Would you like to delete ';
    if (numberToDelete > 1) {
      content += 'these ' + numberToDelete + ' organizations?';
    } else {
      content += 'this selected organization?';
    }

    return this.confirmDialogService.showConfirmDialog('Delete organizations', content, 'Delete');
  }

}
