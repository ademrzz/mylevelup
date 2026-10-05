"use client";

import { useState } from "react";

export interface CourseFinancialRow {
  id: string;
  title: string;
  instructorName: string;
  instructorEmail: string | null;
  price: number;
  enrollmentsCount: number;
  gross: number;
}

interface CommissionCalculatorProps {
  initialCourses: CourseFinancialRow[];
  defaultRate?: number;
}

export function CommissionCalculator({
  initialCourses,
  defaultRate = 20,
}: CommissionCalculatorProps) {
  const [commissionRate, setCommissionRate] = useState<number>(defaultRate);

  const presets = [10, 15, 20, 25, 30];

  // Calculate totals based on current commission rate
  let totalGross = 0;
  let totalPlatformCommission = 0;
  let totalInstructorPayout = 0;
  let totalPaidEnrollments = 0;

  const calculatedRows = initialCourses.map((c) => {
    totalGross += c.gross;
    const platformCut = c.gross * (commissionRate / 100);
    const instructorCut = c.gross * ((100 - commissionRate) / 100);

    totalPlatformCommission += platformCut;
    totalInstructorPayout += instructorCut;
    if (c.price > 0) {
      totalPaidEnrollments += c.enrollmentsCount;
    }

    return {
      ...c,
      platformCut,
      instructorCut,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Commission Selector Control Panel */}
      <div 
        className="glass"
        style={{
          padding: "1.75rem 2rem",
          borderRadius: "1.25rem",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0,0,0,0.5) 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.25rem" }}>⚙️</span>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", margin: 0 }}>
                Ajustement Variable du Taux de Commission
              </h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Modifiez le pourcentage de commission retenu par la plateforme. Tous les calculs s'ajustent instantanément ci-dessous.
            </p>
          </div>

          {/* Current Rate Big Display */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", background: "rgba(168,85,247,0.15)", padding: "0.5rem 1.25rem", borderRadius: "1rem", border: "1px solid rgba(168,85,247,0.4)" }}>
            <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "#c084fc" }}>
              {commissionRate}%
            </span>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
              (Part Formateur: {100 - commissionRate}%)
            </span>
          </div>
        </div>

        {/* Interactive Slider & Preset Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>0%</span>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "#a855f7",
                  height: "8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>50%</span>
            </div>

            {/* Direct Number Input */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#e5e7eb", fontWeight: 600 }}>
                Valeur exacte :
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="input-field"
                  style={{ width: "80px", textAlign: "center", fontWeight: 700, fontSize: "1rem", padding: "0.4rem 0.5rem" }}
                />
                <span style={{ fontWeight: 700, color: "white" }}>%</span>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginRight: "0.25rem" }}>
              Raccourcis rapides :
            </span>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCommissionRate(p)}
                className="btn btn-outline"
                style={{
                  padding: "0.35rem 0.85rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  borderColor: commissionRate === p ? "#a855f7" : "rgba(255,255,255,0.15)",
                  background: commissionRate === p ? "rgba(168,85,247,0.25)" : "transparent",
                  color: commissionRate === p ? "#c084fc" : "white",
                }}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Financial KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(52,211,153,0.3)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Total Encaissé Brut (GMV)
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399", margin: "0.3rem 0" }}>
            {totalGross.toLocaleString("fr-DZ")} <span style={{ fontSize: "1rem" }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {totalPaidEnrollments} transactions payantes
          </span>
        </div>

        <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(168,85,247,0.3)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Commissions Plateforme ({commissionRate}%)
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#c084fc", margin: "0.3rem 0" }}>
            {Math.round(totalPlatformCommission).toLocaleString("fr-DZ")} <span style={{ fontSize: "1rem" }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Part retenue par Level Up DZ
          </span>
        </div>

        <div className="glass" style={{ padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(254,145,0,0.3)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
            Total Net Formateurs ({100 - commissionRate}%)
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--brand-orange)", margin: "0.3rem 0" }}>
            {Math.round(totalInstructorPayout).toLocaleString("fr-DZ")} <span style={{ fontSize: "1rem" }}>DZD</span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Net à reverser aux formateurs
          </span>
        </div>
      </div>

      {/* Recalculated Financial Statement Table */}
      <div className="glass" style={{ borderRadius: "1.25rem", border: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Formation</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Formateur</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Tarif</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Ventes</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>Total Brut</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "#c084fc" }}>Part Admin ({commissionRate}%)</th>
                <th style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "var(--brand-orange)", textAlign: "right" }}>Net Formateur ({100 - commissionRate}%)</th>
              </tr>
            </thead>
            <tbody>
              {calculatedRows.map((row) => (
                <tr 
                  key={row.id}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td style={{ padding: "1.1rem 1.25rem", fontWeight: 600, color: "white" }}>
                    {row.title}
                  </td>
                  <td style={{ padding: "1.1rem 1.25rem" }}>
                    <div style={{ color: "#e5e7eb", fontSize: "0.85rem" }}>{row.instructorName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{row.instructorEmail}</div>
                  </td>
                  <td style={{ padding: "1.1rem 1.25rem", color: "var(--text-muted)" }}>
                    {row.price ? `${row.price.toLocaleString("fr-DZ")} DZD` : "Gratuit"}
                  </td>
                  <td style={{ padding: "1.1rem 1.25rem" }}>
                    <strong style={{ color: "var(--brand-blue)" }}>{row.enrollmentsCount}</strong>
                  </td>
                  <td style={{ padding: "1.1rem 1.25rem", fontWeight: 700, color: row.gross > 0 ? "white" : "var(--text-muted)" }}>
                    {row.gross.toLocaleString("fr-DZ")} DZD
                  </td>
                  <td style={{ padding: "1.1rem 1.25rem", fontWeight: 700, color: "#c084fc" }}>
                    {Math.round(row.platformCut).toLocaleString("fr-DZ")} DZD
                  </td>
                  <td style={{ padding: "1.1rem 1.25rem", fontWeight: 700, color: "var(--brand-orange)", textAlign: "right" }}>
                    {Math.round(row.instructorCut).toLocaleString("fr-DZ")} DZD
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderTop: "2px solid var(--border)", fontWeight: 800 }}>
                <td colSpan={4} style={{ padding: "1.25rem", color: "white" }}>
                  TOTAL GÉNÉRAL PLATEFORME
                </td>
                <td style={{ padding: "1.25rem", color: "#34d399", fontSize: "1.05rem" }}>
                  {totalGross.toLocaleString("fr-DZ")} DZD
                </td>
                <td style={{ padding: "1.25rem", color: "#c084fc", fontSize: "1.05rem" }}>
                  {Math.round(totalPlatformCommission).toLocaleString("fr-DZ")} DZD
                </td>
                <td style={{ padding: "1.25rem", color: "var(--brand-orange)", fontSize: "1.05rem", textAlign: "right" }}>
                  {Math.round(totalInstructorPayout).toLocaleString("fr-DZ")} DZD
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
