import BrandLogo from "../BrandLogo/BrandLogo";

export default function LandingFooter() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <BrandLogo className="footer-logo" alt="AppSoft" />
        <p>&copy; 2026 AppSoft. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
