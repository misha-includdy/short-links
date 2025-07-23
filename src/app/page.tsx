import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/dashboard";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold">Shortlinks</h1>
            <LoginLink>
              <Button size="lg">
                Se connecter
              </Button>
            </LoginLink>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">Shortlinks</h1>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-muted-foreground">
              {user.given_name && user.family_name 
                ? `${user.given_name} ${user.family_name}`
                : user.given_name || user.email
              }
            </span>
            <ThemeToggle />
            <LogoutLink>
              <Button variant="outline" size="sm">
                Se déconnecter
              </Button>
            </LogoutLink>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <Dashboard />
      </main>
    </div>
  );
}
