import logoAppSoft from "../../assets/logo-appsoft-orange-Photoroom.png";

type BrandLogoProps = {
  className?: string;
  alt?: string;
};

export default function BrandLogo({
  className,
  alt = "<AppSoft/> Oficina",
}: BrandLogoProps) {
  return <img className={className} src={logoAppSoft} alt={alt} />;
}
