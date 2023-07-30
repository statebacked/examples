import "./globals.css";

export const metadata = {
  title: "State Backed Example - Email Automation",
  description:
    "Example of using State Backed to create an email automation backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-background flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
