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
import {CodenvyOrganization} from '../../../../components/api/codenvy-organizations.factory';

/**
 * @ngdoc controller
 * @name organization.details.member:MemberDialogController
 * @description This class is handling the controller for adding/editing organization member dialog.
 * @author Oleksii Orel
 */
export class OrganizationMemberDialogController {
  /**
   * User API interaction.
   */
  private cheUser: any;
  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * Service for displaying dialogs.
   */
  private $mdDialog: angular.material.IDialogService;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Lodash library.
   */
  private lodash: any;
  /**
   * Processing state of adding member.
   */
  private isProcessing: boolean;
  /**
   * Set of user roles info.
   */
  private roles: Array<any>;
  /**
   * Already added emails.
   */
  private emails: Array<string>;
  /**
   * Existing members.
   */
  private members: Array<any>;
  /**
   * Entered email address.
   */
  private email: string;
  /**
   * Controller that will handle callbacks.
   */
  private callbackController: any;
  /**
   * Member to be displayed, may be <code>null</code> if add new member is needed. (Comes from outside)
   */
  private member: codenvy.IMember;
  /**
   * Role to be used, may be <code>null</code> if role is needed to be set. (Comes from outside)
   */
  private role: any;
  /**
   * Choosen role for user.
   */
  private newRole: any;
  /**
   * Dialog window title.
   */
  private title: string;
  /**
   * Title of operation button (Save or Add)
   */
  private buttonTitle: string;
  /**
   * Email validation error message.
   */
  private emailError: string;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($q: ng.IQService, $mdDialog: angular.material.IDialogService, cheUser: any, codenvyOrganization: CodenvyOrganization, lodash: any) {
    this.$mdDialog = $mdDialog;
    this.cheUser = cheUser;
    this.codenvyOrganization = codenvyOrganization;
    this.$q = $q;
    this.lodash = lodash;

    this.isProcessing = false;

    this.emails = [];
    this.members.forEach((member: codenvy.IMember) => {
      this.emails.push(member.email);
    });

    // role is set, need to add only user with this role:
    if (this.role) {
      this.email = '';
      this.title = 'Add new ' + this.role.title.toLowerCase();
      this.buttonTitle = 'Add';
      return;
    }

    this.roles = CodenvyOrganizationRoles.getValues();
    if (this.member) {
      this.title = 'Edit ' + this.member.name + ' roles';
      this.buttonTitle = 'Save';
      this.email = this.member.email;
      let roles = codenvyOrganization.getRolesFromActions(this.member.permissions.actions);
      this.newRole = (roles && roles.length > 0) ? angular.toJson(roles[0]) : angular.toJson(CodenvyOrganizationRoles.MEMBER);
    } else {
      this.email = '';
      this.title = 'Invite member to collaborate';
      this.buttonTitle = 'Add';
      this.newRole = angular.toJson(CodenvyOrganizationRoles.MEMBER);
    }
  }

  /**
   * Hides the add member dialog.
   */
  hide(): void {
    this.$mdDialog.hide();
  }

  /**
   * Checks whether entered email valid and is unique.
   *
   * @param value value with email(s) to check
   * @returns {boolean} true if pointed email(s) are valid and not in the list yet
   */
  isValidEmail(value: string): boolean {
    let emails = value.replace(/ /g, ',').split(',');
    for (let i = 0; i < emails.length; i++) {
      let email = emails[i];
      let emailRe = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRe.test(email)) {
        this.emailError = email + ' is invalid email address.';
        return false;
      }

      if (this.emails.indexOf(email) >= 0) {
        this.emailError = 'User with email ' + email + ' is already invited.';
        return false;
      }
    }
    return true;
  }

  /**
   * Adds new member.
   */
  addMembers(): void {
    let userRoles = this.role ? [this.role] : [angular.fromJson(this.newRole)];
    let emails = this.email.replace(/ /g, ',').split(',');
    // form the list of emails without duplicates and empty values:
    let resultEmails = emails.reduce((array: Array<string>, element: string) => {
      if (array.indexOf(element) < 0 && element.length > 0) {
        array.push(element);
      }
      return array;
    }, []);

    let promises = [];
    let users = [];
    resultEmails.forEach((email: string) => {
      promises.push(this.processUser(email, users));
    });

    this.$q.all(promises).then(() => {
      this.finishAdding(users, userRoles);
    });
  }

  processUser(email: string, users: Array<any>): ng.IPromise<any> {
    let deferred = this.$q.defer();
    let user = this.cheUser.getUserByAlias(email);
    if (user) {
      users.push(user);
      deferred.resolve();
    } else {
      this.isProcessing = true;
      this.cheUser.fetchUserByAlias(email).then(() => {
        users.push(this.cheUser.getUserByAlias(email));
        deferred.resolve();
      }, (error: any) => {
        users.push({email: email});
        deferred.resolve();
      });
    }
    return deferred.promise;
  }

  /**
   * Handle edit member user's action.
   */
  editMember(): void {
    this.member.permissions.actions = this.getCurrentActions();
    this.callbackController.updateMember(this.member);
    this.hide();
  }

  /**
   * Returns the actions of current chosen roles.
   */
  getCurrentActions(): Array<string> {
    let userRoles = this.role ? [this.role] : [angular.fromJson(this.newRole)];
    let processedActions = [];
    this.roles.forEach((role: any) => {
      processedActions = processedActions.concat(role.actions);
    });

    let actions = this.member ? this.member.permissions.actions : [];
    let otherActions = this.lodash.difference(actions, processedActions);

    return this.lodash.uniq(this.getActionsFromRoles(userRoles).concat(otherActions));
  }

  /**
   * Forms the list actions based on the list of roles.
   *
   * @param roles array of roles
   * @returns {Array<string>} actions array
   */
  getActionsFromRoles(roles: Array<any>): Array<string> {
    let actions = [];
    roles.forEach((role: any) => {
      actions = actions.concat(role.actions);
    });

    return actions;
  }

  /**
   * Finish adding user state.
   *
   * @param users users to be added
   * @param roles user's roles
   */
  finishAdding(users: Array<any>, roles: any): void {
    this.isProcessing = false;
    this.callbackController.addMembers(users, roles);
    this.hide();
  }

}
