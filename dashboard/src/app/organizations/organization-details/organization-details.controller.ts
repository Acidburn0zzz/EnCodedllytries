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
import {CodenvyResourcesDistribution} from '../../../components/api/codenvy-resources-distribution.factory';
import {CodenvyResourceLimits} from '../../../components/api/codenvy-resource-limits';
import {CodenvyPermissions} from '../../../components/api/codenvy-permissions.factory';
import {CodenvyUser} from '../../../components/api/codenvy-user.factory';
import {CodenvyOrganization} from '../../../components/api/codenvy-organizations.factory';
import {OrganizationsPermissionService} from '../organizations-permission.service';
import {CodenvyOrganizationActions} from '../../../components/api/codenvy-organization-actions';

enum Tab {Settings, Members, Organization}

/**
 * Controller for a managing organization details.
 *
 * @author Oleksii Orel
 */
export class OrganizationDetailsController {
  tab: Object = Tab;

  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * Organization resources API interaction.
   */
  private codenvyResourcesDistribution: CodenvyResourcesDistribution;
  /**
   * Permissions API interaction.
   */
  private codenvyPermissions: CodenvyPermissions;
  /**
   * User API interaction.
   */
  private codenvyUser: CodenvyUser;
  /**
   * Notifications service.
   */
  private cheNotification: any;
  /**
   * Location service.
   */
  private $location: ng.ILocationService;
  /**
   * Route service.
   */
  private $route: ng.route.IRouteService;
  /**
   * Service for displaying dialogs.
   */
  private confirmDialogService: any;
  /**
   * Lodash library.
   */
  private lodash: any;
  /**
   * Current organization's name. Comes from route path params.
   */
  private organizationName: string;
  /**
   * Current organization's data.
   */
  private organization: codenvy.IOrganization;
  /**
   * The list of allowed user actions.
   */
  private allowedUserActions: Array<string>;
  /**
   * New organization's name (for renaming widget).
   */
  private newName: string;
  /**
   * Index of the selected tab.
   */
  private selectedTabIndex: number;
  /**
   * Organization limits.
   */
  private limits: any;
  /**
   * Copy of limits before letting to modify, to be able to compare.
   */
  private limitsCopy: any;
  /**
   * Page loading state.
   */
  private isLoading: boolean;

  private organizationForm: ng.IFormController;

  private subOrganizations: Array<any> = [];

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor(codenvyResourcesDistribution: CodenvyResourcesDistribution, codenvyPermissions: CodenvyPermissions,
              codenvyUser: CodenvyUser, $route: ng.route.IRouteService, $location: ng.ILocationService, $rootScope: che.IRootScopeService,
              $scope: ng.IScope, confirmDialogService: any, cheNotification: any,
              lodash: any, codenvyOrganization: CodenvyOrganization) {
    this.codenvyResourcesDistribution = codenvyResourcesDistribution;
    this.confirmDialogService = confirmDialogService;
    this.codenvyOrganization = codenvyOrganization;
    this.codenvyPermissions = codenvyPermissions;
    this.cheNotification = cheNotification;
    this.codenvyUser = codenvyUser;
    this.$location = $location;
    this.$route = $route;
    this.lodash = lodash;

    $rootScope.showIDE = false;

    this.allowedUserActions = [];

    this.updateData();

    this.updateSelectedTab(this.$location.search().tab);
    let deRegistrationFn = $scope.$watch(() => {
      return $location.search().tab;
    }, (tab: string) => {
      if (!angular.isUndefined(tab)) {
        this.updateSelectedTab(tab);
      }
    }, true);
    $scope.$on('$destroy', () => {
      deRegistrationFn();
    });
  }

  get SET_PERMISSIONS(): string {
    return CodenvyOrganizationActions.SET_PERMISSIONS;
  }

  get DELETE(): string {
    return CodenvyOrganizationActions.DELETE;
  }

  get UPDATE(): string {
    return CodenvyOrganizationActions.UPDATE;
  }

  /**
   * Fetch organizations.
   */
  fetchOrganizations() {
    this.codenvyOrganization.fetchOrganizations().then(() => {
      this.updateData();
    });
  }

  /**
   * Update data.
   */
  updateData(): void {
    this.organizationName = this.$route.current.params.organizationName;
    if (!this.organizationName) {
      return;
    }
    this.organization = this.lodash.find(this.codenvyOrganization.getOrganizations(), (organization: codenvy.IOrganization) => {
      return organization.qualifiedName === this.organizationName;
    });
    if (!this.organization) {
      return;
    }
    this.newName = angular.copy(this.organization.name);
    this.subOrganizations = this.lodash.filter(this.codenvyOrganization.getOrganizations(), (organization: codenvy.IOrganization) => {
      return organization.parent === this.organization.id;
    });
    this.fetchLimits();
    this.fetchUserPermissions();
  }

