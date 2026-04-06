import React, { useState } from "react";
import { http } from "../api/http";
import { useLocation, useNavigate } from "react-router-dom";

function ResetPassword() {

  const [password, setPassword] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const resetPassword = async () => {

    try {

      if (!email) {
        alert("Email missing. Please restart reset flow.");
        navigate("/forgot-password");
        return;
      }

      await http.post("/api/auth/reset-password", { email, password });

      alert("Password reset successful");

      navigate("/login");

    } catch (error) {

      alert("Error resetting password");

    }

  };

  return (

    <div style={{textAlign:"center", marginTop:"100px"}}>

      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <br/><br/>

      <button onClick={resetPassword}>
        Reset Password
      </button>

    </div>

  );

}

export default ResetPassword;