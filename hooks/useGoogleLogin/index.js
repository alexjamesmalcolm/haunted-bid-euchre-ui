import { useState, useEffect } from "../../dependencies/index.js";
import { loadScript } from "./loadScript.js";
import { removeScript } from "./removeScript.js";

export const useGoogleLogin = ({
  onSuccess,
  clientId,
  cookiePolicy,
  loginHint,
  hostedDomain,
  autoLoad,
  isSignedIn,
  fetchBasicProfile,
  redirectUri,
  discoveryDocs,
  onFailure,
  uxMode,
  scope,
  accessType,
  responseType,
  jsSrc = "https://apis.google.com/js/api.js",
  onRequest = () => {},
  prompt,
}) => {
  const [loaded, setLoaded] = useState(false);

  const handleSigninSuccess = (res) => {
    /*
      offer renamed response keys to names that match use
    */
    const basicProfile = res.getBasicProfile();
    const authResponse = res.getAuthResponse();
    res.googleId = basicProfile.getId();
    res.tokenObj = authResponse;
    res.tokenId = authResponse.id_token;
    res.accessToken = authResponse.access_token;
    res.profileObj = {
      googleId: basicProfile.getId(),
      imageUrl: basicProfile.getImageUrl(),
      email: basicProfile.getEmail(),
      name: basicProfile.getName(),
      givenName: basicProfile.getGivenName(),
      familyName: basicProfile.getFamilyName(),
    };
    onSuccess(res);
  };

  const signIn = (e) => {
    if (e) {
      e.preventDefault(); // to prevent submit if used within form
    }
    if (loaded) {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const options = {
        prompt,
      };
      onRequest();
      if (responseType === "code") {
        auth2.grantOfflineAccess(options).then(
          (res) => onSuccess(res),
          (err) => onFailure(err)
        );
      } else {
        auth2.signIn(options).then(
          (res) => handleSigninSuccess(res),
          (err) => onFailure(err)
        );
      }
    }
  };

  useEffect(() => {
    let unmounted = false;
    loadScript(document, "script", "google-login", jsSrc, () => {
      const params = {
        client_id: clientId,
        cookie_policy: cookiePolicy,
        login_hint: loginHint,
        hosted_domain: hostedDomain,
        fetch_basic_profile: fetchBasicProfile,
        discoveryDocs,
        ux_mode: uxMode,
        redirect_uri: redirectUri,
        scope,
        access_type: accessType,
      };

      if (responseType === "code") {
        params.access_type = "offline";
      }

      window.gapi.load("auth2", () => {
        if (!window.gapi.auth2.getAuthInstance()) {
          window.gapi.auth2.init(params).then(
            (res) => {
              if (!unmounted) {
                setLoaded(true);
                if (isSignedIn && res.isSignedIn.get()) {
                  handleSigninSuccess(res.currentUser.get());
                }
              }
            },
            (err) => onFailure(err)
          );
        } else if (!unmounted) {
          setLoaded(true);
        }
      });
    });

    return () => {
      unmounted = true;
      removeScript(document, "google-login");
    };
  }, []);

  useEffect(() => {
    if (autoLoad) {
      signIn();
    }
  }, [loaded]);

  return { signIn, loaded };
};
