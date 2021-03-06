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
    register: async (name, email,phone, password, languages) => {
        let body = JSON.stringify({
            name: name, email:email,phone:phone, password:password, languages
        });
        return await apiFetch(config.urls.register, methods.post, body);
    },
    logout: async (accessToken) => {
        return await apiFetch(config.urls.logout, methods.post, null, accessToken);
    },
    getLanguages: async () => {
        return await apiFetch(config.urls.get_languages, methods.get, null);
    },
    updateProfile: async (name, old_password,new_password, avatar, languages, accessToken) => {
        const body = JSON.stringify({
            name,
            ...(avatar != "" ? { avatar } : null),
            ...(old_password != "" ? { old_password } : null),
            ...(new_password != "" ? { new_password } : null),
            languages
        })
        return await apiFetch(config.urls.update_profile, methods.post, body, accessToken);
    },
    me: async (accessToken) => {
        return await apiFetch(config.urls.me, methods.post, null, accessToken);
    },
    check_token:async (old_token,accessToken) => {
        return await apiFetch(config.urls.check_token, methods.post, JSON.stringify({ old_token: old_token }),accessToken);
    },
    refresh: async (accessToken) => {
        return await apiFetch(config.urls.refresh, methods.post, null, accessToken);
    },
    get_room: async (accessToken) => {
        return await apiFetch(config.urls.get_room, methods.post, null, accessToken);
    },
    leave_room: async (accessToken,to) => {
        return await apiFetch(config.urls.leave_room, methods.post,JSON.stringify({ friend_id: to }), accessToken);
    },
    get_all_friends: async (accessToken) => {
        return await apiFetch(config.urls.get_all_friends, methods.get, null, accessToken);
    },
    send_message: async (to, message, accessToken) => {
        return await apiFetch(config.urls.send_message, methods.post, JSON.stringify({ to, message }), accessToken);
    },
    get_messages: async (to, page, accessToken) => {
        return await apiFetch(config.urls.get_messages, methods.post, JSON.stringify({ to: to, page: page }), accessToken);
    },
    get_all_requests: async (accessToken) => {
        return await apiFetch(config.urls.get_all_requests, methods.get, null, accessToken);
    },
    accept_friend_request: async (sender_id, accessToken) => {
        return await apiFetch(config.urls.accept_friend_request, methods.post, JSON.stringify({ sender_id: sender_id }), accessToken);
    },
    reject_friend_request: async (sender_id, accessToken) => {
        return await apiFetch(config.urls.reject_friend_request, methods.post, JSON.stringify({ sender_id: sender_id }), accessToken);
    },
    add_friend: async (recipient_id, accessToken) => {
        return await apiFetch(config.urls.add_friend, methods.post,JSON.stringify({ recipient_id: recipient_id }), accessToken);
    },
    get_friend_requests_count: async (accessToken) => {
        return await apiFetch(config.urls.get_friend_requests_count, methods.get, null, accessToken);
    },
    remove_friend: async (friend_id, accessToken) => {
        return await apiFetch(config.urls.remove_friend, methods.post,JSON.stringify({ friend_id: friend_id }), accessToken);
    },
    get_messages_count: async (accessToken) => {
        return await apiFetch(config.urls.get_messages_count, methods.get, null, accessToken);
    },
    cancel_request: async (accessToken) => {
        return await apiFetch(config.urls.cancel_request, methods.post, null, accessToken);
    },
    go_offline:async (accessToken) => {
        return await apiFetch(config.urls.go_offline, methods.post,null, accessToken);
    },
    go_online:async (accessToken) => {
        return await apiFetch(config.urls.go_online, methods.post,null, accessToken);
    },
    forget_password: async (email) => {
        return await apiFetch(config.urls.forget_password, methods.post,JSON.stringify({ email: email }));
    },
    change_password: async (code,password,password_confirmation) => {
        return await apiFetch(config.urls.change_password, methods.post,JSON.stringify({ code: code,password:password,password_confirmation }));
    },
    check_code: async (code) => {
        return await apiFetch(config.urls.check_code, methods.post,JSON.stringify({ code: code }));
    },
    get_conversations: async (accessToken) => {
        return await apiFetch(config.urls.get_conversations, methods.get, null, accessToken);
    },
}

module.exports = api;