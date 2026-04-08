// src/contexts/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { signerManager, FormstrAuthModal } from "formstr-auth";

export type UserProfile = {
  pubkey?: string;
  name?: string;
  avatar?: string; // url
  about?: string;
};

interface UserContextType {
  user: UserProfile | null;
  logout: () => void;
  openLoginModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const updateProfile = () => {
      const authUser = signerManager.getUser();
      if (authUser) {
        setUser({
          pubkey: authUser.pubkey,
          name: authUser.name,
          avatar: authUser.picture,
          about: authUser.about,
        });
      } else {
        setUser(null);
      }
    };

    // Initialize signerManager and listen for changes
    signerManager.init().then(updateProfile);
    const unsubscribe = signerManager.onUserChange(updateProfile);

    return () => unsubscribe();
  }, []);

  const logout = () => {
    signerManager.logout();
    setUser(null);
  };

  const openLoginModal = () => setLoginOpen(true);
  const closeLoginModal = () => setLoginOpen(false);

  return (
    <UserContext.Provider value={{ user, logout, openLoginModal }}>
      {children}
      <FormstrAuthModal
        open={loginOpen}
        onClose={closeLoginModal}
        onSuccess={closeLoginModal}
      />
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