  /**
   * Update selected tab index by search part of URL.
   *
   * @param {string} tab
   */
  updateSelectedTab(tab: string): void {
    this.selectedTabIndex = parseInt(this.tab[tab], 10);
  }

  /**
   * Changes search part of URL.
   *
   * @param {number} tabIndex
   */
  onSelectTab(tabIndex?: number): void {
    let param: { tab?: string } = {};
    if (!angular.isUndefined(tabIndex)) {
      param.tab = Tab[tabIndex];
    }
    this.$location.search(param);
  }

  /**
   * Gets sub-organizations for current organization.
   *
   * @returns {Array<any>}
   */
  getSubOrganizations(): Array<any> {
    return this.subOrganizations;
  }

  /**
   * Fetches permission of user in current organization.
   */
  fetchUserPermissions(): void {
    this.codenvyPermissions.fetchOrganizationPermissions(this.organization.id).then(() => {
      this.allowedUserActions = this.processUserPermissions();
    }, (error: any) => {
      this.isLoading = false;
    });
  }

  /**
   * Process permissions to retrieve current user actions.
   *
   * @returns {Array} current user allowed actions
   */
  processUserPermissions(): Array<string> {
    let userId = this.codenvyUser.getUser().id;
    let permissions = this.codenvyPermissions.getOrganizationPermissions(this.organization.id);
    let userPermissions = this.lodash.find(permissions, (permission: any) => {
      return permission.userId === userId;
    });
    return userPermissions ? userPermissions.actions : [];
  }

  /**
   * Checks whether user is allowed to perform pointed action.
   *
   * @param value action
   * @returns {boolean} <code>true</code> if allowed
   */
  isUserAllowedTo(value: string): boolean {
    if (value === CodenvyOrganizationActions.UPDATE && this.isPersonalOrganization()) {
      return false;
    }
    return this.allowedUserActions ? this.allowedUserActions.indexOf(value) >= 0 : false;
  }

  /**
   * Checks for personal.
   *
   * @returns {boolean} <code>true</code> if personal
   */
  isPersonalOrganization(): boolean  {
    let user = this.codenvyUser.getUser();
    return this.organization && user && this.organization.qualifiedName === user.name;
  }

  /**
   * Checks for root.
   *
   * @returns {boolean} <code>true</code> if root
   */
  isRootOrganization(): boolean {
    return this.organization && !this.organization.parent;
  }

  /**
   * Returns whether current user can change organization resource limits.
   *
   * @returns {boolean} <code>true</code> if can change resource limits
   */
  canChangeResourceLimits(): boolean {
    if (this.isRootOrganization()) {
      return false;
    }
    return this.organization && this.isUserAllowedTo(CodenvyOrganizationActions.MANAGE_RESOURCES);
  }

  /**
   * Check if the name is unique.
   * @param name
   * @returns {boolean}
   */
  isUniqueName(name: string): boolean {
    let currentOrganizationName = this.organization.name;
    let organizations = this.codenvyOrganization.getOrganizations();
    let account = '';
    let parentId = this.organization.parent;
    if (parentId) {
      let parent = this.codenvyOrganization.getOrganizationById(parentId);
      if (parent && parent.qualifiedName) {
        account = parent.qualifiedName + '/';
      }
    }
    if (organizations.length && currentOrganizationName !== name) {
      for (let i = 0; i < organizations.length; i++) {
        if (organizations[i].qualifiedName === account + name) {
          return false;
        }
      }
      return true;
    } else {
      return true;
    }
  }

  /**
   * Fetches defined organization's limits (workspace, runtime, RAM caps, etc).
   */
  fetchLimits(): void {
    this.isLoading = true;
    this.codenvyResourcesDistribution.fetchOrganizationResources(this.organization.id).then(() => {
      this.isLoading = false;
      this.processResources();
    }, (error: any) => {
      this.isLoading = false;
      this.limits = {};
      this.limitsCopy = angular.copy(this.limits);
    });
  }

  /**
   * Process resources limits.
   */
  processResources(): void {
    let ramLimit = this.codenvyResourcesDistribution.getOrganizationResourceByType(this.organization.id, CodenvyResourceLimits.RAM);
    let workspaceLimit = this.codenvyResourcesDistribution.getOrganizationResourceByType(this.organization.id, CodenvyResourceLimits.WORKSPACE);
    let runtimeLimit = this.codenvyResourcesDistribution.getOrganizationResourceByType(this.organization.id, CodenvyResourceLimits.RUNTIME);

    this.limits = {};
    this.limits.workspaceCap = workspaceLimit ? workspaceLimit.amount : undefined;
    this.limits.runtimeCap = runtimeLimit ? runtimeLimit.amount : undefined;
    this.limits.ramCap = ramLimit ? ramLimit.amount / 1024 : undefined;
    this.limitsCopy = angular.copy(this.limits);
  }

