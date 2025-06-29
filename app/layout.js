// app/layout.js
import "./globals.css";

export const metadata = {
  title: "NBSM - Brand Signal Monitor",
  description: "Monitor negative brand signals for DTC startups",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {" "}
      {/* Ensure dark mode is applied if needed */}
      <body>
        {/* Removed main container here, Dashboard.jsx now controls its own layout */}
        {children}
      </body>
    </html>
  );
}
