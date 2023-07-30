import { useEffect, useReducer } from "react";
import { exhaustive } from "../utils";

type Action =
  | { type: "error"; error: Error }
  | { type: "success"; token: string };
type State = { token: string } | { error: Error } | { loading: true };

export default function useStateBackedToken(getToken: () => Promise<string>) {
  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case "error":
          return { error: action.error };
        case "success":
          return { token: action.token };
        default: {
          exhaustive(action);
        }
      }
    },
    { loading: true },
  );

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!!token) {
          dispatch({ type: "success", token });
        } else {
          dispatch({ type: "error", error: new Error("no token") });
        }
      } catch (error) {
        dispatch({ type: "error", error: error as Error });
      }
    })();
  }, []);

  return {
    token: "token" in state ? state.token : null,
    loading: "loading" in state ? state.loading : false,
    error: "error" in state ? state.error : null,
  };
}
