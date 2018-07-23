const SERVER = 'https://psycounselor.com:51046';
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
        check_token:`${API}/auth/check_token`,
        get_room: `${API}/room/get_room`,
        leave_room: `${API}/room/leave_room`,
        get_all_friends: `${API}/friend/get_all_friends`,
        send_message: `${API}/message/send_message`,
        get_messages: `${API}/message/get_messages`,
        get_all_requests:`${API}/friend/get_all_requests`,
        accept_friend_request:`${API}/friend/accept_friend_request`,
        reject_friend_request:`${API}/friend/reject_friend_request`,
        add_friend:`${API}/friend/add_friend`,
        get_friend_requests_count:`${API}/friend/get_friend_requests_count`,
        remove_friend:`${API}/friend/remove_friend`,
        get_messages_count:`${API}/message/get_messages_count`,
        cancel_request:`${API}/room/cancel_request`,
        go_offline:`${API}/message/go_offline`,
        go_online:`${API}/message/go_online`,
        forget_password:`${API}/auth/forget_password`,
        change_password:`${API}/auth/change_password`,
        check_code:`${API}/auth/check_code`,
    }
}

module.exports = config;