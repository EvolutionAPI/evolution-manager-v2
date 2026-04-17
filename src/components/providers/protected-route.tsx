import React from "react";
import { Navigate } from "react-router-dom";

import { FeatureKey, isFeatureEnabled } from "@/lib/provider/features";
import { getProvider, getToken, TOKEN_ID } from "@/lib/queries/token";

type ProtectedRouteProps = {
  children: React.ReactNode;
  feature?: FeatureKey;
};

const ProtectedRoute = ({ children, feature }: ProtectedRouteProps) => {
  const apiUrl = getToken(TOKEN_ID.API_URL);
  const token = getToken(TOKEN_ID.TOKEN);
  const version = getToken(TOKEN_ID.VERSION);
  const provider = getProvider();

  const authenticated = provider === "go" ? !!apiUrl && !!token : !!apiUrl && !!token && !!version;

  if (!authenticated) {
    return <Navigate to="/manager/login" />;
  }

  if (feature && !isFeatureEnabled(feature)) {
    return <Navigate to="/manager/" />;
  }

  return children;
};

export default ProtectedRoute;
