const API_URL = "http://127.0.0.1:8000/api";

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await response.json();
  // Store tokens for future requests
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  
  return data;
};