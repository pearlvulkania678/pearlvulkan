import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import ListenPage from "@/pages/ListenPage";
import TrackDetail from "@/pages/TrackDetail";
import SeePage from "@/pages/SeePage";
import PoemDetail from "@/pages/PoemDetail";
import TouchPage from "@/pages/TouchPage";
import TouchDetail from "@/pages/TouchDetail";
import SensePage from "@/pages/SensePage";
import SenseDetail from "@/pages/SenseDetail";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/listen" component={ListenPage} />
      <Route path="/listen/:id">{(p) => <TrackDetail id={p.id} />}</Route>
      <Route path="/see" component={SeePage} />
      <Route path="/see/:id">{(p) => <PoemDetail id={p.id} />}</Route>
      <Route path="/touch" component={TouchPage} />
      <Route path="/touch/:id">{(p) => <TouchDetail id={p.id} />}</Route>
      <Route path="/sense" component={SensePage} />
      <Route path="/sense/:id">{(p) => <SenseDetail id={p.id} />}</Route>
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
