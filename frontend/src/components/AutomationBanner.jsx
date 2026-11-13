import React from 'react';
import { CheckCircle2, Cpu } from 'lucide-react';

export default function AutomationBanner({ qaMode }) {
  if (!qaMode) return null;

  return (
    <div className="qa-banner" data-testid="qa-automation-banner">
      <div className="qa-banner-content">
        <div className="qa-banner-header">
          <Cpu size={18} className="qa-pulse" />
          <strong>QA Automation Engineer Mode Active:</strong>
          <span>Key controls use <code>data-testid</code> selectors for browser automation.</span>
        </div>
        <div className="qa-badges">
          <span className="qa-chip"><CheckCircle2 size={14} /> Selenium WebDriver (POM) Suite</span>
          <span className="qa-chip"><CheckCircle2 size={14} /> 23 Automated Jest / Supertest API Tests</span>
          <span className="qa-chip"><CheckCircle2 size={14} /> Sequential Capacity Boundary Test</span>
          <span className="qa-chip"><CheckCircle2 size={14} /> Postman API Collection Ready</span>
        </div>
      </div>
    </div>
  );
}

