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
 * This is class of remote page labels.
 *
 * @author Oleksii Orel
 */
export class RemotePageLabels {

  static get FIRST(): string {
    return 'first';
  }
  static get PREVIOUS(): string {
    return 'prev';
  }
  static get NEXT(): string {
    return 'next';
  }
  static get LAST(): string {
    return 'last';
  }
}
