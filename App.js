import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import Main from "./Main";

export default function App() {
  const [fontsLoaded] = useFonts({
    "Roboto-Regulat": require("./fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("./fonts/Roboto-Bold.ttf"),
    "Roboto-Medium": require("./fonts/Roboto-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
