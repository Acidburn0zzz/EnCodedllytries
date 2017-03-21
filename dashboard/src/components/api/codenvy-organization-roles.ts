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
import {CodenvyOrganizationActions} from './codenvy-organization-actions';

/**
 * This is enum of organization roles.
 *
 * @author Oleksii Orel
 */
export enum CodenvyOrganizationRoles {
  MEMBER = <any> {
    'title': 'Member',
    'description': 'Can create workspaces in organization and use resources.',
    'actions': [CodenvyOrganizationActions.CREATE_WORKSPACES]
  },
  ADMIN = <any> {
    'title': 'Admin',
    'description': 'Can edit the organization’s settings, manage members and sub-organizations.',
    'actions': [
      CodenvyOrganizationActions.UPDATE,
      CodenvyOrganizationActions.SET_PERMISSIONS,
      CodenvyOrganizationActions.MANAGE_RESOURCES,
      CodenvyOrganizationActions.MANAGE_WORKSPACES,
      CodenvyOrganizationActions.CREATE_WORKSPACES,
      CodenvyOrganizationActions.DELETE,
      CodenvyOrganizationActions.MANAGE_SUB_ORGANIZATION]
  }
}

export namespace CodenvyOrganizationRoles {
  export function getValues(): Array<any> {
    return [CodenvyOrganizationRoles.MEMBER, CodenvyOrganizationRoles.ADMIN];
  }
}
