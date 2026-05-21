// MVP boundary: these flows stay in the codebase for the next release, but are hidden or guarded for now.
export const MVP_USER_FEATURES = {
  publicRegistration: false,
  publicUserLogin: false,
  socialLogin: false,
  userDashboard: false,
  comments: false,
  savedLists: false
} as const;
