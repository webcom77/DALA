"use client";

import * as React from "react";
import { AuthContext } from "@/components/auth-provider";

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider.");
  }
  return context;
}
