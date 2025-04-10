import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleLogin } from "@/auth/userAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import loginEdcBackground from "@/assets/login-edc.jpg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = await handleLogin(email, password);

    if (user.error) {
      setError(user.error.message);
    }

    setError("");
    setLoading(false);
    navigate("/dashboard");
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-100">
      {/* Set Page Title */}
      <Helmet>
        <title>Login</title>
      </Helmet>

      {/* Left Side (Image) */}
      <div className="hidden w-1/2 h-full bg-center bg-cover lg:block" style={{ backgroundImage: `url(${loginEdcBackground})` }}></div>

      {/* Right Side (Login Form) */}
      <div className="flex items-center justify-center w-full lg:w-1/2">
        <div className="w-full max-w-sm mx-auto">
          <div>
            {/* Back Button */}
            <Button
              variant="ghost"
              className="px-0 mb-4 hover:text-[#439c83]"
              onClick={() => navigate("/")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3m0 0l4.5-4.5M3 12l4.5 4.5"
                />
              </svg>
              Kembali ke halaman utama
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Masuk</CardTitle>
                <CardDescription>
                  Masukkan email dan kata sandi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Kata Sandi</Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-red-500">{error}</p>}
                  <Button type="submit" className="w-full bg-[#439c83]  hover:bg-[#3ec49e]" disabled={loading}>
                    {loading ? (
                      <svg
                        className="w-5 h-5 mx-auto animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
