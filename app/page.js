// app/page.js
import Dashboard from "./components/Dashboard";

export default function HomePage() {
  return (
    // The h1 title is now part of the Dashboard's sidebar or main content area
    // So, we can directly render the Dashboard component which takes over the page.
    <Dashboard />
  );
}
