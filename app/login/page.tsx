import { AuthGuard } from "@/components/layout/auth-guard";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <AuthGuard>
      <main className="grid min-h-screen place-items-center bg-fitness-radial p-4">
        <div className="absolute inset-x-0 top-0 h-1 neon-line" />
        <LoginForm />
      </main>
    </AuthGuard>
  );
}
