export function createMiddleware() {
  return () => {
    return (next) => (action) => {
      return next(action);
    };
  };
}

export function createLoader() {
  const state = {
    auth: {
      token: 'LOGGED_IN_TOKEN',
    },
  };

  return () => new Promise((resolve) => resolve(state));
}

export function reducer(clb) {
  return (state, action) => clb(state, action);
}
