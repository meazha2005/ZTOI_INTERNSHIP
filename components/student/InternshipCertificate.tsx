import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const BRAND = '#FF4D00';

export interface InternshipCertificateProps {
  studentName: string;
  domain: string;
  certificate?: { cert_number: string; issued_at: string } | null;
  verifyOrigin: string;
  className?: string;
  id?: string;
}

const InternshipCertificate = forwardRef<HTMLDivElement, InternshipCertificateProps>(
  function InternshipCertificate(
    { studentName, domain, certificate, verifyOrigin, className = '', id },
    ref,
  ) {
    const verifyUrl = certificate
      ? `${verifyOrigin}/verify?cert=${encodeURIComponent(certificate.cert_number)}`
      : '';

    return (
      <div
        ref={ref}
        id={id}
        className={`overflow-hidden bg-[#FDFCFA] ${className}`}
        style={{
          width: '794px',
          maxWidth: '100%',
          aspectRatio: '297 / 210',
          margin: '0 auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          boxSizing: 'border-box',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 6, background: `linear-gradient(90deg, ${BRAND} 0%, #FF8C00 100%)`, flexShrink: 0 }} />

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6% 8% 5%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                fontFamily: "'Michroma', sans-serif",
                fontWeight: 900,
                fontSize: '22px',
                letterSpacing: '0.18em',
                color: BRAND,
              }}>
                ZTOI TECH
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '8px', letterSpacing: '0.3em', color: '#999', textTransform: 'uppercase' }}>
                Certificate No.
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#555', marginTop: 2 }}>
                {certificate?.cert_number || '—'}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4C5B0, transparent)', marginBottom: '4%' }} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2%' }}>
              This is to certify that
            </div>
            <div style={{ fontSize: '24px', color: '#1A1A1A', fontWeight: 700, fontStyle: 'italic', marginBottom: '2.5%' }}>
              {studentName}
            </div>
            <div style={{ width: 40, height: 2, background: BRAND, marginBottom: '2.5%' }} />
            <div style={{ fontSize: '10px', color: '#777', maxWidth: '60%', lineHeight: 1.7, marginBottom: '2%' }}>
              has successfully completed the internship program and demonstrated exceptional skills and dedication in the domain of
            </div>
            <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.25em', color: BRAND, textTransform: 'uppercase' }}>
              {domain}
            </div>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #D4C5B0, transparent)', margin: '4% 0 3%' }} />

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {verifyUrl && <QRCodeSVG value={verifyUrl} size={64} level="H" />}
              <div style={{ fontSize: '6px', letterSpacing: '0.18em', color: '#AAA', textTransform: 'uppercase' }}>
                Scan to Verify
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>
                Authorized By
              </div>
              <div style={{ fontSize: '12px', color: '#1A1A1A', fontWeight: 600 }}>
                ZTOI TECH Founder
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND} 0%, #FF8C00 100%)`, flexShrink: 0 }} />
      </div>
    );
  },
);

export default InternshipCertificate;
