'use strict';

const i18n = require('i18next');
const i18nextBackend = require('i18next-node-fs-backend');
import path from 'path';
import { BrowserWindow, dialog, ipcMain } from 'electron';

const config = require('../configs/app.config');
const { appConfig } = require('../../js/app-config.cjs');

const i18nextOptions = {
    backend:{
        // path where resources get loaded from
        loadPath: path.join(appConfig.appPath, 'locales/{{lng}}/{{ns}}.json'),
        // path to post missing resources
        addPath: path.join(appConfig.appPath, 'locales/{{lng}}/{{ns}}.missing.json'),
        // jsonIndent to use when storing json files
        jsonIndent: 2,
    },
    interpolation: {
        escapeValue: false
    },
    saveMissing: true,
    fallbackLng: config.fallbackLng,
    supportedLngs: config.getLanguagesCodes(),
    locales: config.getLanguagesCodes(),
    react: {
        wait: false
    }
};

function setupI18n()
{
    const { getUserLanguage } = require('../../js/user-preferences.js');
    const userLanguage = getUserLanguage();

    return new Promise((resolve) =>
    {
        i18n.use(i18nextBackend);

        // initialize if not already initialized
        if (!i18n.isInitialized)
        {
            i18n.init(i18nextOptions, () =>
            {
                i18n.changeLanguage(userLanguage).then(() =>
                {
                    resolve();
                });
            });
        }
    });
}

function setLanguageChangedCallback(languageChangedCallback)
{
    i18n.on('languageChanged', () =>
    {
        languageChangedCallback();
    });
}

function changeLanguage(language)
{
    return i18n.changeLanguage(language);
}

ipcMain.handle('CHANGE_LANGUAGE', (event, language) =>
{
    return new Promise((resolve) =>
    {
        changeLanguage(language).then(() =>
        {
            resolve(getCurrentLanguageData());
        });
    });
});

function getCurrentLanguageData()
{
    return i18n.getDataByLanguage(i18n.language);
}

ipcMain.handle('GET_LANGUAGE_DATA', () =>
{
    return {
        'language': i18n.language,
        'data': getCurrentLanguageData()
    };
});

ipcMain.handle('SHOULD_RESET_PREFERENCES', () =>
{
    const options = {
        type: 'question',
        buttons: [getCurrentTranslation('$Preferences.yes-please'), getCurrentTranslation('$Preferences.no-thanks')],
        defaultId: 2,
        title: getCurrentTranslation('$Preferences.reset-preferences'),
        message: getCurrentTranslation('$Preferences.confirm-reset-preferences'),
    };
    const confirmation = dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), options);
    if (confirmation === /*Yes*/0)
    {
        return true;
    }
    else
    {
        return false;
    }
});

function getCurrentTranslation(code)
{
    return i18n.t(code);
}

module.exports =
{
    changeLanguage,
    getCurrentTranslation,
    setLanguageChangedCallback,
    setupI18n,
};
