import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{t("app_name")}</h3>
            <p className="text-sm opacity-90">
              {t("footer_desc")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer_product")}</h4>
            <ul className="space-y-2 text-sm opacity-90 font-medium">
              <li><Link to="/" className="hover:text-accent transition-colors">{t("footer_features")}</Link></li>
              <li><Link to="/pricing" className="hover:text-accent transition-colors">{t("footer_pricing")}</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">{t("footer_privacy")}</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">{t("footer_terms")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-95">
          <p>{t("footer_rights", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
