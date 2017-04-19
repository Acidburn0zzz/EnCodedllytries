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

import {CodenvyOrganizationRoles} from './codenvy-organization-roles';
import {PagingInfoResource} from '../utils/paging-info-resource';

interface IOrganizationsResource<T> extends ng.resource.IResourceClass<T> {
  getOrganizations(): ng.resource.IResource<T>;
  createOrganization(data: { name: string, parent?: string }): ng.resource.IResource<T>;
  fetchOrganization(data: { id: string }): ng.resource.IResource<T>;
  deleteOrganization(data: { id: string }): ng.resource.IResource<T>;
  updateOrganization(data: { id: string }, organization: codenvy.IOrganization): ng.resource.IResource<T>;
  fetchSubOrganizations(data: { id: string }): ng.resource.IResource<T>;
}

/**
 * This class is handling the interactions with Organization management API.
 *
 * @author Oleksii Orel
 */
export class CodenvyOrganization {
  /**
   * Angular Resource service.
   */
  private $resource: ng.resource.IResourceService;
  private $q: ng.IQService;
  private lodash: any;
  /**
   * Organizations map by organization's id.
   */
  private organizationsMap: Map<string, any> = new Map();
  /**
   * Array of organizations.
   */
  private organizations: Array<codenvy.IOrganization> = [];
  /**
   * Client for requesting Organization API.
   */
  private remoteOrganizationAPI: IOrganizationsResource<any>;
  /**
   * Organizations map by parent organization's id.
   */
  private subOrganizationsMap: Map<string, any> = new Map();

  private organizationsPagingInfo: PagingInfoResource;

  private requestData: {userId?: string; [param: string]: string};

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor($resource: ng.resource.IResourceService, $q: ng.IQService, lodash: any) {
    this.$resource = $resource;
    this.$q = $q;
    this.lodash = lodash;

    this.remoteOrganizationAPI = <IOrganizationsResource<any>>$resource('/api/organization', {}, {
      getOrganizations: {method: 'GET', url: '/api/organization', isArray: true},
      fetchOrganization: {method: 'GET', url: '/api/organization/:id'},
      createOrganization: {method: 'POST', url: '/api/organization'},
      deleteOrganization: {method: 'DELETE', url: '/api/organization/:id'},
      updateOrganization: {method: 'POST', url: '/api/organization/:id'},
      fetchSubOrganizations: {method: 'GET', url: '/api/organization/:id/organizations'}
    });

    this.requestData = {};
    this.organizationsPagingInfo = new PagingInfoResource('/api/organization', this.requestData, $q, $resource);
  }

