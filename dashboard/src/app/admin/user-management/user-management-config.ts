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

import {AdminsAddUserController} from './add-user/add-user.controller';
import {AdminsUserManagementCtrl} from './user-management.controller';
import {AdminUserDetailsController} from './user-details/user-details.controller';
import {CodenvyPermissions} from '../../../components/api/codenvy-permissions.factory';

export class AdminsUserManagementConfig {

  constructor(register: che.IRegisterService) {
    register.controller('AdminUserDetailsController', AdminUserDetailsController);
    register.controller('AdminsAddUserController', AdminsAddUserController);
    register.controller('AdminsUserManagementCtrl', AdminsUserManagementCtrl);


    const userDetailLocationProvider = {
      title: 'User Details',
      reloadOnSearch: false,
      templateUrl: 'app/admin/user-management/user-details/user-details.html',
      controller: 'AdminUserDetailsController',
      controllerAs: 'adminUserDetailsController',
      resolve: {
        check: ['$q', 'codenvyPermissions', ($q: ng.IQService, codenvyPermissions: CodenvyPermissions) => {
          let defer = $q.defer();
          if (codenvyPermissions.getUserServices().hasAdminUserService) {
            defer.resolve();
          } else {
            defer.reject();
          }
          return defer.promise;
        }]
      }
    };

    // configure routes
    register.app.config(($routeProvider: ng.route.IRouteProvider) => {
      $routeProvider.accessWhen('/admin/usermanagement', {
        title: 'Users',
        templateUrl: 'app/admin/user-management/user-management.html',
        controller: 'AdminsUserManagementCtrl',
        controllerAs: 'adminsUserManagementCtrl',
        resolve: {
          check: ['$q', 'codenvyPermissions', ($q: ng.IQService, codenvyPermissions: CodenvyPermissions) => {
            let defer = $q.defer();
            if (codenvyPermissions.getUserServices().hasUserService) {
              defer.resolve();
            } else {
              defer.reject();
            }
            return defer.promise;
          }]
        }
      })
        .accessWhen('/admin/userdetails/:userId', userDetailLocationProvider);
    });

  }
}
