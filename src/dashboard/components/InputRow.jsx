export default function InputRow({ label, value, suffix, prefix, info }) {
  return (
    <div className="input-row">
      <div className="input-label">
        {info && <span title={info}>{"\u24D8"}</span>}
        <span>{label}</span>
      </div>
      <div className="input-box">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <span>{value}</span>
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}
