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
import {CodenvyOrganizationRoles} from '../../../../components/api/codenvy-organization-roles';


/**
 * @ngdoc controller
 * @name organization.details.invite-members:ListOrganizationInviteMembersController
 * @description This class is handling the controller for the list of invited organization members.
 * @author Oleksii Orel
 */
export class ListOrganizationInviteMembersController {
  /**
   * Lodash library.
   */
  private lodash: any;
  /**
   * Service for displaying dialogs.
   */
  private $mdDialog: ng.material.IDialogService;
  /**
   * No members selected.
   */
  private isNoSelected: boolean;
  /**
   * Bulk operation checked state.
   */
  private isBulkChecked: boolean;
  /**
   * Status of selected members.
   */
  private membersSelectedStatus: any;
  /**
   * Number of selected members.
   */
  private membersSelectedNumber: number;
  /**
   * Members order by value.
   */
  private membersOrderBy: string;
  /**
   * List of members to be invited.
   */
  private members: Array<codenvy.IMember>;
  /**
   * Parent organization ID
   */
  private parentOrganizationId: string;
  /**
   * Members list of parent organization.
   */
  private parentOrganizationMembers: string[];

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($mdDialog: angular.material.IDialogService, lodash: any) {
    this.$mdDialog = $mdDialog;
    this.lodash = lodash;
    this.isNoSelected = true;
    this.isBulkChecked = false;
    this.membersSelectedStatus = {};
    this.membersSelectedNumber = 0;
    this.membersOrderBy = 'email';
  }

  /**
   * Forms the list of members.
   */
  buildMembersList(): void {
    this.members.forEach((member: codenvy.IMember) => {
      member.role = member.roles ? angular.toJson(member.roles[0]) : angular.toJson(CodenvyOrganizationRoles.MEMBER);
    });
  }

  /**
   * Returns developer role value.
   *
   * @returns {string} string of the developer role value
   */
  getDeveloperRoleValue(): string {
    return angular.toJson(CodenvyOrganizationRoles.MEMBER);
  }

  /**
   * Returns admin role value.
   *
   * @returns {string} string of the admin role value
   */
  getAdminRoleValue(): string {
    return angular.toJson(CodenvyOrganizationRoles.ADMIN);
  }

  /**
   * Handler for value changed in the list.
   * @param member
   */
  onValueChanged(member: codenvy.IMember): void {
    member.roles = [angular.fromJson(member.role)];
  }

  /**
   * Update members selected status
   */
  updateSelectedStatus(): void {
    this.membersSelectedNumber = 0;
    this.isBulkChecked = !!this.members.length;
    this.members.forEach((member: codenvy.IMember) => {
      if (this.membersSelectedStatus[member.email]) {
        this.membersSelectedNumber++;
      } else {
        this.isBulkChecked = false;
      }
    });
  }

  /**
   * Change bulk selection value.
   */
  changeBulkSelection(): void {
    if (this.isBulkChecked) {
      this.deselectAllMembers();
      this.isBulkChecked = false;
      return;
    }
    this.selectAllMembers();
    this.isBulkChecked = true;
  }

  /**
   * Check all members in list.
   */
  selectAllMembers(): void {
    this.membersSelectedNumber = this.members.length;
    this.members.forEach((member: codenvy.IMember) => {
      this.membersSelectedStatus[member.email] = true;
    });
  }

  /**
   * Uncheck all members in list
   */
  deselectAllMembers(): void {
    this.membersSelectedStatus = {};
    this.membersSelectedNumber = 0;
  }

  /**
   * Adds member to the list.
   *
   * @param members {Array<codenvy.IMember>}
   * @param roles {Array<codenvy.IRole>}
   */
  addMembers(members: Array<codenvy.IMember>, roles: Array<codenvy.IRole>): void {
    members.forEach((member: any) => {
      member.roles = roles;
      this.members.push(member);
    });
    this.buildMembersList();
  }

  /**
   * Shows dialog to add new member.
   *
   * @param $event
   */
  showAddDialog($event: MouseEvent): void {
    this.$mdDialog.show({
      targetEvent: $event,
      controller: 'OrganizationMemberDialogController',
      controllerAs: 'organizationMemberDialogController',
      bindToController: true,
      clickOutsideToClose: true,
      locals: {
        members: this.members,
        member: null,
        parentOrganizationId: this.parentOrganizationId,
        parentOrganizationMembers: this.parentOrganizationMembers,
        callbackController: this
      },
      templateUrl: 'app/organizations/organization-details/organization-member-dialog/organization-member-dialog.html'
    });
  }

  /**
   * Removes selected members.
   */
  removeSelectedMembers(): void {
    this.lodash.remove(this.members, (member: codenvy.IMember) => {
      return this.membersSelectedStatus[member.email];
    });
    this.buildMembersList();
    this.deselectAllMembers();
    this.isBulkChecked = false;
  }
}
