import {AsyncStorage} from 'react-native'

const storage = {
    keys: {
        accessToken: 'accessToken',
        name: 'username',
        email: 'useremail',
        user: 'user',
    },
    setItem: async function(key, value) {
        try {
            if(typeof value !== 'string'){
                value = JSON.stringify(value);
            }
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('AsyncStorage#setItem error: ' + error.message);
        }
    },
    getItem: async function(key){
        try {
            return await AsyncStorage.getItem(key);
        }catch (error) {
            console.error('AsyncStorage#getItem error: ' + error.message);
        }
    },
    removeItem: async function (key) {
        try {
            const result = await AsyncStorage.removeItem(key);
            console.log(result);
            return result;
        }catch (error) {
            console.error('AsyncStorage#removeItem error: ' + error.message);
        }
    },
    clear: async function() {
        try {
            await AsyncStorage.clear()
        } catch (error) {
            console.error('AsyncStorage#clear error: ' + error.message);
        }
    }
}

module.exports = storage;