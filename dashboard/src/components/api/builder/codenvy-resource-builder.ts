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

type Resource = {
  type: string,
  amount: number,
  unit: string
}

/**
 * This class is providing a builder for Resources
 *
 * @autor Oleksii Kurinnyi
 */
export class CodenvyResourceBuilder {

  private resource: Resource;

  /**
   * Default constructor
   */
  constructor() {
    this.resource = [];
  }

  /**
   * Sets type of resource
   *
   * @param {string} type resource's type
   * @return {CodenvyResourceBuilder}
   */
  withType(type: string): CodenvyResourceBuilder {
    this.resource.type = type;
    return this;
  }

  /**
   * Sets amount of resource
   *
   * @param {number} amount resource's amount
   * @return {CodenvyResourceBuilder}
   */
  withAmount(amount: string): CodenvyResourceBuilder {
    this.resource.amount = amount;
    return this;
  }

  /**
   * Sets unit of resource
   *
   * @param {string} unit resource's unit
   * @return {CodenvyResourceBuilder}
   */
  withUnit(unit: string): CodenvyResourceBuilder {
    this.resource.unit = unit;
    return this;
  }

  /**
   * Build the resource
   *
   * @return {Resource}
   */
  build(): Resource {
    return this.resource;
  }

}

