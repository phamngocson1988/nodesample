const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
import { success, failure } from "@/libs/response-lib";
import * as settingDB from "@/db/setting";
import { CURRENT_SETTING_VERSION } from "@/constants";

const main = async (event) => {
  try {
    console.log(event);
    const {
      projectId,
      channelId,
      channelName,
      channelIcon,
      version,
      defaultLanguage,
      supportedLanguages,
      msOverwriteMenu,
      botActivation,
      getStarted,
      settings,
      badWords,
      systemMenu,
      persistentMenuEdit,
      persistentMenu,
      whitelistedDomains,
    } = event.body;

    let newSettings = settings;
    let newVersion = version;

    const currentProfile = await settingDB.getChannelProfileProperties(channelId);

    // Use default profile
    if (!currentProfile) {
      newSettings = await settingDB.getLatestDefaultProfile();
      newVersion = newSettings.version;
    } else {
      newSettings = settings || JSON.parse(currentProfile.settings);
      newVersion = currentProfile.version;
    }

    // Compatibility code
    if (whitelistedDomains) {
      newSettings.general.whitelistedDomains = whitelistedDomains;
    }
    // Compatibility code
    if (defaultLanguage) {
      newSettings.general.defaultLanguage = defaultLanguage;
    }
    // Compatibility code
    if (badWords) {
      newSettings.general.badWords = badWords;
    }

    const prevSystemMenu = currentProfile ? currentProfile.systemMenu : undefined;
    const finalSystemMenu = systemMenu ? generateSystemMenu(systemMenu) : prevSystemMenu;
    let finalPersistentMenu = persistentMenu || (currentProfile ? currentProfile.persistentMenu : undefined);
    if (!finalPersistentMenu || msOverwriteMenu) {
      finalPersistentMenu = generatePersistentMenu(defaultLanguage, finalSystemMenu);
    }

    const now = new Date().toISOString();
    const newProfile = {
      ...(currentProfile || {}),
      pk: channelId,
      sk: newVersion,
      projectId,
      channelId,
      version: newVersion,
      settings: JSON.stringify(newSettings),
      updatedAt: now,
    };
    if (!currentProfile) {
      newProfile.createdAt = now;
    }
    const fields = {
      getStarted,
      defaultLanguage,
      supportedLanguages,
      botActivation,
      whitelistedDomains,
      persistentMenu: finalPersistentMenu,
      badWords,
      systemMenu: finalSystemMenu,
      persistentMenuEdit,
      channelName,
      channelIcon,
    };
    Object.keys(fields).forEach((key) => {
      if (typeof fields[key] === "undefined") delete fields[key];
    });
    Object.assign(newProfile, fields);

    const newCurrentProfile = {
      ...newProfile,
      sk: CURRENT_SETTING_VERSION,
    };

    await settingDB.batchPut([newProfile, newCurrentProfile]);

    return success({
      data: newCurrentProfile,
    });
  } catch (error) {
    console.log(error);
    return failure({ message: error.message }, error.statusCode);
  }
};

const bodySchema = Joi.object().keys({
  projectId: Joi.string(),
  channelId: Joi.string(),
  channelName: Joi.string(),
  channelIcon: Joi.string(),
  version: Joi.string(),
  defaultLanguage: Joi.string(),
  supportedLanguages: Joi.array(),
  msOverwriteMenu: Joi.boolean(),
  botActivation: Joi.boolean(),
  getStarted: Joi.object(),
  settings: Joi.object(),
  badWords: Joi.object(),
  systemMenu: Joi.object(),
  persistentMenuEdit: Joi.object(),
  persistentMenu: Joi.array(),
  whitelistedDomains: Joi.array(),
});

export const handler = middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { bodySchema } }))
  .use(httpErrorHandler());

const generateSystemMenu = (systemMenu) => {
  if (!systemMenu) return [];

  return Object.keys(systemMenu)
    .map((key) => {
      systemMenu[key].id = key;
      return systemMenu[key];
    })
    .filter((item) => {
      if (!item.type) return false;
      if (item.type === "postback") {
        if (!item.payload) return false;
      }
      if (item.type === "web_url") {
        if (item.webviewHeightRatio) {
          item.webview_height_ratio = item.webviewHeightRatio;
        }
      }
      return true;
    });
};

const generatePersistentMenu = (defaultLanguage, systemMenu) => {
  if (!defaultLanguage || !systemMenu) return undefined;
  if (systemMenu.filter((item) => item.active).length === 0) return null;

  const locales = Object.keys(systemMenu[0].title);

  const persistentMenu = locales.map((locale) => {
    const call_to_actions = systemMenu
      .filter((item) => item.active)
      .map((item) => ({
        ...item,
        title: item.title[locale],
      }));

    return {
      locale: locale === defaultLanguage ? "default" : locale,
      call_to_actions,
    };
  });

  return persistentMenu;
};
