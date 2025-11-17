import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CandidateProvider } from "@/context/CandidateContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { FormCandidateProvider } from "@/context/FormCandidateContext";
import Home from "@/pages/Home";
import InboundCustomers from "@/pages/InboundCustomers";
import InboundStaffsForm from "@/pages/InboundStaffsForm";
import OutboundCustomers from "@/pages/OutboundCustomers";
import OutboundStaffs from "@/pages/OutboundStaffs";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import AnalyticsPage from "@/pages/AnalyticsPage";
import LegacyAnalyticsPage from "@/pages/LegacyAnalyticsPage";
import CustomerAnalyticsPage from "@/pages/CustomerAnalyticsPage";
import FormAnalyticsPage from "@/pages/FormAnalyticsPage";
import CustomerCallRecruitmentAnalyticsPage from "@/pages/CustomerCallRecruitmentAnalyticsPage";
import TextRecruitmentInbound from "@/pages/TextRecruitmentInbound";
import CallRecruitmentInbound from "@/pages/CallRecruitmentInbound";
import FormRecruitmentInbound from "@/pages/FormRecruitmentInbound";
import CustomerCallRecruitmentInbound from "@/pages/CustomerCallRecruitmentInbound";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

interface SessionResponse {
  authenticated: boolean;
  user?: {
    id: string;
    username: string;
  };
}

function AuthenticatedLayout() {
  const { data: session } = useQuery<SessionResponse>({
    queryKey: ["/api/auth/session"],
  });
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [location] = useLocation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-2 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {session?.user && (
                <span className="text-sm text-muted-foreground" data-testid="text-username">
                  {session.user.username}
                </span>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/">
                {() => <Redirect to="/staffs/call/cs/inbound" />}
              </Route>

              {/* Customers Routes */}
              {/* Call - CS */}
              <Route path="/customers/call/cs/inbound" component={InboundCustomers} />
              <Route path="/customers/call/cs/outbound" component={OutboundCustomers} />
              
              {/* Call - Recruitment */}
              <Route path="/customers/call/recruitment/inbound" component={CustomerCallRecruitmentInbound} />
              <Route path="/customers/call/recruitment/outbound" component={OutboundCustomers} />
              
              {/* Text - CS */}
              <Route path="/customers/text/cs/inbound" component={InboundCustomers} />
              <Route path="/customers/text/cs/outbound" component={OutboundCustomers} />
              
              {/* Text - Recruitment */}
              <Route path="/customers/text/recruitment/inbound" component={InboundCustomers} />
              <Route path="/customers/text/recruitment/outbound" component={OutboundCustomers} />
              
              {/* Form - CS */}
              <Route path="/customers/form/cs/inbound" component={InboundCustomers} />
              <Route path="/customers/form/cs/outbound" component={OutboundCustomers} />
              
              {/* Form - Recruitment */}
              <Route path="/customers/form/recruitment/inbound" component={InboundCustomers} />
              <Route path="/customers/form/recruitment/outbound" component={OutboundCustomers} />

              {/* Staffs Routes */}
              {/* Call - CS */}
              <Route path="/staffs/call/cs/inbound" component={Home} />
              <Route path="/staffs/call/cs/outbound" component={OutboundStaffs} />
              
              {/* Call - Recruitment */}
              <Route path="/staffs/call/recruitment/inbound" component={CallRecruitmentInbound} />
              <Route path="/staffs/call/recruitment/outbound" component={OutboundStaffs} />
              
              {/* Text - CS */}
              <Route path="/staffs/text/cs/inbound" component={Home} />
              <Route path="/staffs/text/cs/outbound" component={OutboundStaffs} />
              
              {/* Text - Recruitment */}
              <Route path="/staffs/text/recruitment/inbound" component={TextRecruitmentInbound} />
              <Route path="/staffs/text/recruitment/outbound" component={OutboundStaffs} />
              
              {/* Form - CS */}
              <Route path="/staffs/form/cs/inbound" component={InboundStaffsForm} />
              <Route path="/staffs/form/cs/outbound" component={OutboundStaffs} />
              
              {/* Form - Recruitment */}
              <Route path="/staffs/form/recruitment/inbound" component={FormRecruitmentInbound} />
              <Route path="/staffs/form/recruitment/outbound" component={OutboundStaffs} />

              {/* Legacy route redirects */}
              <Route path="/inbound/staffs/call">
                {() => <Redirect to="/staffs/call/cs/inbound" />}
              </Route>
              <Route path="/inbound/staffs/text">
                {() => <Redirect to="/staffs/text/cs/inbound" />}
              </Route>
              <Route path="/inbound/staffs/form">
                {() => <Redirect to="/staffs/form/cs/inbound" />}
              </Route>
              <Route path="/inbound/customers/call">
                {() => <Redirect to="/customers/call/cs/inbound" />}
              </Route>
              <Route path="/inbound/customers/text">
                {() => <Redirect to="/customers/text/cs/inbound" />}
              </Route>
              <Route path="/inbound/customers/form">
                {() => <Redirect to="/customers/form/cs/inbound" />}
              </Route>
              <Route path="/outbound/customers/call">
                {() => <Redirect to="/customers/call/cs/outbound" />}
              </Route>
              <Route path="/outbound/customers/text">
                {() => <Redirect to="/customers/text/cs/outbound" />}
              </Route>
              <Route path="/outbound/customers/form">
                {() => <Redirect to="/customers/form/cs/outbound" />}
              </Route>
              <Route path="/outbound/staffs/call">
                {() => <Redirect to="/staffs/call/cs/outbound" />}
              </Route>
              <Route path="/outbound/staffs/text">
                {() => <Redirect to="/staffs/text/cs/outbound" />}
              </Route>
              <Route path="/outbound/staffs/form">
                {() => <Redirect to="/staffs/form/cs/outbound" />}
              </Route>

              {/* Analytics Routes */}
              <Route path="/staffs/call/recruitment/inbound/analytics" component={AnalyticsPage} />
              <Route path="/staffs/form/recruitment/inbound/analytics" component={AnalyticsPage} />
              <Route path="/customers/call/recruitment/inbound/analytics" component={CustomerCallRecruitmentAnalyticsPage} />
              <Route path="/customer-analytics" component={CustomerAnalyticsPage} />
              <Route path="/form-analytics" component={FormAnalyticsPage} />
              
              {/* Legacy analytics route for backward compatibility with Home and TextRecruitmentInbound */}
              <Route path="/analytics" component={LegacyAnalyticsPage} />

              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedRouter() {
  const { data: session, isLoading } = useQuery<SessionResponse>({
    queryKey: ["/api/auth/session"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session?.authenticated) {
    return <Login />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CandidateProvider>
          <CustomerProvider>
            <FormCandidateProvider>
              <Toaster />
              <AuthenticatedRouter />
            </FormCandidateProvider>
          </CustomerProvider>
        </CandidateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
