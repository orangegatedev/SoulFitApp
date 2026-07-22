"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { sucursalsService } from "@/services/sucursals.service";
import { useAuthStore } from "@/stores/auth-store";
import { sessionTimeoutService } from "@/services/session-timeout.service";

function getLoginErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "No fue posible iniciar sesión.";
  }

  const response = "response" in error ? error.response : undefined;
  if (response && typeof response === "object" && "data" in response) {
    const data = response.data;

    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : "No fue posible iniciar sesión.";
}

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shouldLoadLogo, setShouldLoadLogo] = useState(false);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setShouldLoadLogo(true), 0);
    setSessionMessage(sessionTimeoutService.consumeExpirationMessage());
    return () => window.clearTimeout(timeoutId);
  }, []);

  const { data: branchLogo } = useQuery({
    enabled: shouldLoadLogo,
    queryKey: ["sucursals", "logo"],
    queryFn: () => sucursalsService.getLogo(),
    retry: false,
    staleTime: 0,
    refetchOnMount: "always"
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      setSession(response.token, response.user);
      sessionTimeoutService.startSession();
      router.replace("/dashboard");
    }
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginMutation.isPending) return;
    loginMutation.mutate({ email, password });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center space-y-5 text-center">
        <div className="flex h-20 w-full items-center justify-center">
          {branchLogo ? (
            <img
              src={branchLogo}
              alt="Logo de la sucursal"
              className="max-h-20 max-w-56 object-contain drop-shadow-[0_0_24px_rgba(255,38,56,0.24)]"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-neon-red via-neon-ember to-neon-cyan shadow-glow">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div className="w-full">
          <CardTitle className="text-2xl font-black">Entrar a SoulFit</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {loginMutation.isError ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {getLoginErrorMessage(loginMutation.error)}
            </p>
          ) : null}
          {sessionMessage ? (
            <p className="rounded-md border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
              {sessionMessage}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Validando..." : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
