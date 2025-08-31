// src/pages/SignUpPage.jsx
import { SignUp } from "@clerk/clerk-react";

export const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp />
    </div>
  );
};