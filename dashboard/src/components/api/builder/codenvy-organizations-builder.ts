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
 * This class is providing a builder for Organization
 *
 * @autor Oleksii Kurinnyi
 */
export class CodenvyOrganizationsBuilder {

  private organization: codenvy.IOrganization;

  /**
   * Default constructor
   */
  constructor() {
    this.organization = {
      id: '',
      links: [],
      name: '',
      qualifiedName: ''
    };
  }

  /**
   * Sets the ID of the organization
   *
   * @param {string} id organization ID
   * @return {CodenvyOrganizationsBuilder}
   */
  withId(id: string): CodenvyOrganizationsBuilder {
    this.organization.id = id;
    return this;
  }

  /**
   * Sets the id of the parent organization
   *
   * @param {string} id parent organization ID
   * @return {CodenvyOrganizationsBuilder}
   */
  withParentId(id: string): CodenvyOrganizationsBuilder {
    this.organization.parent = id;
    return this;
  }

  /**
   * Sets the name of the organization
   *
   * @param {string} name organization name
   * @return {CodenvyOrganizationsBuilder}
   */
  withName(name: string): CodenvyOrganizationsBuilder {
    this.organization.name = name;
    return this;
  }

  /**
   * Sets the qualified name of the organization
   *
   * @param {string} name qualified name of organization
   * @return {CodenvyOrganizationsBuilder}
   */
  withQualifiedName(name: string): CodenvyOrganizationsBuilder {
    this.organization.qualifiedName = name;
    return this;
  }

  /**
   * Build the organization
   *
   * @return {codenvy.IOrganization}
   */
  build(): codenvy.IOrganization {
    return this.organization;
  }

}
