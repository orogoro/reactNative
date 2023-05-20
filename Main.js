import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import { useRotes } from "./routes/routes";
import { authStateChange } from "./redux/auth/autnOperation";

export default function Main() {
  const { stateChange } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authStateChange());
  }, []);
  const routes = useRotes(stateChange);
  return <NavigationContainer>{routes}</NavigationContainer>;
}
