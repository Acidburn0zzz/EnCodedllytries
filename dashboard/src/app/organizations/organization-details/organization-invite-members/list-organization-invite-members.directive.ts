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
 * @ngdoc directive
 * @name organization.details.invite-members:ListOrganizationInviteMembers
 * @restrict E
 * @element
 *
 * @description
 * `<list-organization-members members="ctrl.members"></list-organization-members>` for displaying list of members
 *
 * @usage
 *   <list-organization-members members="ctrl.members"></list-organization-members>
 *
 * @author Oleksii Orel
 */
export class ListOrganizationInviteMembers implements ng.IDirective {

  restrict: string = 'E';
  templateUrl: string = 'app/organizations/organization-details/organization-invite-members/list-organization-invite-members.html';

  controller: string = 'ListOrganizationInviteMembersController';
  controllerAs: string = 'listOrganizationInviteMembersController';
  bindToController: boolean = true;

  scope: any = {
    members: '='
  };
}
