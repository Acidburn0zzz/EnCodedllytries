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

enum Tab {Profile, Organization}

interface IScope extends ng.IScope {
  profileInformationForm: ng.IFormController;
}

interface IProfileAttributes {
  phone?: string;
  country?: string;
  employer?: string;
  jobtitle?: string;
  lastName?: string;
  firstName?: string;
}

/**
 * Controller for user details.
 *
 * @author Oleksii Orel
 */
export class AdminUserDetailsController {
  tab: Object = Tab;

  /**
   * Angular Route service.
   */
  private $route: ng.route.IRouteService;
 /**
  * Angular Location service.
  */
  private $location: ng.ILocationService;
  /**
   * IScope service.
   */
  private $scope: IScope;
  /**
   * User profile service.
   */
  private cheProfile: any;
  /**
   * Notification service.
   */
  private cheNotification: any;
  /**
   * Index of the selected tab.
   */
  private selectedTabIndex: number = 0;
  /**
   * User profile.
   */
  private profile: che.IProfile;
  /**
   * Profile attributes.
   */
  private profileAttributes: IProfileAttributes;
  /**
   * Loading state of the page.
   */
  private isLoading: boolean;

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor(cheProfile: any, $location: ng.ILocationService, $timeout: ng.ITimeoutService, $scope: ng.IScope, $route: ng.route.IRouteService, cheNotification: any) {
    this.$location = $location;
    this.$scope = <IScope>$scope;
    this.cheProfile = cheProfile;
    this.$route = $route;
    this.cheNotification = cheNotification;

    this.updateSelectedTab(this.$location.search().tab);
    let deRegistrationFn = $scope.$watch(() => {
      return $location.search().tab;
    }, (tab: string) => {
      if (!angular.isUndefined(tab)) {
        this.updateSelectedTab(tab);
      }
    }, true);
    $scope.$on('$destroy', () => {
      deRegistrationFn();
    });

    this.updateData();

    let timeoutPromise: ng.IPromise<any>;
    $scope.$watch(() => {
      return this.profile.attributes;
    }, () => {
      if (!this.$scope.profileInformationForm || this.$scope.profileInformationForm.$invalid) {
        return;
      }
      $timeout.cancel(timeoutPromise);

      timeoutPromise = $timeout(() => {
        this.setProfileAttributes();
      }, 500);
    }, true);
    $scope.$on('$destroy', () => {
      if (timeoutPromise) {
        $timeout.cancel(timeoutPromise);
      }
    });
  }

  /**
   * Update data.
   */
  updateData(): void {
    let userId = this.$route.current.params.userId;
    if (!userId) {
      return;
    }
    this.isLoading = true;
    this.cheProfile.fetchProfileId(userId).then(() => {
      this.isLoading = false;
      this.profile = this.cheProfile.getProfileFromId(userId);
      this.profileAttributes = angular.copy(this.profile.attributes);
    }, (error: any) => {
      this.isLoading = false;
      if (error && error.status === 304) {
        this.profile = this.cheProfile.getProfileFromId(userId);
        this.profileAttributes = angular.copy(this.profile.attributes);
      }
    });
  }

  /**
   * Check if profile attributes have changed
   * @returns {boolean}
   */
  isAttributesChanged(): boolean {
    return !angular.equals(this.profile.attributes, this.profileAttributes);
  }

  /**
   * Set profile attributes
   */
  setProfileAttributes() {
    if (angular.equals(this.profile.attributes, this.profileAttributes)) {
      return;
    }
    let promise = this.cheProfile.setAttributes(this.profileAttributes);

    promise.then(() => {
      this.cheNotification.showInfo('Profile successfully updated.');
      this.updateData();
    }, (error: any) => {
        this.profileAttributes = angular.copy(this.profile.attributes);
        this.cheNotification.showError(error.data.message ? error.data.message : 'Profile update failed.');
    });
  }

  /**
   * Update selected tab index by search part of URL.
   *
   * @param {string} tab
   */
  updateSelectedTab(tab: string): void {
    this.selectedTabIndex = parseInt(this.tab[tab], 10);
  }

  /**
   * Changes search part of URL.
   *
   * @param {number} tabIndex
   */
  onSelectTab(tabIndex?: number): void {
    let param: { tab?: string } = {};
    if (!angular.isUndefined(tabIndex)) {
      param.tab = Tab[tabIndex];
    }
    if (angular.isUndefined(this.$location.search().tab)) {
      this.$location.replace();
    }
    this.$location.search(param);
  }

}
