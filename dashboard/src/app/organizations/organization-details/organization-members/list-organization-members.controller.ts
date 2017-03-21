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
import {CodenvyPermissions} from '../../../../components/api/codenvy-permissions.factory';
import {CodenvyUser} from '../../../../components/api/codenvy-user.factory';
import {CodenvyOrganization} from '../../../../components/api/codenvy-organizations.factory';
import {OrganizationsPermissionService} from '../../organizations-permission.service';
import {CodenvyOrganizationActions} from '../../../../components/api/codenvy-organization-actions';

/**
 * @ngdoc controller
 * @name organization.details.members:ListOrganizationMembersController
 * @description This class is handling the controller for the list of organization's members.
 * @author Oleksii Orel
 */
export class ListOrganizationMembersController {
  /**
   * Location service.
   */
  private $location: ng.ILocationService;
  /**
   * User API interaction.
   */
  private codenvyUser: CodenvyUser;
  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * User profile API interaction.
   */
  private cheProfile: any;
  /**
   * Permissions API interaction.
   */
  private codenvyPermissions: CodenvyPermissions;
  /**
   * Service for displaying dialogs.
   */
  private $mdDialog: angular.material.IDialogService;
  /**
   * Notifications service.
   */
  private cheNotification: any;
  /**
   * Confirm dialog service.
   */
  private confirmDialogService: any;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Lodash library.
   */
  private lodash: any;
  /**
   * Team's members list.
   */
  private members: Array<codenvy.IMember>;
  /**
   * Loading state of the page.
   */
  private isLoading: boolean;
  /**
   * Filter for members list.
   */
  private memberFilter: any;
  /**
   * Selected status of members in list.
   */
  private membersSelectedStatus: any;
  /**
   * Bulk operation state.
   */
  private isBulkChecked: boolean;
  /**
   * No selected members state.
   */
  private isNoSelected: boolean;
  /**
   * All selected members state.
   */
  private isAllSelected: boolean;
  /**
   * Current organization (comes from directive's scope).
   */
  private organization: codenvy.IOrganization;
  /**
   * Organization permission service.
   */
  private organizationsPermissionService: OrganizationsPermissionService;
  /**
   * Has update permission.
   */
  private hasUpdatePermission;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(codenvyPermissions: CodenvyPermissions, codenvyUser: CodenvyUser, cheProfile: any, codenvyOrganization: CodenvyOrganization,
              confirmDialogService: any, $mdDialog: angular.material.IDialogService, $q: ng.IQService, cheNotification: any,
              lodash: any, $location: ng.ILocationService, organizationsPermissionService: OrganizationsPermissionService) {
    this.codenvyPermissions = codenvyPermissions;
    this.cheProfile = cheProfile;
    this.codenvyUser = codenvyUser;
    this.codenvyOrganization = codenvyOrganization;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$location = $location;
    this.lodash = lodash;
    this.cheNotification = cheNotification;
    this.confirmDialogService = confirmDialogService;
    this.organizationsPermissionService = organizationsPermissionService;

    this.members = [];
    this.isLoading = true;

    this.memberFilter = {name: ''};

    this.membersSelectedStatus = {};
    this.isBulkChecked = false;
    this.isNoSelected = true;

    this.fetchMembers();
  }

  /**
   * Fetches the list of organization members.
   */
  fetchMembers(): void {
    if (!this.organization) {
      return;
    }
    let permissions = this.codenvyPermissions.getOrganizationPermissions(this.organization.id);
    if (permissions && permissions.length) {
      this.isLoading = false;
      this.formUserList();
    } else {
      this.isLoading = true;
    }
    this.codenvyPermissions.fetchOrganizationPermissions(this.organization.id).then(() => {
      this.isLoading = false;
      this.formUserList();
    }, (error: any) => {
      this.isLoading = false;
      this.cheNotification.showError(error.data && error.data.message ? error.data.message : 'Failed to retrieve organization permissions.');
    });
  }

  /**
   * Combines permissions and users data in one list.
   */
  formUserList(): void {
    let permissions = this.codenvyPermissions.getOrganizationPermissions(this.organization.id);
    this.members = [];

    permissions.forEach((permission: any) => {
      let userId = permission.userId;
      let user = this.cheProfile.getProfileFromId(userId);

      if (user) {
        this.formUserItem(user, permission);
      } else {
        this.cheProfile.fetchProfileId(userId).then(() => {
          this.formUserItem(this.cheProfile.getProfileFromId(userId), permission);
        });
      }
    });

    this.hasUpdatePermission = this.organizationsPermissionService.isUserAllowedTo(CodenvyOrganizationActions.UPDATE.toString(), this.organization.id);
  }

