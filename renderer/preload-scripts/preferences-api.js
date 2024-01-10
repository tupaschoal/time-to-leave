'use strict';

import { ipcRenderer } from 'electron';
import * as config from '../../src/configs/app.config.js';
import { getUserPreferencesPromise } from '../../js/user-preferences.js';

function notifyNewPreferences(preferences)
{
    ipcRenderer.send('PREFERENCE_SAVE_DATA_NEEDED', preferences);
}

function changeLanguagePromise(language)
{
    return ipcRenderer.invoke('CHANGE_LANGUAGE', language);
}

function getLanguageDataPromise()
{
    return ipcRenderer.invoke('GET_LANGUAGE_DATA');
}

function shouldResetPreferences()
{
    return ipcRenderer.invoke('SHOULD_RESET_PREFERENCES');
}

const preferencesApi = {
    notifyNewPreferences: (preferences) => notifyNewPreferences(preferences),
    getLanguageMap: () => config.getLanguageMap(),
    getUserPreferencesPromise: () => getUserPreferencesPromise(),
    changeLanguagePromise: (language) => changeLanguagePromise(language),
    getLanguageDataPromise: () => getLanguageDataPromise(),
    shouldResetPreferences: () => shouldResetPreferences()
};

export {
    preferencesApi
};
