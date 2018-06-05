import config from './config';

const methods = {post: 'POST', get: 'GET'}

const apiFetch = (url, method, body, accessToken) => {
    
    let auth = accessToken ? {'Authorization': `Bearer ${accessToken}`} : null;
    return fetch(url, {  
        method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...auth
        },
        body
    }).then(response => response.json())
      .then(response => {
        return response
      })
}

const api =  {
    login: async (email, password) => {
        const body = JSON.stringify({
            email: email,
            password: password,
        });
        return await apiFetch(config.urls.login, methods.post, body);
    },
    register: async (name, email, password, avatar, langauges) => {
        let body = JSON.stringify({
            name: name, email, password, avatar, langauges
        });
        return await apiFetch(config.urls.register, methods.post, body);
    },
    logout: async (accessToken) => {
        return await apiFetch(config.urls.logout, methods.post, null, accessToken);
    },
    getLanguages: async () => {
        return await apiFetch(config.urls.get_languages, methods.get, null);
    },
    updateProfile: async (name, password, avatar, languages, accessToken) => {
        const body = JSON.stringify({
            name,
            ...(avatar != "" ? { avatar } : null),
            ...(password != "" ? { password } : null),
            languages
        })
        return await apiFetch(config.urls.update_profile, methods.post, body, accessToken);
    },
    me: async (accessToken) => {
        return await apiFetch(config.urls.me, methods.post, null, accessToken);
    },
    refresh: async (accessToken) => {
        return await apiFetch(config.urls.refresh, methods.post, null, accessToken);
    },
    get_room: async (accessToken) => {
        return await apiFetch(config.urls.get_room, methods.post, null, accessToken);
    },
    leave_room: async (accessToken) => {
        return await apiFetch(config.urls.leave_room, methods.post, null, accessToken);
    },
    get_all_friends: async (accessToken) => {
        return await apiFetch(config.urls.get_all_friends, methods.get, null, accessToken);
    },
    send_message: async (to, message, accessToken) => {
        return await apiFetch(config.urls.send_message, methods.post, JSON.stringify({ to, message }), accessToken);
    },
    get_messages: async (to, page, accessToken) => {
        return await apiFetch(config.urls.get_messages, methods.post, JSON.stringify({ to: to, page: page }), accessToken);
    }
}

module.exports = api;