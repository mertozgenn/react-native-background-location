import React, { useEffect } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
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

interface ApiLocation {
  id: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
  user: string;
}

function App(): JSX.Element {
  const [enabled, setEnabled] = React.useState(false);
  const [locations, setLocations] = React.useState([] as ApiLocation[]);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const onHttp = BackgroundGeolocation.onHttp(httpEvent => {
      console.log("[http] ", httpEvent.responseText);
    });

    /// 2. ready the plugin.
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 1000,
      disableElasticity: true,
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
      params: {               // <-- Optional HTTP params
        "user": Platform.OS == "android" ? "burak" : "mert"
      }
    }).then((state) => {
      setEnabled(state.enabled)
      BackgroundGeolocation.start();
      console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
    });

    getLocations()

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
    }
  }, [enabled]);

  const getLocations = async () => {
    const apiResult = await fetch('https://gpstest.mertozgen.com.tr/weatherforecast/gps?apiKey=enaz18cmolmalı')
    const data = await apiResult.json() as ApiLocation[]
    setLocations(data)
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getLocations().then(() => setRefreshing(false))
  }, []);


  return (
    <SafeAreaView>
      <StatusBar/>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{padding: 20}}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }>
        {locations.map((location, index) => (
          <View key={index} style={{marginBottom: 10}}>
            <Text style={styles.text}>İd: {location.id}</Text>
            <Text style={styles.text}>User: {location.user}</Text>
            <Text style={styles.text}>Lat: {location.latitude}</Text>
            <Text style={styles.text}>Lng: {location.longitude}</Text>
            <Text style={styles.text}>Date: {location.timestamp.toString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;