  /**
   * Request the list of available organizations with the same parent id.
   *
   * @param id {string} parent organization's id
   * @returns {ng.IPromise<any>}
   */
  fetchSubOrganizationsById(id: string): ng.IPromise<any> {
    let data = {'id': id};
    let promise = this.remoteOrganizationAPI.fetchSubOrganizations(data).$promise;
    let resultPromise = promise.then((organizations: Array<any>) => {
      this.subOrganizationsMap.set(id, organizations);
      return organizations;
    }, (error: any) => {
      if (error.status === 304) {
        return this.subOrganizationsMap.get(id);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Request the list of available organizations.
   *
   * @returns {ng.IPromise<any>}
   */
  fetchOrganizations(maxItems?: number, userId?: string): ng.IPromise<any> {
    if (angular.isDefined(userId)) {
      this.requestData.userId = userId;
    } else if (this.requestData.userId) {
      delete this.requestData.userId;
    }
    let promise = this.organizationsPagingInfo.fetchObjects(maxItems);

    let resultPromise = promise.then((organizations: Array<codenvy.IOrganization>) => {
      this.organizations.length = 0;
      this.organizationsMap.clear();
      organizations.forEach((organization: codenvy.IOrganization) => {
        this.organizations.push(organization);
        this.organizationsMap.set(organization.id, organization);
      });
      return this.organizations;
    }, (error: any) => {
        return this.$q.reject(error);
    });

    return resultPromise;
  }

  /**
   * Ask for loading the organization page objects
   * @param pageKey {string} - the key of page ('first', 'prev', 'next', 'last'  or '1', '2', '3' ...)
   * @returns {ng.IPromise<any>} the promise
   */
  fetchOrganizationPageObjects(pageKey: string, userId?: string): ng.IPromise<any> {
    if (angular.isDefined(userId)) {
      this.requestData.userId = userId;
    } else if (this.requestData.userId) {
      delete this.requestData.userId;
    }
    return this.organizationsPagingInfo.fetchPageObjects(pageKey);
  }

  /**
   * Returns the array of organizations.
   *
   * @returns {Array<any>} the array of organizations
   */
  getOrganizations(): Array<any> {
    return this.organizations;
  }

  /**
   * Requests organization by it's id.
   *
   * @param id the organization's Id
   * @returns {ng.IPromise<any>} result promise
   */
  fetchOrganizationById(id: string): ng.IPromise<any> {
    let data = {'id': id};
    let promise = this.remoteOrganizationAPI.fetchOrganization(data).$promise;
    let resultPromise = promise.then((organization: codenvy.IOrganization) => {
      this.organizationsMap.set(id, organization);
      return organization;
    }, (error: any) => {
      if (error.status === 304) {
        return this.organizationsMap.get(id);
      }
      return this.$q.reject();
    });

    return resultPromise;
  }

  /**
   * Returns organization by it's id.
   *
   * @param id {string} organization's id
   * @returns {any} organization or <code>null</code> if not found
   */
  getOrganizationById(id: string): any {
    return this.organizationsMap.get(id);
  }

  getOrganizationByName(name: string) {
    return this.organizations.find((organization: codenvy.IOrganization) => {
      return organization.qualifiedName === name;
    });
  }


  /**
   * Creates new organization with pointed name.
   *
   * @param name the name of the organization to be created
   * @param parentId {string} the id of the parent organization
   * @returns {ng.IPromise<any>} result promise
   */
  createOrganization(name: string, parentId?: string): ng.IPromise<any> {
    let data: { name: string; parent?: string } = {name: name};
    if (parentId) {
      data.parent = parentId;
    }
    return this.remoteOrganizationAPI.createOrganization(data).$promise;
  }

  /**
   * Delete organization by pointed id.
   *
   * @param id organization's id to be deleted
   * @returns {ng.IPromise<any>} result promise
   */
  deleteOrganization(id: string): ng.IPromise<any> {
    let promise = this.remoteOrganizationAPI.deleteOrganization({'id': id}).$promise;
    return promise;
  }

  /**
   * Update organization's info.
   *
   * @param organization {codenvy.IOrganization} the organization info to be updated
   * @returns {ng.IPromise<any>} result promise
   */
  updateOrganization(organization: codenvy.IOrganization): ng.IPromise<any> {
    let promise = this.remoteOrganizationAPI.updateOrganization({'id': organization.id}, organization).$promise;
    return promise;
  }

  /**
   * Forms the list of roles based on the list of actions
   *
   * @param actions array of actions
   * @returns {Array<codenvy.IRole>} array of roles
   */
  getRolesFromActions(actions: Array<string>): Array<codenvy.IRole> {
    let roles = [];
    let organizationRoles = CodenvyOrganizationRoles.getValues();
    organizationRoles.forEach((role: codenvy.IRole) => {
      if (this.lodash.difference(role.actions, actions).length === 0) {
        roles.push(role);
      }
    });

    // avoid roles intake (filter if any role's action is subset of any other):
    roles = this.lodash.filter(roles, (role: codenvy.IRole) => {
      return !this._checkIsSubset(role, roles);
    });

    return roles;
  }

  /**
   * Checks the actions in provided role to be part (subset) of any other role's actions.
   *
   * @param role role to be checked
   * @param roles list of roles
   * @returns {boolean} <code>true</code> if subset
   * @private
   */
  _checkIsSubset(role: any, roles: Array<any>): boolean {
    let isSubset = false;
    for (let i = 0; i < roles.length; i++) {
      let r = roles[i];
      // checks provided role's action is subset of any other role's actions in the roles list:
      if (role.actions.length === this.lodash.intersection(role.actions, r.actions).length && role.actions.length !== r.actions.length) {
        return true;
      }
    }

    return isSubset;
  }

  /**
   * Forms the list actions based on the list of roles.
   *
   * @param {Array<codenvy.IRole>} roles array of roles
   * @returns {Array<string>} actions array
   */
  getActionsFromRoles(roles: Array<codenvy.IRole>): Array<string> {
    let actions = [];
    roles.forEach((role: any) => {
      actions = actions.concat(role.actions);
    });

    return actions;
  }
}
