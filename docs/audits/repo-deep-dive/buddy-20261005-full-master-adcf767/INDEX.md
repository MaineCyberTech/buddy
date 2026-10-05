# Audit run buddy-20261005-full-master-adcf767 - buddy

Focused security / supply-chain / CI deep-dive (`master` @ `adcf767`).

Counts: P0 x0, P1 x4, P2 x13, P3 x24

| File | Contents |
|---|---|
| lens_focused_security_supply_chain_ci.md | Full findings write-up |
| findings.json | Machine-readable findings |
| EXECUTIVE_SUMMARY.md | Summary |
| risk_register.md / follow_up_register.md | Findings register |
| RELEASE_GATE.md | Gate verdict |
| roadmap.md / patch_plan.md | Remediation plan |
| audit_manifest.json | Run manifest |

## P0/P1
- **ARCH-P1-001** (P1) Client is fully authoritative: no server trust boundary exists
- **BP-P1-001** (P1) master is unprotected: no required PR, review, or status checks
- **BP-P1-002** (P1) The `release` environment required by release.yml does not exist
- **CI-P1-001** (P1) CI is failing on master at the audited commit

