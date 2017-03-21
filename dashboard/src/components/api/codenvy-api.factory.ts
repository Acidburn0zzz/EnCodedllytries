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
import {CodenvyPermissions} from './codenvy-permissions.factory';
import {CodenvySystem} from './codenvy-system.factory';
import {CodenvyTeam} from './codenvy-team.factory';
import {CodenvyOrganization} from './codenvy-organizations.factory';
import {CodenvyPayment} from './codenvy-payment.factory';
import {CodenvyLicense} from './codenvy-license.factory';
import {CodenvyInvoices} from './codenvy-invoices.factory';


/**
 * This class is providing the entry point for accessing to Codenvy API
 * It handles workspaces, projects, etc.
 * @author Florent Benoit
 */
export class CodenvyAPI {
  private codenvyPermissions: CodenvyPermissions;
  private codenvySystem: CodenvySystem;
  private codenvyLicense: CodenvyLicense;
  private codenvyTeam: CodenvyTeam;
  private codenvyOrganization: CodenvyOrganization;
  private codenvyPayment: CodenvyPayment;
  private codenvyInvoices: CodenvyInvoices;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor(codenvyPermissions, codenvySystem, codenvyLicense, codenvyTeam, codenvyOrganization: CodenvyOrganization, codenvyPayment, codenvyInvoices) {
    this.codenvyPermissions = codenvyPermissions;
    this.codenvySystem = codenvySystem;
    this.codenvyLicense = codenvyLicense;
    this.codenvyTeam = codenvyTeam;
    this.codenvyOrganization = codenvyOrganization;
    this.codenvyPayment = codenvyPayment;
    this.codenvyInvoices = codenvyInvoices;
  }

  /**
   * The Codenvy Payment API
   * @returns {CodenvyPayment|*}
   */
  getPayment(): CodenvyPayment {
    return this.codenvyPayment;
  }

  /**
   * The System License API interaction service.
   *
   * @returns {CodenvyLicense}
   */
  getLicense(): CodenvyLicense {
    return this.codenvyLicense;
  }

  /**
   * The Codenvy Permissions API
   * @returns {CodenvyPermissions|*}
   */
  getPermissions(): CodenvyPermissions {
    return this.codenvyPermissions;
  }

  /**
   * The Codenvy System API
   * @returns {CodenvySystem|*}
   */
  getSystem(): CodenvySystem {
    return this.codenvySystem;
  }

  getTeam(): CodenvyTeam {
    return this.codenvyTeam;
  }

  getOrganization(): CodenvyOrganization {
    return this.codenvyOrganization;
  }

  /**
   * The Codenvy Invoices API.
   *
   * @returns {CodenvyInvoices}
   */
  getInvoices(): CodenvyInvoices {
    return this.codenvyInvoices;
  }
}
