// Example of provider configs supported by SimpleAuth.

module.exports = {
    google: {
        appId: 'appid.apps.googleusercontent.com',
        callback: 'com.sponb.sponbtv:/oauth2redirect',
    },
    facebook: {
        appId: 'appId',
        callback: 'appId://authorize',
    },
    twitter: {
     appId: 'appId',
     appSecret: 'secret',
     callback: 'com.sponb.sponbtv:/authorize',
   }
};
