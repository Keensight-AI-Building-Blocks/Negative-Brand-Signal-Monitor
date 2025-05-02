// app/layout.js
import "./globals.css"; // Import the updated global styles

export const metadata = {
  title: "NBSM - Brand Signal Monitor",
  description: "Monitor negative brand signals for DTC startups",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Removed conflicting background/text classes like bg-gray-100, text-gray-900 */}
      {/* Kept min-h-screen which is fine for layout */}
      <body className="min-h-screen">
        {/* Container and padding are fine for layout */}
        <main className="container mx-auto p-4 md:p-6 lg:p-8">{children}</main>
      </body>
    </html>
  );
}
