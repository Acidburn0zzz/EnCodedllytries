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
 * @name organization.details:OrganizationNotFound
 * @restrict E
 * @element
 *
 * @description
 * `<organization-not-found organization-name="myOrganization"></organization-not-found>` for displaying "Organization not found" page.
 *
 * @usage
 *   <organization-not-found organization-name="myOrganization"></organization-not-found>
 *
 * @author Oleksii Kurinnyi
 */
export class OrganizationNotFound implements ng.IDirective {
  restrict: string = 'E';
  replace: boolean = true;
  templateUrl: string = 'app/organizations/organization-details/organization-not-found/organization-not-found.html';

  scope: any = {
    organizationName: '='
  };

}
