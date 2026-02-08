import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import InputRow from "../components/InputRow.jsx";
import SummaryTile from "../components/SummaryTile.jsx";

function stripCommas(value) {
  return value.replace(/,/g, "");
}

function formatNumberInput(value) {
  const raw = value.replace(/,/g, "");
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formattedInt = Number(intPart || "0").toLocaleString();
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function fmtCurrency(n) {
  if (n == null || isNaN(n)) return "₪0";
  return `₪${Math.round(n).toLocaleString()}`;
}

function fmtNumber(n) {
  if (n == null || isNaN(n)) return "0";
  return Math.round(n).toLocaleString();
}

function ManualInput({ label, value, onChange, prefix, suffix }) {
  return (
    <div className="fn-input-group">
      <label className="fn-input-label">{label}</label>
      <div className="fn-input-box">
        {prefix && <span className="fn-input-prefix">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          className="fn-input"
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, "");
            onChange(formatNumberInput(raw));
          }}
        />
        {suffix && <span className="fn-input-prefix">{suffix}</span>}
      </div>
    </div>
  );
}

export default function RevenueBlueprint({ embedded = false }) {
  const [revenueTarget, setRevenueTarget] = useState(formatNumberInput("200000"));
  const [merTarget, setMerTarget] = useState(formatNumberInput("3.5"));
  const [aov, setAov] = useState(formatNumberInput("8000"));
  const [showRate, setShowRate] = useState(formatNumberInput("80"));
  const [offerRate, setOfferRate] = useState(formatNumberInput("70"));
  const [closeRate, setCloseRate] = useState(formatNumberInput("7"));
  const [mqlToQualified, setMqlToQualified] = useState(formatNumberInput("30"));

  const outputs = useMemo(() => {
    const revenue = parseFloat(stripCommas(revenueTarget)) || 0;
    const mer = parseFloat(stripCommas(merTarget)) || 0;
    const avgOrder = parseFloat(stripCommas(aov)) || 0;
    const show = (parseFloat(stripCommas(showRate)) || 0) / 100;
    const offer = (parseFloat(stripCommas(offerRate)) || 0) / 100;
    const close = (parseFloat(stripCommas(closeRate)) || 0) / 100;
    const mqlRate = (parseFloat(stripCommas(mqlToQualified)) || 0) / 100;

    const unitsRequired = avgOrder > 0 ? revenue / avgOrder : 0;
    const offersRequired = close > 0 ? unitsRequired / close : 0;
    const qualifiedCallsRequired = offer > 0 ? offersRequired / offer : 0;
    const bookedCallsRequired = show > 0 ? qualifiedCallsRequired / show : 0;
    const liveCallsRequired = qualifiedCallsRequired;
    const mqlsRequired = mqlRate > 0 ? qualifiedCallsRequired / mqlRate : 0;

    const maxSpend = mer > 0 ? revenue / mer : 0;
    const tolerableCPA = unitsRequired > 0 ? maxSpend / unitsRequired : 0;
    const tolerableQualifiedCallCost = qualifiedCallsRequired > 0 ? maxSpend / qualifiedCallsRequired : 0;
    const tolerableMqlCost = mqlsRequired > 0 ? maxSpend / mqlsRequired : 0;

    return {
      unitsRequired,
      offersRequired,
      qualifiedCallsRequired,
      bookedCallsRequired,
      liveCallsRequired,
      mqlsRequired,
      maxSpend,
      tolerableCPA,
      tolerableQualifiedCallCost,
      tolerableMqlCost,
      revenue,
      mer,
    };
  }, [revenueTarget, merTarget, aov, showRate, offerRate, closeRate, mqlToQualified]);

  const content = (
    <>
      {!embedded && (
        <PageHeader
          title="Revenue Blueprint"
          subtitle="Reverse-engineer יעדי ביצוע לפי יעד הכנסות"
        />
      )}

      <div className="grid grid-2 section">
        <div className="card padded">
          <div className="section-title">Goal &amp; Assumptions</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 12 }}>
            Manual Inputs
          </div>
          <ManualInput label="Revenue Target (יעד הכנסות)" value={revenueTarget} onChange={setRevenueTarget} prefix="₪" />
          <ManualInput label="MER Target" value={merTarget} onChange={setMerTarget} />
          <ManualInput label="AOV (ערך עסקה ממוצע)" value={aov} onChange={setAov} prefix="₪" />
          <ManualInput label="Show Rate (%)" value={showRate} onChange={setShowRate} suffix="%" />
          <ManualInput label="Offer Rate (%)" value={offerRate} onChange={setOfferRate} suffix="%" />
          <ManualInput label="Close Rate (%)" value={closeRate} onChange={setCloseRate} suffix="%" />
          <ManualInput label="MQL → Qualified Call (%)" value={mqlToQualified} onChange={setMqlToQualified} suffix="%" />
        </div>

        <div className="card padded">
          <div className="section-title">Execution Requirements</div>
          <InputRow label="Units Required" value={fmtNumber(outputs.unitsRequired)} />
          <InputRow label="Offers Required" value={fmtNumber(outputs.offersRequired)} />
          <InputRow label="Qualified Calls Required" value={fmtNumber(outputs.qualifiedCallsRequired)} />
          <InputRow label="Booked Calls Required" value={fmtNumber(outputs.bookedCallsRequired)} />
          <InputRow label="Live Calls Required" value={fmtNumber(outputs.liveCallsRequired)} />
          <InputRow label="MQLs Required" value={fmtNumber(outputs.mqlsRequired)} />
        </div>
      </div>

      <div className="card padded section">
        <div className="section-title">Cost Constraints</div>
        <div className="grid grid-2">
          <InputRow label="Spend (Max Allowed)" value={fmtCurrency(outputs.maxSpend)} />
          <InputRow label="Tolerable CPA" value={fmtCurrency(outputs.tolerableCPA)} />
          <InputRow label="Tolerable Qualified Call Cost" value={fmtCurrency(outputs.tolerableQualifiedCallCost)} />
          <InputRow label="Tolerable MQL Cost" value={fmtCurrency(outputs.tolerableMqlCost)} />
        </div>
      </div>

      <div className="card padded section">
        <div className="section-title">Summary</div>
        <div className="grid grid-3">
          <SummaryTile label="Revenue Target" value={fmtCurrency(outputs.revenue)} highlight />
          <SummaryTile label="Max Allowed Spend" value={fmtCurrency(outputs.maxSpend)} />
          <SummaryTile label="Units Required" value={fmtNumber(outputs.unitsRequired)} />
        </div>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <SummaryTile label="Tolerable CPA" value={fmtCurrency(outputs.tolerableCPA)} />
          <SummaryTile label="MER Target" value={outputs.mer ? outputs.mer.toString() : "0"} />
          <SummaryTile label="Qualified Calls Required" value={fmtNumber(outputs.qualifiedCallsRequired)} />
        </div>
      </div>

      {!embedded && (
        <div className="footer">
          Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
        </div>
      )}
    </>
  );

  return embedded ? (
    <div className="projections-tab forecast-view-enter revenue-blueprint">{content}</div>
  ) : (
    <div className="page-enter revenue-blueprint">{content}</div>
  );
}