  /**
   * Forms item to display with permissions and user data.
   *
   * @param user {codenvy.IUser} data
   * @param permissions {codenvy.IPermissions} data
   */
  formUserItem(user: codenvy.IUser, permissions: codenvy.IPermissions): void {
    user.name = this.cheProfile.getFullName(user.attributes);
    let userItem = <codenvy.IMember>angular.copy(user);
    userItem.permissions = permissions;
    this.members.push(userItem);
  }

  /**
   * Return <code>true</code> if all members in list are checked.
   * @returns {boolean}
   */
  isAllMembersSelected(): boolean {
    return this.isAllSelected;
  }

  /**
   * Returns <code>true</code> if all members in list are not checked.
   * @returns {boolean}
   */
  isNoMemberSelected(): boolean {
    return this.isNoSelected;
  }

  /**
   * Make all members in list selected.
   */
  selectAllMembers(): void {
    this.members.forEach((member: codenvy.IMember) => {
      this.membersSelectedStatus[member.userId] = true;
    });
  }

  /**
   * Make all members in list deselected.
   */
  deselectAllMembers(): void {
    this.members.forEach((member: codenvy.IMember) => {
      this.membersSelectedStatus[member.userId] = false;
    });
  }

  /**
   * Change bulk selection value.
   */
  changeBulkSelection(): void {
    if (this.isBulkChecked) {
      this.deselectAllMembers();
      this.isBulkChecked = false;
    } else {
      this.selectAllMembers();
      this.isBulkChecked = true;
    }
    this.updateSelectedStatus();
  }

