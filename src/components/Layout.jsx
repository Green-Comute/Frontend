import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      <Header />
      <main className="flex-1 animate-fade-in">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
