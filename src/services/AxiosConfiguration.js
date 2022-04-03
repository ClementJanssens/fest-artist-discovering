import Axios from 'axios';
import AuthenticationService from './Authentication';

Axios.defaults.baseURL = `${process.env.REACT_APP_API_URL}/`;

Axios.interceptors.request.use(async function (config) {
    await AuthenticationService.RefreshToken().then((token) => {
        config.headers['Content-Type'] = 'application/json';
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
    });

    if (!(config.data instanceof FormData))
        config.data = JSON.stringify(config.data);

    return config;
}, function (error) {
    return Promise.reject(error);
});

Axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response) {
        // if (error.response.status === 401 || error.response.status === 403)
        //     window.location.replace('/');

        // if (error.response.status === 401)
        //     localStorage.clear();
    }

    return Promise.reject(error);
});
