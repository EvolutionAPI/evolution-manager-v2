const CONTACT_JID_SUFFIXES = ["@s.whatsapp.net", "@lid"] as const;
const GROUP_JID_SUFFIX = "@g.us";

export const isContactJid = (remoteJid: string): boolean => CONTACT_JID_SUFFIXES.some((suffix) => remoteJid.endsWith(suffix));

export const isGroupJid = (remoteJid: string): boolean => remoteJid.endsWith(GROUP_JID_SUFFIX);
