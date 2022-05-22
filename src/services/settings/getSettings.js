const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
const createError = require("http-errors");
import { success, failure } from "@/libs/response-lib";
import * as settingDB from "@/db/setting";

const isWhiteListed = (settings, origin) => {
  const { whitelistedDomains, config } = settings.general;
  const { displayOption = "popup" } = config;
  if (displayOption === "window") return true;
  if (!origin) return false;

  for (let domain of whitelistedDomains) {
    if (domain.trim().startsWith(origin)) return true;
  }
  return false;
};

const main = async (event) => {
  try {
    const { channelId, origin, locale } = event.queryStringParameters;
    const settingItem = await settingDB.getCurrent(channelId);
    const settings = JSON.parse(settingItem.settings);

    if (!isWhiteListed(settings, origin)) {
      throw createError(403, "Domain is not whitelisted.");
    }

    const { persistentMenu, defaultLanguage } = settingItem;
    const menu = getLocalePersistentMenu(persistentMenu, locale || defaultLanguage);

    return success({
      ...settingItem,
      settings,
      persistentMenu: menu,
      serverTime: Date.now(),
    });
  } catch (error) {
    return failure({ message: error.message }, error.statusCode);
  }
};

const qsSchema = Joi.object().keys({
  channelId: Joi.string().required(),
  origin: Joi.string().required(),
  locale: Joi.string(),
});

export const handler = middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { qsSchema } }))
  .use(httpErrorHandler());

const getLocalePersistentMenu = (persistentMenu, locale = "default") => {
  if (!persistentMenu || persistentMenu.length === 0) return undefined;

  const menu =
    persistentMenu.find((menu) => menu.locale === locale) ||
    persistentMenu.find((menu) => menu.locale === "default") ||
    persistentMenu[0];

  if (!menu) return undefined;
  const { call_to_actions: actions = [] } = menu;
  if (actions.filter((action) => action.active !== false).length === 0) return undefined;

  return menu;
};
