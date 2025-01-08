'use strict';

import { contextBridge } from 'electron';
import { workdayWaiverApi } from './workday-waiver-api.mjs';

contextBridge.exposeInMainWorld(
    'mainApi', workdayWaiverApi
);
