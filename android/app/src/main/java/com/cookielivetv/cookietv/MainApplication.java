package com.sponb.sponbtv;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.brentvatne.react.ReactVideoPackage;
import com.idehub.Billing.InAppBillingBridgePackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.burnweb.rnpermissions.RNPermissionsPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.reactlibrary.RNDefaultPreferencePackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactVideoPackage(),
            new InAppBillingBridgePackage(),
            new KCKeepAwakePackage(),
            new RNSoundPackage(),
            new RNPermissionsPackage(),
            new BlurViewPackage(),
            new LinearGradientPackage(),
            new RNDefaultPreferencePackage(),
            new ReactNativeLocalizationPackage(),
            new WebRTCModulePackage(),
            new VectorIconsPackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
