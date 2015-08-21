/*
 * CODENVY CONFIDENTIAL
 * __________________
 *
 *  [2012] - [2015] Codenvy, S.A.
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
package com.codenvy.im;

import org.apache.sshd.SshServer;
import org.apache.sshd.server.keyprovider.SimpleGeneratorHostKeyProvider;
import org.apache.sshd.server.shell.ProcessShellFactory;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Create SSH server for testing proposes.
 */
public class SshServerFactory {
    public static final String TEST_SSH_USER = "testUser";
    public static final String TEST_SSH_HOST = "127.0.0.1";
    public static final int    TEST_SSH_PORT = 2050;

    private static final Path TEST_SSH_AUTH_PUBLIC_KEY =
        Paths.get(BaseTest.class.getClassLoader().getResource("../test-classes/test_rsa.pub.txt").getFile());

    public static final Path TEST_SSH_AUTH_PRIVATE_KEY =
        Paths.get(BaseTest.class.getClassLoader().getResource("../test-classes/test_rsa.txt").getFile());

    /**
     * Get SSH server with shell support bound to port 2050
     */
    public static SshServer createSshd() {
        SshServer sshd = SshServer.setUpDefaultServer();
        sshd.setPort(TEST_SSH_PORT);

        sshd.setKeyPairProvider(new SimpleGeneratorHostKeyProvider(TEST_SSH_AUTH_PUBLIC_KEY.toAbsolutePath().toString()));
        sshd.setPublickeyAuthenticator((s, publicKey, serverSession) -> true);
        sshd.setCommandFactory(command -> new ProcessShellFactory(command.split(" ")).create());

        return sshd;
    }
}