  /**
   * Update members selected status.
   */
  updateSelectedStatus(): void {
    this.isNoSelected = true;
    this.isAllSelected = true;

    Object.keys(this.membersSelectedStatus).forEach((key: string) => {
      if (this.membersSelectedStatus[key]) {
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
   * Shows dialog for adding new member to the organization.
   */
  showMemberDialog(member: codenvy.IMember): void {
    this.$mdDialog.show({
      controller: 'OrganizationMemberDialogController',
      controllerAs: 'organizationMemberDialogController',
      bindToController: true,
      clickOutsideToClose: true,
      locals: {
        members: this.members,
        callbackController: this,
        member: member
      },
      templateUrl: 'app/organizations/organization-details/organization-member-dialog/organization-member-dialog.html'
    });
  }

  /**
   * Add new members to the organization.
   *
   * @param members members to be added
   * @param roles member roles
   */
  addMembers(members: Array<codenvy.IMember>, roles: Array<any>): void {
    let promises = [];
    let unregistered = [];

    members.forEach((member: codenvy.IMember) => {
      if (member.id) {
        let actions = [];
        roles.forEach((role: any) => {
          actions = actions.concat(role.actions);
        });
        let permissions = {
          instanceId: this.organization.id,
          userId: member.id,
          domainId: 'organization',
          actions: actions
        };
        let promise = this.codenvyPermissions.storePermissions(permissions);
        promises.push(promise);
      } else {
        unregistered.push(member.email);
      }
    });

    this.isLoading = true;
    this.$q.all(promises).then(() => {
      this.fetchMembers();
    }).finally(() => {
      this.isLoading = false;
      if (unregistered.length > 0) {
        this.cheNotification.showError('User' + (unregistered.length > 1 ? 's ' : ' ') + unregistered.join(', ') + (unregistered.length > 1 ? ' are' : ' is') + ' not registered in the system.');
      }
    });
  }

  /**
   * Perform edit member permissions.
   *
   * @param member
   */
  editMember(member: codenvy.IMember): void {
    this.showMemberDialog(member);
  }

  /**
   * Performs member's permissions update.
   *
   * @param member member to update permissions
   */
  updateMember(member: codenvy.IMember): void {
    if (member.permissions.actions.length > 0) {
      this.storePermissions(member.permissions);
    } else {
      this.removePermissions(member);
    }
  }

  /**
   * Stores provided permissions.
   *
   * @param permissions {codenvy.IPermissions}
   */
  storePermissions(permissions: codenvy.IPermissions): void {
    this.isLoading = true;
    this.codenvyPermissions.storePermissions(permissions).then(() => {
      this.fetchMembers();
    }, (error: any) => {
      this.isLoading = false;
      this.cheNotification.showError(error.data && error.data.message ? error.data.message : 'Set user permissions failed.');
    });
  }

  /**
   * Remove all selected members.
   */
  removeSelectedMembers(): void {
    let membersSelectedStatusKeys = Object.keys(this.membersSelectedStatus);
    let checkedKeys = [];

    if (!membersSelectedStatusKeys.length) {
      this.cheNotification.showError('No such developers.');
      return;
    }

    membersSelectedStatusKeys.forEach((key: string) => {
      if (this.membersSelectedStatus[key] === true) {
        checkedKeys.push(key);
      }
    });

    if (!checkedKeys.length) {
      this.cheNotification.showError('No such developers.');
      return;
    }

    let confirmationPromise = this.showDeleteMembersConfirmation(checkedKeys.length);
    confirmationPromise.then(() => {
      let removalError;
      let removeMembersPromises = [];
      let isCurrentUser = false;
      for (let i = 0; i < checkedKeys.length; i++) {
        let id = checkedKeys[i];
        this.membersSelectedStatus[id] = false;
        if (id === this.codenvyUser.getUser().id) {
          isCurrentUser = true;
        }
        let promise = this.codenvyPermissions.removeOrganizationPermissions(this.organization.id, id);
        promise.catch((error: any) => {
          removalError = error;
        });
        removeMembersPromises.push(promise);
      }

      this.$q.all(removeMembersPromises).finally(() => {
        if (isCurrentUser) {
          this.processCurrentUserRemoval();
        } else {
          this.fetchMembers();
        }

        this.updateSelectedStatus();
        if (removalError) {
          this.cheNotification.showError(removalError.data && removalError.data.message ? removalError.data.message : 'User removal failed.');
        }
      });
    });
  }

  /**
   * Call user permissions removal. Show the dialog
   * @param member
   */
  removeMember(member: codenvy.IMember): void {
    let promise = this.confirmDialogService.showConfirmDialog('Remove member', 'Would you like to remove member  ' + member.email + ' ?', 'Delete');

    promise.then(() => {
      this.removePermissions(member);
    });
  }

  /**
   * Returns true if the member is owner for current organization.
   * @param member
   *
   * @returns {boolean}
   */
  isOwner(member: codenvy.IMember): boolean {
    if (!this.organization || !member) {
      return false;
    }

    return this.organization.qualifiedName.split('/')[0] === member.name;
  }

  /**
   * Returns string with member roles.
   * @param member
   *
   * @returns {string} string format of roles array
   */
  getMemberRoles(member: codenvy.IMember): string {
    if (!member) {
      return '';
    }
    if (this.isOwner(member)) {
      return 'Organization Owner';
    }
    let roles = this.codenvyOrganization.getRolesFromActions(member.permissions.actions);
    let titles = [];
    let processedActions = [];
    roles.forEach((role: any) => {
      titles.push(role.title);
      processedActions = processedActions.concat(role.actions);
    });

    return titles.join(', ');
  }

  /**
   * Returns string with member other actions.
   * @param member
   *
   * @returns {string} string format of roles array
   */
  getOtherActions(member: codenvy.IMember): string {
    if (!member) {
      return '';
    }
    let roles = this.codenvyOrganization.getRolesFromActions(member.permissions.actions);
    let processedActions = [];
    roles.forEach((role: any) => {
      processedActions = processedActions.concat(role.actions);
    });

    return this.lodash.difference(member.permissions.actions, processedActions).join(', ');
  }

  /**
   * Process the removal of current user from organization.
   */
  processCurrentUserRemoval(): void {
    this.$location.path('/organizations');
  }

  /**
   * Removes user permissions for current organization
   *
   * @param member {codenvy.IMember}
   */
  removePermissions(member: codenvy.IMember): void {
    this.isLoading = true;
    this.codenvyPermissions.removeOrganizationPermissions(member.permissions.instanceId, member.userId).then(() => {
      if (member.userId === this.codenvyUser.getUser().id) {
        this.processCurrentUserRemoval();
      } else {
        this.fetchMembers();
      }
    }, (error: any) => {
      this.isLoading = false;
      this.cheNotification.showError(error.data && error.data.message ? error.data.message : 'Failed to remove user ' + member.email + ' permissions.');
    });
  }

  /**
   * Show confirmation popup before members removal
   * @param numberToDelete {number}
   * @returns {ng.IPromise<any>}
   */
  showDeleteMembersConfirmation(numberToDelete: number): ng.IPromise<any> {
    let confirmTitle = 'Would you like to remove ';
    if (numberToDelete > 1) {
      confirmTitle += 'these ' + numberToDelete + ' members?';
    } else {
      confirmTitle += 'the selected member?';
    }

    return this.confirmDialogService.showConfirmDialog('Remove members', confirmTitle, 'Delete');
  }
}
