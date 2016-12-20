window.feathers = feathers()
  .configure(feathers.hooks())
  .configure(feathers.rest(window.location.origin).jquery(jQuery))
  .configure(feathers.authentication({ storage: window.localStorage, localEndpoint: 'auth/local', tokenEndpoint: 'auth/token' }));
