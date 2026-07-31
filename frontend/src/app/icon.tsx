import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 45%, #f97316 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 28,
            borderRadius: 112,
            border: '2px solid rgba(255,255,255,0.16)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 44,
            width: 180,
            height: 180,
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.12)',
            filter: 'blur(18px)',
          }}
        />
        <div
          style={{
            width: 336,
            height: 336,
            borderRadius: 96,
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 28px 80px rgba(69, 10, 10, 0.35)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 999,
              background: 'linear-gradient(180deg, #fff7ed 0%, #fed7aa 50%, #fdba74 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#991b1b',
              fontSize: 92,
              fontWeight: 900,
              lineHeight: 1,
              boxShadow: '0 18px 40px rgba(255, 255, 255, 0.2)',
            }}
          >
            S
          </div>
          <div
            style={{
              marginTop: 24,
              color: '#ffffff',
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: '-0.06em',
              lineHeight: 1,
            }}
          >
            SG Fire
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}