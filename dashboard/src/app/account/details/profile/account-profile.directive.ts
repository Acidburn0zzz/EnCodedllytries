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

interface IAccountProfileScope extends ng.IScope {
  profileAttributes: {
    phone?: string;
    country?: string;
    employer?: string;
    jobtitle?: string;
    lastName?: string;
    firstName?: string;
  };
  profileInformationForm: ng.IFormController;
  countries?: Array<{ 'name': string, 'code': string }>;
  jobs?: Array<{ 'name': string }>;
}

/**
 * @ngdoc directive
 * @name account.profile.directive:accountProfile
 * @restrict E
 * @element
 *
 * @description
 * <account-profile profile-attributes="ctrl.profileAttributes"></account-profile>` for displaying account profile.
 *
 * @usage
 *   <account-profile profile-attributes="ctrl.profileAttributes"></account-profile>
 *
 * @author Florent Benoit
 */
export class AccountProfile implements ng.IDirective {
  restrict = 'E';
  templateUrl = 'app/account/details/profile/account-profile.html';
  replace = true;
  scope = {
    profileAttributes: '=profileAttributes',
    profileInformationForm: '=?profileInformationForm'
  };

  jsonCountries: string;
  jsonJobs: string;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(jsonCountries: string, jsonJobs: string) {
    this.jsonCountries = jsonCountries;
    this.jsonJobs = jsonJobs;
  }

  link($scope: IAccountProfileScope) {
    $scope.countries = angular.fromJson(this.jsonCountries);
    $scope.jobs = angular.fromJson(this.jsonJobs);
  }
}
