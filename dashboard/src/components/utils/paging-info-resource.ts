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

import {RemotePageLabels} from './remote-page-labels';

interface IData {
  maxItems?: string;
  skipCount?: string;
  [param: string]: string;
}

interface ITransformResponse {
  objects: Array<any>;
  links?: Map<string, string>;
}

interface IPageParam {
  maxItems: number;
  skipCount: number;
}

interface IPageInfo {
  countOfPages: number;
  currentPageNumber: number;
}

interface IPageDataResource<T> extends ng.resource.IResourceClass<T> {
  getPageData(): ng.resource.IResource<T>;
}

/**
 * A helper class to simplify getting paging info.
 * @author Oleksii Orel
 */
export class PagingInfoResource {

  private $q: ng.IQService;
  private $resource: ng.resource.IResourceService;
  private remoteDataAPI: IPageDataResource<any>;
  private data: IData;
  private maxItems: number;
  private skipCount: number;

  private pageInfo: IPageInfo;
  private pageObjects: Array<any> = [];
  private objectPagesMap: Map<number, any> = new Map();

  constructor(url: string, data: IData, $q: ng.IQService, $resource: ng.resource.IResourceService) {
    this.$q = $q;
    this.$resource = $resource;
    this.data = data;

    // remote call
    this.remoteDataAPI = <IPageDataResource<any>> this.$resource(url, data, {
      getPageData: {
        method: 'GET',
        isArray: false,
        responseType: 'json',
        transformResponse: (data: any, headersGetter: any) => {
          return this._getPageFromResponse(data, headersGetter('link'));
        }
      }
    });

    // set default values
    this.pageInfo = {countOfPages: 0, currentPageNumber: 0};
    this.maxItems = 30;
    this.skipCount = 0;
  }

  _getPageFromResponse(data: Array<any>, headersLink: string): ITransformResponse {
    let links: Map<string, string> = new Map();
    if (!headersLink) {
      return {objects: data};
    }
    let pattern = new RegExp('<([^>]+?)>.+?rel="([^"]+?)"', 'g');
    let result;
    // look for pattern
    while (result = pattern.exec(headersLink)) {
      // add link
      links.set(result[2], result[1]);
    }
    return {
      objects: data,
      links: links
    };
  }

  _getPageParamByLink(pageLink: string): IPageParam {
    let lastPageParamMap = new Map();
    let pattern = new RegExp('([_\\w]+)=([\\w]+)', 'g');
    let result;
    while (result = pattern.exec(pageLink)) {
      lastPageParamMap.set(result[1], result[2]);
    }
    let skipCount = lastPageParamMap.get('skipCount');
    let maxItems = lastPageParamMap.get('maxItems');

    return {
      maxItems: maxItems ? maxItems : 0,
      skipCount: skipCount ? skipCount : 0
    };
  }

  _updateCurrentPage(objects?: Array<any>): void {
    this.pageObjects.length = 0;
    let pageData = angular.isDefined(objects) ? objects : this.objectPagesMap.get(this.pageInfo.currentPageNumber);
    if (!pageData || !pageData.objects) {
      return;
    }

    pageData.objects.forEach((object: any) => {
      // add object
      this.pageObjects.push(object);
    });
  }

