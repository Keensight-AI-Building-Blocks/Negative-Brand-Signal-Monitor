// app/page.js
import Dashboard from "./components/Dashboard";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Brand Signal Monitor
      </h1>
      <Dashboard />
    </div>
  );
}
