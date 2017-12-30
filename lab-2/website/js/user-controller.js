var userController = {
    data: {
        auth0Lock: null,
        config: null
    },
    uiElements: {
        loginButton: null,
        logoutButton: null,
        profileButton: null,
        profileNameLabel: null,
        profileImage: null
    },
    init: function(config) {
        this.uiElements.loginButton = $('#auth0-login');
        this.uiElements.logoutButton = $('#auth0-logout');
        this.uiElements.profileButton = $('#user-profile');
        this.uiElements.profileNameLabel = $('#profilename');
        this.uiElements.profileImage = $('#profilepicture');

        this.data.config = config;
        //this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain);

        this.data.webAuth = new auth0.WebAuth({
            domain: config.auth0.domain,
            clientID: config.auth0.clientId,
            redirectUri: location.href,
            audience: 'https://' + config.auth0.domain + '/userinfo',
            responseType: 'token id_token',
            scope: 'openid profile',
            leeway: 60
        });


        // check to see if the user has previously logged in
        var idToken = localStorage.getItem('userToken');

        if (idToken) {
            //this.configureAuthenticatedRequests();

            var that = this;

            /*this.data.auth0Lock.getProfile(idToken, function (err, profile) {
                if (err) {
                    return alert('There was an error getting the profile: ' + err.message);
                }
                // Display user information
                that.showUserAuthenticationDetails(profile);

            });*/

            that.data.webAuth.client.userInfo(idToken, function(err, profile) {
                if (err) {
                    return alert('There was an error getting the profile: ' + err.message);
                }
                // Display user information
                that.showUserAuthenticationDetails(profile);

            });
        } else {
            var that = this;

            that.data.webAuth.parseHash(function(err, authResult) {
                if (authResult && authResult.accessToken && authResult.idToken) {
                    window.location.hash = '';

                    localStorage.setItem('userToken', authResult.accessToken);

                    // this.configureAuthenticatedRequests();

                    that.data.webAuth.client.userInfo(authResult.accessToken, function(err, profile) {
                        if (err) {
                            return alert('There was an error getting the profile: ' + err.message);
                        }
                        // Display user information
                        that.showUserAuthenticationDetails(profile);

                    });



                } else if (err) {

                    console.log(err);
                    alert(
                        'Error: ' + err.error + '. Check the console for further details.'
                    );
                }

            });

        }

        this.wireEvents();
    },
    configureAuthenticatedRequests: function() {
        $.ajaxSetup({
            'beforeSend': function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
            }
        });
    },
    showUserAuthenticationDetails: function(profile) {
        console.log(profile);

        var showAuthenticationElements = !!profile;

        if (showAuthenticationElements) {
            this.uiElements.profileNameLabel.text(profile.nickname);
            this.uiElements.profileImage.attr('src', profile.picture);
        }

        this.uiElements.loginButton.toggle(!showAuthenticationElements);
        this.uiElements.logoutButton.toggle(showAuthenticationElements);
        this.uiElements.profileButton.toggle(showAuthenticationElements);
    },
    wireEvents: function() {
        var that = this;

        this.uiElements.loginButton.click(function(e) {
            var params = {
                authParams: {
                    scope: 'openid email user_metadata picture'
                }
            };

            that.data.webAuth.authorize();
            /* that.data.auth0Lock.show(params, function (err, profile, token) {
                 if (err) {
                     // Error callback
                     alert('There was an error');
                 } else {
                     // Save the JWT token.
                     localStorage.setItem('userToken', token);

                     that.configureAuthenticatedRequests();

                     that.showUserAuthenticationDetails(profile);
                 }
             });*/
        });

        this.uiElements.logoutButton.click(function(e) {
            localStorage.removeItem('userToken');

            that.uiElements.logoutButton.hide();
            that.uiElements.profileButton.hide();
            that.uiElements.loginButton.show();
        });
    }
};