  /**
   * Update page links by relative direction ('first', 'prev', 'next', 'last')
   */
  _updatePagesData(data: ITransformResponse): void {
    if (!data.links) {
      return;
    }
    let firstPageLink = data.links.get(RemotePageLabels.FIRST);
    if (firstPageLink) {
      let firstPageData: { objects?: Array<any>; link?: string; } = {link: firstPageLink};
      if (this.pageInfo.currentPageNumber === 1) {
        firstPageData.objects = data.objects;
      }
      if (!this.objectPagesMap.get(1) || firstPageData.objects) {
        this.objectPagesMap.set(1, firstPageData);
      }
    }
    let lastPageLink = data.links.get(RemotePageLabels.LAST);
    if (lastPageLink) {
      let pageParam = this._getPageParamByLink(lastPageLink);
      this.pageInfo.countOfPages = pageParam.skipCount / pageParam.maxItems + 1;
      let lastPageData: { objects?: Array<any>; link?: string; } = {link: lastPageLink};
      if (this.pageInfo.currentPageNumber === this.pageInfo.countOfPages) {
        lastPageData.objects = data.objects;
      }
      if (!this.objectPagesMap.get(this.pageInfo.countOfPages) || lastPageData.objects) {
        this.objectPagesMap.set(this.pageInfo.countOfPages, lastPageData);
      }
    }
    let prevPageLink = data.links.get(RemotePageLabels.PREVIOUS);
    let prevPageNumber = this.pageInfo.currentPageNumber - 1;
    if (prevPageNumber > 0 && prevPageLink) {
      let prevPageData = {link: prevPageLink};
      if (!this.objectPagesMap.get(prevPageNumber)) {
        this.objectPagesMap.set(prevPageNumber, prevPageData);
      }
    }
    let nextPageLink = data.links.get(RemotePageLabels.NEXT);
    let nextPageNumber = this.pageInfo.currentPageNumber + 1;
    if (nextPageLink) {
      let lastPageData = {link: nextPageLink};
      if (!this.objectPagesMap.get(nextPageNumber)) {
        this.objectPagesMap.set(nextPageNumber, lastPageData);
      }
    }
  }

  /**
   * Ask for loading the objects in asynchronous way
   * If there are no changes, it's not updated
   * @param maxItems - the max number of items to return
   * @returns {*} the promise
   */
  fetchObjects(maxItems?: number): ng.IPromise<any> {
    if (maxItems) {
      this.data.maxItems = maxItems.toString();
    }
    this.data.skipCount = '0';
    let promise = this.remoteDataAPI.getPageData().$promise;

    return promise.then((data: any) => {
      this.pageInfo.currentPageNumber = 1;
      this._updateCurrentPage(data);
      this._updatePagesData(data);
      return this.pageObjects;
    }, (error: any) => {
      if (error && error.status === 304) {
        return this.pageObjects;
      }
      return this.$q.reject(error);
    });
  }

  /**
   * Ask for loading the page objects in asynchronous way
   * If there are no changes, it's not updated
   * @param pageKey {string} - the key of page ('first', 'prev', 'next', 'last'  or '1', '2', '3' ...)
   * @returns {ng.IPromise<any>} the promise
   */
  fetchPageObjects(pageKey: string): ng.IPromise<any> {
    let deferred = this.$q.defer();
    let pageNumber;

    switch (pageKey) {
      case RemotePageLabels.FIRST:
        pageNumber = 1;
        break;
      case RemotePageLabels.PREVIOUS:
        pageNumber = pageNumber > 1 ? this.pageInfo.currentPageNumber - 1 : 1;
        break;
      case RemotePageLabels.NEXT:
        pageNumber = this.pageInfo.countOfPages > this.pageInfo.currentPageNumber ? this.pageInfo.currentPageNumber + 1 : this.pageInfo.currentPageNumber;
        break;
      case RemotePageLabels.LAST:
        pageNumber = this.pageInfo.countOfPages;
        break;
      default:
        pageNumber = parseInt(pageKey, 10);
    }
    let pageData = this.objectPagesMap.get(pageNumber);
    if (pageData.link) {
      this.pageInfo.currentPageNumber = pageNumber;

      let pageParam = this._getPageParamByLink(pageData.link);
//      let data = angular.copy(this.data);
      this.data.maxItems = pageParam.maxItems.toString();
      this.data.skipCount = pageParam.skipCount.toString();

      let promise = this.remoteDataAPI.getPageData().$promise;
      promise.then((data: ITransformResponse) => {
        this._updatePagesData(data);
        pageData.objects = data.objects;
        this._updateCurrentPage();
        deferred.resolve(this.pageObjects);
      }, (error: any) => {
        if (error && error.status === 304) {
          this._updateCurrentPage();
          deferred.resolve(this.pageObjects);
        }
        deferred.reject(error);
      });
    } else {
      deferred.reject({data: {message: 'Error. No necessary link.'}});
    }

    return deferred.promise;
  }

  /**
   * Gets the pageInfo object
   * @returns {IPageInfo}
   */
  getPagesInfo(): IPageInfo {
    return this.pageInfo;
  }

  /**
   * Gets the page objects
   * @returns {Array<any>}
   */
  getPageObjects(): Array<any> {
    return this.pageObjects;
  }
}
