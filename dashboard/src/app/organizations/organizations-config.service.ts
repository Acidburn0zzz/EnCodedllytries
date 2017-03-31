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
import {CodenvyOrganization} from '../../components/api/codenvy-organizations.factory';
import {CodenvyPermissions} from '../../components/api/codenvy-permissions.factory';
import {CodenvyResourcesDistribution} from '../../components/api/codenvy-resources-distribution.factory';

export class OrganizationsConfigService {
  /**
   * Log service.
   */
  private $log: ng.ILogService;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Route service.
   */
  private $route: ng.route.IRouteService;
  /**
   * Organization API interaction.
   */
  private codenvyOrganization: CodenvyOrganization;
  /**
   * Permissions API interaction.
   */
  private codenvyPermissions: CodenvyPermissions;
  /**
   * Organization resources API interaction.
   */
  private codenvyResourcesDistribution: CodenvyResourcesDistribution;

  /** Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor($log: ng.ILogService,
              $q: ng.IQService,
              $route: ng.route.IRouteService,
              codenvyOrganization: CodenvyOrganization,
              codenvyPermissions: CodenvyPermissions,
              codenvyResourcesDistribution: CodenvyResourcesDistribution) {
    this.$log = $log;
    this.$q = $q;
    this.$route = $route;
    this.codenvyOrganization = codenvyOrganization;
    this.codenvyPermissions = codenvyPermissions;
    this.codenvyResourcesDistribution = codenvyResourcesDistribution;
  }

  waitAll(promises: Array<ng.IPromise<any>>): ng.IPromise<any> {
    return this.$q.all(promises).then((results: any) => {
      return results;
    }, (error: any) => {
      this.logError(error);
    });
  }

  /**
   * Fetches all organizations.
   *
   * @return {IPromise<any>}
   */
  fetchOrganizations(): ng.IPromise<any> {
    const defer = this.$q.defer();

    // we should resolve this promise in any case to show 'not found page' in case with error
    this.codenvyOrganization.fetchOrganizations().finally(() => {
      const organizations = this.codenvyOrganization.getOrganizations();
      defer.resolve(organizations);
    });

    return defer.promise;
  }

  /**
   * Fetches organization by its name.
   *
   * @param {string} name organization name
   * @return {IPromise<any>}
   */
  getOrFetchOrganizationByName(name: string): ng.IPromise<any> {
    const defer = this.$q.defer();

    const organization = this.codenvyOrganization.getOrganizationByName(name);
    if (organization) {
      defer.resolve(organization);
    } else {
      this.codenvyOrganization.fetchOrganizations().then(() => {
        const organization = this.codenvyOrganization.getOrganizationByName(name);
        if (organization) {
          defer.resolve(organization);
        } else {
          defer.reject(`Organization "${name}" is not found.`);
        }
      }, (error: any) => {
        defer.reject(error);
      });
    }

    return defer.promise;
  }

  /**
   * Fetches permissions of organization.
   *
   * @param {string} id organization ID
   * @return {IPromise<any>}
   */
  getOrFetchOrganizationPermissions(id: string): ng.IPromise<any> {
    const defer = this.$q.defer();

    const permissions = this.codenvyPermissions.getOrganizationPermissions(id);
    if (permissions) {
      defer.resolve();
    } else {
      this.codenvyPermissions.fetchOrganizationPermissions(id).then(() => {
        defer.resolve();
      }, (error: any) => {
        this.logError(error);
        defer.resolve();
      })
    }

    return defer.promise;
  }

  /**
   * Fetches resources of organization.
   *
   * @param {string} id organization ID
   * @return {IPromise<any>}
   */
  getOrFetchOrganizationResources(id: string): ng.IPromise<any> {
    const defer = this.$q.defer();

    const resources = this.codenvyResourcesDistribution.getOrganizationResources(id);
    if (resources) {
      defer.resolve();
    } else {
      this.codenvyResourcesDistribution.fetchOrganizationResources(id).then(() => {
        defer.resolve();
      }, (error: any) => {
        this.logError(error);
        defer.resolve();
      })
    }

    return defer.promise;
  }

  /**
   * Fetches resources of root organization.
   *
   * @param {string} id organization ID
   * @return {IPromise<any>}
   */
  getOrFetchTotalOrganizationResources(id: string): ng.IPromise<any> {
    const defer = this.$q.defer();

    const resources = this.codenvyResourcesDistribution.getTotalOrganizationResources(id);
    if (resources) {
      defer.resolve();
    } else {
      this.codenvyResourcesDistribution.fetchTotalOrganizationResources(id).then(() => {
        defer.resolve();
      }, (error: any) => {
        this.logError(error);
        defer.resolve();
      })
    }

    return defer.promise;
  }

  /**
   * Prints error message.
   *
   * @param {any} error error object or string
   */
  logError(error: any): void {
    if (!error) {
      return;
    }
    const message = error.data && error.data.message ? error.data.message : error;
    this.$log.error(message);
  }
}
