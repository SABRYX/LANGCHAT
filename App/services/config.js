const SERVER = 'http://192.168.1.85:1994/';
const STORAGE = `${SERVER}/storage/`;
const API = `${SERVER}/api`;
const config = {
    urls: {
        login: `${API}/auth/login`,
        register: `${API}/auth/register`,
        logout: `${API}/auth/logout`,
        forget_password: `${API}/auth/forget_password`,
        update_profile: `${API}/auth/update_profile`,
        get_languages: `${API}/get_languages`,
        refresh: `${API}/auth/refresh`,
        me: `${API}/auth/me`,
        get_room: `${API}/room/get_room`,
        leave_room: `${API}/room/leave_room`,
        get_all_friends: `${API}/friend/get_all_friends`,
        send_message: `${API}/message/send_message`,
        get_messages: `${API}/message/get_messages`,
        get_all_requests:`${API}/friend/get_all_requests`,
    }
}

module.exports = config;