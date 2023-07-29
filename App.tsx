import React, { useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import BackgroundGeolocation, {
  State,
  Config,
  Location,
  LocationError,
  Geofence,
  GeofenceEvent,
  GeofencesChangeEvent,
  HeartbeatEvent,
  HttpEvent,
  MotionActivityEvent,
  MotionChangeEvent,
  ProviderChangeEvent,
  ConnectivityChangeEvent,
  Subscription
} from "react-native-background-geolocation";

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [enabled, setEnabled] = React.useState(false);
  const [location, setLocation] = React.useState('');

  useEffect(() => {
    const onHttp = BackgroundGeolocation.onHttp(httpEvent => {
      console.log("[http] ", httpEvent.responseText);
    });


    /// 2. ready the plugin.
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 0,
      stopTimeout: 5,
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
      showsBackgroundLocationIndicator: true,
      maxRecordsToPersist: 1,
      fastestLocationUpdateInterval: 60000,
      locationUpdateInterval: 60000,
      logMaxDays: 1,
      maxDaysToPersist: 1,
      foregroundService: true,
      notification: {
        text: 'Konumunuz paylaşılıyor.'
      },
      // HTTP / SQLite config
      url: 'https://gpstest.mertozgen.com.tr/weatherforecast/addgps',
      httpRootProperty: ".",
      method: 'POST',
      locationTemplate: '{"latitude":"<%= latitude %>","longitude":"<%= longitude %>"}',
      locationsOrderDirection: 'ASC',
      batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
      headers: {              // <-- Optional HTTP headers
        "Content-Type": "application/json"
      },
      //params: {               // <-- Optional HTTP params
        //"auth_token": "maybe_your_server_authenticates_via_token_YES?"
      //}
    }).then((state) => {
      setEnabled(state.enabled)
      BackgroundGeolocation.start();
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
    });

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onHttp.remove();
    }
  }, []);


  /// 3. start / stop BackgroundGeolocation
  React.useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);


  return (
    <SafeAreaView>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Text>Konum Test</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
