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
 * @name organization.details.members:ListOrganizationMembers
 * @restrict E
 * @element
 *
 * @description
 * `<list-organization-members editable="ctrl.editable" organization="ctrl.organization"></list-organization-members>` for displaying list of members
 *
 * @usage
 *   <list-organization-members editable="ctrl.editable" organization="ctrl.organization"></list-organization-members>
 *
 * @author Oleksii Orel
 */
export class ListOrganizationMembers implements ng.IDirective {

  restrict: string = 'E';
  templateUrl: string = 'app/organizations/organization-details/organization-members/list-organization-members.html';
  controller: string = 'ListOrganizationMembersController';
  controllerAs: string = 'listOrganizationMembersController';
  bindToController: boolean = true;

  scope: any = {
    editable: '=',
    organization: '=',
    parentOrganizationMembers: '='
  };
}
