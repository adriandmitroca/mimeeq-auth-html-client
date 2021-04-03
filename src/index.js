import Cookies from "js-cookie";

const config = {
    cookieKey: "mimeeq-auth",
    cookieExpireInDays: 365,
    modalQueryParam: "auth",
    modalQueryValue: "mimeeq",
    ...(window.mimeeqHtmlConfig || {}),
};

const setSessionCookie = (body) => {
    Cookies.set(config.cookieKey, body, { expires: config.cookieExpireInDays });
};

const removeSessionCookie = () => {
    Cookies.remove(config.cookieKey);
};

const isLoggedIn = () => {
    return !!Cookies.get(config.cookieKey);
};

const openLoginModal = () => {
    mimeeqAuth.mountLogin({
        onLoginSuccess: (res) => {
            setSessionCookie(res);
            window.location.reload();
        },
    });
};

const setupAuth = () => {
    const onElements = document.querySelectorAll(
        "[mimeeq-auth-on], .mimeeq-auth-off, [mimeeq-logout], .mimeeq-logout, [mimeeq-profile], .mimeeq-profile"
    );
    const offElements = document.querySelectorAll(
        "[mimeeq-auth-off], .mimeeq-auth-off, [mimeeq-login], .mimeeq-login"
    );

    mimeeqAuth.authorization
        .getUserData()
        .then((res) => {
            if (res) {
                setSessionCookie(res);

                Array.from(onElements).forEach((item) => {
                    item.style.display = "";
                });

                Array.from(offElements).forEach((item) => {
                    item.style.display = "none";
                });
            } else {
                removeSessionCookie();

                Array.from(onElements).forEach((item) => {
                    item.style.display = "none";
                });

                Array.from(offElements).forEach((item) => {
                    item.style.display = "";
                });
            }
        })
        .catch((err) => {
            console.error(err);
        });
};

const setupAuthListeners = () => {
    Array.from(
        document.querySelectorAll("[mimeeq-login], .mimeeq-login")
    ).forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            openLoginModal();
        });
    });

    Array.from(
        document.querySelectorAll("[mimeeq-logout], .mimeeq-logout")
    ).forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            mimeeqAuth.authorization.signOut().then(() => {
                removeSessionCookie();
                window.location.reload();
            });
        });
    });

    Array.from(
        document.querySelectorAll("[mimeeq-profile], .mimeeq-profile")
    ).forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            mimeeqAuth.mountUserProfile();
        });
    });
};

const setupAuthUrls = () => {
    const queryParam = new URLSearchParams(window.location.search).get(
        config.modalQueryParam
    );

    if (queryParam === config.modalQueryValue && !isLoggedIn()) {
        openLoginModal();
    }
};

document.addEventListener("mimeeq-auth-loaded", () => {
    setupAuth();
    setupAuthListeners();
    setupAuthUrls();
});

const setupListeners = () => {
    Array.from(
        document.querySelectorAll(
            "[mimeeq-configurator-button], .mimeeq-configurator-button"
        )
    ).forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            document.dispatchEvent(new Event("mimeeq-show-modular"));
        });
    });
};

const setupUrls = () => {
    if (window.location.href.indexOf("variantCode") > -1) {
        document.dispatchEvent(new Event("mimeeq-show-modular"));
    }
};

document.addEventListener("mimeeq-app-loaded", () => {
    setupListeners();
    setupUrls();
});
