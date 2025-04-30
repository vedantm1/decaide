import React, { ComponentType, FC } from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  path: string;
  component: ComponentType<any>;
  [key: string]: any;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center h-screen">
          <div className="loading-spinner" />
        </div>
      </Route>
    );
  }

  return (
    <Route
      path={path}
      {...rest}
    >
      {(params) => 
        isAuthenticated ? (
          <Component {...params} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    </Route>
  );
};

export default ProtectedRoute;