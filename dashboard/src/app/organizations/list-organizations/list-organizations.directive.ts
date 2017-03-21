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
 * @name organizations.organizations:ListOrganizations
 * @restrict E
 * @element
 *
 * @description
 * `<list-organizations organizations="ctrl.organizations"></list-organizations>` for displaying list of organizations
 *
 * @usage
 *   <list-organizations organizations="ctrl.organizations"></list-organizations>
 *
 * @author Oleksii Orel
 */
export class ListOrganizations implements ng.IDirective {

  restrict: string = 'E';
  templateUrl: string = 'app/organizations/list-organizations/list-organizations.html';

  controller: string = 'ListOrganizationsController';
  controllerAs: string = 'listOrganizationsController';
  bindToController: boolean = true;

  scope: any = {
    isLoading: '=?',
    organizations: '=',
    onUpdate: '&?onUpdate'
  };
}
