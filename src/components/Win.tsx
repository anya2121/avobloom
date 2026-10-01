import { ReactNode } from "react";

type Props = {
  title: ReactNode;
  icon?: ReactNode;
  tone?: "pink" | "green" | "sky";
  className?: string;
  bodyClassName?: string;
  onClose?: () => void;
  children: ReactNode;
  style?: React.CSSProperties;
  id?: string;
  footer?: ReactNode;
};

/** Bingkai jendela ala OS jadul. */
export default function Win({ title, icon, tone = "pink", className = "", bodyClassName = "", onClose, children, style, id, footer }: Props) {
  return (
    <section id={id} className={`win ${tone === "pink" ? "" : tone} ${className}`} style={style}>
      <div className="win-title">
        {icon && <span aria-hidden>{icon}</span>}
        <span className="t">{title}</span>
        <div className="win-btns" aria-hidden={!onClose}>
          <span>_</span>
          <span>□</span>
          {onClose ? (
            <button type="button" onClick={onClose} aria-label="Tutup">
              ✕
            </button>
          ) : (
            <span>✕</span>
          )}
        </div>
      </div>
      <div className={`win-body ${bodyClassName}`}>{children}</div>
      {footer}
    </section>
  );
}
