'use strict';

import assert from 'assert';
import { BrowserWindow, ipcMain } from 'electron';
import { spy, stub } from 'sinon';

import { getDateStr } from '../../js/date-aux.mjs';
import IpcConstants from '../../js/ipc-constants.mjs';
import Windows from '../../js/windows.mjs';

describe('Windows tests', () =>
{
    let showSpy;
    let loadSpy;
    before(() =>
    {
        // Avoid window being shown
        showSpy = stub(BrowserWindow.prototype, 'show');
        loadSpy = spy(BrowserWindow.prototype, 'loadURL');

        // Mocking for tests below
        ipcMain.handle(IpcConstants.GetWaiverDay, () =>
        {
            return new Promise((resolve) =>
            {
                resolve(global.waiverDay);
            });
        });
        ipcMain.removeHandler(IpcConstants.GetLanguageData);
        ipcMain.handle(IpcConstants.GetLanguageData, () => ({
            'language': 'en',
            'data': {}
        }));
        ipcMain.handle(IpcConstants.GetWaiverStoreContents, () =>
        {
            return new Promise(resolve => resolve({}));
        });
        ipcMain.handle(IpcConstants.GetCountries, () =>
        {
            return new Promise(resolve => resolve([]));
        });
    });

    it('Elements should be null on starting', () =>
    {
        assert.strictEqual(Windows.getWaiverWindow(), null);
        assert.strictEqual(global.tray, null);
        assert.strictEqual(global.contextMenu, null);
        assert.strictEqual(Windows.getPreferencesWindow(), null);
    });

    it('Should create waiver window', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openWaiverManagerWindow(mainWindow);
        assert.notStrictEqual(Windows.getWaiverWindow(), null);
        assert.strictEqual(Windows.getWaiverWindow() instanceof BrowserWindow, true);

        // Values can vary about 10px from 600, 500
        const size = Windows.getWaiverWindow().getSize();
        assert.strictEqual(Math.abs(size[0] - 600) < 10, true);
        assert.strictEqual(Math.abs(size[1] - 500) < 10, true);

        assert.strictEqual(loadSpy.calledOnce, true);

        Windows.getWaiverWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledOnce, true);
            done();
        });
    });

    it('Should show waiver window when it has been created', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openWaiverManagerWindow(mainWindow);
        Windows.openWaiverManagerWindow(mainWindow);
        assert.notStrictEqual(Windows.getWaiverWindow(), null);

        // It should only load once the URL because it already exists
        assert.strictEqual(loadSpy.calledOnce, true);

        Windows.getWaiverWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledTwice, true);
            done();
        });
    });

    it('Should set global waiverDay when event is sent', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openWaiverManagerWindow(mainWindow, true);
        Windows.getWaiverWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledOnce, true);
            assert.notStrictEqual(Windows.getWaiverWindow(), null);
            assert.strictEqual(global.waiverDay, getDateStr(new Date()));
            done();
        });
    });

    it('Should reset waiverWindow on close', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openWaiverManagerWindow(mainWindow, true);
        Windows.getWaiverWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledOnce, true);
            Windows.getWaiverWindow().close();
            assert.strictEqual(Windows.getWaiverWindow(), null);
            done();
        });
    });

    it('Should create preferences window', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openPreferencesWindow(mainWindow);
        assert.notStrictEqual(Windows.getPreferencesWindow(), null);
        assert.strictEqual(Windows.getPreferencesWindow() instanceof BrowserWindow, true);

        // Values can vary about 10px from 600, 500
        const size = Windows.getPreferencesWindow().getSize();
        assert.strictEqual(Math.abs(size[0] - 550) < 10, true);
        assert.strictEqual(Math.abs(size[1] - 620) < 10, true);

        assert.strictEqual(loadSpy.calledOnce, true);

        Windows.getPreferencesWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledOnce, true);
            done();
        });
    });

    it('Should show preferences window when it has been created', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openPreferencesWindow(mainWindow);
        Windows.openPreferencesWindow(mainWindow);
        assert.notStrictEqual(Windows.getPreferencesWindow(), null);

        // It should only load once the URL because it already exists
        assert.strictEqual(loadSpy.calledOnce, true);

        Windows.getPreferencesWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledTwice, true);
            done();
        });
    });

    it('Should reset preferences window on close', (done) =>
    {
        const mainWindow = new BrowserWindow({
            show: false
        });
        Windows.openPreferencesWindow(mainWindow, true);
        Windows.getPreferencesWindow().webContents.ipc.on(IpcConstants.WindowReadyToShow, () =>
        {
            assert.strictEqual(showSpy.calledOnce, true);
            Windows.getPreferencesWindow().close();
            assert.strictEqual(Windows.getPreferencesWindow(), null);
            done();
        });
    });

    it('Should get dialog coordinates', () =>
    {
        const coordinates = Windows.getDialogCoordinates(500, 250, {
            getBounds: () => ({
                x: 200,
                y: 300,
                width: 400,
                height: 600
            })
        });
        assert.deepStrictEqual(coordinates, {
            x: 150,
            y: 475
        });
    });

    afterEach(() =>
    {
        showSpy.resetHistory();
        loadSpy.resetHistory();
        Windows.resetWindowsElements();
    });

    after(() =>
    {
        showSpy.restore();
        loadSpy.restore();

        ipcMain.removeHandler(IpcConstants.GetWaiverDay);
        ipcMain.removeHandler(IpcConstants.GetLanguageData);
        ipcMain.removeHandler(IpcConstants.GetWaiverStoreContents);
        ipcMain.removeHandler(IpcConstants.GetCountries);
    });
});
