"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { T_Login_Response, T_Login_User } from "../types/login.types";

export type T_Auth_Status = "CHECKING" | "AUTHENTICATED" | "ANONYMOUS";

type T_Auth_Context = {
  user: T_Login_User | null;
  auth_status: T_Auth_Status;
  get_access_token: () => string | null;
  set_access_token: (access_token: string) => void;
  set_auth_session: (login_data: T_Login_Response) => void;
  clear_auth_session: () => void;
};

type T_Auth_Provider_Props = {
  children: ReactNode;
};

const Auth_Context = createContext<T_Auth_Context | null>(null);

export default function Auth_Provider({ children }: T_Auth_Provider_Props) {
  const access_token_ref = useRef<string | null>(null);

  const [user, set_user] = useState<T_Login_User | null>(null);
  const [auth_status, set_auth_status] = useState<T_Auth_Status>("CHECKING");

  const get_access_token = useCallback((): string | null => {
    return access_token_ref.current;
  }, []);

  const set_access_token = useCallback((access_token: string): void => {
    access_token_ref.current = access_token;
  }, []);

  const set_auth_session = useCallback((login_data: T_Login_Response): void => {
    access_token_ref.current = login_data.access_token;

    set_user(login_data.user);
    set_auth_status("AUTHENTICATED");
  }, []);

  const clear_auth_session = useCallback((): void => {
    access_token_ref.current = null;

    set_user(null);
    set_auth_status("ANONYMOUS");
  }, []);

  const context_value = useMemo<T_Auth_Context>(
    () => ({
      user,
      auth_status,
      get_access_token,
      set_access_token,
      set_auth_session,
      clear_auth_session,
    }),
    [
      user,
      auth_status,
      get_access_token,
      set_access_token,
      set_auth_session,
      clear_auth_session,
    ],
  );

 return (
   <Auth_Context.Provider value={context_value}>
     {children}
   </Auth_Context.Provider>
 );
}

export function useAuth(): T_Auth_Context {
  const auth_context = useContext(Auth_Context);

  if (!auth_context) {
    throw new Error("use_auth must be used inside Auth_Provider");
  }

  return auth_context;
}
