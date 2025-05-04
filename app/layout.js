// app/layout.js
import "./globals.css"; // Import the updated global styles

export const metadata = {
  title: "NBSM - Brand Signal Monitor",
  description: "Monitor negative brand signals for DTC startups",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="container mx-auto p-4 md:p-6 lg:p-8">{children}</main>
      </body>
    </html>
  );
}
