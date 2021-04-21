export const isProd = process.env.NODE_ENV === "production";
export const LOGIN_PATH = "/auth/login/";
export const REGISTER_PATH = "/auth/register/";
export const HOME_PATH = "/home/";
export const FORGOT_PASSWORD_PATH = "/auth/forgot-password/";
export const DISCOVER_ROOT_PATH= "/discover/";
export const CREATE_GROUP_PATH = "/groups/create/";
export const UPLOAD_TRANSCRIPT_PATH = "/user/details/transcript_upload/";
export const MANUAL_DETAIL_INPUT_PATH = "/user/details/init/";
export const RSS_FEEDS = "/rss/manage";

/* local storage item names */
export const TOKEN = "auth-token";
export const USER = "user";
export const SCRAPED_PROGRAM = "scraped-program";
export const SCRAPED_COURSES = "scraped-courses";
export const SCRAPED_GROUPS = "scraped-groups";
