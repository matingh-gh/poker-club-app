import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Poker Club",
  description: "Home poker tracker",
  manifest: "/manifest.json",
  themeColor: "#0ea5e9"
};

export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-5xl mx-auto p-4">{children}</main>
        <script dangerouslySetInnerHTML={{__html:`
          if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js');}
        `}} />
      </body>
    </html>
  );
}
