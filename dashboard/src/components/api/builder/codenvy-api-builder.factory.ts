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


import {CodenvyTeamBuilder} from './codenvy-team-builder';
import {CodenvyOrganizationsBuilder} from './codenvy-organizations-builder';
import {CodenvyPermissionsBuilder} from './codenvy-permissions-builder';
import {CodenvyResourceBuilder} from './codenvy-resource-builder';

/**
 * This class is providing the entry point for accessing the builders
 * @author Florent Benoit
 * @author Oleksii Orel
 */
export class CodenvyAPIBuilder {

  /**
   * Default constructor
   * @ngInject for Dependency injection
   */
  constructor () {
  }

  /***
   * The Codenvy Team builder
   * @returns {CodenvyTeamBuilder}
   */
  getTeamBuilder() {
    return new CodenvyTeamBuilder();
  }

  /**
   * The Codenvy Organizations builder
   *
   * @return {CodenvyOrganizationsBuilder}
   */
  getOrganizationsBuilder() {
    return new CodenvyOrganizationsBuilder();
  }

  /**
   * The Codenvy Permissions builder
   *
   * @return {CodenvyPermissionsBuilder}
   */
  getPermissionsBuilder() {
    return new CodenvyPermissionsBuilder();
  }

  /**
   * The Codenvy Resources builder
   *
   * @return {CodenvyResourceBuilder}
   */
  getResourceBuilder() {
    return new CodenvyResourceBuilder();
  }
}
