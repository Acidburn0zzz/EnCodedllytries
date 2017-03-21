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
 * @name  organizations.list.Item.controller:WorkspaceItem
 * @restrict E
 * @element
 *
 * @description
 * `<organizations-item organization="ctrl.organization"></organizations-item>` for displaying list of organizations
 *
 * @usage
 *   <organizations-item organization="ctrl.organization"></organizations-item>
 *
 * @author Oleksii Orel
 */
export class OrganizationsItem implements ng.IDirective {

  restrict = 'E';
  require = ['ngModel'];
  templateUrl = 'app/organizations/list-organizations/organizations-item/organizations-item.html';
  controller = 'OrganizationsItemController';
  controllerAs = 'organizationsItemController';
  bindToController = true;

  // scope values
  scope = {
    organization: '=',
    members: '=',
    ramCap: '=',
    isChecked: '=cdvyChecked',
    isSelect: '=?ngModel',
    isSelectable: '=?cdvyIsSelectable',
    onCheckboxClick: '&?cdvyOnCheckboxClick',
    onUpdate: '&?onUpdate'
  };
}
