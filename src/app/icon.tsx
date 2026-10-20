import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 14,
          background: '#0d0d0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          letterSpacing: '-0.5px',
        }}
      >
        TR
      </div>
    ),
    {
      ...size,
    }
  );
}
