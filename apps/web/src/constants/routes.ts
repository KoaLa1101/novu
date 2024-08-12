export enum ROUTES {
  HOME = '/',
  AUTH_SIGNUP = '/auth/signup',
  AUTH_SIGNUP_ORGANIZATION_LIST = '/auth/signup/organization-list',
  AUTH_LOGIN = '/auth/login',
  AUTH_RESET_REQUEST = '/auth/reset/request',
  AUTH_RESET_TOKEN = '/auth/reset/:token',
  AUTH_INVITATION_TOKEN = '/auth/invitation/:token',
  /**
   **
   * Note: Do not use client navigation(react-router-dom), on AUTH_APPLICATION we need to make sure to create new headers,
   * please use navigateToAuthApplication() instead
   *
   */
  AUTH_APPLICATION = '/auth/application',
  PARTNER_INTEGRATIONS_VERCEL_LINK_PROJECTS = '/partner-integrations/vercel/link-projects',
  PARTNER_INTEGRATIONS_VERCEL_LINK_PROJECTS_EDIT = '/partner-integrations/vercel/link-projects/edit',
  ANY = '/*',
  WORKFLOWS_DIGEST_PLAYGROUND = '/workflows/:templateId/digest-playground',
  WORKFLOWS_CREATE = '/workflows/create',
  WORKFLOWS_CREATE_V2 = '/workflows/new',

  WORKFLOWS_EDIT_TEMPLATEID = '/workflows/edit/:templateId',
  WORKFLOWS_V2_STEP_EDIT = '/workflows/edit/:templateId/step/:stepId',
  WORKFLOWS_V2_TEST = '/workflows/edit/:templateId/test',
  WORKFLOWS_VARIANT_PREVIEW = '/workflows/edit/:templateId/:channel/:stepUuid/variants/:variantUuid/preview',
  WORKFLOWS = '/workflows',
  TENANTS = '/tenants',
  TENANTS_CREATE = '/tenants/create',
  QUICKSTART = '/quickstart',
  GET_STARTED = '/get-started',
  DASHBOARD_WELCOME = '/welcome',
  DASHBOARD_ONBOARDING = '/onboarding',
  DASHBOARD_PLAYGROUND = '/playground',
  GET_STARTED_PREVIEW = '/get-started/preview',
  QUICK_START_NOTIFICATION_CENTER = '/quickstart/notification-center',
  QUICK_START_SETUP = '/quickstart/notification-center/set-up',
  QUICK_START_SETUP_FRAMEWORK = '/quickstart/notification-center/set-up/:framework',
  QUICK_START_SETUP_TRIGGER = '/quickstart/notification-center/set-up/:framework/trigger',
  QUICK_START_SETUP_SUCCESS = '/quickstart/notification-center/set-up/:framework/success',
  ACTIVITIES = '/activities',
  INTEGRATIONS = '/integrations',
  INTEGRATIONS_CREATE = '/integrations/create',
  TEAM = '/team',
  CHANGES = '/changes',
  SUBSCRIBERS = '/subscribers',
  ABOUT = '/about',
  CONTACT = '/contact',
  BRAND = '/brand',
  TRANSLATIONS = '/translations',
  LAYOUT = '/layouts',
  API_KEYS = '/api-keys',
  WEBHOOK = '/webhook',

  /** Settings nested routes */
  SETTINGS = '/settings',
  PROFILE = '/settings/profile',
  TEAM_SETTINGS = '/settings/team',
  /* Deprecated */
  BRAND_SETTINGS_DEPRECATED = '/settings/brand',
  BRAND_SETTINGS = '/settings/branding',
  ORGANIZATION = '/settings/organization',
  SECURITY = '/settings/security',
  BILLING = '/settings/billing',

  /** Novu V2 routes, defined as nested routes */
  STUDIO = '/studio',
  STUDIO_FLOWS = '/studio/flows',
  STUDIO_FLOWS_VIEW = '/studio/flows/:templateId',
  STUDIO_FLOWS_STEP_EDITOR = '/studio/flows/:templateId/step/:stepId',
  STUDIO_FLOWS_TEST = '/studio/flows/:templateId/test',
  STUDIO_ONBOARDING = '/studio/onboarding',
  STUDIO_ONBOARDING_PREVIEW = '/studio/onboarding/preview',
  STUDIO_ONBOARDING_SUCCESS = '/studio/onboarding/success',

  LOCAL_STUDIO_AUTH = '/local-studio/auth',
}

export const PUBLIC_ROUTES_PREFIXES = new Set<string>(['/auth', '/local-studio']);
