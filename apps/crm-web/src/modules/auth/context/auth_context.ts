"use client";

import { createContext } from "react";
import { T_Auth_Context } from "../types/auth_context.types";

export const Auth_Context = createContext<T_Auth_Context | null>(null);