  /**
   * Confirms and performs organization's deletion.
   */
  deleteOrganization(): void {
    let promise = this.confirmDialogService.showConfirmDialog('Delete organization',
      'Would you like to delete organization \'' + this.organization.name + '\'?', 'Delete');

    promise.then(() => {
      let promise = this.codenvyOrganization.deleteOrganization(this.organization.id);
      promise.then(() => {
        this.$location.path('/organizations');

      }, (error: any) => {
        this.cheNotification.showError(error.data.message !== null ? error.data.message : 'Team deletion failed.');
      });
    });
  }

  /**
   * Update organization's details.
   *
   */
  updateOrganizationName(): void {
    if (this.newName && this.organization && this.newName !== this.organization.name) {
      this.organization.name = this.newName;
      this.codenvyOrganization.updateOrganization(this.organization).then((organization: codenvy.IOrganization) => {
        this.codenvyOrganization.fetchOrganizations().then(() => {
          this.$location.path('/organization/' + organization.qualifiedName);
        });
      }, (error: any) => {
        this.cheNotification.showError((error.data && error.data.message !== null) ? error.data.message : 'Rename organization failed.');
      });
    }
  }

  /**
   * Update resource limits.
   */
  updateLimits(): void {
    if (!this.organization || !this.limits || angular.equals(this.limits, this.limitsCopy)) {
      return;
    }
    let resources = angular.copy(this.codenvyResourcesDistribution.getOrganizationResources(this.organization.id));

    let resourcesToRemove = [CodenvyResourceLimits.TIMEOUT];
    if (this.limits.ramCap !== null && this.limits.ramCap !== undefined) {
      resources = this.codenvyResourcesDistribution.setOrganizationResourceLimitByType(resources, CodenvyResourceLimits.RAM, (this.limits.ramCap * 1024).toString());
    } else {
      resourcesToRemove.push(CodenvyResourceLimits.RAM);
    }
    if (this.limits.workspaceCap !== null && this.limits.workspaceCap !== undefined) {
      resources = this.codenvyResourcesDistribution.setOrganizationResourceLimitByType(resources, CodenvyResourceLimits.WORKSPACE, this.limits.workspaceCap);
    } else {
      resourcesToRemove.push(CodenvyResourceLimits.WORKSPACE);
    }
    if (this.limits.runtimeCap !== null && this.limits.runtimeCap !== undefined) {
      resources = this.codenvyResourcesDistribution.setOrganizationResourceLimitByType(resources, CodenvyResourceLimits.RUNTIME, this.limits.runtimeCap);
    } else {
      resourcesToRemove.push(CodenvyResourceLimits.RUNTIME);
    }
    // if the timeout resource will be send in this case - it will set the timeout for the current organization, and the updating timeout of
    // parent organization will not affect the current organization, so to avoid this - remove timeout resource if present:
    this.lodash.remove(resources, (resource: any) => {
      return resourcesToRemove.indexOf(resource.type) >= 0;
    });

    this.isLoading = true;
    this.codenvyResourcesDistribution.distributeResources(this.organization.id, resources).then(() => {
      this.fetchLimits();
    }, (error: any) => {
      let errorMessage = 'Failed to set update organization CAPs.';
      this.cheNotification.showError((error.data && error.data.message !== null) ? errorMessage + '</br>Reason: ' + error.data.message : errorMessage);
      this.fetchLimits();
    });
  }

  /**
   * Returns whether save button is disabled.
   *
   * @return {boolean}
   */
  isSaveButtonDisabled(): boolean {
    return !this.organizationForm || this.organizationForm.$invalid;
  }

  /**
   * Returns true if "Save" button should be visible
   *
   * @return {boolean}
   */
  isSaveButtonVisible(): boolean {
    return (this.selectedTabIndex === Tab.Settings && !this.isLoading) && (!angular.equals(this.organization.name, this.newName) ||
      !angular.equals(this.limits, this.limitsCopy));
  }

  updateOrganization(): void {
    this.updateOrganizationName();
    this.updateLimits();
  }

  cancelChanges(): void {
    this.newName = angular.copy(this.organization.name);
    this.limits = angular.copy(this.limitsCopy);
  }
}
