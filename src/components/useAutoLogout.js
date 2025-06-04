import { useEffect, useRef } from "react";

const useAutoLogout = (timeout = 300000) => { // default timeout is 300000ms (5 minutes)
  const timerId = useRef(null);

  // The logout function that clears localStorage and redirects the user.
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("tokenExpiry");
    window.location.href = "/"; // or your designated login route
  };

  // Resets the current timer or starts a new one.
  const resetTimer = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
    }
    timerId.current = setTimeout(logout, timeout);
  };

  useEffect(() => {
    // List of events to reset the timer on
    const events = ["mousemove", "mousedown", "click", "scroll", "keypress"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    
    // Initialize the timer when the hook mounts.
    resetTimer();

    // Cleanup event listeners and timer on unmount.
    return () => {
      clearTimeout(timerId.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeout]);

  return null; // The hook does not render anything.
};

export default useAutoLogout;
