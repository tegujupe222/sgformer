import jaTranslations from '../locales/ja.json';

type TranslationKey = string;
type TranslationValue = string | Record<string, unknown>;

class I18n {
  private locale: string = 'ja';
  private translations: Record<string, unknown> = jaTranslations;

  setLocale(locale: string) {
    this.locale = locale;
  }

  getLocale(): string {
    return this.locale;
  }

  t(key: TranslationKey, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: TranslationValue = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k] as TranslationValue;
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((str, [param, replacement]) => {
        return str.replace(new RegExp(`{${param}}`, 'g'), replacement);
      }, value);
    }

    return value;
  }

  // Helper method for common translations
  common(key: string, params?: Record<string, string>): string {
    return this.t(`common.${key}`, params);
  }

  auth(key: string, params?: Record<string, string>): string {
    return this.t(`auth.${key}`, params);
  }

  navigation(key: string, params?: Record<string, string>): string {
    return this.t(`navigation.${key}`, params);
  }

  dashboard(key: string, params?: Record<string, string>): string {
    return this.t(`dashboard.${key}`, params);
  }

  forms(key: string, params?: Record<string, string>): string {
    return this.t(`forms.${key}`, params);
  }

  submissions(key: string, params?: Record<string, string>): string {
    return this.t(`submissions.${key}`, params);
  }

  user(key: string, params?: Record<string, string>): string {
    return this.t(`user.${key}`, params);
  }

  admin(key: string, params?: Record<string, string>): string {
    return this.t(`admin.${key}`, params);
  }

  messages(key: string, params?: Record<string, string>): string {
    return this.t(`messages.${key}`, params);
  }

  app(key: string, params?: Record<string, string>): string {
    return this.t(`app.${key}`, params);
  }
}

export const i18n = new I18n();

// React Hook for translations
export const useTranslation = () => {
  return {
    t: i18n.t.bind(i18n),
    common: i18n.common.bind(i18n),
    auth: i18n.auth.bind(i18n),
    navigation: i18n.navigation.bind(i18n),
    dashboard: i18n.dashboard.bind(i18n),
    forms: i18n.forms.bind(i18n),
    submissions: i18n.submissions.bind(i18n),
    user: i18n.user.bind(i18n),
    admin: i18n.admin.bind(i18n),
    messages: i18n.messages.bind(i18n),
    app: i18n.app.bind(i18n),
    locale: i18n.getLocale(),
  };
};
