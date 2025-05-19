// app/layout.js
import "./globals.css";

export const metadata = {
  title: "NBSM - Brand Signal Monitor",
  description: "Monitor negative brand signals for DTC startups",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      {" "}
      {/* Ensure dark mode is applied if needed */}
      <body className="min-h-screen bg-gray-900 text-gray-200 font-sans antialiased">
        {/* Removed main container here, Dashboard.jsx now controls its own layout */}
        {children}
      </body>
    </html>
  );
}
